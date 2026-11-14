---
name: web-backend-architecture
description: >-
  Skill chuyên sâu cho nhánh AI Skill Design Web: thiết kế kiến trúc BackEnd,
  Database (Prisma/PostgreSQL/Supabase), Auth/RBAC, Next.js App Router
  (Server Components, Route Handlers, Server Actions, Middleware), API Contract-first,
  State/Service Bridge, bảo mật hệ thống và chuẩn bị phản biện hội đồng Đồ án Tốt nghiệp.
---

# Web Backend Architecture & Internal Web Mechanisms

Skill quy chuẩn dành cho nhánh **`ai-skill-design-web`**, đảm nhiệm toàn bộ phần **BackEnd và cơ chế bên trong** của ứng dụng web (Node.js / Next.js Fullstack + PostgreSQL/Prisma hoặc Supabase).

---

## Quy Trình Thực Thi 5 Bước

### Bước 1: Định nghĩa Domain & API Contract-First
Đọc [references/contract-and-council-defense.md](references/contract-and-council-defense.md):
1. Trước khi viết route hoặc UI gọi dữ liệu, khóa hợp đồng trong `docs/API-CONTRACT.md` và `src/types/api.ts` + `src/schemas/*.ts` (Zod).
2. Mọi API endpoint / Server Action dùng chung phong bì phản hồi thống nhất:
   - Thành công: `{ ok: true, data: T, meta?: PaginationMeta }`
   - Thất bại: `{ ok: false, error: { code: string, message: string, fieldErrors?: Record<string, string[]> } }`
3. Bàn giao ngay `src/types/api.ts` để `ai-template-2-fe` code song song mà không phải đoán kiểu dữ liệu.

### Bước 2: Thiết kế Database & Quyền truy cập dữ liệu
Đọc [references/database-auth-security.md](references/database-auth-security.md):
1. Chuẩn hóa bảng, khóa ngoại, `onDelete`, index cho các cột hay lọc/sort (`createdAt`, `userId`, `status`, `slug`).
2. Nếu dùng **Supabase**, kích hoạt thêm skill `supabase` và `supabase-postgres-best-practices` để viết migration và RLS policy đúng chuẩn.
3. Nếu dùng **Prisma / Postgres**, tách singleton client trong `src/lib/db/prisma.ts`, dùng `$transaction` cho các thao tác ghi nhiều bảng liên quan.

### Bước 3: Dựng Cơ Chế Web Bên Trong (Next.js App Router & Node.js)
Đọc [references/nextjs-fullstack-patterns.md](references/nextjs-fullstack-patterns.md):
1. **Ranh giới Server / Client:** Fetch dữ liệu đọc (read) trong Server Components hoặc `src/server/queries/*`; chỉ gắn `'use client'` ở lá component cần state/event trình duyệt.
2. **Tầng Handler mỏng, Tầng Service rõ:**
   - Route Handler (`src/app/api/**`) & Server Actions (`src/actions/**`) chỉ làm 4 việc: `AuthN/AuthZ -> Zod Validate -> Call src/server/services/* -> Map Response`.
   - Không viết raw business logic hoặc query phức tạp trực tiếp trong component hay route handler.
3. **Caching & Revalidation:** Chọn rõ `no-store` cho dữ liệu cá nhân/realtime, `revalidatePath` / `revalidateTag` sau mỗi mutation.

### Bước 4: Khóa Cổng Bảo Mật (Security Gate)
1. Kiểm tra session ở server cho mọi route cần đăng nhập; luôn đối chiếu **ownership (`resource.userId === session.userId` hoặc role Admin)** để chặn IDOR.
2. Không bao giờ đặt secret (`DATABASE_URL`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, API keys) vào biến `NEXT_PUBLIC_*` hoặc trả entity có trường nhạy cảm (`passwordHash`) ra response.
3. Dùng HTTP-only, Secure, SameSite cookie cho session; cấu hình `next.config.*` security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

### Bước 5: Cung cấp Client Service Bridge & Tài liệu Bảo vệ Hội đồng
1. Đóng gói các hàm gọi API/Action cho Frontend trong `src/services/*.ts` (xử lý `AbortController`, parse lỗi thống nhất, type-safe 100%).
2. Ghi lại sơ đồ luồng dữ liệu ngắn gọn (`UI -> Service -> API/Action -> Auth/Zod -> Domain Service -> DB`) và lý do chọn kỹ thuật để nhóm sẵn sàng trả lời hội đồng.
