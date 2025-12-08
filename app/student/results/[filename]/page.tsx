'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function ResultDetailPage() {
  const params = useParams<{ filename: string }>();
  const filename = decodeURIComponent(params.filename);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const studentSessionId = parseInt(filename);
    if (isNaN(studentSessionId)) {
      setError('Invalid session ID');
      setLoading(false);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadData = async (): Promise<boolean> => {
      try {
        const d = await api.getStudentSession(studentSessionId);
        
        // Check if grading is complete (has score_total)
        if (d.score_total === null || d.score_total === undefined) {
          // Still loading - wait page should handle this, but if user navigates directly, show loading
          setLoading(true);
          return false; // Not complete yet
        }
        
        // Backend returns: { student_session_id, session_id, session_name, session_type, score_total, ai_overall_feedback, answers: [...] }
        // Transform to match expected format
        const payload: any = {
          filename: filename,
          overall_score: d.score_total || 0,
          summary: d.ai_overall_feedback || '',
          scores: {
            correctness: 0,
            coverage: 0,
            reasoning: 0,
            creativity: 0,
            communication: 0,
            attitude: 0
          },
          details: (d.answers || []).map((answer: any) => ({
            question_id: answer.question_id,
            score: answer.ai_score || answer.lecturer_score || 0,
            notes: answer.ai_feedback || answer.lecturer_feedback || '',
            question: answer.question || '',
            answer: answer.answer || answer.answer_text || ''
          })),
          session_name: d.session_name,
          session_type: d.session_type,
          answers: d.answers || []
        };
        setData(payload);
        setLoading(false);
        return true; // Complete
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
        return false;
      }
    };

    // Initial load
    loadData().then((isComplete) => {
      if (!isComplete) {
        // If not complete, poll every 3 seconds until grading is complete
        intervalId = setInterval(async () => {
          const result = await loadData();
          if (result && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }
        }, 3000);
        
        // Cleanup after 5 minutes
        timeoutId = setTimeout(() => {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          setError('Chấm điểm mất quá nhiều thời gian. Vui lòng thử lại sau.');
          setLoading(false);
        }, 5 * 60 * 1000);
      }
    });

    // Cleanup on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [filename]);

  const summary = data?.summary || (typeof data?.summary === 'string' ? data.summary : '');
  const details = data?.details || [];
  const feedback: string | { overall_score?: number; strengths?: string; weaknesses?: string; hiring_recommendation?: string; overall_feedback?: string } | undefined = typeof summary === 'string' ? summary : (summary as any);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-2">Kết quả phỏng vấn</h1>
        {data?.session_name && (
          <p className="text-gray-600 mb-6">{data.session_name}</p>
        )}

        {loading ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Đang chấm điểm...</h2>
            <p className="text-gray-600 mb-2">AI đang chấm điểm các câu trả lời của bạn</p>
            <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 font-semibold mb-2">Lỗi</div>
            <div className="text-red-700">{error}</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary */}
            <section className="bg-white shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Tên phiên</div>
                  <div className="font-medium">{data?.session_name || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Loại phiên</div>
                  <div className="font-medium">{data?.session_type || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Điểm tổng</div>
                  <div className="font-medium">{data?.overall_score ? data.overall_score.toFixed(1) : '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Số câu hỏi</div>
                  <div className="font-medium">{Array.isArray(details) ? details.length : 0}</div>
                </div>
              </div>
            </section>

            {/* Overall Feedback */}
            {feedback && (
              <section className="bg-white shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Đánh giá tổng thể</h2>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Điểm tổng thể</div>
                  <div className="text-2xl font-bold text-[#0065ca]">{data?.overall_score ? `${data.overall_score.toFixed(1)} / 10` : '-'}</div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Nhận xét</div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {typeof feedback === 'string' 
                      ? feedback 
                      : (feedback && typeof feedback === 'object' 
                          ? (feedback.overall_feedback || feedback.strengths || '-') 
                          : '-')}
                  </p>
                </div>
              </section>
            )}

            {/* Details */}
            <section className="bg-white shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Chi tiết theo câu hỏi</h2>
              <div className="space-y-4">
                {(!Array.isArray(details) || details.length === 0) && (
                  <div className="text-gray-600">Không có dữ liệu chi tiết.</div>
                )}
                {Array.isArray(details) && details.map((item: any, index: number) => (
                  <div key={item.question_id || index} className="border border-gray-200 p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Câu hỏi {index + 1}</div>
                        <div className="font-medium whitespace-pre-wrap break-words mt-1">{item.question || '-'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Điểm</div>
                        <div className="font-semibold text-lg">{typeof item.score === 'number' ? item.score.toFixed(1) : '-'}</div>
                      </div>
                    </div>
                    {item.answer && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Câu trả lời của bạn</div>
                        <div className="bg-gray-50 border border-gray-200 p-3 whitespace-pre-wrap break-words text-gray-800">{item.answer}</div>
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-3">
                        <div className="text-sm font-semibold mb-1">Nhận xét</div>
                        <p className="text-gray-700 whitespace-pre-wrap break-words">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

