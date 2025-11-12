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

Frontend sử dụng Next.js API routes (`/api/*`) làm proxy để kết nối với Flask backend. Tất cả các API routes trong `app/api/` đều sử dụng biến môi trường `NEXT_PUBLIC_API_URL` để xác định địa chỉ backend.

### Cấu hình Development (Local)

1. **Tạo file `.env.local`** trong thư mục gốc:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

2. **Các ví dụ cấu hình khác:**
   - Backend cổng 5000: `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Backend cổng 8008: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8008`
   - Backend trên máy khác trong mạng local: `NEXT_PUBLIC_API_URL=http://192.168.1.100:8008`

3. **Khởi động lại development server:**
```bash
npm run dev
```

### Cấu hình Production (Deploy)

Khi deploy lên server, frontend và backend sẽ ở các domain/port khác nhau. Bạn cần thiết lập biến môi trường `NEXT_PUBLIC_API_URL` trỏ đến backend server.

#### Vercel
1. Vào project settings trên Vercel
2. Chọn **Environment Variables**
3. Thêm biến:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL backend của bạn (ví dụ: `https://api.yourdomain.com`)
   - **Environment**: Production, Preview, Development
4. Deploy lại project

#### Docker
```bash
docker run -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com -p 3000:3000 your-image
```

#### Server thông thường
Tạo file `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Sau đó build và start:
```bash
npm run build
npm start
```

### Lưu ý quan trọng

1. **CORS**: Đảm bảo backend server có CORS được cấu hình để cho phép frontend domain
2. **HTTPS**: Trong production, nên sử dụng HTTPS cho cả frontend và backend
3. **Security**: Không commit file `.env.local` vào git (đã được thêm vào `.gitignore`)
4. **Next.js**: Biến môi trường bắt đầu với `NEXT_PUBLIC_` sẽ được expose ra browser

Xem thêm hướng dẫn chi tiết trong file [ENV_SETUP.md](./ENV_SETUP.md)

## 📦 Xây dựng và Deploy Production

### Bước 1: Chuẩn bị môi trường trên server

#### Cài đặt Node.js và npm

```bash
# Cài đặt Node.js (phiên bản 18 trở lên)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra phiên bản
node --version
npm --version
```

#### Clone project và cài đặt dependencies

```bash
# Clone project (hoặc upload code lên server)
cd /var/www  # hoặc thư mục bạn muốn
git clone <repository-url> iview-neu-fe
cd iview-neu-fe

# Cài đặt dependencies
npm install
```

### Bước 2: Cấu hình biến môi trường

#### Tạo file `.env.production`

```bash
# Tạo file .env.production
nano .env.production
```

#### Cấu hình URL backend

**Nếu backend chạy trên cùng server, cổng 8008:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8008
```

**Nếu backend chạy trên server khác, cổng 8008:**
```bash
NEXT_PUBLIC_API_URL=http://192.168.1.100:8008
# hoặc nếu có domain
NEXT_PUBLIC_API_URL=http://api.yourdomain.com:8008
```

**Nếu backend chạy với HTTPS:**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Nếu backend chạy trên cổng khác (ví dụ: 5000, 3001, 8080):**
```bash
# Cổng 5000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Cổng 3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cổng 8080
NEXT_PUBLIC_API_URL=http://localhost:8080

# Cổng khác trên server khác
NEXT_PUBLIC_API_URL=http://backend-server-ip:PORT
```

### Bước 3: Build project

```bash
# Build project cho production
npm run build
```

Lưu ý: Quá trình build có thể mất vài phút. Đảm bảo có đủ RAM (tối thiểu 2GB).

### Bước 4: Chạy ứng dụng

#### Cách 1: Chạy trực tiếp (không khuyến nghị cho production)

```bash
# Chạy trực tiếp
npm start
```

Ứng dụng sẽ chạy trên cổng 3000 (mặc định). Bạn có thể truy cập tại `http://your-server-ip:3000`

#### Cách 2: Sử dụng PM2 (Khuyến nghị)

**Cài đặt PM2:**
```bash
npm install -g pm2
```

**Tạo file `ecosystem.config.js` trong thư mục gốc:**
```javascript
module.exports = {
  apps: [{
    name: 'iview-neu-fe',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/iview-neu-fe', // Thay đổi đường dẫn phù hợp
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

**Chạy ứng dụng với PM2:**
```bash
# Chạy ứng dụng
pm2 start ecosystem.config.js --env production

# Lưu cấu hình PM2 để tự động khởi động lại khi server reboot
pm2 save
pm2 startup
```

**Các lệnh PM2 hữu ích:**
```bash
# Xem trạng thái
pm2 status

# Xem logs
pm2 logs iview-neu-fe

# Restart ứng dụng
pm2 restart iview-neu-fe

# Stop ứng dụng
pm2 stop iview-neu-fe

# Xóa ứng dụng khỏi PM2
pm2 delete iview-neu-fe
```

#### Cách 3: Sử dụng systemd (Linux)

**Tạo file service `/etc/systemd/system/iview-neu-fe.service`:**
```bash
sudo nano /etc/systemd/system/iview-neu-fe.service
```

**Nội dung file:**
```ini
[Unit]
Description=iView NEU Frontend Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/iview-neu-fe
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=iview-neu-fe

[Install]
WantedBy=multi-user.target
```

**Khởi động service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Khởi động service
sudo systemctl start iview-neu-fe

# Enable tự động khởi động khi boot
sudo systemctl enable iview-neu-fe

# Kiểm tra trạng thái
sudo systemctl status iview-neu-fe

# Xem logs
sudo journalctl -u iview-neu-fe -f
```

### Bước 5: Cấu hình Nginx Reverse Proxy (Tùy chọn)

Nếu bạn muốn sử dụng domain và HTTPS, cấu hình Nginx làm reverse proxy.

**Cài đặt Nginx:**
```bash
sudo apt-get update
sudo apt-get install nginx
```

**Tạo file cấu hình `/etc/nginx/sites-available/iview-neu-fe`:**
```bash
sudo nano /etc/nginx/sites-available/iview-neu-fe
```

**Nội dung file:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Kích hoạt cấu hình:**
```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/iview-neu-fe /etc/nginx/sites-enabled/

# Kiểm tra cấu hình Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

**Cấu hình HTTPS với Let's Encrypt (Khuyến nghị):**
```bash
# Cài đặt Certbot
sudo apt-get install certbot python3-certbot-nginx

# Cài đặt SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot sẽ tự động cấu hình HTTPS và renew certificate
```

### Bước 6: Cấu hình Firewall

```bash
# Nếu sử dụng UFW
sudo ufw allow 3000/tcp  # Cho phép cổng 3000 (nếu không dùng Nginx)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# Nếu sử dụng firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### Bước 7: Kiểm tra kết nối

1. **Kiểm tra frontend đang chạy:**
   ```bash
   curl http://localhost:3000
   ```

2. **Kiểm tra kết nối đến backend:**
   - Mở browser và truy cập frontend
   - Mở Developer Tools (F12) → Network tab
   - Thực hiện một thao tác (ví dụ: login)
   - Kiểm tra request có được gửi đến đúng backend URL không

3. **Kiểm tra logs:**
   ```bash
   # Nếu dùng PM2
   pm2 logs iview-neu-fe

   # Nếu dùng systemd
   sudo journalctl -u iview-neu-fe -f

   # Nếu chạy trực tiếp
   # Xem output trong terminal
   ```

### Troubleshooting

#### Lỗi: Cannot connect to backend

**Nguyên nhân và giải pháp:**
1. **Backend chưa chạy:**
   ```bash
   # Kiểm tra backend có đang chạy không
   curl http://localhost:8008/api/health  # Thay đổi URL phù hợp
   ```

2. **Sai URL backend trong `.env.production`:**
   ```bash
   # Kiểm tra file .env.production
   cat .env.production
   
   # Đảm bảo URL đúng với backend đang chạy
   # Ví dụ: NEXT_PUBLIC_API_URL=http://localhost:8008
   ```

3. **Backend chạy trên server khác nhưng firewall block:**
   ```bash
   # Kiểm tra có thể ping được backend không
   ping backend-server-ip
   
   # Kiểm tra port có mở không
   telnet backend-server-ip 8008
   ```

4. **CORS error:**
   - Đảm bảo backend có cấu hình CORS cho phép frontend domain
   - Kiểm tra CORS settings trong backend code

#### Lỗi: Port 3000 đã được sử dụng

**Giải pháp:**
```bash
# Tìm process đang sử dụng port 3000
sudo lsof -i :3000

# Hoặc
sudo netstat -tulpn | grep :3000

# Kill process (thay PID bằng process ID thực tế)
sudo kill -9 PID

# Hoặc thay đổi port trong .env.production
PORT=3001
```

#### Lỗi: Out of memory khi build

**Giải pháp:**
```bash
# Tăng swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hoặc build trên máy khác có nhiều RAM hơn
```

#### Lỗi: PM2 không tự khởi động lại

**Giải pháp:**
```bash
# Cài đặt lại PM2 startup
pm2 unstartup
pm2 startup
pm2 save
```

#### Lỗi: Biến môi trường không được load

**Giải pháp:**
1. Đảm bảo file `.env.production` tồn tại trong thư mục gốc
2. Đảm bảo biến bắt đầu với `NEXT_PUBLIC_`
3. Restart ứng dụng sau khi thay đổi biến môi trường:
   ```bash
   # PM2
   pm2 restart iview-neu-fe
   
   # systemd
   sudo systemctl restart iview-neu-fe
   ```

### Cập nhật ứng dụng

Khi cần cập nhật code mới:

```bash
# Pull code mới
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install

# Rebuild
npm run build

# Restart ứng dụng
# Nếu dùng PM2
pm2 restart iview-neu-fe

# Nếu dùng systemd
sudo systemctl restart iview-neu-fe
```

### Tóm tắt các bước deploy

1. ✅ Cài đặt Node.js và npm
2. ✅ Clone/upload code lên server
3. ✅ Cài đặt dependencies: `npm install`
4. ✅ Tạo file `.env.production` với `NEXT_PUBLIC_API_URL` trỏ đến backend (ví dụ: `http://localhost:8008`)
5. ✅ Build project: `npm run build`
6. ✅ Chạy ứng dụng với PM2 hoặc systemd
7. ✅ Cấu hình Nginx reverse proxy (nếu cần)
8. ✅ Cấu hình firewall
9. ✅ Kiểm tra kết nối và logs

### Ví dụ cấu hình cụ thể cho backend cổng 8008

**File `.env.production`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8008
```

**Nếu backend chạy trên server khác (IP: 192.168.1.100):**
```bash
NEXT_PUBLIC_API_URL=http://192.168.1.100:8008
```

**Nếu backend có domain:**
```bash
NEXT_PUBLIC_API_URL=http://api.yourdomain.com:8008
# hoặc nếu dùng HTTPS
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
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
