# Frontend - iView NEU

Frontend cho hệ thống phỏng vấn AI được xây dựng bằng Next.js và Tailwind CSS.

## 🚀 Cài đặt

```bash
npm install
```

## 🏃 Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## 🔗 Kết nối Backend

Frontend proxy tới Flask backend thông qua các route `/api/*` nội bộ. 

**Development (localhost):**
- Mặc định: `http://localhost:5000`
- Có thể override bằng file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Production (với domain proxy):**
- Nếu backend được proxy qua cùng domain (ví dụ: `http://fit.neu.edu.vn/iview3/api`):
  - Có thể để trống (code sẽ sử dụng relative path)
  - Hoặc set: `NEXT_PUBLIC_API_URL=http://fit.neu.edu.vn/iview3/api`
  
- Nếu backend chạy ở server/port riêng:
  - Set: `NEXT_PUBLIC_API_URL=http://your-backend-url:port`

Xem file `.env.local.example` để biết chi tiết.

## 📦 Xây dựng Production

```bash
npm run build
npm start
```

## 📁 Cấu trúc

- `app/` - Các pages và routes
  - `student/` - Các trang dành cho sinh viên
  - `teacher/` - Các trang dành cho giảng viên
  - `api/` - API routes proxy
- `components/` - Các components tái sử dụng (Navbar, Footer, CustomSelect)
- `lib/` - Utilities và API client
- `public/` - Static assets (images, logos)

## ✨ Tính năng chính

### 👨‍🎓 Phía Sinh viên

#### 1. **Trang chủ (Home)**
- Hero section với giới thiệu hệ thống
- Quick actions: Tạo buổi phỏng vấn, Kỳ thi, Lịch sử, Dashboard
- Tính năng nổi bật: Thi vấn đáp môn học, Phỏng vấn việc làm, Đánh giá AI, Theo dõi tiến bộ

#### 2. **Tạo Buổi Phỏng Vấn** (`/student/create-session`)
- **Thi vấn đáp môn học** (`/student/create-exam-session`):
  - Chọn môn học phần từ danh sách hoặc tự nhập
  - Chọn tài liệu chung do giảng viên upload (tùy chọn)
  - Đặt tên buổi luyện tập
  - Đặt giới hạn thời gian (phút)
  - Chọn độ khó theo thang đo Bloom (tự động chọn các mức thấp hơn khi chọn mức cao)
  - **Chọn ngôn ngữ**: Tiếng Việt hoặc English
  
- **Phỏng vấn việc làm** (`/student/upload-cv`):
  - Upload CV (PDF, PNG, JPG, JPEG)
  - Upload JD (Job Description) - tùy chọn
  - Nhập vị trí ứng tuyển
  - Chọn Level (Intern, Fresher, Junior, Senior, Lead)
  - Cấu hình thời gian hoặc số câu hỏi
  - **Chọn ngôn ngữ**: Tiếng Việt hoặc English

#### 3. **Tài khoản/Dashboard** (`/student/dashboard`)
- **Thông tin tài khoản**:
  - Họ và tên
  - Mã sinh viên
  - Lớp
  - Khóa
  - Email
- **Thống kê**:
  - Tổng số buổi phỏng vấn
  - Điểm trung bình
  - Số buổi thi vấn đáp
  - Số buổi phỏng vấn việc làm
- **Biểu đồ**:
  - Pie chart: Tỷ lệ thi vấn đáp vs phỏng vấn việc làm
  - Bar chart: Số buổi theo ngày (7 ngày gần nhất)
- **Lịch sử**: 5 phiên phỏng vấn gần đây

#### 4. **Phỏng vấn tương tác** (`/student/interview`)
- Hiển thị câu hỏi từng bước
- Nhập thông tin ứng viên (tên, ID)
- Trả lời câu hỏi với textarea
- Progress bar hiển thị tiến độ
- Nộp bài khi hoàn thành

#### 5. **Lịch sử** (`/student/history`)
- Xem lại tất cả các buổi phỏng vấn đã thực hiện
- Xem kết quả chi tiết

#### 6. **Kỳ thi** (`/student/exams`)
- Xem danh sách các kỳ thi được giảng viên tạo
- Tham gia kỳ thi với mật khẩu

#### 7. **Hướng dẫn** (`/student/guide`)
- Hướng dẫn sử dụng hệ thống

### 👨‍🏫 Phía Giảng viên

#### 1. **Dashboard** (`/teacher/dashboard`)
- Tổng quan hệ thống
- Quick access: Upload Tài Liệu, Tạo Buổi Thi, Review Bài Thi
- Danh sách các buổi thi gần đây

#### 2. **Upload Tài Liệu** (`/teacher/upload-material`)
- Upload tài liệu PDF cho sinh viên sử dụng
- Quản lý tài liệu đã upload

#### 3. **Tạo Buổi Thi** (`/teacher/create-exam`)
- Tên buổi vấn đáp
- Tên học phần
- Lựa chọn tài liệu (đã upload, NeuReader, hoặc upload mới)
- Thời gian thi/luyện tập (phút)
- Chọn độ khó theo thang đo Bloom (checkbox với logic tự động chọn mức thấp hơn)
- Tạo mật khẩu cho lớp học phần
- Thời gian mở và kết thúc buổi vấn đáp
- **Chọn ngôn ngữ**: Tiếng Việt hoặc English

#### 4. **Review Bài Thi** (`/teacher/review`)
- **Danh sách buổi thi đã kết thúc**: Hiển thị tất cả các buổi thi đã hoàn thành
- **Danh sách sinh viên**: Khi click vào buổi thi, hiển thị danh sách sinh viên đã hoàn thành với:
  - Tên và ID sinh viên
  - Thời gian nộp bài
  - Số câu hỏi
  - Điểm tổng
- **Chi tiết kết quả**: Khi click vào sinh viên, hiển thị:
  - Kết quả tổng quan với điểm từng tiêu chí
  - Câu trả lời chi tiết của từng câu hỏi
  - Nhận xét tổng thể (điểm mạnh, điểm cần cải thiện, khuyến nghị)
  - **Chức năng sửa**: Có thể sửa điểm và feedback cho từng câu hỏi

## 🎨 UI/UX Features

### Custom Dropdown Component
- Dropdown menu tùy chỉnh với hover effect màu xanh theme
- Góc vuông (không bo tròn)
- Animation mượt mà
- Hỗ trợ keyboard navigation

### Responsive Design
- Mobile-first approach
- Tối ưu cho mọi kích thước màn hình
- Touch-friendly cho mobile devices

### Theme Colors
- Brand color: `#0065ca` (Blue)
- Consistent color scheme across all pages
- Smooth transitions và hover effects

## 🔐 Authentication

- LocalStorage-based authentication
- Role-based access (Student/Teacher)
- Auto redirect based on user role

## 📝 Lưu ý vận hành

- Sau khi nộp bài, trang `/wait/[log]` sẽ tự động chuyển sang `/results/[filename]` khi có kết quả
- Username trên navbar (sinh viên) có thể click để xem tài khoản/dashboard
- Tất cả form validation được xử lý phía client và server

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js với react-chartjs-2
- **Icons**: SVG icons
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router
