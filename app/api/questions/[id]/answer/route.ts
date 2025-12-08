export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    
    if (!questionId) {
      return Response.json(
        { error: 'question_id is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
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
    const response = await fetch(`${BACKEND_URL}/api/questions/${questionId}/answer`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to update answer' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Update answer error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

