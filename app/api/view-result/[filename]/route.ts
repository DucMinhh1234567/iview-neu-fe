export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(_: Request, ctx: { params: Promise<{ filename: string }> }) {
  try {
    const resolvedParams = await ctx.params;
    const studentSessionId = resolvedParams.filename;
    
    if (!studentSessionId) {
      return Response.json(
        { error: 'student_session_id is required' },
        { status: 400 }
      );
    }
    
    // Get authorization header if present
    const authHeader = _.headers.get('Authorization');
    
    // Prepare headers for Flask backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/student-sessions/${studentSessionId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get student session' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    // Transform backend response to match expected format
    return Response.json({
      filename: studentSessionId,
      overall_score: data.score_total || 0,
      summary: data.ai_overall_feedback || '',
      scores: {
        correctness: 0,
        coverage: 0,
        reasoning: 0,
        creativity: 0,
        communication: 0,
        attitude: 0
      },
      details: (data.answers || []).map((answer: any) => ({
        question_id: answer.question_id,
        score: answer.ai_score || answer.lecturer_score || 0,
        notes: answer.ai_feedback || answer.lecturer_feedback || ''
      })),
      session_name: data.session_name,
      session_type: data.session_type,
      answers: data.answers,
      student_session_id: data.student_session_id
    });
  } catch (error) {
    console.error('Get result error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}
