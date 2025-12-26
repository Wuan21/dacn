# Hướng Dẫn Deploy Lên Render

## Bước 1: Chuẩn Bị Database (MySQL)

Vì Render không cung cấp MySQL miễn phí, bạn có 2 lựa chọn:

### Tùy Chọn A: Sử dụng PlanetScale (Khuyến nghị - Miễn phí)
1. Truy cập [PlanetScale](https://planetscale.com/)
2. Đăng ký tài khoản miễn phí
3. Tạo database mới
4. Lấy connection string (DATABASE_URL)

### Tùy Chọn B: Sử dụng Railway (Có free tier)
1. Truy cập [Railway](https://railway.app/)
2. Đăng nhập bằng GitHub
3. Tạo MySQL database
4. Copy DATABASE_URL từ dashboard

### Tùy Chọn C: Sử dụng Render MySQL (Trả phí)
1. Tạo MySQL database trên Render (từ $7/tháng)

## Bước 2: Push Code Lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả file
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Thêm remote repository (thay YOUR_USERNAME và YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push lên GitHub
git push -u origin main
```

## Bước 3: Deploy Trên Render

### Cách 1: Sử dụng Dashboard (Đơn giản hơn)

1. **Đăng nhập Render**
   - Truy cập [Render](https://render.com/)
   - Đăng nhập bằng GitHub

2. **Tạo Web Service Mới**
   - Click "New +" → "Web Service"
   - Chọn repository từ GitHub
   - Cấu hình như sau:

3. **Cấu hình Build & Deploy**
   ```
   Name: medical-booking-app (hoặc tên bạn muốn)
   Environment: Node
   Region: Singapore (hoặc gần bạn nhất)
   Branch: main
   Build Command: chmod +x build.sh && ./build.sh
   Start Command: npm start
   Plan: Free
   ```

4. **Thêm Environment Variables**
   
   Click "Environment" → "Add Environment Variable", thêm các biến sau:
   
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-here-change-this
   NODE_ENV=production
   ```
   
   **Quan trọng:**
   - `DATABASE_URL`: Lấy từ PlanetScale/Railway/Render MySQL
   - `JWT_SECRET`: Tạo một chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự)

5. **Deploy**
   - Click "Create Web Service"
   - Render sẽ tự động build và deploy
   - Quá trình mất khoảng 5-10 phút

### Cách 2: Sử dụng render.yaml (Infrastructure as Code)

Nếu bạn muốn sử dụng file `render.yaml` đã tạo:

1. Đảm bảo file `render.yaml` đã được push lên GitHub
2. Trên Render Dashboard → "New +" → "Blueprint"
3. Chọn repository
4. Render sẽ tự động đọc file `render.yaml`
5. Thêm Environment Variables như ở Cách 1

## Bước 4: Migrate Database (Lần Đầu)

Sau khi deploy thành công, bạn cần chạy migrations:

1. Vào Render Dashboard → Web Service của bạn
2. Click tab "Shell"
3. Chạy lệnh:
   ```bash
   npx prisma migrate deploy
   ```

## Bước 5: Seed Data (Tùy chọn)

Nếu bạn muốn thêm dữ liệu mẫu:

```bash
npm run seed
```

## Bước 6: Kiểm Tra Website

1. Render sẽ cung cấp URL dạng: `https://your-app-name.onrender.com`
2. Truy cập URL để kiểm tra
3. Test các chức năng:
   - Login/Register
   - Booking appointment
   - Admin panel

## Lưu Ý Quan Trọng

### 🔴 Free Plan Limitations
- App sẽ sleep sau 15 phút không hoạt động
- Lần đầu truy cập sau khi sleep mất 30-50 giây để khởi động
- 750 giờ miễn phí/tháng

### 🔒 Bảo Mật
- **KHÔNG** commit file `.env` lên GitHub
- Luôn dùng Environment Variables cho thông tin nhạy cảm
- Đổi `JWT_SECRET` thành giá trị mạnh và duy nhất

### 🗄️ Database Connection
- PlanetScale sử dụng SSL connection, connection string có thể cần thêm `?sslaccept=strict`
- Ví dụ: `mysql://user:pass@host/db?sslaccept=strict`

### 📝 Cập Nhật Code
Mỗi khi bạn push code mới lên GitHub:
1. Render tự động detect và re-deploy
2. Hoặc click "Manual Deploy" → "Deploy latest commit"

## Troubleshooting

### ❌ Build Failed
- Check logs trong Render Dashboard
- Đảm bảo `DATABASE_URL` đúng format
- Kiểm tra Prisma schema và migrations

### ❌ App Crashes
- Check logs: Dashboard → Logs tab
- Xem có lỗi database connection không
- Verify environment variables

### ❌ Database Error
- Kiểm tra DATABASE_URL có đúng không
- Test kết nối database từ máy local:
  ```bash
  npx prisma db pull
  ```

### ❌ App quá chậm (Cold Start)
- Đây là normal với free plan
- Nâng cấp lên paid plan để tránh sleep mode
- Hoặc dùng uptime monitoring tools (UptimeRobot) để ping app định kỳ

## Chi Phí Ước Tính

### Free Setup (Khuyến nghị để test)
- Render Web Service: Free (750 giờ/tháng)
- PlanetScale MySQL: Free (1 database, 5GB storage)
- **Tổng: $0/tháng**

### Paid Setup (Production)
- Render Web Service: $7/tháng (Starter)
- Render MySQL: $7/tháng hoặc PlanetScale Pro: $29/tháng
- **Tổng: $14-36/tháng**

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề khi deploy:
1. Check Render logs
2. Xem Render [Documentation](https://render.com/docs)
3. Check Prisma + MySQL issues trên [GitHub](https://github.com/prisma/prisma/issues)

---

**Chúc bạn deploy thành công! 🚀**
