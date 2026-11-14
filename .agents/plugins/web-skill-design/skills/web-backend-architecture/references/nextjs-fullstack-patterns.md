# Next.js App Router & Node.js Fullstack Patterns

Tài liệu chuẩn hóa cơ chế vận hành bên trong của ứng dụng web hiện đại (Next.js App Router / Node.js).

---

## 1. Cấu trúc Thư mục Backend & Cơ chế nội bộ (`src/`)

```text
src/
├── app/
│   ├── api/                 # REST / Webhook Route Handlers (mỏng)
│   └── (routes)/            # Server Component pages & layouts
├── actions/                 # Server Actions cho form/mutation nội bộ
├── server/
│   ├── queries/             # Các hàm đọc dữ liệu (Server-only, có cache/filter)
│   ├── services/            # Business logic thuần nghiệp vụ + transaction
│   └── policies/            # Logic kiểm tra quyền (canEditOrder, isAdmin...)
├── schemas/                 # Zod schemas dùng chung cho validation Client + Server
├── types/
│   └── api.ts               # API Response envelope & DTO types
├── lib/
│   ├── db/                  # Prisma / Postgres / Supabase server client
│   ├── auth/                # Session parser, guard requireUser(), requireRole()
│   └── errors.ts            # AppError class (ValidationError, UnauthorizedError, ConflictError...)
├── services/                # Client-side API wrappers cho Frontend gọi
└── state/                   # Client state tối giản (nếu cần chia sẻ giữa UI)
```

> Đánh dấu `import 'server-only'` ở đầu các module trong `src/server/**` và `src/lib/db/**` để Next.js chặn tuyệt đối việc import nhầm code server sang Client Component lúc build.

---

## 2. Khi nào dùng Server Component vs Route Handler vs Server Action?

| Cơ chế | Dùng khi nào? | Lưu ý quan trọng |
|---|---|---|
| **Server Component (`src/server/queries`)** | Tải dữ liệu ban đầu cho trang (danh sách, chi tiết, dashboard SSR) | Kiểm tra session trước khi query dữ liệu riêng tư; chỉ pass DTO cần thiết xuống Client Component. |
| **Server Action (`src/actions/`)** | Form submit, tạo/sửa/xóa nội bộ gắn chặt UI React (`useActionState`) | Luôn gọi `requireUser()` + `schema.safeParse()` bên trong action (action là endpoint HTTP công khai!). Gọi `revalidatePath` / `revalidateTag` sau khi ghi. |
| **Route Handler (`src/app/api/`)** | Endpoint cho client fetch động (search, infinite scroll, upload, webhook thanh toán, export, third-party callback) | Trả `NextResponse.json(...)` kèm HTTP status đúng (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`). |

---

## 3. Mẫu Route Handler Chuẩn & Error Mapping

```ts
// Quy tắc: Handler mỏng, mọi lỗi nghiệp vụ ném AppError để map thống nhất
export async function POST(req: Request) {
  try {
    const actor = await requireUser();
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return apiError('INVALID_JSON', 'Dữ liệu gửi lên không đúng định dạng JSON.', 400);
    }

    const parsed = createBookingSchema.safeParse(rawBody);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const booking = await createBookingService(actor.id, parsed.data);
    return apiSuccess(booking, 201);
  } catch (err) {
    return handleApiException(err);
  }
}
```

- **Chống sập do lỗi Prisma / Postgres:** Map mã lỗi DB phổ biến trong `handleApiException`:
  - `P2002` (Unique constraint) $\rightarrow$ `409 Conflict`
  - `P2025` (Record not found) $\rightarrow$ `404 Not Found`
  - Không bao giờ trả `err.stack` hoặc thông báo SQL thô về client ở môi trường production.

---

## 4. Phân trang, Tìm kiếm & Caching

1. **Phân trang bắt buộc:** Mọi API danh sách phải giới hạn `limit` tối đa (vd `Math.min(limit, 50)`) để tránh query full-table làm treo server.
2. **Search an toàn:** Trim chuỗi tìm kiếm, dùng parameterized query của ORM (Prisma `contains` / `mode: 'insensitive'` hoặc Postgres `ilike` qua query builder có bind param).
3. **Cache hợp lý:**
   - Dữ liệu công khai ít đổi (danh mục, bài viết): dùng tag cache (`revalidateTag('posts')`).
   - Dữ liệu theo user (giỏ hàng, đơn hàng, hồ sơ): không cache chia sẻ chung giữa các user.
