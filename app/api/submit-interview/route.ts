export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Log backend URL for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Submit interview - Backend URL:', BACKEND_URL);
}

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
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // If backend returns HTML error page, extract meaningful message
            errorData = { 
              error: errorText.includes('Internal Server Error') 
                ? 'Lỗi máy chủ nội bộ khi nộp câu trả lời. Vui lòng thử lại.'
                : errorText || 'Failed to submit answer'
            };
          }
          return Response.json(
            errorData,
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
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        // If backend returns HTML error page, extract meaningful message
        errorData = { 
          error: errorText.includes('Internal Server Error') 
            ? 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
            : errorText || 'Failed to end session'
        };
      }
      return Response.json(
        errorData,
        { status: endResponse.status }
      );
    }
    
    let endData;
    try {
      endData = await endResponse.json();
    } catch (error) {
      const errorText = await endResponse.text();
      return Response.json(
        { error: `Invalid response from backend: ${errorText.substring(0, 200)}` },
        { status: 500 }
      );
    }
    
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
    console.error('Backend URL:', BACKEND_URL);
    
    let errorMessage = 'Failed to connect to backend server';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for specific error types
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
      }
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
