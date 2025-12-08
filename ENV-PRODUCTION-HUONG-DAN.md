# 📝 Hướng dẫn cấu hình .env.production

## ✅ Nội dung file .env.production

Khi bạn chạy lệnh:
```bash
nano .env.production
```

**File phải có nội dung chính xác như sau:**

```env
NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
PORT=8003
```

## 🔍 Giải thích từng dòng

### Dòng 1: `NEXT_PUBLIC_API_URL=http://101.96.66.223:8008`
- **Mục đích:** Cho frontend biết địa chỉ backend API
- **Giá trị:** `http://101.96.66.223:8008` (IP và cổng của backend)
- **Lưu ý:** 
  - Phải có `http://` ở đầu
  - Không có dấu `/` ở cuối
  - IP phải đúng với IP server của bạn

### Dòng 2: `PORT=8003`
- **Mục đích:** Chỉ định cổng mà Next.js sẽ chạy
- **Giá trị:** `8003` (cổng frontend)
- **Lưu ý:** 
  - Không có dấu `:` hay `http://`
  - Chỉ là số cổng

## ⚠️ Lưu ý quan trọng

1. **Không có khoảng trắng thừa:**
   ```env
   # ❌ SAI
   NEXT_PUBLIC_API_URL = http://101.96.66.223:8008
   PORT = 8003
   
   # ✅ ĐÚNG
   NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
   PORT=8003
   ```

2. **Không có dấu ngoặc kép:**
   ```env
   # ❌ SAI
   NEXT_PUBLIC_API_URL="http://101.96.66.223:8008"
   PORT="8003"
   
   # ✅ ĐÚNG
   NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
   PORT=8003
   ```

3. **Không có dấu `/` ở cuối URL:**
   ```env
   # ❌ SAI
   NEXT_PUBLIC_API_URL=http://101.96.66.223:8008/
   
   # ✅ ĐÚNG
   NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
   ```

4. **Mỗi biến trên một dòng:**
   ```env
   # ✅ ĐÚNG
   NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
   PORT=8003
   ```

## 📋 Các bước tạo file

```bash
# 1. Vào thư mục frontend
cd ~/apps/frontend/iview-neu-fe

# 2. Tạo/sửa file
nano .env.production

# 3. Dán nội dung sau (hoặc gõ từng dòng):
NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
PORT=8003

# 4. Lưu file:
# - Nhấn Ctrl + O (để save)
# - Nhấn Enter (để xác nhận)
# - Nhấn Ctrl + X (để thoát)

# 5. Kiểm tra lại
cat .env.production
```

## ✅ Kiểm tra file đã đúng chưa

```bash
# Xem nội dung file
cat .env.production

# Kết quả mong đợi:
# NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
# PORT=8003
```

## 🔄 Sau khi sửa file

**QUAN TRỌNG:** Phải rebuild và restart frontend:

```bash
# 1. Rebuild (bắt buộc - để Next.js load biến môi trường mới)
npm run build

# 2. Restart PM2
pm2 restart iview_frontend

# 3. Kiểm tra logs
pm2 logs iview_frontend --lines 20
```

## 🎯 Tóm tắt

**File `.env.production` phải có đúng 2 dòng:**

```env
NEXT_PUBLIC_API_URL=http://101.96.66.223:8008
PORT=8003
```

**Sau đó rebuild và restart!**

