'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/teacher/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}

