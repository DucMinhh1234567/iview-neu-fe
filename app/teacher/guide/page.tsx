'use client';

import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import Link from 'next/link';

export default function TeacherGuidePage() {
  const steps = [
    {
      number: '01',
      title: 'Upload Tài Liệu Chung',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      description: 'Upload tài liệu PDF để sinh viên sử dụng khi tạo buổi luyện tập:',
      details: [
        'Đăng nhập vào hệ thống với tài khoản giảng viên',
        'Truy cập mục "Upload Tài Liệu" từ Dashboard',
        'Nhập tên tài liệu và mô tả (tùy chọn)',
        'Chọn file PDF cần upload',
        'Chọn quyền truy cập: Public (sinh viên thấy) hoặc Private (chỉ giảng viên thấy)',
        'Nhấn "Upload Tài Liệu" để hoàn tất',
        'Quản lý và xóa tài liệu đã upload khi cần'
      ]
    },
    {
      number: '02',
      title: 'Tạo Buổi Thi / Luyện Tập',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      description: 'Tạo các buổi thi hoặc luyện tập vấn đáp chính thức cho học phần:',
      details: [
        {
          section: 'Thông tin cơ bản',
          items: [
            'Nhập tên buổi vấn đáp (ví dụ: Giữa kỳ - Kinh tế vi mô)',
            'Nhập tên học phần (ví dụ: Kinh tế vi mô)'
          ]
        },
        {
          section: 'Lựa chọn tài liệu',
          items: [
            'Chọn "Tài liệu đã Upload": Sử dụng tài liệu đã upload trước đó',
            'Chọn "NeuReader": Tích hợp với hệ thống NeuReader (khi có API)',
            'Lưu ý: Tài liệu Public sẽ hiển thị cho sinh viên, Private chỉ dành cho giảng viên'
          ]
        },
        {
          section: 'Cấu hình buổi thi',
          items: [
            'Đặt thời gian thi/luyện tập (phút)',
            'Chọn độ khó theo thang đo Bloom (tự động chọn các mức thấp hơn khi chọn mức cao)',
            'Tạo mật khẩu cho lớp học phần (sinh viên cần nhập để tham gia)',
            'Chọn ngôn ngữ: Tiếng Việt hoặc English',
            'Thiết lập thời gian mở và kết thúc buổi vấn đáp'
          ]
        }
      ]
    },
    {
      number: '03',
      title: 'Review và Chấm Điểm Bài Thi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Xem và sửa điểm, đáp án, nhận xét của các bài thi sinh viên đã thực hiện:',
      details: [
        {
          section: 'Xem danh sách buổi thi',
          items: [
            'Truy cập mục "Review Bài Thi" từ Dashboard',
            'Xem danh sách tất cả các buổi thi đã kết thúc',
            'Mỗi buổi thi hiển thị: tên buổi thi, ngày thi, số sinh viên đã hoàn thành'
          ]
        },
        {
          section: 'Xem danh sách sinh viên',
          items: [
            'Click vào buổi thi để xem danh sách sinh viên đã hoàn thành',
            'Mỗi sinh viên hiển thị: tên, ID, thời gian nộp bài, số câu hỏi, điểm tổng',
            'Sắp xếp và lọc theo điểm số hoặc thời gian nộp bài'
          ]
        },
        {
          section: 'Xem và sửa chi tiết kết quả',
          items: [
            'Click vào sinh viên để xem chi tiết kết quả',
            'Xem kết quả tổng quan với điểm từng tiêu chí (Correctness, Coverage, Reasoning, Creativity, Communication, Attitude)',
            'Xem câu trả lời chi tiết của từng câu hỏi',
            'Xem nhận xét tổng thể (điểm mạnh, điểm cần cải thiện, khuyến nghị)',
            'Sửa điểm và feedback cho từng câu hỏi',
            'Sửa nhận xét tổng thể và đánh giá cuối cùng'
          ]
        }
      ]
    },
    {
      number: '04',
      title: 'Quản Lý và Theo Dõi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Quản lý tài liệu và theo dõi hoạt động của sinh viên:',
      details: [
        'Xem thống kê tổng quan trên Dashboard: số buổi thi đã tạo, số sinh viên đã thi, số tài liệu đã upload',
        'Quản lý tài liệu: xem, xóa, và cập nhật quyền truy cập (Public/Private)',
        'Theo dõi các buổi thi gần đây và số sinh viên đã tham gia',
        'Phân tích kết quả thi của sinh viên để đánh giá chất lượng giảng dạy',
        'Xuất báo cáo kết quả thi nếu cần'
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
            Hướng dẫn chi tiết cách sử dụng hệ thống iView NEU để quản lý và tạo các buổi thi vấn đáp hiệu quả
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
                    
                    {step.details && Array.isArray(step.details) && typeof step.details[0] === 'object' && 'section' in step.details[0] ? (
                      <div className="space-y-4">
                        {(step.details as Array<{section: string; items: string[]}>).map((detail, detailIndex: number) => (
                          <div key={detailIndex} className="bg-blue-50/50 border border-blue-100 p-5">
                            <h3 className="font-semibold text-[#0065ca] mb-3">{detail.section}</h3>
                            <ul className="space-y-2">
                              {detail.items.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} className="flex items-start gap-2 text-sm text-[#5f6368]">
                                  <svg className="w-5 h-5 text-[#0065ca] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{item}</span>
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
          <p className="text-blue-100 mb-6">Sẵn sàng để quản lý các buổi thi? Bắt đầu với việc upload tài liệu hoặc tạo buổi thi đầu tiên!</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/teacher/upload-material"
              className="bg-white text-[#0065ca] font-semibold px-6 py-3 hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2"
            >
              Upload Tài Liệu
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/teacher/create-exam"
              className="bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors duration-300 border border-white/20 flex items-center gap-2"
            >
              Tạo Buổi Thi
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/teacher/review"
              className="bg-white/10 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-colors duration-300 border border-white/20 flex items-center gap-2"
            >
              Review Bài Thi
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <TeacherFooter />
    </div>
  );
}

