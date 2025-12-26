'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Answer {
  answer_id: number;
  question_id: number;
  question: string;
  answer: string;
  ai_score?: number;
  ai_feedback?: string;
  lecturer_score?: number;
  lecturer_feedback?: string;
}

interface StudentSessionDetail {
  student_session_id: number;
  student_name: string;
  student_id: string;
  session_name: string;
  session_type: string;
  score_total?: number;
  ai_overall_feedback?: string;
  answers: Answer[];
  join_time: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export default function ReviewStudentSessionPage() {
  const router = useRouter();
  const params = useParams();
  const studentSessionId = params?.student_session_id ? parseInt(params.student_session_id as string) : null;
  
  const [sessionDetail, setSessionDetail] = useState<StudentSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Local state for editing
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  useEffect(() => {
    if (studentSessionId) {
      loadStudentSessionDetail();
    }
  }, [studentSessionId]);

  const loadStudentSessionDetail = async () => {
    if (!studentSessionId) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await api.getStudentSessionDetail(studentSessionId);
      setSessionDetail(data);
      setAnswers(data.answers || []);
      setOverallScore(data.score_total || null);
    } catch (err) {
      console.error('Failed to load student session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin bài thi';
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError('Không tìm thấy bài thi. Vui lòng kiểm tra lại.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Bạn không có quyền xem bài thi này.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (answerId: number, newScore: number) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.answer_id === answerId
          ? { ...answer, lecturer_score: newScore }
          : answer
      )
    );
  };

  const handleFeedbackChange = (answerId: number, newFeedback: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.answer_id === answerId
          ? { ...answer, lecturer_feedback: newFeedback }
          : answer
      )
    );
  };

  const handleSave = async () => {
    if (!studentSessionId) return;

    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      // Save all answers
      const savePromises = answers.map(async (answer) => {
        const promises = [];
        
        // Update score if changed
        if (answer.lecturer_score !== undefined && answer.lecturer_score !== null) {
          promises.push(
            api.updateAnswerScore(answer.answer_id, answer.lecturer_score)
          );
        }
        
        // Update feedback if changed
        if (answer.lecturer_feedback !== undefined) {
          promises.push(
            api.updateAnswerFeedback(answer.answer_id, answer.lecturer_feedback)
          );
        }
        
        return Promise.all(promises);
      });

      await Promise.all(savePromises);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        // Reload data to get updated overall score
        loadStudentSessionDetail();
      }, 2000);
    } catch (err) {
      console.error('Failed to save:', err);
      setError(err instanceof Error ? err.message : 'Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const calculateOverallScore = () => {
    const scoredAnswers = answers.filter(a => a.lecturer_score !== undefined && a.lecturer_score !== null);
    if (scoredAnswers.length === 0) return null;
    const total = scoredAnswers.reduce((sum, a) => sum + (a.lecturer_score || 0), 0);
    return (total / scoredAnswers.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#5f6368]">Đang tải thông tin bài thi...</p>
          </div>
        </main>
        <TeacherFooter />
      </div>
    );
  }

  if (error || !sessionDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error || 'Không tìm thấy bài thi'}
          </div>
          <Link
            href="/teacher/exams"
            className="text-[#0065ca] hover:underline"
          >
            ← Quay lại danh sách buổi thi
          </Link>
        </main>
        <TeacherFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/teacher/exams"
            className="text-[#0065ca] hover:underline mb-4 inline-block"
          >
            ← Quay lại danh sách buổi thi
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#202124] mb-2">
                Review Bài Thi: {sessionDetail.student_name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                <span>Buổi thi: {sessionDetail.session_name}</span>
                <span>•</span>
                <span>Mã SV: {sessionDetail.student_id}</span>
                <span>•</span>
                <span>Tham gia: {formatDate(sessionDetail.join_time)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-[#5f6368]">Điểm tổng</div>
                <div className="text-2xl font-bold text-[#0065ca]">
                  {calculateOverallScore() || sessionDetail.score_total?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#0065ca] text-white font-semibold hover:bg-[#005bb5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6">
            Đã lưu thay đổi thành công!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Answers Form */}
        <div className="bg-white border border-gray-300 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Câu hỏi và câu trả lời</h2>
          
          {answers.length === 0 ? (
            <p className="text-[#5f6368] text-center py-8">Chưa có câu trả lời nào</p>
          ) : (
            <div className="space-y-8">
              {answers.map((answer, index) => (
                <div key={answer.answer_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#202124]">
                        Câu hỏi {index + 1}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-[#5f6368]">AI Score: </span>
                          <span className="font-semibold">
                            {answer.ai_score !== null && answer.ai_score !== undefined
                              ? answer.ai_score.toFixed(2)
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                      <p className="text-[#202124] whitespace-pre-wrap">{answer.question}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#5f6368] mb-2">
                      Câu trả lời của sinh viên
                    </label>
                    <div className="bg-gray-50 border border-gray-200 p-4">
                      <p className="text-[#202124] whitespace-pre-wrap">{answer.answer}</p>
                    </div>
                  </div>

                  {answer.ai_feedback && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#5f6368] mb-2">
                        Nhận xét từ AI
                      </label>
                      <div className="bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm text-[#202124] whitespace-pre-wrap">{answer.ai_feedback}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#202124] mb-2">
                        Điểm của giảng viên (0-10) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={answer.lecturer_score !== undefined && answer.lecturer_score !== null ? answer.lecturer_score : ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          if (value === null || (value >= 0 && value <= 10)) {
                            handleScoreChange(answer.answer_id, value || 0);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                        placeholder="Nhập điểm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#202124] mb-2">
                        Nhận xét của giảng viên
                      </label>
                      <textarea
                        value={answer.lecturer_feedback || ''}
                        onChange={(e) => handleFeedbackChange(answer.answer_id, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                        placeholder="Nhập nhận xét..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Feedback */}
        {sessionDetail.ai_overall_feedback && (
          <div className="bg-white border border-gray-300 p-6">
            <h2 className="text-xl font-semibold text-[#202124] mb-4">Nhận xét tổng quan từ AI</h2>
            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-[#202124] whitespace-pre-wrap">{sessionDetail.ai_overall_feedback}</p>
            </div>
          </div>
        )}
      </main>

      <TeacherFooter />
    </div>
  );
}

