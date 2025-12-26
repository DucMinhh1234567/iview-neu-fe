'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUserInfo, clearAuth } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Only hide navbar while đang làm bài (luyện tập/phỏng vấn), giữ lại trên trang kỳ thi chi tiết
  const hideExact = ['/student/interview'];
  const hidePrefixes: string[] = []; // add specific do/exam routes if cần ẩn thêm
  const shouldHideNavbar =
    hideExact.includes(pathname) || hidePrefixes.some((route) => pathname.startsWith(route));

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <div ref={navbarRef} className="relative">
      <nav className="bg-[#004d80] text-white px-4 md:px-6 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 z-[100] h-14">
        <Link href="/" className="flex items-center gap-2 md:gap-2.5 px-2 md:px-3 h-full transition-all hover:bg-white/10">
        <img 
          src="/logos/logo-neu2.png" 
          alt="Logo NEU" 
            width={32}
            height={32}
            className="w-7 h-7 md:w-9 md:h-9 transition-transform hover:scale-105"
          />
          <span className="text-base md:text-xl font-bold transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">iView NEU</span>
      </Link>
      
        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-stretch list-none m-0 p-0 h-full">
        {userRole === 'teacher' || userRole === 'lecturer' ? (
          <>
            <li className="flex items-stretch h-full">
              <Link 
                href="/teacher/dashboard"
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
                className={`px-3 md:px-4 py-3 transition-all font-medium text-xs md:text-sm uppercase tracking-wide relative flex items-center h-full ${
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
            <li className="flex items-stretch h-full ml-2 md:ml-4">
              {userRole === 'student' ? (
                <Link 
                  href="/student/dashboard"
                  className={`relative px-2 md:px-4 py-3 transition-all duration-300 flex items-center gap-2 md:gap-3 group h-full hover:bg-white/10 hover:shadow-md`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs font-semibold text-white group-hover:from-white/30 transition-all">
                      {userName ? userName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight">
                      <span className="text-xs md:text-sm font-semibold">{userName || 'Sinh viên'}</span>
                      <span className="text-xs opacity-75">SV</span>
                    </div>
                  </div>
                  
                </Link>
              ) : (
                <Link
                  href="/teacher/dashboard"
                  className={`relative px-2 md:px-4 py-3 transition-all duration-300 flex items-center gap-2 md:gap-3 group h-full hover:bg-white/10 hover:shadow-md`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-xs font-semibold text-white group-hover:from-white/30 transition-all" style={{background: 'linear-gradient(135deg,#fff1e6, #ffdca8)'}}>
                      {userName ? userName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight">
                      <span className="text-xs md:text-sm font-semibold">{userName || 'Giảng viên'}</span>
                      <span className="text-xs opacity-75">GV</span>
                    </div>
                  </div>
                  
                </Link>
              )}
            </li>
            <li className="flex items-stretch h-full ml-2 md:ml-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white font-semibold px-3 md:px-5 py-3 text-xs md:text-sm hover:bg-red-700 focus:outline-none focus:shadow-[0_0_0_2px_rgba(220,38,38,0.25)] transition-colors h-full whitespace-nowrap"
              >
                <span className="hidden md:inline">Đăng Xuất</span>
                <span className="md:hidden">Thoát</span>
              </button>
            </li>
          </>
        ) : (
          <li className="flex items-stretch h-full ml-2 md:ml-4">
            <Link 
              href="/select-role" 
              className="bg-white text-[#0065ca] font-semibold px-3 md:px-5 py-3 text-xs md:text-sm hover:bg-[#f1f5ff] focus:outline-none focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] h-full flex items-center whitespace-nowrap"
            >
              Đăng Nhập
            </Link>
          </li>
        )}
      </ul>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </nav>

    {/* Overlay Backdrop */}
    {isMobileMenuOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[98] transition-opacity duration-300"
        onClick={closeMobileMenu}
      />
    )}

    {/* Mobile Menu */}
    <div
      className={`lg:hidden fixed top-14 left-0 right-0 bg-[#004d80] shadow-lg z-[99] transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <ul className="flex flex-col list-none m-0 p-0">
        {userRole === 'teacher' || userRole === 'lecturer' ? (
          <>
            <li>
              <Link 
                href="/teacher/dashboard"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/teacher/dashboard') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link 
                href="/teacher/materials"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/teacher/materials') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tài Liệu
              </Link>
            </li>
            <li>
              <Link 
                href="/teacher/create-exam"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/teacher/create-exam') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tạo Buổi Thi
              </Link>
            </li>
            <li>
              <Link 
                href="/teacher/exams"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/teacher/exams') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Kỳ Thi
              </Link>
            </li>
            <li>
              <Link 
                href="/teacher/guide"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/teacher/guide') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Hướng Dẫn
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link 
                href={isLoggedIn && userRole === 'student' ? '/student/home' : '/'}
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  (isActive('/') || isActive('/student/home')) ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link 
                href="/student/create-session"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/student/create-session') || pathname.startsWith('/student/upload-cv') || pathname.startsWith('/student/create-exam-session') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Tạo Buổi Phỏng Vấn
              </Link>
            </li>
            <li>
              <Link 
                href="/student/history"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/student/history') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Lịch Sử
              </Link>
            </li>
            <li>
              <Link 
                href="/student/exams"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/student/exams') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Kỳ Thi
              </Link>
            </li>
            <li>
              <Link 
                href="/student/guide"
                onClick={closeMobileMenu}
                className={`block px-6 py-4 transition-all font-medium text-sm uppercase tracking-wide border-b border-white/10 text-white ${
                  pathname.startsWith('/student/guide') ? 'bg-white/10' : ''
                } hover:bg-white/10`}
              >
                Hướng Dẫn
              </Link>
            </li>
          </>
        )}
        {isLoggedIn ? (
          <>
            <li className="border-b border-white/10">
              {userRole === 'student' ? (
                <Link 
                  href="/student/dashboard"
                  onClick={closeMobileMenu}
                  className="block px-6 py-4 transition-all duration-300 hover:bg-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-sm font-semibold text-white">
                      {userName ? userName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white">{userName || 'Sinh viên'}</span>
                      <span className="text-xs opacity-75 text-white">SV</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/teacher/dashboard"
                  onClick={closeMobileMenu}
                  className="block px-6 py-4 transition-all duration-300 hover:bg-white/10 text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{background: 'linear-gradient(135deg,#fff1e6, #ffdca8)'}}>
                      {userName ? userName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white">{userName || 'Giảng viên'}</span>
                      <span className="text-xs opacity-75 text-white">GV</span>
                    </div>
                  </div>
                </Link>
              )}
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full text-left px-6 py-4 bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none transition-colors"
              >
                Đăng Xuất
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link 
              href="/select-role" 
              onClick={closeMobileMenu}
              className="block px-6 py-4 bg-white text-[#0065ca] font-semibold hover:bg-[#f1f5ff] transition-colors"
            >
              Đăng Nhập
            </Link>
          </li>
        )}
      </ul>
    </div>
    </div>
  );
}

