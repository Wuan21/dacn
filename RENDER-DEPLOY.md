# Hướng Dẫn Deploy Lên Render

## Bước 1: Chuẩn Bị Database (MongoDB)

### ✅ Sử dụng MongoDB Atlas (Miễn phí - Đã có sẵn)

Bạn đã có cluster **DACN** trên MongoDB Atlas! Chỉ cần lấy connection string:

1. Vào MongoDB Atlas: https://cloud.mongodb.com/
2. Click vào cluster "DACN"
3. Click nút "Connect"
4. Chọn "Connect your application"
5. Copy connection string, format:
   ```
   mongodb+srv://qn21012004_db_user:<password>@dacn.tuj4ekw.mongodb.net/?retryWrites=true&w=majority
   ```
6. Thay `<password>` bằng password thật của bạn
7. Thêm tên database vào sau `mongodb.net/`:
   ```
   mongodb+srv://qn21012004_db_user:YOUR_PASSWORD@dacn.tuj4ekw.mongodb.net/yourmedicare?retryWrites=true&w=majority
   ```

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
   - `DATABASE_URL`: Connection string MongoDB từ Atlas (format phía trên)
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

## Bước 4: Push Schema To MongoDB (Lần Đầu)

Sau khi deploy thành công, bạn cần push schema lên MongoDB:

1. Vào Render Dashboard → Web Service của bạn
2. Click tab "Shell"
3. Chạy lệnh:
   ```bash
   npx prisma db push
   ```

**Lưu ý:** MongoDB không dùng migrations như MySQL, chỉ cần `db push`.

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
- MongoDB Atlas connection string format:
  ```
  mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority
  ```

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
- MongoDB Atlas: Free (512MB storage, shared cluster)
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
