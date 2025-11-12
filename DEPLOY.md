# 🚀 Hướng dẫn Deploy Frontend lên Server

## Cách Dễ Nhất - Chỉ Cần Thay Đổi Cổng

Khi deploy lên server, bạn chỉ cần set biến môi trường `BACKEND_INTERNAL_URL` với URL backend và thay đổi số cổng.

### Bước 1: Cài đặt dependencies

```bash
npm ci || npm install
```

### Bước 2: Build với URL backend (CHỈ CẦN ĐỔI SỐ CỔNG)

**Cách đơn giản nhất - Dùng URL đầy đủ:**

```bash
# Kết nối với cổng 8008
BACKEND_INTERNAL_URL=http://127.0.0.1:8008 npm run build

# Kết nối với cổng 8009 (chỉ cần đổi số)
BACKEND_INTERNAL_URL=http://127.0.0.1:8009 npm run build

# Kết nối với cổng 8020 (chỉ cần đổi số)
BACKEND_INTERNAL_URL=http://127.0.0.1:8020 npm run build
```

**Lợi ích:**
- Chỉ cần thay đổi số cổng (8008 → 8009 → 8020)
- Dễ nhớ và rõ ràng với URL đầy đủ
- Có thể copy/paste và chỉ sửa số cổng

### Bước 3: Chạy production server

```bash
npm start
```

## Các Cách Khác (Tùy chọn)

### Cách 1: Chỉ dùng số cổng (BACKEND_PORT)

```bash
# Hệ thống tự động kết nối đến http://127.0.0.1:xxxx
BACKEND_PORT=8008 npm run build
BACKEND_PORT=8009 npm run build
BACKEND_PORT=8020 npm run build
```

### Cách 2: Dùng file .env.local

1. Tạo file `.env.local`:
```bash
cp env.example .env.local
```

2. Chỉnh sửa file `.env.local`:
```bash
BACKEND_INTERNAL_URL=http://127.0.0.1:8008
```

3. Build:
```bash
npm run build
```

### Cách 3: Set biến môi trường trước

```bash
# Linux/Mac:
export BACKEND_INTERNAL_URL=http://127.0.0.1:8008
npm run build

# Windows PowerShell:
$env:BACKEND_INTERNAL_URL="http://127.0.0.1:8008"
npm run build

# Windows CMD:
set BACKEND_INTERNAL_URL=http://127.0.0.1:8008
npm run build
```

## Ví dụ Deploy Hoàn Chỉnh

```bash
# 1. Cài đặt
npm ci || npm install

# 2. Build với cổng 8008
BACKEND_INTERNAL_URL=http://127.0.0.1:8008 npm run build

# 3. Chạy production
npm start
```

## Thay Đổi Cổng Sau Khi Deploy

Nếu bạn muốn thay đổi cổng sau khi đã deploy:

1. **Dừng server hiện tại** (Ctrl+C)

2. **Build lại với cổng mới:**
```bash
# Chỉ cần đổi số cổng
BACKEND_INTERNAL_URL=http://127.0.0.1:8009 npm run build
```

3. **Chạy lại:**
```bash
npm start
```

## Lưu ý

- **Khuyến nghị:** Dùng `BACKEND_INTERNAL_URL=http://127.0.0.1:xxxx` - rõ ràng và dễ quản lý
- **Tùy chọn:** Dùng `BACKEND_PORT=xxxx` - hệ thống tự động dùng `127.0.0.1` và `http`
- Nếu backend chạy trên server khác, thay `127.0.0.1` bằng IP hoặc domain của server đó
- Kiểm tra log khi build để xác nhận URL backend: `[Next.js Config] Backend URL: http://127.0.0.1:8008`

