# PM2 Commands cho IView Frontend

## Khởi động
```bash
pm2 start ecosystem.config.js
# hoặc
pm2 start npm --name "iview-frontend" -- start
```

## Xem danh sách processes
```bash
pm2 list
pm2 ls
```

## Xem logs
```bash
# Xem tất cả logs
pm2 logs

# Xem logs của app cụ thể
pm2 logs iview-frontend

# Xem logs real-time
pm2 logs iview-frontend --lines 100

# Xem logs không follow
pm2 logs iview-frontend --lines 100 --nostream
```

## Dừng/Restart
```bash
# Dừng app
pm2 stop iview-frontend

# Restart app
pm2 restart iview-frontend

# Reload app (zero-downtime)
pm2 reload iview-frontend
```

## Xóa app khỏi PM2
```bash
pm2 delete iview-frontend
```

## Xem thông tin chi tiết
```bash
# Xem thông tin app
pm2 show iview-frontend

# Xem monitoring
pm2 monit
```

## Lưu và khởi động lại
```bash
# Lưu cấu hình hiện tại
pm2 save

# Khôi phục cấu hình đã lưu
pm2 resurrect
```

## Startup (tự động start khi server reboot)
```bash
# Tạo startup script
pm2 startup

# Sau đó lưu cấu hình
pm2 save
```

