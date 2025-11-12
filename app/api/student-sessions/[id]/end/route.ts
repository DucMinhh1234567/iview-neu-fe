export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16 requires params to be Promise
    const resolvedParams = await ctx.params;
    const studentSessionId = resolvedParams.id;
    
    if (!studentSessionId) {
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
    
    // Forward to Flask backend with increased timeout for batch evaluation
    // This endpoint can take a long time to evaluate all answers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
    
    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/student-sessions/${studentSessionId}/end`, {
        method: 'POST',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return Response.json(
          { error: 'Request timeout. Evaluation is taking longer than expected. Please check results later.' },
          { status: 504 }
        );
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to end session' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('End session error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

