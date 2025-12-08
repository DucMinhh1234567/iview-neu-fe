export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_session_id, answers } = body;
    
    if (!student_session_id) {
      return Response.json(
        { error: 'student_session_id is required' },
        { status: 400 }
      );
    }
    
    // Get authorization header if present
    const authHeader = request.headers.get('Authorization');
    
    // Prepare headers for Flask backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // If answers are provided, submit them one by one
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        const submitResponse = await fetch(`${BACKEND_URL}/api/student-sessions/${student_session_id}/answer`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            question_id: answer.question_id || answer.id,
            answer: answer.answer || answer.response
          }),
        });
        
        if (!submitResponse.ok) {
          const errorText = await submitResponse.text();
          return Response.json(
            { error: `Failed to submit answer: ${errorText}` },
            { status: submitResponse.status }
          );
        }
      }
    }
    
    // End the session to get final results
    const endResponse = await fetch(`${BACKEND_URL}/api/student-sessions/${student_session_id}/end`, {
      method: 'POST',
      headers,
    });
    
    if (!endResponse.ok) {
      const errorText = await endResponse.text();
      return Response.json(
        { error: `Failed to end session: ${errorText}` },
        { status: endResponse.status }
      );
    }
    
    const endData = await endResponse.json();
    
    // Return format compatible with old flow
    return Response.json({
      queued: false,
      log_file: student_session_id,
      student_session_id: student_session_id,
      completed: true,
      ...endData
    });
  } catch (error) {
    console.error('Submit interview error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}
