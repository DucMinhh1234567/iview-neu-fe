'use client';

import { useRouter } from 'next/navigation';

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-5 py-12">
      <div className="max-w-5xl w-full">
        {/* Compact Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight text-[#001a33]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Chào mừng đến với iView NEU
          </h1>
          <p className="text-lg text-[#5f6368] font-light">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <div className="group relative bg-white shadow-lg p-8 transition-all hover:-translate-y-1 hover:shadow-xl border-2 border-[#e5e7eb] hover:border-[#0065ca] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0065ca] to-[#004a95] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="text-center flex-grow">
              <div className="w-12 h-0.5 bg-[#0065ca] mx-auto mb-6 group-hover:w-16 transition-all"></div>
              
              <h2 className="text-2xl font-semibold mb-4 text-[#001a33]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sinh Viên
              </h2>
              
              <p className="text-[#5f6368] mb-6 leading-relaxed text-sm font-light">
                Luyện tập phỏng vấn việc làm và thi vấn đáp môn học
              </p>
              
              <div className="space-y-2 text-xs text-[#5f6368] mb-6 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Luyện tập phỏng vấn việc làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Thi vấn đáp môn học</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Xem lịch sử và kết quả</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/student/login')}
              className="group/btn w-full py-4 bg-[#0065ca] text-white font-semibold hover:bg-[#004a95] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-auto"
            >
              <span>Đăng nhập Sinh viên</span>
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Teacher Card */}
          <div className="group relative bg-white shadow-lg p-8 transition-all hover:-translate-y-1 hover:shadow-xl border-2 border-[#e5e7eb] hover:border-[#0065ca] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0065ca] to-[#004a95] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="text-center flex-grow">
              <div className="w-12 h-0.5 bg-[#0065ca] mx-auto mb-6 group-hover:w-16 transition-all"></div>
              
              <h2 className="text-2xl font-semibold mb-4 text-[#001a33]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Giảng Viên
              </h2>
              
              <p className="text-[#5f6368] mb-6 leading-relaxed text-sm font-light">
                Tạo và quản lý các buổi thi vấn đáp
              </p>
              
              <div className="space-y-2 text-xs text-[#5f6368] mb-6 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Upload tài liệu chung</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Tạo buổi thi/luyện tập</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#0065ca]"></div>
                  <span>Review bài thi sinh viên</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/teacher/login')}
              className="group/btn w-full py-4 bg-[#0065ca] text-white font-semibold hover:bg-[#004a95] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-auto"
            >
              <span>Đăng nhập Giảng viên</span>
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

