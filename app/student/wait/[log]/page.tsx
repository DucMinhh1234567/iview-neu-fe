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
    // Polling to check if AI grading is complete
    const studentSessionId = parseInt(log);
    if (isNaN(studentSessionId)) {
      setError('Invalid session ID');
      setLoading(false);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const checkStatus = async (): Promise<boolean> => {
      try {
        // Check if session is completed (has score_total)
        const session = await api.getStudentSession(studentSessionId);
        
        // If session has score_total, AI grading is complete, redirect to results
        if (session.score_total !== null && session.score_total !== undefined) {
          if (isMounted) {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
            router.push(`/student/results/${studentSessionId}`);
          }
          return true; // Stop polling
        }

        // If not completed yet, continue polling
        return false;
      } catch (e) {
        console.error('Error checking session status:', e);
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Lỗi kết nối');
        }
        // Don't stop polling on error, might be temporary
        return false;
      }
    };

    // Initial check
    checkStatus().then((isComplete) => {
      if (!isComplete && isMounted) {
        // If not completed, start polling every 3 seconds
        intervalId = setInterval(async () => {
          if (!isMounted) {
            if (intervalId) clearInterval(intervalId);
            return;
          }
          const result = await checkStatus();
          if (result && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, 3000); // Poll every 3 seconds

        // Cleanup interval after 5 minutes (timeout)
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          setError('Chấm điểm mất quá nhiều thời gian. Vui lòng thử lại sau.');
          setLoading(false);
          // Redirect to results anyway after timeout
          setTimeout(() => {
            if (isMounted) {
              router.push(`/student/results/${log}`);
            }
          }, 2000);
        }, 5 * 60 * 1000); // 5 minutes timeout
      }
    });

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [log, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto text-center py-24 px-5">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Đang chấm điểm...</h1>
          <div className="mx-auto w-20 h-20 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin mb-6"></div>
          {error ? (
            <div className="mt-4">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Đang chuyển đến trang kết quả...</p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-gray-600 mb-2">AI đang chấm điểm các câu trả lời của bạn</p>
              <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

