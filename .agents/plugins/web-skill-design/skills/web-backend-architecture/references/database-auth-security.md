# Database Modeling, Auth/RBAC & Security Checklist

Quy chuẩn thiết kế dữ liệu và bảo mật cơ chế bên trong web cho Đồ án Tốt nghiệp.

---

## 1. Thiết kế Database (PostgreSQL / Prisma / Supabase)

1. **Nguyên tắc schema:**
   - Dùng `uuid` hoặc `cuid` (hoặc `bigint` identity) nhất quán cho primary key.
   - Mọi bảng nghiệp vụ chính đều có `createdAt`, `updatedAt`.
   - Khai báo `@@index([...])` trên các khóa ngoại và cột hay xuất hiện trong `WHERE` / `ORDER BY`.
   - Khai báo `@@unique([...])` ở tầng DB cho các ràng buộc nghiệp vụ (email, slug, cặp `(userId, courseId)`...), không chỉ kiểm tra bằng `if` trong JS (tránh race condition).
2. **Tính toàn vẹn giao dịch:**
   - Mọi luồng đụng từ 2 bảng trở lên (vd: tạo đơn hàng + trừ tồn kho, thanh toán + nâng hạng gói) bắt buộc chạy trong `prisma.$transaction(async (tx) => { ... })` hoặc Postgres RPC/transaction.
   - Kiểm tra điều kiện tồn kho/số dư ngay trong câu lệnh `UPDATE ... WHERE stock >= qty` (atomic update) thay vì đọc ra rồi mới ghi đè.
3. **Nếu dùng Supabase:**
   - Luôn bật **Row Level Security (RLS)** cho tất cả bảng trong schema `public`.
   - Tối ưu policy với `(select auth.uid()) = user_id` để Postgres cache kết quả hàm auth trên mỗi query.
   - Không bao giờ đưa `SUPABASE_SERVICE_ROLE_KEY` xuống client.

---

## 2. Authentication & Authorization (RBAC + Chống IDOR)

1. **Session & Cookie:**
   - Lưu token phiên trong **HTTP-only, Secure (production), SameSite=Lax** cookie; không lưu JWT nhạy cảm trong `localStorage` (dễ bị đánh cắp nếu dính XSS).
   - Hash mật khẩu bằng `argon2` hoặc `bcrypt` (`cost >= 10`), tuyệt đối không dùng MD5/SHA256 trần.
2. **Middleware vs Data-Layer Guard (Defense in Depth):**
   - `src/middleware.ts` chỉ làm cổng lọc thô (redirect nhanh khi chưa có cookie phiên), **KHÔNG coi middleware là lớp bảo mật duy nhất**.
   - **Mọi Server Component, Server Action và API Route Handler** phải tự gọi `requireUser()` / `requireRole(['ADMIN'])` và kiểm tra quyền sở hữu bản ghi (`record.ownerId === user.id`) trước khi đọc/sửa/xóa (chặn triệt để lỗ hổng **IDOR**).

---

## 3. Checklist Bảo mật Web Tối thiểu (Council Security Gate)

| Rủi ro | Biện pháp bắt buộc |
|---|---|
| **Validation Bypass** | Parse toàn bộ body, query params, route params bằng `zod` trên server; ép kiểu rõ ràng, giới hạn độ dài chuỗi và kích thước số. |
| **Mass Assignment** | Chỉ pick đúng các field được phép từ `parsed.data` khi đưa vào `prisma.model.create/update`, không bao giờ truyền thẳng `await req.json()` vào ORM. |
| **XSS & Injection** | Không render HTML thô từ user (`dangerouslySetInnerHTML` phải qua sanitizer như `DOMPurify` nếu bắt buộc); không nối chuỗi SQL thủ công. |
| **File Upload** | Kiểm tra MIME type thật & giới hạn dung lượng ở server; đổi tên file bằng UUID; không lưu upload thô vào thư mục thực thi script. |
| **Secret Exposure** | Tạo `.env.example` mẫu không chứa khóa thật; kiểm tra `.gitignore` chặn `.env*`; chỉ prefix `NEXT_PUBLIC_` cho biến thực sự công khai. |
| **Rate Limit & Abuse** | Có giới hạn tần suất (rate limit) tối thiểu cho các route nhạy cảm: đăng nhập, đăng ký, gửi OTP/email, gọi AI API (Gemini). |
