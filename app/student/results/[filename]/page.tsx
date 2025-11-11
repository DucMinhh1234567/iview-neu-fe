'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface FeedbackObject {
  overall_score?: number;
  strengths?: string;
  weaknesses?: string;
  hiring_recommendation?: string;
  overall_feedback?: string;
}

export default function ResultDetailPage() {
  const params = useParams<{ filename: string }>();
  const filename = decodeURIComponent(params.filename);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // filename is now student_session_id
        const studentSessionId = parseInt(filename);
        if (isNaN(studentSessionId)) {
          setError('Invalid session ID');
          setLoading(false);
          return;
        }
        
        const d = await api.getStudentSession(studentSessionId);
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
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filename]);

  const summary = data?.summary || '';
  const details = data?.details || [];
  // feedback can be either a string or an object with feedback properties
  const feedback: string | FeedbackObject | undefined = typeof summary === 'string' 
    ? summary 
    : (typeof summary === 'object' && summary !== null ? summary as FeedbackObject : undefined);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-semibold mb-2">Kết quả phỏng vấn</h1>
        {data?.session_name && (
          <p className="text-gray-600 mb-6">{data.session_name}</p>
        )}

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-[#0065ca] border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải kết quả...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
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
                      : (typeof feedback === 'object' && feedback !== null
                        ? (feedback.overall_feedback || feedback.strengths || feedback.weaknesses || feedback.hiring_recommendation || '-')
                        : '-')
                    }
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

