'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadMaterialPage() {
  const router = useRouter();

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
