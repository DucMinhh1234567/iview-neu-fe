export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
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
    return Response.json(data);
  } catch (error) {
    console.error('Get student session error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

