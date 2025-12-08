export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://101.96.66.223:8008';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Handle params as Promise (Next.js 15+)
    const resolvedParams = await params;
    const lecturerId = resolvedParams.id;
    
    if (!lecturerId) {
      return Response.json(
        { error: 'lecturer_id is required' },
        { status: 400 }
      );
    }
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    
    const url = `${BACKEND_URL}/api/lecturers/${lecturerId}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    console.log('Fetching lecturer dashboard from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get lecturer dashboard' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Get lecturer dashboard error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

