// Auth utility functions
// Use sessionStorage instead of localStorage to auto-clear on tab close

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('authToken') || sessionStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('authToken', token);
  sessionStorage.setItem('token', token); // Support both keys
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
}

export function setUserInfo(userInfo: {
  isLoggedIn?: boolean;
  userRole?: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
  studentCode?: string;
  lecturerCode?: string;
}): void {
  if (typeof window === 'undefined') return;
  if (userInfo.isLoggedIn !== undefined) {
    sessionStorage.setItem('isLoggedIn', String(userInfo.isLoggedIn));
  }
  if (userInfo.userRole) {
    sessionStorage.setItem('userRole', userInfo.userRole);
  }
  if (userInfo.userEmail) {
    sessionStorage.setItem('userEmail', userInfo.userEmail);
  }
  if (userInfo.userName) {
    sessionStorage.setItem('userName', userInfo.userName);
  }
  if (userInfo.userId) {
    sessionStorage.setItem('userId', userInfo.userId);
  }
  if (userInfo.studentCode) {
    sessionStorage.setItem('studentCode', userInfo.studentCode);
  }
  if (userInfo.lecturerCode) {
    sessionStorage.setItem('lecturerCode', userInfo.lecturerCode);
  }
}

export function getUserInfo(): {
  isLoggedIn: boolean;
  userRole: string | null;
  userEmail: string | null;
  userName: string | null;
  userId: string | null;
  studentCode: string | null;
  lecturerCode: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      isLoggedIn: false,
      userRole: null,
      userEmail: null,
      userName: null,
      userId: null,
      studentCode: null,
      lecturerCode: null,
    };
  }
  return {
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
    userRole: sessionStorage.getItem('userRole'),
    userEmail: sessionStorage.getItem('userEmail'),
    userName: sessionStorage.getItem('userName'),
    userId: sessionStorage.getItem('userId'),
    studentCode: sessionStorage.getItem('studentCode'),
    lecturerCode: sessionStorage.getItem('lecturerCode'),
  };
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  // Clear all auth-related data
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('studentCode');
  sessionStorage.removeItem('lecturerCode');
}

// Setup cleanup on page unload (backup - sessionStorage already clears on tab close)
export function setupAuthCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Cleanup on beforeunload (when user closes tab/window)
  window.addEventListener('beforeunload', () => {
    // sessionStorage will be automatically cleared, but we can add additional cleanup here if needed
  });
  
  // Also cleanup on pagehide (for mobile browsers)
  window.addEventListener('pagehide', () => {
    // sessionStorage will be automatically cleared
  });
}

