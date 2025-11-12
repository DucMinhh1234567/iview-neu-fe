# Hướng dẫn cấu hình môi trường

## Tổng quan

Frontend sử dụng biến môi trường `NEXT_PUBLIC_API_URL` để kết nối với backend. Biến này được sử dụng trong tất cả các API routes của Next.js.

## Development (Local)

### Bước 1: Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của project:

```bash
# .env.local
# Thay đổi cổng và địa chỉ IP theo backend của bạn
NEXT_PUBLIC_API_URL=http://127.0.0.1:8008
```

**Ví dụ các cấu hình khác:**
- Backend cổng 5000: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Backend cổng 8008: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8008`
- Backend cổng 3001: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Backend trên máy khác trong mạng local: `NEXT_PUBLIC_API_URL=http://192.168.1.100:8008`
- Backend với domain: `NEXT_PUBLIC_API_URL=http://api.example.com`

### Bước 2: Khởi động lại development server

Sau khi tạo file `.env.local`, khởi động lại development server:

```bash
npm run dev
```

## Production (Deploy)

### Vercel

1. Vào project settings trên Vercel
2. Chọn **Environment Variables**
3. Thêm biến mới:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL backend của bạn (ví dụ: `https://api.yourdomain.com`)
   - **Environment**: Production, Preview, Development (tùy chọn)
4. Deploy lại project

### Docker

Thiết lập biến môi trường khi chạy container:

```bash
docker run -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com -p 3000:3000 your-image
```

Hoặc trong `docker-compose.yml`:

```yaml
services:
  frontend:
    image: your-image
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    ports:
      - "3000:3000"
```

### Server thông thường (Linux/Windows)

#### Linux

1. Tạo file `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

2. Hoặc export biến môi trường:

```bash
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

3. Build và start:

```bash
npm run build
NEXT_PUBLIC_API_URL=https://api.yourdomain.com npm start
```

#### Windows

1. Tạo file `.env.production`:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

2. Hoặc thiết lập biến môi trường hệ thống:

```powershell
$env:NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
npm run build
npm start
```

## Kiểm tra cấu hình

Sau khi cấu hình, bạn có thể kiểm tra bằng cách:

1. Mở browser console
2. Kiểm tra Network tab khi thực hiện API call
3. Xác nhận rằng request được gửi đến đúng backend URL

## Lưu ý quan trọng

1. **CORS**: Đảm bảo backend server có CORS được cấu hình để cho phép frontend domain
2. **HTTPS**: Trong production, nên sử dụng HTTPS cho cả frontend và backend
3. **Security**: Không commit file `.env.local` vào git (đã được thêm vào `.gitignore`)
4. **Next.js**: Biến môi trường bắt đầu với `NEXT_PUBLIC_` sẽ được expose ra browser, chỉ sử dụng cho các giá trị công khai

## Troubleshooting

### Backend không kết nối được

1. Kiểm tra biến môi trường đã được thiết lập đúng chưa
2. Kiểm tra backend server đang chạy
3. Kiểm tra CORS configuration trên backend
4. Kiểm tra firewall/network settings

### Lỗi CORS

Nếu gặp lỗi CORS, đảm bảo backend có cấu hình:

```python
# Flask example
from flask_cors import CORS

CORS(app, origins=["https://your-frontend-domain.com"])
```

### Biến môi trường không hoạt động

1. Đảm bảo biến bắt đầu với `NEXT_PUBLIC_`
2. Khởi động lại development server sau khi thay đổi `.env.local`
3. Trong production, rebuild application sau khi thay đổi biến môi trường

