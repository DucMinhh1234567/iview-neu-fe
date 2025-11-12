# Hướng dẫn Cấu hình Kết nối Frontend và Backend

## Tổng quan

Dự án sử dụng Next.js Rewrites để proxy các API requests từ frontend đến backend Flask. Điều này giúp:
- Frontend gọi API bằng `/api/...` mà không cần biết URL backend
- Dễ dàng quản lý khi deploy (chỉ cần thay đổi biến môi trường)
- Tránh vấn đề CORS trong production

## Cấu hình

### 1. Tạo file `.env.local` trong thư mục `iview-neu-fe/`

**Cách 1: Sử dụng URL đầy đủ (Khuyến nghị)**

```bash
# Development - Backend chạy trên cổng 5000
BACKEND_INTERNAL_URL=http://localhost:5000

# Production - Backend chạy trên cổng khác (ví dụ: 8080)
BACKEND_INTERNAL_URL=http://localhost:8080

# Production với domain
BACKEND_INTERNAL_URL=https://api.yourdomain.com

# Docker - Sử dụng tên service
BACKEND_INTERNAL_URL=http://backend:5000
```

**Cách 2: Tách riêng HOST và PORT (Tùy chọn)**

Nếu bạn muốn tách riêng host và port để dễ quản lý:

```bash
# Development
BACKEND_HOST=localhost
BACKEND_PORT=5000
BACKEND_PROTOCOL=http

# Production với cổng khác
BACKEND_HOST=localhost
BACKEND_PORT=8080
BACKEND_PROTOCOL=http

# Production với domain
BACKEND_HOST=api.yourdomain.com
BACKEND_PORT=443
BACKEND_PROTOCOL=https
```

**Lưu ý:** 
- Nếu có cả `BACKEND_INTERNAL_URL` và `BACKEND_HOST`/`BACKEND_PORT`, hệ thống sẽ ưu tiên `BACKEND_INTERNAL_URL`
- Nếu không có biến môi trường nào, mặc định sẽ dùng `http://localhost:5000` (cho development)

### 2. Cấu hình Backend (iview-neu-be)

Backend đã được cấu hình CORS trong `config.py`. Đảm bảo biến môi trường `CORS_ORIGINS` bao gồm URL của frontend:

```bash
# Trong file .env của backend
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://your-frontend-domain.com
```

### 3. Cách hoạt động

1. **Development (Local)**:
   - Frontend chạy trên `http://localhost:3000`
   - Backend chạy trên `http://localhost:5000`
   - Frontend gọi `/api/auth/login` → Next.js rewrite → `http://localhost:5000/api/auth/login`

2. **Production (Docker/Server)**:
   - **Cùng server, cổng khác**: `BACKEND_INTERNAL_URL=http://localhost:8080` (thay 8080 bằng cổng backend của bạn)
   - **Khác server**: `BACKEND_INTERNAL_URL=http://backend-server:5000`
   - **Docker**: `BACKEND_INTERNAL_URL=http://backend:5000` (tên service)
   - **Domain**: `BACKEND_INTERNAL_URL=https://api.yourdomain.com`

## Kiểm tra kết nối

1. Khởi động backend:
```bash
cd iview-neu-be
python app.py
```

2. Khởi động frontend:
```bash
cd iview-neu-fe
npm run dev
```

3. Kiểm tra:
   - Mở browser tại `http://localhost:3000`
   - Mở DevTools → Network tab
   - Thực hiện một action gọi API
   - Xem request được gửi đến `/api/...` và được proxy đến backend

## Lưu ý

- File `.env.local` không được commit vào git (đã có trong `.gitignore`)
- Trong production, sử dụng biến môi trường của server/deployment platform
- `BACKEND_INTERNAL_URL` là URL nội bộ, không cần public nếu frontend và backend cùng server
- Nếu frontend và backend khác server, cần đảm bảo backend có thể truy cập được từ frontend

