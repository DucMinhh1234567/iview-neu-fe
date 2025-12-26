'use client';

import { useEffect } from 'react';
import { useBaseRouter } from '@/lib/useBaseRouter';
import { getUserInfo } from '@/lib/auth';

export default function HomePage() {
  const router = useBaseRouter();

  useEffect(() => {
    // Check if user is logged in (from sessionStorage)
    if (typeof window !== 'undefined') {
      const userInfo = getUserInfo();
      const { isLoggedIn, userRole } = userInfo;

      if (isLoggedIn && userRole) {
        // User is logged in, redirect to their home page
        if (userRole === 'student') {
          router.replace('/student/home');
        } else if (userRole === 'teacher' || userRole === 'lecturer') {
          router.replace('/teacher/dashboard');
        } else {
          router.replace('/select-role');
        }
      } else {
        // User is not logged in, redirect to role selection
        router.replace('/select-role');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent  animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
