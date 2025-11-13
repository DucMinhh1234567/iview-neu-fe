const BASE = '';

// Import auth utilities
import { getAuthToken as getToken, getRefreshToken, setAuthToken, setRefreshToken, clearAuth } from './auth';

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

// Track if we're currently refreshing token to avoid infinite loops
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Function to refresh token
async function refreshAuthToken(): Promise<boolean> {
  // If already refreshing, wait for that promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      // Call refresh token API (don't use handleResponse to avoid infinite loop)
      const response = await fetch(`${BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.log('Refresh token failed:', response.status);
        return false;
      }

      const data = await response.json();
      if (data.token) {
        // Update tokens
        setAuthToken(data.token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }
        console.log('Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Helper function to make authenticated requests with auto-retry on 401
async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit,
  retryOn401: boolean = true
): Promise<Response> {
  // Make initial request
  let response = await fetch(url, options);
  
  // If 401 and retry is enabled, try to refresh token and retry
  if (response.status === 401 && retryOn401) {
    if (typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname.includes('/login') || 
                         window.location.pathname.includes('/student/login') || 
                         window.location.pathname.includes('/teacher/login');
      
      // Don't try to refresh on login pages (invalid credentials)
      if (!isLoginPage) {
        // Try to refresh token
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          // Update authorization header with new token
          const newHeaders = { ...options.headers };
          const newToken = getAuthToken();
          if (newToken) {
            (newHeaders as any)['Authorization'] = `Bearer ${newToken}`;
          }
          
          // Retry request with new token
          response = await fetch(url, {
            ...options,
            headers: newHeaders,
          });
        }
        // If refresh failed, don't redirect here - let handleResponse handle it
        // This allows pages to show error messages instead of redirecting immediately
      }
    }
  }
  
  return response;
}

async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    // Parse error message from response first (can only read once)
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { error: text || `Request failed with status ${response.status}` };
    }
    
    if (response.status === 401) {
      // Unauthorized - token refresh should have been attempted by makeAuthenticatedRequest
      // If we're here, refresh failed or we're on login page
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/student/login') || 
                           window.location.pathname.includes('/teacher/login');
        
        // Don't redirect on login pages (invalid credentials)
        if (!isLoginPage) {
          // Refresh token should have been attempted in makeAuthenticatedRequest
          // If we're here, refresh failed or no refresh token
          // Clear auth but don't redirect - let the page handle the error
          clearAuth();
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
      // Throw error with message from backend or default Vietnamese message
      throw new Error(errorData.error || 'Sai email hoặc mật khẩu');
    }
    
    if (response.status === 403) {
      // Forbidden - access denied due to role mismatch
      // Don't redirect on login pages or student/teacher pages, just show error
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/student/login') || 
                           window.location.pathname.includes('/teacher/login');
        const isStudentPage = window.location.pathname.startsWith('/student/');
        const isTeacherPage = window.location.pathname.startsWith('/teacher/');
        
        // Don't redirect if on login page or protected pages - let them handle the error
        if (!isLoginPage && !isStudentPage && !isTeacherPage) {
          // Redirect only if on other pages
          clearAuth();
          window.location.href = '/select-role';
        }
      }
      // Throw error with message from backend
      throw new Error(errorData.error || 'Bạn không có quyền truy cập trang này');
    }
    
    // For other error statuses, throw with parsed error message
    throw new Error(errorData.error || `Request failed: status=${response.status}`);
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
    return handleResponse(response);
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
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/sessions/practice`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        cache: 'no-store',
      }
    );
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
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/sessions/interview`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        cache: 'no-store',
      }
    );
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
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/sessions/exam`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async uploadCV(file: File, sessionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await makeAuthenticatedRequest(
      `${BASE}/api/upload-cv`,
      {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async uploadJD(file: File, sessionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await makeAuthenticatedRequest(
      `${BACKEND_URL}/api/sessions/interview/upload-jd`,
      {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  // Student session flow
  async joinSession(sessionId: number, password?: string) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/join`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId, password: password || '' }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async startSession(studentSessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/${studentSessionId}/start`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getNextQuestion(studentSessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/${studentSessionId}/question`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async submitAnswer(studentSessionId: number, questionId: number, answer: string) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/${studentSessionId}/answer`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question_id: questionId, answer }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async endSession(studentSessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/${studentSessionId}/end`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getStudentSession(studentSessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/student-sessions/${studentSessionId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  // Legacy methods (for backward compatibility)
  async getQuestionsByFilename(filename: string) {
    // filename is now student_session_id
    const studentSessionId = parseInt(filename);
    if (isNaN(studentSessionId)) {
      throw new Error('Invalid student_session_id');
    }
    return api.getNextQuestion(studentSessionId);
  },

  async getHistory() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/history`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getResultStatus(logFile: string) {
    // logFile is now student_session_id
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/result-status?student_session_id=${encodeURIComponent(logFile)}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getResults() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/results`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
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
    
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/submit-interview`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData),
        cache: 'no-store',
      }
    );
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

    const response = await makeAuthenticatedRequest(
      `${BASE}/api/upload-material`,
      {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
        cache: 'no-store',
      }
    );
    
    return handleResponse(response);
  },

  async getMaterials() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/materials`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async deleteMaterial(materialId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/materials/${materialId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getStudentDashboard(studentId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/dashboard/students/${studentId}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
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
      const response = await makeAuthenticatedRequest(
        url,
        {
          headers: getAuthHeaders(),
          cache: 'no-store',
          signal: controller.signal,
        }
      );
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
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/sessions/${sessionId}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getSessionStudents(sessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/sessions/${sessionId}/students`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  // Dashboard
  async getLecturerDashboard(lecturerId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/dashboard/lecturers/${lecturerId}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async logout() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/auth/logout`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getCurrentUser() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/auth/user`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    });
    return handleResponse(response);
  },

  // Review
  async getReviewSessions() {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/sessions`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getStudentSessionDetail(studentSessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/student-sessions/${studentSessionId}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async updateAnswerScore(answerId: number, score: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/answers/${answerId}/score`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lecturer_score: score }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async updateAnswerFeedback(answerId: number, feedback: string) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/answers/${answerId}/feedback`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lecturer_feedback: feedback }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async updateOverallFeedback(studentSessionId: number, feedback: string) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/review/student-sessions/${studentSessionId}/overall`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lecturer_feedback: feedback }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  // Questions Management
  async generateQuestions(sessionId: number, numQuestions?: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/generate`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId, num_questions: numQuestions }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async getQuestions(sessionId: number, status?: string) {
    const queryParams = status ? `?status=${status}` : '';
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/session/${sessionId}${queryParams}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async updateQuestion(questionId: number, data: { content?: string; keywords?: string; difficulty?: string }) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/${questionId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async deleteQuestion(questionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/${questionId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async approveQuestions(sessionId: number, questionIds?: number[]) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/approve`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async generateAnswers(sessionId: number, questionIds?: number[]) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/generate-answers`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async updateAnswer(questionId: number, referenceAnswer: string) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/${questionId}/answer`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reference_answer: referenceAnswer }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  async approveAnswers(sessionId: number, questionIds?: number[]) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/questions/approve-answers`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ session_id: sessionId, question_ids: questionIds }),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },

  // Finalize Session
  async finalizeSession(sessionId: number) {
    const response = await makeAuthenticatedRequest(
      `${BASE}/api/sessions/${sessionId}/finalize`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );
    return handleResponse(response);
  },
};

