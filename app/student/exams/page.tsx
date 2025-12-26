'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import { useBaseRouter } from '@/lib/useBaseRouter';
import { api } from '@/lib/api';

interface Exam {
  session_id: number;
  session_name: string;
  course_name?: string;
  status: string;
  password?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export default function ExamsPage() {
  const router = useBaseRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      // Get EXAM sessions - students can see all EXAM sessions
      const data = await api.getSessions({ type: 'EXAM' });
      
      // Filter only ready or active sessions for students
      const availableExams = (data || []).filter((exam: Exam) => 
        exam.status === 'ready' || exam.status === 'active'
      );
      
      setExams(availableExams);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách kỳ thi');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchSubject = subjectFilter === 'all' || 
      exam.course_name?.toLowerCase().includes(subjectFilter.toLowerCase());
    const matchSearch = exam.session_name.toLowerCase().includes(searchInput.toLowerCase()) ||
      exam.course_name?.toLowerCase().includes(searchInput.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Get unique subjects for filter
  const subjects = ['all', ...Array.from(new Set(exams.map(e => e.course_name).filter(Boolean) as string[]))];

  const handleEnterExam = (exam: Exam) => {
    setSelectedExam(exam);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = async () => {
    if (!selectedExam) return;
    
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return;
    }

    setJoining(true);
    setPasswordError('');

    try {
      // Join session with password
      const joinResponse = await api.joinSession(selectedExam.session_id, password);
      const studentSessionId = joinResponse.student_session_id;

      if (!studentSessionId) {
        throw new Error('Không thể tham gia kỳ thi');
      }

      // Start session
      await api.startSession(studentSessionId);

      // Close modal and redirect to interview
      setSelectedExam(null);
      setPassword('');
      router.push(`/student/interview?student_session_id=${studentSessionId}`);
    } catch (err) {
      console.error('Join exam error:', err);
      setPasswordError(err instanceof Error ? err.message : 'Mật khẩu không đúng hoặc không thể tham gia kỳ thi');
    } finally {
      setJoining(false);
    }
  };

  const handleClosePasswordModal = () => {
    setSelectedExam(null);
    setPassword('');
    setPasswordError('');
  };

  const formatDate = (dateString?: string) => {
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

  const getTimeRange = (start?: string, end?: string) => {
    if (!start && !end) return '';
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return start ? `Từ ${formatDate(start)}` : `Đến ${formatDate(end)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-[#0065ca] text-3xl font-bold uppercase tracking-wide mb-4">Kỳ Thi</h1>
        <p className="text-[#5f6368] mb-6">
          Danh sách các kỳ thi đã được giảng viên tạo. Bạn có thể lọc theo học phần hoặc tìm kiếm.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-none mb-6">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 shadow-sm p-3 flex gap-3 items-center mb-6 flex-wrap rounded-none">
          <div className="w-[260px]">
            <CustomSelect
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={[
                { value: 'all', label: 'Tất cả học phần' },
                ...subjects.filter(s => s !== 'all').map(subject => ({
                  value: subject,
                  label: subject
                }))
              ]}
              placeholder="-- Chọn học phần --"
              className="truncate"
            />
          </div>
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên kỳ thi..."
            className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0065ca] max-w-[260px] rounded-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0065ca] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#5f6368]">Đang tải danh sách kỳ thi...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-12 text-[#5f6368]">
            {exams.length === 0 
              ? 'Hiện tại chưa có kỳ thi nào sẵn sàng.' 
              : 'Không tìm thấy kỳ thi nào phù hợp với bộ lọc của bạn.'}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {filteredExams.map((exam) => (
              <article key={exam.session_id} className="bg-white border border-gray-200 shadow-sm p-4.5 transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#0065ca] rounded-none">
                <div className="text-lg font-semibold text-[#202124] mb-1.5">{exam.session_name}</div>
                {exam.course_name && (
                  <div className="text-sm text-[#0065ca] mb-2 font-medium">{exam.course_name}</div>
                )}
                <div className="text-[#5f6368] text-sm mb-3 space-y-1">
                  {getTimeRange(exam.start_time, exam.end_time) && (
                    <div>Thời gian: {getTimeRange(exam.start_time, exam.end_time)}</div>
                  )}
                  <div>Hình thức: Vấn đáp AI</div>
                  <div>Trạng thái: {exam.status === 'ready' ? 'Sẵn sàng' : 'Đang diễn ra'}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide rounded-none ${
                    exam.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-[#eef4ff] text-[#0065ca]'
                  }`}>
                    {exam.status === 'active' ? 'Đang diễn ra' : 'Sẵn sàng'}
                  </span>
                  <button 
                    onClick={() => handleEnterExam(exam)}
                    className="bg-[#0065ca] text-white px-3 py-2 rounded-none hover:bg-[#004a95] transition-colors text-sm font-medium"
                  >
                    Vào thi
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />

      {/* Password Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClosePasswordModal} />
          <div className="relative bg-white rounded-none w-[92%] max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Nhập mật khẩu kỳ thi</h3>
            <p className="text-gray-700 mb-4">
              Kỳ thi: <span className="font-semibold">{selectedExam.session_name}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Nhập mật khẩu kỳ thi"
                className="w-full px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                autoFocus
                disabled={joining}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !joining) {
                    handlePasswordSubmit();
                  }
                }}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={handleClosePasswordModal}
                disabled={joining}
                className="px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={handlePasswordSubmit}
                disabled={joining}
                className="px-4 py-2 bg-[#0065ca] text-white rounded-none hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? 'Đang tham gia...' : 'Vào thi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
