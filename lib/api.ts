const BASE = '';

// Import auth utilities
import { getAuthToken as getToken, clearAuth } from './auth';

// Authentication helpers
function getAuthToken(): string | null {
  return getToken();
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAuthHeadersFormData(): HeadersInit {
  const headers: HeadersInit = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData, let browser set it with boundary
  return headers;
}

async function handleResponse(
  response: Response,
  options?: { redirectOn401?: boolean }
): Promise<any> {
  const redirectOn401 = options?.redirectOn401 ?? true;
  if (!response.ok) {
    if (response.status === 401) {
      if (redirectOn401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          clearAuth();
          window.location.href = '/select-role';
        }
        throw new Error('Unauthorized');
      } else {
        // For login page: show message instead of redirect
        const text = await response.text();
        let errorData: { error?: string } = {};
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Unauthorized' };
        }
        const message = (errorData.error || '').toLowerCase();
        if (message.includes('invalid email or password')) {
          throw new Error('Sai email hoặc mật khẩu');
        }
        throw new Error(errorData.error || 'Không thể xác thực. Vui lòng thử lại.');
      }
    }
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { error: text || `Request failed with status ${response.status}` };
    }
    throw new Error(errorData.error || `Request failed: status=${response.status}; body=${text.slice(0, 500)}`);
  }
  return response.json();
}

export const api = {
  // Authentication helpers
  getAuthToken,
  getAuthHeaders,
  
  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
    // Do not redirect on 401 for login; return message to UI instead
    return handleResponse(response, { redirectOn401: false });
  },

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: 'STUDENT' | 'LECTURER';
    username?: string;
    // Student fields
    student_code?: string;
    class_name?: string;
    course_year?: string;
    // Lecturer fields
    lecturer_code?: string;
    department?: string;
  }) {
    const response = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    return handleResponse(response);
  },
  
  // Session management
  async createPracticeSession(data: {
    session_name: string;
    course_name: string;
    material_id?: number;
    difficulty_level: string;
    time_limit: number;
  }) {
    const response = await fetch(`${BASE}/api/sessions/practice`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async createInterviewSession(data: {
    session_name: string;
    position: string;
    level: string;
    cv_url: string;
    jd_url?: string;
    time_limit?: number;
    num_questions?: number;
  }) {
    const response = await fetch(`${BASE}/api/sessions/interview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async createExamSession(data: {
    session_name: string;
    course_name: string;
    material_id: number;
    difficulty_level: string;
    password: string;
    start_time: string;
    end_time: string;
    time_limit?: number;
    language?: string;
  }) {
    const response = await fetch(`${BASE}/api/sessions/exam`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async uploadCV(file: File, sessionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await fetch(`${BASE}/api/upload-cv`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async uploadJD(file: File, sessionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await fetch(`${BASE}/api/upload-jd`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Student session flow
  async joinSession(sessionId: number, password?: string) {
    const response = await fetch(`${BASE}/api/student-sessions/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, password: password || '' }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async startSession(studentSessionId: number) {
    const response = await fetch(`${BASE}/api/student-sessions/${studentSessionId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getNextQuestion(studentSessionId: number) {
    const response = await fetch(`${BASE}/api/student-sessions/${studentSessionId}/question`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async submitAnswer(studentSessionId: number, questionId: number, answer: string) {
    const response = await fetch(`${BASE}/api/student-sessions/${studentSessionId}/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question_id: questionId, answer }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async endSession(studentSessionId: number) {
    // Use AbortController for timeout (5 minutes for batch evaluation)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
    
    try {
      const response = await fetch(`${BASE}/api/student-sessions/${studentSessionId}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Chấm điểm mất quá nhiều thời gian. Vui lòng kiểm tra kết quả sau vài phút.');
      }
      if (error instanceof Error && (error.message.includes('ECONNRESET') || error.message.includes('socket hang up'))) {
        throw new Error('Kết nối bị ngắt. Hệ thống có thể đang chấm điểm. Vui lòng kiểm tra kết quả sau vài phút.');
      }
      throw error;
    }
  },

  async getStudentSession(studentSessionId: number) {
    const response = await fetch(`${BASE}/api/student-sessions/${studentSessionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getHistory() {
    const response = await fetch(`${BASE}/api/history`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getResultStatus(logFile: string) {
    // logFile is now student_session_id
    const response = await fetch(`${BASE}/api/result-status?student_session_id=${encodeURIComponent(logFile)}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getResults() {
    const response = await fetch(`${BASE}/api/results`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getResult(filename: string) {
    // filename is now student_session_id
    const studentSessionId = parseInt(filename);
    if (isNaN(studentSessionId)) {
      throw new Error('Invalid student_session_id');
    }
    return api.getStudentSession(studentSessionId);
  },

  async submitInterview(data: {
    student_session_id: number;
    answers?: Array<{ question_id: number; answer: string }>;
    candidate_name?: string;
    candidate_id?: string;
    responses?: Array<{ question_id: number; answer: string }>;
  }) {
    // Support both old and new format
    const submitData: any = {
      student_session_id: data.student_session_id,
    };
    
    if (data.answers) {
      submitData.answers = data.answers;
    } else if (data.responses) {
      // Convert old format to new format
      submitData.answers = data.responses.map(r => ({
        question_id: r.question_id,
        answer: r.answer
      }));
    }
    
    const response = await fetch(`${BASE}/api/submit-interview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(submitData),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async uploadMaterial(data: {
    file: File;
    title: string;
    description?: string;
    isPublic: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('is_public', data.isPublic.toString());

    const response = await fetch(`${BASE}/api/upload-material`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
      cache: 'no-store',
    });
    
    return handleResponse(response);
  },

  async getMaterials() {
    const response = await fetch(`${BASE}/api/materials`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async deleteMaterial(materialId: number) {
    const response = await fetch(`${BASE}/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getStudentDashboard(studentId: number) {
    const response = await fetch(`${BASE}/api/dashboard/students/${studentId}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Sessions management
  async getSessions(params?: { type?: string; created_by?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.created_by) {
      queryParams.append('created_by', params.created_by.toString());
    }
    
    const url = `${BASE}/api/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('The read operation timed out');
      }
      throw error;
    }
  },

  async getSession(sessionId: number) {
    const response = await fetch(`${BASE}/api/sessions/${sessionId}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getSessionStudents(sessionId: number) {
    const response = await fetch(`${BASE}/api/review/sessions/${sessionId}/students`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Dashboard
  async getLecturerDashboard(lecturerId: number) {
    const response = await fetch(`${BASE}/api/dashboard/lecturers/${lecturerId}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Review
  async getStudentSessionDetail(studentSessionId: number) {
    const response = await fetch(`${BASE}/api/review/student-sessions/${studentSessionId}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async updateAnswerScore(answerId: number, score: number) {
    const response = await fetch(`${BASE}/api/review/answers/${answerId}/score`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lecturer_score: score }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async updateAnswerFeedback(answerId: number, feedback: string) {
    const response = await fetch(`${BASE}/api/review/answers/${answerId}/feedback`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lecturer_feedback: feedback }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Questions Management
  async generateQuestions(sessionId: number, numQuestions?: number) {
    const response = await fetch(`${BASE}/api/questions/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, num_questions: numQuestions }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getQuestions(sessionId: number, status?: string) {
    const queryParams = status ? `?status=${status}` : '';
    const response = await fetch(`${BASE}/api/questions/session/${sessionId}${queryParams}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async updateQuestion(questionId: number, data: { content?: string; keywords?: string; difficulty?: string }) {
    const response = await fetch(`${BASE}/api/questions/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async deleteQuestion(questionId: number) {
    const response = await fetch(`${BASE}/api/questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async approveQuestions(sessionId: number, questionIds?: number[]) {
    const response = await fetch(`${BASE}/api/questions/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async generateAnswers(sessionId: number, questionIds?: number[]) {
    const response = await fetch(`${BASE}/api/questions/generate-answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async updateAnswer(questionId: number, referenceAnswer: string) {
    const response = await fetch(`${BASE}/api/questions/${questionId}/answer`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference_answer: referenceAnswer }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async approveAnswers(sessionId: number, questionIds?: number[]) {
    const response = await fetch(`${BASE}/api/questions/approve-answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Scripts Management
  async generateScript(sessionId: number) {
    const response = await fetch(`${BASE}/api/sessions/${sessionId}/generate-script`, {
      method: 'POST',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async getScript(sessionId: number) {
    const response = await fetch(`${BASE}/api/sessions/${sessionId}/script`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  async updateScript(sessionId: number, openingScript?: string, closingScript?: string) {
    const response = await fetch(`${BASE}/api/sessions/${sessionId}/script`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ opening_script: openingScript, closing_script: closingScript }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Finalize Session
  async finalizeSession(sessionId: number) {
    const response = await fetch(`${BASE}/api/sessions/${sessionId}/finalize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse(response);
  },
};

