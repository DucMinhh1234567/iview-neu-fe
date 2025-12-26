"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BaseLink from '@/components/BaseLink';

export default function CreateSessionPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="max-w-4xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-10">Bạn muốn bắt đầu loại phỏng vấn nào?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseLink href="/student/create-exam-session" className="bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-[#0065ca] text-center block">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-[#0065ca]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#0065ca]">Thi vấn đáp môn học</h3>
            <p className="text-[#5f6368] leading-relaxed">
              Dành cho sinh viên ôn tập hoặc thi vấn đáp theo giáo trình hoặc môn học.
            </p>
          </BaseLink>

          <BaseLink href="/student/upload-cv" className="bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-[#0065ca] text-center">
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 text-[#0065ca]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#0065ca]">Phỏng vấn việc làm</h3>
            <p className="text-[#5f6368] leading-relaxed">
              Mô phỏng phỏng vấn xin việc theo CV và mô tả công việc (JD).
            </p>
          </BaseLink>
        </div>
      </section>

      <Footer />
    </div>
  );
}

