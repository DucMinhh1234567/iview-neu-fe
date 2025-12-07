'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';
import { getUserInfo } from '@/lib/auth';

interface Material {
  material_id: number;
  title: string;
  description?: string;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  file_url?: string;
  num_chunks?: number;
}

export default function CreateExamPage() {
  const router = useRouter();
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [materialSource, setMaterialSource] = useState<'uploaded' | 'neureader'>('uploaded');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [bloomLevel, setBloomLevel] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [language, setLanguage] = useState<'vietnamese' | 'english'>('vietnamese');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  // Load materials from API
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const data = await api.getMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load materials:', err);
      // Don't show error here, just log it
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Filter materials: show public materials and my materials (private)
  const isMyMaterial = (material: Material) => {
    if (typeof window === 'undefined') return false;
    const userInfo = getUserInfo();
    if (!userInfo.userId) return false;
    return material.uploaded_by === parseInt(userInfo.userId);
  };

  const filteredMaterials = materials.filter((material) => {
    return material.is_public || isMyMaterial(material);
  });

  // Format materials for dropdown
  const materialOptions = filteredMaterials.map(material => ({
    value: material.material_id.toString(),
    label: `${material.title}${material.is_public ? ' (Public)' : ' (Private)'}`
  }));

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
    
    if (!examName || !subjectName || !timeLimit || bloomLevel.length === 0 || !password || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (materialSource === 'uploaded' && !selectedMaterial) {
      setError('Vui lòng chọn tài liệu');
      return;
    }

    // NeuReader is not implemented yet
    if (materialSource === 'neureader') {
      setError('Tính năng NeuReader chưa được hỗ trợ. Vui lòng chọn tài liệu đã upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert bloom levels array to highest level (backend expects single level)
      // Bloom levels order: remember < understand < apply < analyze < evaluate < create
      const bloomOrder = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
      const highestLevel = bloomLevel.reduce((highest, current) => {
        const currentIndex = bloomOrder.indexOf(current.toLowerCase());
        const highestIndex = bloomOrder.indexOf(highest.toLowerCase());
        return currentIndex > highestIndex ? current : highest;
      }, bloomLevel[0]);
      
      // Convert to uppercase for backend
      const difficultyLevel = highestLevel.toUpperCase();

      // Format datetime for backend (ISO format)
      // Convert from datetime-local format (YYYY-MM-DDTHH:mm) to ISO format
      const formatDateTime = (dateTimeStr: string): string => {
        if (!dateTimeStr) {
          throw new Error('Thời gian không được để trống');
        }
        // datetime-local returns format: YYYY-MM-DDTHH:mm
        // We need to convert to ISO format: YYYY-MM-DDTHH:mm:ss
        // Backend expects ISO format, so we'll add seconds if not present
        if (dateTimeStr.length === 16) {
          return dateTimeStr + ':00';
        }
        return dateTimeStr;
      };

      // Prepare data for API
      const examData = {
        session_name: examName,
        course_name: subjectName,
        material_id: parseInt(selectedMaterial),
        difficulty_level: difficultyLevel,
        password: password,
        start_time: formatDateTime(startTime),
        end_time: formatDateTime(endTime),
        time_limit: parseInt(timeLimit), // Optional, may not be stored in backend
        language: language // Optional, may not be stored in backend
      };

      // Call API to create exam session
      const result = await api.createExamSession(examData);
      
      if (result.session_id) {
        // Success - redirect to session detail page where teacher can generate questions
        router.push(`/teacher/exams/${result.session_id}`);
      } else {
        throw new Error('Không nhận được session_id từ server');
      }
    } catch (err) {
      console.error('Create exam error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo buổi thi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Tạo Buổi Thi / Luyện Tập</h1>
          <p className="text-[#5f6368]">Tạo buổi thi hoặc luyện tập vấn đáp chính thức cho học phần</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white  shadow-sm p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 ">
              {error}
            </div>
          )}

          {/* Tên buổi vấn đáp */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Tên buổi vấn đáp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Ví dụ: Giữa kỳ - Kinh tế vi mô"
              required
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
          </div>

          {/* Tên học phần */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Tên học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Ví dụ: Kinh tế vi mô"
              required
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
          </div>

          {/* Lựa chọn tài liệu */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Lựa chọn tài liệu <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="materialSource"
                    value="uploaded"
                    checked={materialSource === 'uploaded'}
                    onChange={(e) => setMaterialSource(e.target.value as 'uploaded')}
                    className="mr-2"
                  />
                  <span className="text-sm">Tài liệu đã Upload</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="materialSource"
                    value="neureader"
                    checked={materialSource === 'neureader'}
                    onChange={(e) => setMaterialSource(e.target.value as 'neureader')}
                    className="mr-2"
                  />
                  <span className="text-sm">NeuReader</span>
                </label>
              </div>

              {materialSource === 'uploaded' && (
                <div className="space-y-2">
                  {loadingMaterials ? (
                    <div className="px-4 py-2.5 border border-gray-300 text-sm text-[#5f6368]">
                      Đang tải danh sách tài liệu...
                    </div>
                  ) : materialOptions.length === 0 ? (
                    <div className="px-4 py-2.5 border border-gray-300 text-sm text-[#5f6368]">
                      Chưa có tài liệu nào. Vui lòng upload tài liệu trước.
                    </div>
                  ) : (
                    <>
                      <CustomSelect
                        value={selectedMaterial}
                        onChange={setSelectedMaterial}
                        options={materialOptions}
                        placeholder="-- Chọn tài liệu --"
                        required
                      />
                      <p className="text-xs text-[#5f6368]">
                        Public: Tất cả giảng viên có thể thấy • Private: Chỉ bạn thấy (tài liệu bạn upload)
                      </p>
                    </>
                  )}
                </div>
              )}

              {materialSource === 'neureader' && (
                <div className="p-4 bg-blue-50 border border-blue-200 ">
                  <p className="text-sm text-blue-800">Tính năng tích hợp với NeuReader sẽ được kích hoạt khi có API.</p>
                </div>
              )}
            </div>
          </div>

          {/* Thời gian thi/luyện tập */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Thời gian thi / luyện tập (phút) <span className="text-red-500">*</span>
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

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-[#202124] mb-3">
              Tạo mật khẩu cho lớp học phần <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ví dụ: KTVI2025"
              required
              className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
            />
            <p className="text-xs text-[#5f6368] mt-1">Mật khẩu này sẽ được yêu cầu khi sinh viên vào thi</p>
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

          {/* Thời gian mở và kết thúc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                Thời gian mở buổi vấn đáp <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#202124] mb-3">
                Thời gian kết thúc buổi vấn đáp <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#0065ca]"
              />
            </div>
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
              {loading ? 'Đang tạo...' : 'Tạo Buổi Thi'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

