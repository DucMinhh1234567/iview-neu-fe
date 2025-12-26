import BaseLink from './BaseLink';

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white pt-15 pb-10 border-t border-white/10 relative">
      <div className="before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-white mb-6 text-lg uppercase tracking-wide font-semibold">Về iView</h3>
          <p className="text-white/80 leading-relaxed mb-4">
            iView là nền tảng luyện tập phỏng vấn và thi vấn đáp trực tuyến được phát triển bởi Trường Đại học Kinh tế Quốc dân, nhằm hỗ trợ sinh viên nâng cao kỹ năng phỏng vấn và trả lời vấn đáp.
          </p>
        </div>
        
        <div>
          <h3 className="text-white mb-6 text-lg uppercase tracking-wide font-semibold">Liên Kết Nhanh</h3>
          <ul className="list-none">
            <li className="mb-3">
              <BaseLink href="/student/create-session" className="text-white/80 hover:text-white transition-all hover:pl-1.5 text-[15px]">
                Tạo Buổi Phỏng Vấn
              </BaseLink>
            </li>
            <li className="mb-3">
              <BaseLink href="/student/history" className="text-white/80 hover:text-white transition-all hover:pl-1.5 text-[15px]">
                Lịch Sử Phỏng Vấn
              </BaseLink>
            </li>
            <li className="mb-3">
              <BaseLink href="/student/dashboard" className="text-white/80 hover:text-white transition-all hover:pl-1.5 text-[15px]">
                Dashboard
              </BaseLink>
            </li>
            <li className="mb-3">
              <BaseLink href="/student/exams" className="text-white/80 hover:text-white transition-all hover:pl-1.5 text-[15px]">
                Kỳ Thi
              </BaseLink>
            </li>
            <li className="mb-3">
              <BaseLink href="/student/guide" className="text-white/80 hover:text-white transition-all hover:pl-1.5 text-[15px]">
                Hướng Dẫn Sử Dụng
              </BaseLink>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white mb-6 text-lg uppercase tracking-wide font-semibold">Liên Hệ</h3>
          <ul className="list-none text-white/80 text-[15px]">
            <li className="mb-3">Email: kcntt@neu.edu.vn</li>
            <li className="mb-3">Điện thoại: 02436.280.280 (6323)</li>
            <li className="mb-3">Địa chỉ: 207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội</li>
          </ul>
          <div className="flex gap-5 mt-6">
            <a href="https://web.facebook.com/TruongDaiHocKTQD" className="text-white/80 hover:text-white transition-all hover:-translate-y-0.5 text-xl">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-all hover:-translate-y-0.5 text-xl">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-all hover:-translate-y-0.5 text-xl">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-15 pt-5 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between text-white/60 text-sm">
          <p className="whitespace-nowrap">Beta 1.0.3</p>
          <p className="text-right flex-1">&copy; 2025 iView - Trường Đại học Kinh tế Quốc dân. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

