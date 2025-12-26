'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';
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
}

export default function TeacherExamsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      // Get EXAM sessions created by current lecturer
      // Backend now returns student_count for each session (optimized with batch query)
      const data = await api.getSessions({ type: 'EXAM' });
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách buổi thi';
      
      // Handle timeout specifically
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        setError('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      created: { label: 'Đã tạo', color: 'bg-slate-800 text-white' },
      generating_questions: { label: 'Đang tạo câu hỏi', color: 'bg-indigo-900 text-white' },
      reviewing_questions: { label: 'Đang xem xét câu hỏi', color: 'bg-amber-900 text-white' },
      generating_answers: { label: 'Đang tạo đáp án', color: 'bg-indigo-900 text-white' },
      reviewing_answers: { label: 'Đang xem xét đáp án', color: 'bg-amber-900 text-white' },
      ready: { label: 'Sẵn sàng', color: 'bg-emerald-900 text-white' },
      active: { label: 'Đang diễn ra', color: 'bg-emerald-900 text-white' },
      ended: { label: 'Đã kết thúc', color: 'bg-slate-800 text-white' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-slate-800 text-white' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusInfo.color}`}>
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

  const filteredSessions = sessions.filter(session => {
    const matchStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchSearch = searchQuery === '' || 
      session.session_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.course_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Quản Lý Buổi Thi</h1>
          <p className="text-[#5f6368]">Xem và quản lý các buổi thi do bạn tạo</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-300 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên buổi thi hoặc môn học..."
                className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div className="md:w-48">
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'created', label: 'Đã tạo' },
                  { value: 'ready', label: 'Sẵn sàng' },
                  { value: 'active', label: 'Đang diễn ra' },
                  { value: 'ended', label: 'Đã kết thúc' }
                ]}
                placeholder="-- Chọn trạng thái --"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#5f6368]">Đang tải dữ liệu...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white border border-gray-300 shadow-sm p-12 text-center">
            <p className="text-[#5f6368] mb-4">
              {sessions.length === 0 
                ? 'Bạn chưa tạo buổi thi nào. Hãy tạo buổi thi đầu tiên!' 
                : 'Không tìm thấy buổi thi nào phù hợp với bộ lọc.'}
            </p>
            {sessions.length === 0 && (
              <Link
                href="/teacher/create-exam"
                className="inline-block px-8 py-3 bg-slate-900 text-white font-semibold uppercase tracking-wider hover:bg-slate-800 transition-all duration-200 shadow-lg"
              >
                Tạo Buổi Thi Mới
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.session_id}
                className="bg-white border border-gray-300 shadow-sm p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[#202124]">
                        {session.session_name}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-[#5f6368]">
                      {session.course_name && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>{session.course_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{session.student_count || 0} sinh viên đã tham gia</span>
                      </div>
                      
                      {session.start_time && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Bắt đầu: {formatDate(session.start_time)}</span>
                        </div>
                      )}
                      
                      {session.end_time && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Kết thúc: {formatDate(session.end_time)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-xs text-[#5f6368]">
                      Tạo lúc: {formatDate(session.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:flex-row">
                    <Link
                      href={`/teacher/exams/${session.session_id}`}
                      className="px-6 py-2.5 bg-slate-900 text-white font-semibold uppercase tracking-wider hover:bg-slate-800 transition-all duration-200 text-center shadow-md"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => {
                        // Copy session ID or show details
                        navigator.clipboard.writeText(session.session_id.toString());
                        alert('Đã copy Session ID: ' + session.session_id);
                      }}
                      className="px-6 py-2.5 bg-slate-100 text-slate-800 font-semibold uppercase tracking-wider hover:bg-slate-200 border border-slate-300 transition-all duration-200"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <TeacherFooter />
    </div>
  );
}

