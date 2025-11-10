'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function GuidePage() {
  const steps = [
    {
      number: '01',
      title: 'Tạo Phiên Phỏng Vấn',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      description: 'Bắt đầu với việc tạo một phiên phỏng vấn mới. Hệ thống hỗ trợ hai loại:',
      details: [
        {
          type: 'Thi vấn đáp môn học',
          description: 'Ôn tập hoặc thi vấn đáp theo giáo trình, chọn môn học và độ khó theo thang đo Bloom',
          features: ['Chọn môn học từ danh sách hoặc tự nhập', 'Chọn tài liệu public do giảng viên upload', 'Đặt thời gian và độ khó theo Bloom\'s Taxonomy', 'Hỗ trợ tiếng Việt và English']
        },
        {
          type: 'Phỏng vấn việc làm',
          description: 'Mô phỏng phỏng vấn xin việc với CV và Job Description',
          features: ['Upload CV (PDF, PNG, JPG)', 'Upload JD - tùy chọn', 'Chọn level (Intern, Fresher, Junior, Senior, Lead)', 'Hỗ trợ tiếng Việt và English']
        }
      ]
    },
    {
      number: '02',
      title: 'Cấu Hình Buổi Phỏng Vấn',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Cấu hình các thông tin cần thiết cho buổi phỏng vấn:',
      details: [
        'Đặt tên buổi luyện tập/phỏng vấn',
        'Chọn ngôn ngữ (Tiếng Việt hoặc English)',
        'Thiết lập thời gian hoặc số câu hỏi',
        'Chọn độ khó theo thang đo Bloom (tự động chọn các mức thấp hơn)'
      ]
    },
    {
      number: '03',
      title: 'Thực Hiện Phỏng Vấn',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Sau khi AI tạo câu hỏi, bạn sẽ thực hiện phỏng vấn:',
      details: [
        'Nhập thông tin ứng viên (tên, ID)',
        'Đọc từng câu hỏi một cách cẩn thận',
        'Trả lời bằng cách nhập text vào ô trả lời',
        'Theo dõi tiến độ qua progress bar',
        'Xem thời gian đã sử dụng',
        'Nộp bài sau khi hoàn thành tất cả câu hỏi'
      ]
    },
    {
      number: '04',
      title: 'Xem Kết Quả và Đánh Giá',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Sau khi nộp bài, AI sẽ đánh giá và cung cấp kết quả chi tiết:',
      details: [
        'Điểm số từng câu hỏi với các tiêu chí: Correctness, Coverage, Reasoning, Creativity, Communication, Attitude',
        'Điểm trung bình tổng thể của buổi phỏng vấn',
        'Nhận xét chi tiết về điểm mạnh và điểm cần cải thiện',
        'Khuyến nghị cụ thể để nâng cao kỹ năng',
        'Đánh giá tổng thể và gợi ý tuyển dụng'
      ]
    },
    {
      number: '05',
      title: 'Dashboard và Theo Dõi Tiến Bộ',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Theo dõi và quản lý tiến bộ của bạn:',
      details: [
        'Xem thông tin tài khoản đầy đủ (họ tên, mã SV, lớp, khóa, email)',
        'Thống kê tổng quan: tổng số buổi, điểm trung bình, số buổi theo loại',
        'Biểu đồ phân tích: Pie chart và Bar chart',
        'Lịch sử các phiên phỏng vấn đã thực hiện',
        'So sánh kết quả giữa các phiên để theo dõi tiến bộ',
        'Tham gia các kỳ thi do giảng viên tạo'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-white to-[#eef4ff]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#001a33] via-[#003366] to-[#004a95] text-white py-16 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMCAwVjIyaDJ2MTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl font-semibold mb-4 tracking-tight">Hướng Dẫn Sử Dụng</h1>
          <p className="text-xl text-blue-100 font-light max-w-2xl mx-auto">
            Hướng dẫn chi tiết cách sử dụng hệ thống iView NEU để luyện tập và thi vấn đáp hiệu quả
          </p>
        </div>
      </section>
      
      <main className="max-w-5xl mx-auto px-5 py-16 -mt-8 relative z-20">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0065ca] to-[#004a95] rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#0065ca]">
                        {step.icon}
                      </div>
                      <h2 className="text-2xl font-semibold text-[#202124]">{step.title}</h2>
                    </div>
                    <p className="text-[#5f6368] mb-6 leading-relaxed">{step.description}</p>
                    
                    {step.details && Array.isArray(step.details) && typeof step.details[0] === 'object' && 'type' in step.details[0] ? (
                      <div className="space-y-4">
                        {(step.details as Array<{type: string; description: string; features: string[]}>).map((detail, detailIndex: number) => (
                          <div key={detailIndex} className="bg-blue-50/50 border border-blue-100 p-5">
                            <h3 className="font-semibold text-[#0065ca] mb-2">{detail.type}</h3>
                            <p className="text-sm text-[#5f6368] mb-3">{detail.description}</p>
                            <ul className="space-y-2">
                              {detail.features.map((feature: string, featureIndex: number) => (
                                <li key={featureIndex} className="flex items-start gap-2 text-sm text-[#5f6368]">
                                  <svg className="w-5 h-5 text-[#0065ca] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {(step.details as string[]).map((detail: string, detailIndex: number) => (
                          <li key={detailIndex} className="flex items-start gap-3 text-[#5f6368]">
                            <svg className="w-5 h-5 text-[#0065ca] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 bg-gradient-to-r from-[#0065ca] to-[#004a95] p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">Bắt Đầu Ngay</h2>
          <p className="text-blue-100 mb-6">Sẵn sàng để bắt đầu luyện tập? Tạo buổi phỏng vấn đầu tiên của bạn ngay bây giờ!</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/student/create-session"
              className="bg-white text-[#0065ca] font-semibold px-6 py-3 hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2"
            >
              Tạo Buổi Phỏng Vấn
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/student/dashboard"
              className="bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors duration-300 border border-white/20"
            >
              Xem Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

