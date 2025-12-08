export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const answerId = params.id;
    
    if (!answerId) {
      return Response.json(
        { error: 'answer_id is required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    
    const url = `${BACKEND_URL}/api/review/answers/${answerId}/score`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to update answer score' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Update answer score error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

