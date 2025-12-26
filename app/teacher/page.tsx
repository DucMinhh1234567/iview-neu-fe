'use client';

import { useEffect } from 'react';
import { useBaseRouter } from '@/lib/useBaseRouter';

export default function TeacherPage() {
  const router = useBaseRouter();
  
  useEffect(() => {
    router.replace('/teacher/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}

