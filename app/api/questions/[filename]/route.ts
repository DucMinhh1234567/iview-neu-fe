import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ filename: string }> | { filename: string } }) {
  try {
    const p = (ctx.params as any);
    const studentSessionId = typeof p.then === 'function' ? (await (p as Promise<{ filename: string }>)).filename : (p as { filename: string }).filename;
    
    if (!studentSessionId) {
      return Response.json(
        { error: 'student_session_id is required' },
        { status: 400 }
      );
    }
    
    // Get authorization header if present
    const authHeader = _req.headers.get('Authorization');
    
    // Prepare headers for Flask backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward to Flask backend
    const response = await fetch(`${BACKEND_URL}/api/student-sessions/${studentSessionId}/question`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to get question' };
      }
      return Response.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    // Transform backend response to match expected format
    // Backend returns: { question_id, question, question_number, total_questions, difficulty }
    // Frontend expects: { id, text/question, ... }
    return Response.json({
      filename: studentSessionId,
      questions: data.completed ? [] : [{
        id: data.question_id,
        question: data.question,
        text: data.question, // Support both field names
        question_number: data.question_number,
        total_questions: data.total_questions,
        difficulty: data.difficulty
      }],
      completed: data.completed || false,
      question_number: data.question_number,
      total_questions: data.total_questions
    });
  } catch (error) {
    console.error('Get question error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}

