import type { NextRequest } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const sessionId = context.params.id;
    
    if (!sessionId) {
      return Response.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }
    
    // Get status query parameter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Get authorization header if present
    const authHeader = request.headers.get('Authorization');
    
    // Prepare headers for Flask backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Build URL with query params
    let url = `${BACKEND_URL}/api/questions/session/${sessionId}`;
    if (status) {
      url += `?status=${status}`;
    }
    
    // Forward to Flask backend
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get questions' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Get questions error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

