'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Session {
  session_id: number;
  session_name: string;
  session_type: string;
  course_name?: string;
  status: string;
  password?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  student_count?: number;
  difficulty_level?: string;
  material_id?: number;
  opening_script?: string;
  closing_script?: string;
  questions_count?: number;
}

interface Student {
  student_session_id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  score_total?: number;
  join_time: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id ? parseInt(params.id as string) : null;
  
  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  useEffect(() => {
    if (sessionId) {
      loadSessionDetail();
      loadStudents();
    }
  }, [sessionId]);

  const loadSessionDetail = async () => {
    if (!sessionId) {
      setError('Session ID không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await api.getSession(sessionId);
      if (!data || !data.session_id) {
        throw new Error('Không tìm thấy thông tin buổi thi');
      }
      setSession(data);
    } catch (err) {
      console.error('Failed to load session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin buổi thi';
      
      // More specific error messages
      if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('Resource not found')) {
        setError('Không tìm thấy buổi thi. Vui lòng kiểm tra lại session ID.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Bạn không có quyền truy cập buổi thi này. Vui lòng đăng nhập lại.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Bạn không có quyền xem buổi thi này.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!sessionId) return;
    
    try {
      const data = await api.getSessionStudents(sessionId);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      // Don't show error for students, just log it
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      created: { label: 'Đã tạo', color: 'bg-gray-100 text-gray-800' },
      generating_questions: { label: 'Đang tạo câu hỏi', color: 'bg-blue-100 text-blue-800' },
      reviewing_questions: { label: 'Đang xem xét câu hỏi', color: 'bg-yellow-100 text-yellow-800' },
      generating_answers: { label: 'Đang tạo đáp án', color: 'bg-blue-100 text-blue-800' },
      reviewing_answers: { label: 'Đang xem xét đáp án', color: 'bg-yellow-100 text-yellow-800' },
      generating_script: { label: 'Đang tạo script', color: 'bg-blue-100 text-blue-800' },
      reviewing_script: { label: 'Đang xem xét script', color: 'bg-yellow-100 text-yellow-800' },
      ready: { label: 'Sẵn sàng', color: 'bg-green-100 text-green-800' },
      active: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
      ended: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#5f6368]">Đang tải thông tin buổi thi...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-5 py-10">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Không tìm thấy buổi thi'}
          </div>
          <Link
            href="/teacher/exams"
            className="text-[#0065ca] hover:underline"
          >
            ← Quay lại danh sách buổi thi
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const reviewedCount = students.filter(s => s.reviewed_by).length;
  const pendingReviewCount = students.length - reviewedCount;
  const averageScore = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.score_total || 0), 0) / students.length).toFixed(2)
    : 0;

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
              <h1 className="text-3xl font-semibold text-[#202124] mb-2">{session.session_name}</h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(session.status)}
                {session.course_name && (
                  <span className="text-[#5f6368] text-sm">{session.course_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#0065ca] text-[#0065ca]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-[#0065ca] text-[#0065ca]'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Sinh viên ({students.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-[#0065ca] mb-1">{session.student_count || 0}</div>
                <div className="text-sm text-[#5f6368]">Tổng số sinh viên</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-1">{reviewedCount}</div>
                <div className="text-sm text-[#5f6368]">Đã review</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingReviewCount}</div>
                <div className="text-sm text-[#5f6368]">Chờ review</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">{averageScore}</div>
                <div className="text-sm text-[#5f6368]">Điểm trung bình</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-orange-600 mb-1">{session.questions_count || 0}</div>
                <div className="text-sm text-[#5f6368]">Số câu hỏi</div>
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#202124] mb-4">Thông tin buổi thi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Tên buổi thi</label>
                  <p className="text-[#202124] mt-1">{session.session_name}</p>
                </div>
                {session.course_name && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Môn học</label>
                    <p className="text-[#202124] mt-1">{session.course_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(session.status)}</div>
                </div>
                {session.difficulty_level && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Độ khó</label>
                    <p className="text-[#202124] mt-1">{session.difficulty_level}</p>
                  </div>
                )}
                {session.start_time && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Thời gian bắt đầu</label>
                    <p className="text-[#202124] mt-1">{formatDate(session.start_time)}</p>
                  </div>
                )}
                {session.end_time && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Thời gian kết thúc</label>
                    <p className="text-[#202124] mt-1">{formatDate(session.end_time)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#5f6368]">Ngày tạo</label>
                  <p className="text-[#202124] mt-1">{formatDate(session.created_at)}</p>
                </div>
                {session.password && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Mật khẩu</label>
                    <p className="text-[#202124] mt-1 font-mono">{session.password}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scripts */}
            {(session.opening_script || session.closing_script) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#202124] mb-4">Scripts</h2>
                {session.opening_script && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-[#5f6368]">Script mở đầu</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-[#202124] whitespace-pre-wrap">
                      {session.opening_script}
                    </div>
                  </div>
                )}
                {session.closing_script && (
                  <div>
                    <label className="text-sm font-medium text-[#5f6368]">Script kết thúc</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-[#202124] whitespace-pre-wrap">
                      {session.closing_script}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {students.length === 0 ? (
              <div className="p-12 text-center text-[#5f6368]">
                Chưa có sinh viên nào tham gia buổi thi này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Tên sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Mã sinh viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Thời gian tham gia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#5f6368] uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={student.student_session_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#202124]">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#202124]">
                          {student.student_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f6368]">
                          {student.student_code || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#202124]">
                          {student.score_total !== null && student.score_total !== undefined
                            ? student.score_total.toFixed(2)
                            : 'Chưa có điểm'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5f6368]">
                          {formatDate(student.join_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.reviewed_by ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Đã review
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Chờ review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/teacher/review/${student.student_session_id}`}
                            className="text-[#0065ca] hover:underline font-medium"
                          >
                            Review bài thi
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

