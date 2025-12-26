'use client';

import { useState, useEffect } from 'react';
import { useBaseRouter } from '@/lib/useBaseRouter';
import BaseLink from '@/components/BaseLink';
import { api } from '@/lib/api';
import { setAuthToken, setRefreshToken, setUserInfo, setupAuthCleanup } from '@/lib/auth';

export default function TeacherLoginPage() {
  const router = useBaseRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup auth cleanup on mount
  useEffect(() => {
    setupAuthCleanup();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email, password);
      
      // Store token and user info in sessionStorage (auto-clears on tab close)
      if (response.token) {
        setAuthToken(response.token);
        if (response.refresh_token) {
          setRefreshToken(response.refresh_token);
        }
      }
      
      if (response.user) {
        // Normalize role: API returns "LECTURER" -> convert to "lecturer" -> normalize to "teacher"
        const role = response.user.role?.toLowerCase() || 'teacher';
        const normalizedRole = role === 'lecturer' ? 'teacher' : role;
        
        // Check if user role matches the login page
        if (role !== 'lecturer' && role !== 'teacher' && role !== 'student') {
          // Invalid role
          throw new Error('Sai email hoặc mật khẩu.');
        }
        
        if (role === 'student') {
          // Student trying to login as teacher
          throw new Error('Sai email hoặc mật khẩu.');
        }
        
        setUserInfo({
          isLoggedIn: true,
          userRole: normalizedRole,
          userEmail: response.user.email || email,
          userName: response.user.full_name || email.split('@')[0],
          userId: response.user.user_id?.toString() || '',
          lecturerCode: response.user.lecturer_code,
        });
      }
      
      router.push('/teacher/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Normalize error messages to Vietnamese
      let errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      // Translate common error messages
      if (errorMessage.toLowerCase().includes('invalid email or password') || 
          errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('password')) {
        errorMessage = 'Sai email hoặc mật khẩu. Vui lòng thử lại.';
      } else if (errorMessage.toLowerCase().includes('email and password are required')) {
        errorMessage = 'Vui lòng nhập email và mật khẩu.';
      } else if (errorMessage.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Sai email hoặc mật khẩu. Vui lòng thử lại.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-5">
      <div className="bg-white p-12 shadow-lg w-full max-w-[420px] border border-black/8">
        <div className="text-center mb-6">
          <h2 className="text-[#0065ca] text-3xl font-semibold uppercase tracking-wide mb-2">Đăng Nhập Giảng Viên</h2>
          <p className="text-[#5f6368]">Chào mừng bạn quay trở lại với iView</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-[#202124]">Email</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email giảng viên của bạn" 
                required
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium text-[#202124]">Mật khẩu</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu" 
                required
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
            <a href="#" className="self-end text-[#0065ca] text-sm font-medium hover:text-[#004a95] transition-colors mt-1">
              Quên mật khẩu?
            </a>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember" className="text-sm">Ghi nhớ đăng nhập</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#0065ca] text-white font-semibold uppercase tracking-wide transition-all hover:bg-[#004a95] text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div className="text-center text-[#5f6368] mt-5">
            Chưa có tài khoản? <BaseLink href="/teacher/register" className="text-[#0065ca] font-medium hover:underline">Đăng ký ngay</BaseLink>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-none">
          <p className="text-sm text-[#5f6368] text-center mb-2 font-medium">Tài khoản demo:</p>
          <p className="text-sm text-[#202124] text-center">Email: <span className="font-mono font-semibold">gv1234@gmail.com</span></p>
          <p className="text-sm text-[#202124] text-center">Mật khẩu: <span className="font-mono font-semibold">gv1234</span></p>
        </div>

        <div className="mt-6 text-center">
          <BaseLink href="/select-role" className="text-[#0065ca] hover:underline text-sm">
            ← Chọn lại vai trò
          </BaseLink>
        </div>
      </div>
    </div>
  );
}

