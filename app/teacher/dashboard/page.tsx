'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TeacherFooter from '@/components/TeacherFooter';
import BaseLink from '@/components/BaseLink';
import { getUserInfo } from '@/lib/auth';

export default function TeacherDashboardPage() {
  const [userName, setUserName] = useState<string>('Giảng viên');
  const [greeting, setGreeting] = useState<string>('Chào bạn');

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    const userInfo = getUserInfo();
    setUserName(userInfo.userName || 'Giảng viên');
    
    // Set greeting based on current time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Chào buổi sáng');
    } else if (hour < 18) {
      setGreeting('Chào buổi chiều');
    } else {
      setGreeting('Chào buổi tối');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 py-12">
        {/* Hero Welcome Section */}
        <div className="bg-gradient-to-r from-[#0065ca] to-[#004a95] text-white p-12 mb-12 rounded-none shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4">
                iView NEU - Trang Chủ Giảng Viên
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                {greeting}, {userName}!
              </p>
              <p className="text-lg text-blue-200 leading-relaxed">
                Hệ thống thi vấn đáp thông minh với AI. Tạo, quản lý và đánh giá các buổi thi một cách dễ dàng và hiệu quả.
              </p>
            </div>
            <div className="hidden lg:block">
              <svg className="w-40 h-40 text-white opacity-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* What You Can Do Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#202124] mb-3">Bạn có thể làm gì?</h2>
            <p className="text-[#5f6368] text-lg">Khám phá các tính năng của hệ thống</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BaseLink 
              href="/teacher/materials"
              className="bg-white p-8 rounded-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group border border-transparent hover:border-[#0065ca]"
            >
              <div className="w-16 h-16 bg-[#0065ca] rounded-none flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-2 group-hover:text-[#0065ca] transition-colors">Tài Liệu</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Upload và quản lý tài liệu PDF cho sinh viên
              </p>
            </BaseLink>

            <BaseLink 
              href="/teacher/create-exam"
              className="bg-white p-8 rounded-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group border border-transparent hover:border-[#0065ca]"
            >
              <div className="w-16 h-16 bg-green-600 rounded-none flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-2 group-hover:text-green-600 transition-colors">Tạo Kỳ Thi</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Tạo kỳ thi vấn đáp mới với AI
              </p>
            </BaseLink>

            <BaseLink 
              href="/teacher/exams"
              className="bg-white p-8 rounded-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group border border-transparent hover:border-[#0065ca]"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-none flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-2 group-hover:text-purple-600 transition-colors">Quản Lý Kỳ Thi</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Theo dõi và quản lý các kỳ thi
              </p>
            </BaseLink>

            <BaseLink 
              href="/teacher/guide"
              className="bg-white p-8 rounded-none shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group border border-transparent hover:border-[#0065ca]"
            >
              <div className="w-16 h-16 bg-orange-600 rounded-none flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-2 group-hover:text-orange-600 transition-colors">Hướng Dẫn</h3>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Tìm hiểu cách sử dụng hệ thống
              </p>
            </BaseLink>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#202124] mb-3">Cách hoạt động</h2>
            <p className="text-[#5f6368] text-lg">Quy trình đơn giản, hiệu quả cao</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-none shadow-md text-center border border-gray-200">
              <div className="w-20 h-20 bg-[#0065ca] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-3">Upload Tài Liệu</h3>
              <p className="text-[#5f6368] leading-relaxed">
                Upload file PDF về môn học hoặc kiến thức cần kiểm tra. AI sẽ phân tích nội dung tài liệu.
              </p>
            </div>

            <div className="bg-white p-8 rounded-none shadow-md text-center border border-gray-200">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-3">Tạo Kỳ Thi</h3>
              <p className="text-[#5f6368] leading-relaxed">
                AI tự động sinh câu hỏi và đáp án dựa trên tài liệu. Bạn có thể duyệt và chỉnh sửa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-none shadow-md text-center border border-gray-200">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#202124] mb-3">Chấm Điểm & Đánh Giá</h3>
              <p className="text-[#5f6368] leading-relaxed">
                AI đánh giá câu trả lời của sinh viên và đưa ra điểm số cùng nhận xét chi tiết.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-white rounded-none shadow-md p-10 border border-gray-200">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#202124] mb-3">Tại sao chọn iView NEU?</h2>
            <p className="text-[#5f6368] text-lg">Các tính năng nổi bật của hệ thống</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0065ca] rounded-none flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#202124] mb-2">AI Tự Động Tạo Câu Hỏi</h3>
                <p className="text-[#5f6368] leading-relaxed">
                  Hệ thống AI phân tích tài liệu và tự động sinh câu hỏi vấn đáp phù hợp với nội dung, tiết kiệm thời gian cho giảng viên.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-none flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#202124] mb-2">Quản Lý Tài Liệu Dễ Dàng</h3>
                <p className="text-[#5f6368] leading-relaxed">
                  Upload, lưu trữ và tổ chức tài liệu PDF một cách khoa học. Sinh viên có thể truy cập để luyện tập bất cứ lúc nào.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-none flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#202124] mb-2">Chấm Điểm Thông Minh</h3>
                <p className="text-[#5f6368] leading-relaxed">
                  AI đánh giá câu trả lời của sinh viên dựa trên độ chính xác, độ đầy đủ và khả năng diễn đạt, kèm nhận xét chi tiết.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-none flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#202124] mb-2">Báo Cáo Chi Tiết</h3>
                <p className="text-[#5f6368] leading-relaxed">
                  Xem thống kê, báo cáo về kết quả thi của sinh viên. Theo dõi tiến độ học tập và phát hiện điểm yếu cần cải thiện.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TeacherFooter />
    </div>
  );
}
