'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';

interface Material {
  material_id: number;
  title: string;
  is_public: boolean;
}

export default function CreateExamSessionPage() {
  const router = useRouter();
  const [subjectType, setSubjectType] = useState<'select' | 'custom'>('select');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [bloomLevel, setBloomLevel] = useState<string[]>([]);
  const [language, setLanguage] = useState<'vietnamese' | 'english'>('vietnamese');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitingForQuestions, setWaitingForQuestions] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const subjects = [
    'Kinh tế vi mô',
    'Kinh tế lượng',
    'Tài chính doanh nghiệp',
    'Quản trị học',
    'Marketing căn bản',
    'Kế toán tài chính'
  ];

  // Load materials from backend
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const materialsData = await api.getMaterials();
        // Filter to only show public materials for students
        const publicMaterials = (materialsData || []).filter((m: Material) => m.is_public === true);
        setMaterials(publicMaterials);
      } catch (err) {
        console.error('Failed to load materials:', err);
        // Continue with empty materials list
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, []);

  const bloomLevels = [
    { value: 'remember', label: 'Remember (Nhớ lại)' },
    { value: 'understand', label: 'Understand (Hiểu)' },
    { value: 'apply', label: 'Apply (Áp dụng)' },
    { value: 'analyze', label: 'Analyze (Phân tích)' },
    { value: 'evaluate', label: 'Evaluate (Đánh giá)' },
    { value: 'create', label: 'Create (Sáng tạo)' }
  ];

  const handleBloomChange = (level: string) => {
    setBloomLevel(prev => {
      const index = prev.indexOf(level);
      if (index > -1) {
        // Remove level and all higher levels
        const levelIndex = bloomLevels.findIndex(l => l.value === level);
        return prev.filter(l => {
          const lIndex = bloomLevels.findIndex(bl => bl.value === l);
          return lIndex < levelIndex;
        });
      } else {
        // Add level and all lower levels
        const levelIndex = bloomLevels.findIndex(l => l.value === level);
        const levelsToAdd = bloomLevels.slice(0, levelIndex + 1).map(l => l.value);
        const newLevels = [...new Set([...prev, ...levelsToAdd])];
        return newLevels.sort((a, b) => {
          const aIndex = bloomLevels.findIndex(l => l.value === a);
          const bIndex = bloomLevels.findIndex(l => l.value === b);
          return aIndex - bIndex;
        });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bloomLevel.length === 0) {
      setError('Vui lòng chọn ít nhất một mức độ khó Bloom');
      return;
    }

    if (!sessionName || !timeLimit) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const courseName = subjectType === 'select' ? selectedSubject : customSubject;
    if (!courseName) {
      setError('Vui lòng chọn hoặc nhập tên môn học');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map Bloom levels to backend difficulty_level format
      // Backend expects a single difficulty level, use the highest selected level
      const bloomLevelMapping: Record<string, string> = {
        'remember': 'REMEMBER',
        'understand': 'UNDERSTAND',
        'apply': 'APPLY',
        'analyze': 'ANALYZE',
        'evaluate': 'EVALUATE',
        'create': 'CREATE'
      };
      
      // Get the highest selected level
      const highestLevel = bloomLevel[bloomLevel.length - 1];
      const difficultyLevel = bloomLevelMapping[highestLevel] || 'APPLY';

      // Step 1: Create practice session
      const sessionData: any = {
        session_name: sessionName,
        course_name: courseName,
        difficulty_level: difficultyLevel,
        time_limit: parseInt(timeLimit),
      };

      if (selectedMaterialId) {
        sessionData.material_id = selectedMaterialId;
      }

      const sessionResponse = await api.createPracticeSession(sessionData);
      const sessionId = sessionResponse.session_id;

      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      // Step 2: Join session
      const joinResponse = await api.joinSession(sessionId);
      const studentSessionId = joinResponse.student_session_id;

      if (!studentSessionId) {
        throw new Error('Failed to join session');
      }

      // Step 3: Start session (this will generate questions)
      await api.startSession(studentSessionId);

      // Step 4: Wait (poll) until questions are available for this student session
      try {
        setWaitingForQuestions(true);
        const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
        const maxAttempts = 30; // ~60s
        const intervalMs = 2000;
        let found = false;
        for (let i = 0; i < maxAttempts; i++) {
          try {
            const sessionDetail = await api.getStudentSession(studentSessionId);
            // Try to detect questions array in response
            const arrays = Object.values(sessionDetail || {}).filter(v => Array.isArray(v));
            if (arrays.some((a: any) => (a as any[]).length > 0)) {
              found = true;
              break;
            }
          } catch (pollErr) {
            console.warn('Polling student session for questions failed:', pollErr);
          }
          await sleep(intervalMs);
        }

        if (!found) {
          // still navigate but set an error message so user knows questions may not be ready
          setError('Câu hỏi chưa sẵn sàng sau thời gian chờ. Bạn sẽ được chuyển tiếp, vui lòng kiểm tra lại sau.');
        }
      } finally {
        setWaitingForQuestions(false);
      }

      // Step 5: Redirect to interview page
      router.push(`/student/interview?student_session_id=${studentSessionId}`);
    } catch (err) {
      console.error('Error creating practice session:', err);
      setError('Có lỗi xảy ra: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Luyện tập vấn đáp</h1>
        <p className="text-[#5f6368] mb-8">Cấu hình buổi luyện tập vấn đáp môn học</p>

        <form onSubmit={handleSubmit} className="bg-white  shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 ">
              {error}
            </div>
          )}

          {/* Chọn môn học phần / tự nhập */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Chọn môn học phần / Tự nhập tên môn <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subjectType"
                    value="select"
                    checked={subjectType === 'select'}
                    onChange={(e) => setSubjectType(e.target.value as 'select')}
                    className="mr-2"
                  />
                  <span className="text-sm">Chọn từ danh sách</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="subjectType"
                    value="custom"
                    checked={subjectType === 'custom'}
                    onChange={(e) => setSubjectType(e.target.value as 'custom')}
                    className="mr-2"
                  />
                  <span className="text-sm">Tự nhập</span>
                </label>
              </div>
              
              {subjectType === 'select' ? (
                <CustomSelect
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={subjects.map(subject => ({ value: subject, label: subject }))}
                  placeholder="-- Chọn môn học --"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Nhập tên môn học..."
                  required
                  className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
                />
              )}
            </div>
          </div>

          {/* Chọn tài liệu chung do GV upload (optional) */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Chọn tài liệu chung do GV upload (nếu có)
              <span className="text-[#5f6368] text-xs font-normal ml-2">(Tùy chọn)</span>
            </label>
            {loadingMaterials ? (
              <div className="text-sm text-[#5f6368]">Đang tải danh sách tài liệu...</div>
            ) : (
              <CustomSelect
                value={selectedMaterialId?.toString() || ''}
                onChange={(value) => setSelectedMaterialId(value ? parseInt(value) : null)}
                options={[
                  { value: '', label: '-- Không chọn tài liệu --' },
                  ...materials.map(material => ({ 
                    value: material.material_id.toString(), 
                    label: material.title 
                  }))
                ]}
                placeholder="-- Không chọn tài liệu --"
              />
            )}
          </div>

          {/* Đặt tên buổi luyện tập */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Đặt tên buổi luyện tập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Ví dụ: Luyện tập giữa kỳ - Kinh tế vi mô"
              required
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
          </div>

          {/* Đặt giới hạn thời gian */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Đặt giới hạn thời gian (phút) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="Ví dụ: 30"
              min="1"
              required
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
          </div>

          {/* Chọn độ khó Bloom */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Chọn độ khó theo thang đo Bloom <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[#5f6368] mb-3">Khi chọn độ khó cao hơn, hệ thống sẽ tự động bao gồm cả độ khó thấp hơn</p>
            <div className="space-y-2">
              {bloomLevels.map((level) => (
                <label key={level.value} className="flex items-center p-3 border border-gray-200  hover:border-[#0065ca] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bloomLevel.includes(level.value)}
                    onChange={() => handleBloomChange(level.value)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm">{level.label}</span>
                </label>
              ))}
            </div>
            {bloomLevel.length > 0 && (
              <p className="text-xs text-[#5f6368] mt-2">
                Đã chọn: {bloomLevel.map(l => bloomLevels.find(bl => bl.value === l)?.label).join(', ')}
              </p>
            )}
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
              disabled={loading || waitingForQuestions}
              className="flex-1 px-6 py-2.5 bg-[#0065ca] text-white font-semibold  hover:bg-[#004a95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || waitingForQuestions ? 'Đang tạo và chuẩn bị câu hỏi...' : 'Tạo buổi luyện tập'}
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {/* Overlay while waiting for questions */}
      {waitingForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md p-6 flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-t-transparent border-[#0065ca] rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-[#202124]">Đang chuẩn bị câu hỏi cho buổi luyện tập...</p>
              <p className="text-sm text-[#5f6368]">Quá trình có thể mất vài chục giây. Vui lòng đợi.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

