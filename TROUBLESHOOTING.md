# Troubleshooting: Không Đăng Nhập Được Trên Render

## Các Vấn Đề Thường Gặp & Cách Khắc Phục

### 1. ❌ Kiểm Tra Environment Variables

**Vấn đề:** JWT_SECRET hoặc DATABASE_URL chưa được thiết lập

**Cách kiểm tra:**
1. Vào Render Dashboard → Web Service của bạn
2. Click tab "Environment"
3. Đảm bảo có đủ 3 biến:

```
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-strong-secret-key-at-least-32-chars
NODE_ENV=production
```

**Cách sửa:**
- Click "Add Environment Variable" để thêm biến còn thiếu
- Sau khi thêm, click "Save Changes"
- Render sẽ tự động redeploy

### 2. 🍪 Vấn Đề Cookie Settings

**Triệu chứng:** Đăng nhập thành công nhưng bị logout ngay sau đó

**Nguyên nhân:** Cookie không được lưu do settings không đúng

**Đã fix trong code:**
- Cookie `secure: true` chỉ hoạt động qua HTTPS ✅
- Cookie `sameSite: 'none'` cho cross-site requests ✅

### 3. 🔌 Kiểm Tra Database Connection

**Cách test:**
```bash
# Trên Render Shell (Dashboard → Shell tab)
npx prisma db pull
```

**Nếu lỗi:**
- Kiểm tra DATABASE_URL có đúng không
- Đảm bảo database đã được migrate:
  ```bash
  npx prisma migrate deploy
  ```

### 4. 🔍 Debug API Calls

**Bước 1:** Mở Developer Tools trên trình duyệt (F12)

**Bước 2:** Vào tab Network, thử đăng nhập

**Bước 3:** Kiểm tra request `/api/auth/login`:
- Status code: 200 = thành công, 401/403 = lỗi credentials
- Response: xem có error message không
- Cookies: xem có cookie `token` được set không

**Bước 4:** Kiểm tra endpoint debug:
```
https://your-app.onrender.com/api/debug
```

Kết quả sẽ hiển thị:
```json
{
  "nodeEnv": "production",
  "hasJwtSecret": true/false,
  "hasDatabaseUrl": true/false,
  "databaseProvider": "mysql",
  "cookieSettings": {...}
}
```

### 5. 📋 Kiểm Tra Logs Trên Render

1. Vào Render Dashboard
2. Click vào Web Service
3. Tab "Logs"
4. Tìm các error messages:

**Error thường gặp:**

```
❌ JWT_SECRET must be set in production
→ Fix: Thêm JWT_SECRET vào Environment Variables
```

```
❌ PrismaClientInitializationError
→ Fix: DATABASE_URL sai hoặc database không accessible
```

```
❌ connect ETIMEDOUT
→ Fix: Database host không accessible từ Render
```

### 6. 🔐 Tạo User Test

Nếu chưa có user nào, tạo user test:

**Cách 1: Qua Register Page**
- Truy cập: `https://your-app.onrender.com/register`
- Đăng ký tài khoản mới

**Cách 2: Qua Prisma Studio (Local)**
```bash
# Chạy trên máy local với DATABASE_URL từ Render
DATABASE_URL="your-render-db-url" npx prisma studio
```

**Cách 3: Chạy seed script**
```bash
# Trên Render Shell
npm run seed
```

### 7. 🌐 CORS Issues

Nếu frontend và backend ở domain khác nhau, cần config CORS:

**Thêm vào `pages/api/auth/login.js`:**
```javascript
// Thêm ở đầu handler function
res.setHeader('Access-Control-Allow-Credentials', 'true')
res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

if (req.method === 'OPTIONS') {
  return res.status(200).end()
}
```

### 8. 🔄 Redeploy Sau Khi Sửa

Sau khi sửa code:

```bash
# Commit changes
git add .
git commit -m "Fix authentication for Render deployment"
git push origin main
```

Render sẽ tự động detect và redeploy.

**Hoặc manual deploy:**
- Vào Dashboard → Manual Deploy → "Deploy latest commit"

## Checklist Đầy Đủ

- [ ] Environment variables đã set đầy đủ (JWT_SECRET, DATABASE_URL, NODE_ENV)
- [ ] Database connection working (test với `npx prisma db pull`)
- [ ] Migrations đã chạy (`npx prisma migrate deploy`)
- [ ] Code đã push lên GitHub
- [ ] Render đã deploy version mới nhất
- [ ] Browser cookies được enable
- [ ] Truy cập qua HTTPS (không phải HTTP)
- [ ] Đã có ít nhất 1 user trong database

## Các Lệnh Hữu Ích

**Kiểm tra database:**
```bash
npx prisma studio
```

**Xem users trong database:**
```bash
npx prisma db execute --stdin <<< "SELECT id, email, role FROM user;"
```

**Reset database (cẩn thận!):**
```bash
npx prisma migrate reset --force
```

## Liên Hệ Hỗ Trợ

Nếu vẫn gặp vấn đề, hãy:
1. Copy toàn bộ logs từ Render
2. Copy response từ `/api/debug`
3. Screenshot error messages
4. Gửi thông tin để được hỗ trợ

---

**Lưu ý bảo mật:** Xóa endpoint `/api/debug` khi đã fix xong vấn đề!
