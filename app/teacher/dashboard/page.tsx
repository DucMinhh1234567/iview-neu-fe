'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
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

      <main className="max-w-7xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0065ca] mb-2">Tài Khoản Giảng Viên</h1>
          <p className="text-[#5f6368]">
            {greeting}, {userName}! Quản lý và tổ chức các buổi thi vấn đáp một cách hiệu quả
          </p>
        </div>


        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Truy cập nhanh</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/teacher/materials"
              className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-[#0065ca] flex items-center justify-center mb-4 group-hover:bg-[#005bb5] transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#202124] mb-2 group-hover:text-[#0065ca] transition-colors">Tài Liệu</h3>
              <p className="text-sm text-[#5f6368]">
                Quản lý và upload tài liệu PDF
              </p>
            </Link>

            <Link
              href="/teacher/create-exam"
              className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-[#0065ca] flex items-center justify-center mb-4 group-hover:bg-[#005bb5] transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#202124] mb-2 group-hover:text-[#0065ca] transition-colors">Tạo Buổi Thi</h3>
              <p className="text-sm text-[#5f6368]">
                Tạo buổi thi vấn đáp mới
              </p>
            </Link>


            <Link
              href="/teacher/exams"
              className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-[#0065ca] flex items-center justify-center mb-4 group-hover:bg-[#005bb5] transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#202124] mb-2 group-hover:text-[#0065ca] transition-colors">Quản Lý Buổi Thi</h3>
              <p className="text-sm text-[#5f6368]">
                Xem tất cả buổi thi đã tạo
              </p>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#202124] mb-6">Tính năng chính</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border-l-4 border-[#0065ca]">
              <h3 className="text-lg font-semibold text-[#202124] mb-2">Tạo buổi thi</h3>
              <p className="text-sm text-[#5f6368]">
                Tạo các buổi thi vấn đáp với AI tự động tạo câu hỏi và đáp án dựa trên tài liệu của bạn
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-[#005bb5]">
              <h3 className="text-lg font-semibold text-[#202124] mb-2">Quản lý tài liệu</h3>
              <p className="text-sm text-[#5f6368]">
                Upload và quản lý tài liệu PDF để sinh viên sử dụng trong các buổi luyện tập
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-[#6fb6ff]">
              <h3 className="text-lg font-semibold text-[#202124] mb-2">Review & Chấm điểm</h3>
              <p className="text-sm text-[#5f6368]">
                Xem và chấm điểm các bài thi của sinh viên với đánh giá chi tiết từ AI
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
