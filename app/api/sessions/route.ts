export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const created_by = searchParams.get('created_by');
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (type) {
      queryParams.append('type', type);
    }
    if (created_by) {
      queryParams.append('created_by', created_by);
    }
    
    const url = `${BACKEND_URL}/api/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get sessions' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Get sessions error:', error);
    
    // Handle timeout/abort errors
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      return Response.json(
        { error: 'The read operation timed out. Please try again or contact administrator if the problem persists.' },
        { status: 504 }
      );
    }
    
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

