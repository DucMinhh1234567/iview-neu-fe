'use client';

import { useState } from 'react';
import { useBaseRouter } from '@/lib/useBaseRouter';
import BaseLink from '@/components/BaseLink';
import { api } from '@/lib/api';

export default function TeacherRegisterPage() {
  const router = useBaseRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [lecturerCode, setLecturerCode] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Trim tất cả inputs
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedLecturerCode = lecturerCode.trim();
    const trimmedDepartment = department.trim();

    // Validate từng field cụ thể theo thứ tự
    if (!trimmedFullName) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    if (!trimmedEmail) {
      setError('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Email không hợp lệ');
      return;
    }

    if (!trimmedLecturerCode) {
      setError('Vui lòng nhập mã giảng viên');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Tất cả validate đã pass, bây giờ mới gọi API
    setLoading(true);

    try {
      const response = await api.register({
        email: trimmedEmail,
        password,
        full_name: trimmedFullName,
        role: 'LECTURER',
        lecturer_code: trimmedLecturerCode,
        department: trimmedDepartment || undefined,
      });

      // Registration successful, redirect to login
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/teacher/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-5">
      <div className="bg-white p-12 shadow-lg w-full max-w-[420px] border border-black/8">
        <div className="text-center mb-6">
          <h2 className="text-[#0065ca] text-3xl font-semibold uppercase tracking-wide mb-2">Đăng Ký Giảng Viên</h2>
          <p className="text-[#5f6368]">Tạo tài khoản mới để bắt đầu</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="font-medium text-[#202124]">Họ và tên <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="text" 
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ" 
                required
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-[#202124]">Email <span className="text-red-500">*</span></label>
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
            <label htmlFor="lecturerCode" className="font-medium text-[#202124]">Mã giảng viên <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="text" 
                id="lecturerCode"
                value={lecturerCode}
                onChange={(e) => setLecturerCode(e.target.value)}
                placeholder="Nhập mã giảng viên" 
                required
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="department" className="font-medium text-[#202124]">Khoa/Bộ môn</label>
            <div className="relative">
              <i className="fas fa-building absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="text" 
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ví dụ: Khoa Kinh tế, Khoa CNTT" 
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium text-[#202124]">Mật khẩu <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" 
                required
                minLength={6}
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-medium text-[#202124]">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]"></i>
              <input 
                type="password" 
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu" 
                required
                className="w-full px-10 py-3.5 border border-[#dfe3ea] transition-all focus:border-[#0065ca] focus:shadow-[0_0_0_2px_rgba(0,101,202,0.25)] focus:outline-none text-[15px]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#0065ca] text-white font-semibold uppercase tracking-wide transition-all hover:bg-[#004a95] text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>

          <div className="text-center text-[#5f6368] mt-5">
            Đã có tài khoản? <BaseLink href="/teacher/login" className="text-[#0065ca] font-medium hover:underline">Đăng nhập ngay</BaseLink>
          </div>
        </form>

        <div className="mt-6 text-center">
          <BaseLink href="/select-role" className="text-[#0065ca] hover:underline text-sm">
            ← Chọn lại vai trò
          </BaseLink>
        </div>
      </div>
    </div>
  );
}

