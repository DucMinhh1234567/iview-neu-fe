'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to exams page if accessed directly
    const studentSessionId = searchParams?.get('student_session_id');
    if (studentSessionId) {
      router.replace(`/teacher/review/${studentSessionId}`);
    } else {
      router.replace('/teacher/exams');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-[#5f6368]">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
