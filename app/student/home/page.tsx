'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getUserInfo } from '@/lib/auth';

export default function StudentHomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Sinh viên');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [roleError, setRoleError] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userInfo = getUserInfo();
      
      setIsLoggedIn(userInfo.isLoggedIn);
      setUserName(userInfo.userName || 'Sinh viên');
      
      // Check if user is logged in
      if (!userInfo.isLoggedIn) {
        router.replace('/select-role');
        return;
      }
      
      // Check if user role matches
      if (userInfo.userRole !== 'student') {
        // User has wrong role - show error message instead of redirecting
        if (userInfo.userRole === 'teacher' || userInfo.userRole === 'lecturer') {
          setRoleError('Bạn đang đăng nhập bằng tài khoản giảng viên. Vui lòng đăng nhập ở trang dành cho giảng viên.');
        } else {
          setRoleError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản sinh viên.');
        }
        // Don't redirect, just show error
        return;
      }
    }
  }, [router]);

  const quickActions = [
    {
      title: 'Tạo Buổi Phỏng Vấn',
      description: 'Bắt đầu một buổi luyện tập phỏng vấn mới',
      link: '/student/create-session'
    },
    {
      title: 'Kỳ Thi',
      description: 'Xem và tham gia các kỳ thi vấn đáp',
      link: '/student/exams'
    },
    {
      title: 'Lịch Sử',
      description: 'Xem lại các buổi phỏng vấn đã thực hiện',
      link: '/student/history'
    },
    {
      title: 'Dashboard',
      description: 'Theo dõi thống kê và tiến bộ của bạn',
      link: '/student/dashboard'
    }
  ];

  const features = [
    {
      title: 'Thi Vấn Đáp Môn Học',
      description: 'Luyện tập và thi vấn đáp theo giáo trình, chọn độ khó theo thang đo Bloom'
    },
    {
      title: 'Phỏng Vấn Việc Làm',
      description: 'Mô phỏng phỏng vấn xin việc với CV và JD, hỗ trợ nhiều level từ Intern đến Lead'
    },
    {
      title: 'Đánh Giá AI Tức Thì',
      description: 'Nhận phản hồi và đánh giá chi tiết từ AI về câu trả lời của bạn'
    },
    {
      title: 'Theo Dõi Tiến Bộ',
      description: 'Xem thống kê và biểu đồ về quá trình luyện tập của bạn'
    }
  ];

  if (!isLoggedIn) {
    return null; // Will redirect
  }

  // Show error if role doesn't match
  if (roleError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-5">
        <div className="bg-white p-12 shadow-lg w-full max-w-[600px] border border-red-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Lỗi Quyền Truy Cập</h2>
            <p className="text-gray-700 mb-6">{roleError}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/select-role"
                className="px-6 py-2 bg-[#0065ca] text-white font-semibold hover:bg-[#004a95] transition-colors"
              >
                Chọn Vai Trò
              </Link>
              <Link
                href="/teacher/login"
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Đăng Nhập Giảng Viên
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#001a33] via-[#003366] to-[#004a95] text-white py-32 px-5 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-light tracking-widest uppercase">
              Hệ Thống Phỏng Vấn AI
            </div>
            <h1 className="text-6xl md:text-7xl font-light mb-8 tracking-tight leading-tight">
              Chào mừng trở lại,<br />
              <span className="font-normal">{userName}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-16 opacity-90 font-light max-w-3xl mx-auto leading-relaxed">
              Nền tảng luyện tập phỏng vấn và thi vấn đáp trực tuyến với công nghệ AI tiên tiến
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/student/create-session"
              className="group bg-white text-[#001a33] px-12 py-5 font-semibold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1 flex items-center gap-3"
            >
              <span>Bắt Đầu Luyện Tập Ngay</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/student/guide"
              className="bg-transparent border-2 border-white/50 text-white px-12 py-5 font-semibold text-lg hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm hover:-translate-y-1"
            >
              Hướng Dẫn Sử Dụng
            </Link>
          </div>
          
          {/* Stats Preview */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center border-t border-white/20 pt-8">
              <div className="text-4xl font-light mb-2">100+</div>
              <div className="text-sm opacity-75 font-light uppercase tracking-wider">Buổi Luyện Tập</div>
            </div>
            <div className="text-center border-t border-white/20 pt-8">
              <div className="text-4xl font-light mb-2">AI</div>
              <div className="text-sm opacity-75 font-light uppercase tracking-wider">Đánh Giá Tức Thì</div>
            </div>
            <div className="text-center border-t border-white/20 pt-8">
              <div className="text-4xl font-light mb-2">24/7</div>
              <div className="text-sm opacity-75 font-light uppercase tracking-wider">Hỗ Trợ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative bg-white py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1 bg-[#0065ca]/10 text-[#0065ca] text-xs font-light tracking-widest uppercase">
              Truy Cập Nhanh
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
              Bắt Đầu Ngay
            </h2>
            <p className="text-lg text-[#5f6368] font-light max-w-2xl mx-auto">
              Chọn một trong các tùy chọn dưới đây để bắt đầu hành trình luyện tập của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="group relative bg-white border-2 border-[#e5e7eb] p-12 transition-all hover:border-[#0065ca] hover:shadow-2xl hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#0065ca]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-0.5 bg-[#0065ca] mb-6 group-hover:w-16 transition-all"></div>
                  <h3 className="text-2xl font-semibold mb-4 text-[#001a33]">
                    {action.title}
                  </h3>
                  <p className="text-[#5f6368] text-sm leading-relaxed font-light mb-6">
                    {action.description}
                  </p>
                  <div className="flex items-center text-[#0065ca] font-medium text-sm group-hover:gap-2 gap-0 transition-all">
                    <span>Khám phá</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-24 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1 bg-[#0065ca]/10 text-[#0065ca] text-xs font-light tracking-widest uppercase">
              Tính Năng
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-lg text-[#5f6368] font-light max-w-2xl mx-auto">
              Khám phá các tính năng mạnh mẽ giúp bạn cải thiện kỹ năng phỏng vấn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white border-2 border-[#e5e7eb] p-10 transition-all hover:border-[#0065ca] hover:shadow-xl hover:-translate-y-2 shadow-sm"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0065ca] to-[#004a95] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative pt-4">
                  <h3 className="text-xl font-semibold mb-4 text-[#001a33]">
                    {feature.title}
                  </h3>
                  <p className="text-[#5f6368] leading-relaxed text-sm font-light">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-[#001a33] via-[#003366] to-[#004a95] py-24 px-5 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-light tracking-widest uppercase">
            Bắt Đầu Hành Trình
          </div>
          <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-tight text-white">
            Bắt Đầu Hành Trình Của Bạn
          </h2>
          <p className="text-xl md:text-2xl mb-16 text-white font-light max-w-3xl mx-auto leading-relaxed">
            Luyện tập thường xuyên để cải thiện kỹ năng phỏng vấn và đạt kết quả tốt nhất
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-sm border-2 border-white/30 p-10 hover:bg-white/20 transition-all">
              <div className="text-5xl font-light mb-4 text-white">Luyện Tập</div>
              <div className="text-sm text-white/90 font-light uppercase tracking-wider">Mọi lúc, mọi nơi</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border-2 border-white/30 p-10 hover:bg-white/20 transition-all">
              <div className="text-5xl font-light mb-4 text-white">Theo Dõi</div>
              <div className="text-sm text-white/90 font-light uppercase tracking-wider">Tiến bộ của bạn</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border-2 border-white/30 p-10 hover:bg-white/20 transition-all">
              <div className="text-5xl font-light mb-4 text-white">Thành Công</div>
              <div className="text-sm text-white/90 font-light uppercase tracking-wider">Đạt mục tiêu</div>
            </div>
          </div>
          
          <div className="mt-16">
            <Link
              href="/student/create-session"
              className="group inline-flex items-center gap-3 bg-white text-[#001a33] px-12 py-5 font-semibold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
            >
              <span>Bắt Đầu Ngay</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

