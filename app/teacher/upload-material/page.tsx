'use client';

import { useEffect } from 'react';
import { useBaseRouter } from '@/lib/useBaseRouter';

export default function UploadMaterialPage() {
  const router = useBaseRouter();

  useEffect(() => {
    // Redirect to materials page
    router.replace('/teacher/materials');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}
