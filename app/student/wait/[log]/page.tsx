'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function WaitPage() {
  const params = useParams<{ log: string }>();
  const router = useRouter();
  const log = decodeURIComponent(params.log);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend processes answers synchronously, so we can check status and redirect immediately
    const checkStatus = async () => {
      try {
        // log is now student_session_id
        const studentSessionId = parseInt(log);
        if (isNaN(studentSessionId)) {
          setError('Invalid session ID');
          setLoading(false);
          return;
        }

        // Check if session is completed
        const session = await api.getStudentSession(studentSessionId);
        
        // If session has score_total, it's completed, redirect to results
        if (session.score_total !== null && session.score_total !== undefined) {
          router.push(`/student/results/${studentSessionId}`);
          return;
        }

        // Otherwise, redirect to results anyway (backend doesn't have async processing)
        // The results page will show "no results yet" or handle it appropriately
        router.push(`/student/results/${studentSessionId}`);
      } catch (e) {
        console.error('Error checking session status:', e);
        setError(e instanceof Error ? e.message : 'Lỗi kết nối');
        setLoading(false);
        // Still redirect to results after a short delay
        setTimeout(() => {
          router.push(`/student/results/${log}`);
        }, 2000);
      }
    };

    checkStatus();
  }, [log, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto text-center py-24 px-5">
        <h1 className="text-2xl font-semibold mb-3">Đang xử lý kết quả...</h1>
        <div className="mx-auto w-16 h-16 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin mb-4"></div>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {!error && (
          <p className="text-gray-500 mt-6">Đang chuyển đến trang kết quả...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

