'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUserInfo, clearAuth } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userInfo = getUserInfo();
      setIsLoggedIn(userInfo.isLoggedIn);
      setUserRole(userInfo.userRole);
      setUserName(userInfo.userName);
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      clearAuth();
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      router.push('/select-role');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#004d80] text-white px-6 flex justify-between items-center shadow-md sticky top-0 z-50 h-14">
      <Link href="/" className="flex items-center gap-2.5 px-3 h-full transition-all hover:bg-white/10">
        <img 
          src="/logos/logo-neu2.png" 
          alt="Logo NEU" 
          width={36} 
          height={36}
          className="transition-transform hover:scale-105"
        />
        <span className="text-xl font-bold transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">iView NEU</span>
      </Link>
      
      <ul className="flex items-stretch list-none m-0 p-0 h-full">
        {userRole === 'teacher' || userRole === 'lecturer' ? (
          <>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/dashboard"
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/teacher/dashboard') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Trang Chủ
                {pathname.startsWith('/teacher/dashboard') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/materials" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/teacher/materials') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tài Liệu
                {pathname.startsWith('/teacher/materials') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/create-exam" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/teacher/create-exam') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tạo Buổi Thi
                {pathname.startsWith('/teacher/create-exam') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/exams" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/teacher/exams') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Kỳ Thi
                {pathname.startsWith('/teacher/exams') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/guide" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/teacher/guide') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Hướng Dẫn
                {pathname.startsWith('/teacher/guide') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="flex items-stretch h-full">
              <Link 
                href={isLoggedIn && userRole === 'student' ? '/student/home' : '/'}
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  (isActive('/') || isActive('/student/home')) ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Trang Chủ
                {(isActive('/') || isActive('/student/home')) && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/student/create-session" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/student/create-session') || pathname.startsWith('/student/upload-cv') || pathname.startsWith('/student/create-exam-session') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tạo Buổi Phỏng Vấn
                {(pathname.startsWith('/student/create-session') || pathname.startsWith('/student/upload-cv') || pathname.startsWith('/student/create-exam-session')) && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/student/history" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/student/history') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Lịch Sử
                {pathname.startsWith('/student/history') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/student/exams" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/student/exams') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Kỳ Thi
                {pathname.startsWith('/student/exams') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
            <li className="flex items-stretch h-full">
              <Link 
                href="/student/guide" 
                className={`px-4 py-3 transition-all font-medium text-sm uppercase tracking-wide relative flex items-center h-full ${
                  pathname.startsWith('/student/guide') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Hướng Dẫn
                {pathname.startsWith('/student/guide') && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></span>}
              </Link>
            </li>
          </>
        )}
        {isLoggedIn ? (
          <>
            <li className="flex items-stretch h-full ml-4">
              {userRole === 'student' ? (
                <Link 
                  href="/student/dashboard"
                  className={`relative px-4 py-3 transition-all duration-300 flex items-center gap-3 group h-full hover:bg-white/10 hover:shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs font-semibold text-white group-hover:from-white/30 transition-all">
                      {userName ? userName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">{userName || 'Sinh viên'}</span>
                      <span className="text-xs opacity-75">SV</span>
                    </div>
                  </div>
                  
                </Link>
              ) : (
                <Link
                  href="/teacher/dashboard"
                  className={`relative px-4 py-3 transition-all duration-300 flex items-center gap-3 group h-full hover:bg-white/10 hover:shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs font-semibold text-white group-hover:from-white/30 transition-all" style={{background: 'linear-gradient(135deg,#fff1e6, #ffdca8)'}}>
                      {userName ? userName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">{userName || 'Giảng viên'}</span>
                      <span className="text-xs opacity-75">GV</span>
                    </div>
                  </div>
                  
                </Link>
              )}
            </li>
            <li className="flex items-stretch h-full ml-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white font-semibold px-5 py-3 hover:bg-red-700 focus:outline-none focus:shadow-[0_0_0_2px_rgba(220,38,38,0.25)] transition-colors h-full"
              >
                Đăng Xuất
              </button>
            </li>
          </>
        ) : (
          <li className="flex items-stretch h-full ml-4">
            <Link 
              href="/select-role" 
              className="bg-white text-[#0065ca] font-semibold px-5 py-3 hover:bg-[#f1f5ff] focus:outline-none focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] h-full flex items-center"
            >
              Đăng Nhập
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

