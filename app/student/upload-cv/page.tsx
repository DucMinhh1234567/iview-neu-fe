'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';

export default function UploadCVPage() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [level, setLevel] = useState('');
  const [configType, setConfigType] = useState<'time' | 'questions'>('time');
  const [timeLimit, setTimeLimit] = useState('');
  const [questionCount, setQuestionCount] = useState('');
  const [language, setLanguage] = useState<'vietnamese' | 'english'>('vietnamese');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName || !file || !jobTitle || !level) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (configType === 'time' && !timeLimit) {
      setError('Vui lòng nhập giới hạn thời gian');
      return;
    }

    if (configType === 'questions' && !questionCount) {
      setError('Vui lòng nhập số câu hỏi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create interview session (CV will be uploaded next)
      const sessionData: any = {
        session_name: sessionName,
        position: jobTitle,
        level: level,
      };

      if (configType === 'time') {
        sessionData.time_limit = parseInt(timeLimit);
      } else {
        sessionData.num_questions = parseInt(questionCount);
      }

      const sessionResponse = await api.createInterviewSession(sessionData);
      const sessionId = sessionResponse.session_id;

      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      // Step 2: Upload CV file (backend stores it and returns URL)
      await api.uploadCV(file, sessionId.toString());

      // Step 3: Upload JD if provided
      if (jdFile) {
        await api.uploadJD(jdFile, sessionId.toString());
      }

      // Step 4: Join session
      const joinResponse = await api.joinSession(sessionId);
      const studentSessionId = joinResponse.student_session_id;

      if (!studentSessionId) {
        throw new Error('Failed to join session');
      }

      // Step 5: Start session (this will generate questions using uploaded files)
      await api.startSession(studentSessionId);

      // Step 6: Redirect to interview page
      router.push(`/student/interview?student_session_id=${studentSessionId}`);
    } catch (err) {
      console.error('Error creating interview session:', err);
      setError('Có lỗi xảy ra: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-5 py-10 relative">
        <h1 className="text-3xl font-semibold mb-2 text-[#0065ca]">Luyện tập phỏng vấn</h1>
        <p className="text-[#5f6368] mb-8">Cấu hình buổi phỏng vấn việc làm</p>
        
        <form onSubmit={handleSubmit} className="bg-white  shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 ">
              {error}
            </div>
          )}

          {/* Đặt tên buổi phỏng vấn */}
          <div>
            <label htmlFor="session_name" className="block text-sm font-semibold text-[#202124] mb-3">
              Đặt tên buổi phỏng vấn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="session_name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ví dụ: Phỏng vấn Java Developer - Công ty ABC"
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            />
          </div>

          {/* Upload CV */}
          <div>
            <label htmlFor="cv_file" className="block text-sm font-semibold text-[#202124] mb-3">
              Upload CV <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="cv_file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            />
            <p className="text-xs text-[#5f6368] mt-1">Chấp nhận: PDF, PNG, JPG, JPEG</p>
          </div>

          {/* Upload JD (optional) */}
          <div>
            <label htmlFor="jd_file" className="block text-sm font-semibold text-[#202124] mb-3">
              Upload JD job (Job Description)
              <span className="text-[#5f6368] text-xs font-normal ml-2">(Tùy chọn)</span>
            </label>
            <input
              type="file"
              id="jd_file"
            accept=".pdf"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
            <p className="text-xs text-[#5f6368] mt-1">Nếu không có JD, bạn có thể bỏ qua bước này.</p>
          </div>

          {/* Nhập vị trí ứng tuyển */}
          <div>
            <label htmlFor="job_title" className="block text-sm font-semibold text-[#202124] mb-3">
              Nhập vị trí ứng tuyển <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="job_title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ví dụ: Java Developer, Product Manager, Data Analyst"
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              required
            />
          </div>

          {/* Chọn Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-[#202124] mb-3">
              Chọn Level <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              id="level"
              value={level}
              onChange={setLevel}
              options={[
                { value: 'Intern', label: 'Intern' },
                { value: 'Fresher', label: 'Fresher' },
                { value: 'Junior', label: 'Junior' },
                { value: 'Senior', label: 'Senior' },
                { value: 'Lead', label: 'Lead' }
              ]}
              placeholder="-- Chọn level --"
              required
            />
          </div>

          {/* Cấu hình thời gian hoặc Số câu hỏi */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Cấu hình thời gian hoặc Số câu hỏi <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="configType"
                    value="time"
                    checked={configType === 'time'}
                    onChange={(e) => setConfigType(e.target.value as 'time')}
                    className="mr-2"
                  />
                  <span className="text-sm">Giới hạn thời gian</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="configType"
                    value="questions"
                    checked={configType === 'questions'}
                    onChange={(e) => setConfigType(e.target.value as 'questions')}
                    className="mr-2"
                  />
                  <span className="text-sm">Số câu hỏi</span>
                </label>
              </div>
              
              {configType === 'time' ? (
                <div>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="Nhập số phút (ví dụ: 30)"
                    min="1"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                  />
                  <p className="text-xs text-[#5f6368] mt-1">Thời gian tối đa cho buổi phỏng vấn (phút)</p>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    placeholder="Nhập số câu hỏi (ví dụ: 10)"
                    min="1"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                  />
                  <p className="text-xs text-[#5f6368] mt-1">Số lượng câu hỏi sẽ được tạo</p>
                </div>
              )}
            </div>
          </div>

          {/* Chọn ngôn ngữ */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Chọn ngôn ngữ <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center p-3 border border-gray-200  hover:border-[#0065ca] cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="vietnamese"
                  checked={language === 'vietnamese'}
                  onChange={(e) => setLanguage(e.target.value as 'vietnamese')}
                  className="mr-3"
                />
                <span className="text-sm">Tiếng Việt</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200  hover:border-[#0065ca] cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="english"
                  checked={language === 'english'}
                  onChange={(e) => setLanguage(e.target.value as 'english')}
                  className="mr-3"
                />
                <span className="text-sm">English</span>
              </label>
            </div>
            <p className="text-xs text-[#5f6368] mt-2">Ngôn ngữ sẽ được sử dụng cho câu hỏi và giao diện phỏng vấn</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300  hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-[#0065ca] text-white font-semibold  hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Tạo buổi phỏng vấn'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#0065ca] border-t-transparent animate-spin mb-4"></div>
            <div className="text-[#0065ca] font-semibold">Hệ thống đang tạo câu hỏi, vui lòng chờ...</div>
          </div>
        </div>
      )}
    </div>
  );
}

