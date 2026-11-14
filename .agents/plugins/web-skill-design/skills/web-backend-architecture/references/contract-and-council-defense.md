# API Contract-First & Chuẩn Bị Phản Biện Hội Đồng (Backend)

---

## 1. Quy ước Hợp đồng API (`src/types/api.ts` & `docs/API-CONTRACT.md`)

Để `ai-template-2-fe` và `ai-skill-design-web` làm việc song song không xung đột:

```ts
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: ApiFieldErrors;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorBody };
```

Mỗi endpoint trong `docs/API-CONTRACT.md` cần ghi gọn 4 dòng:
1. `Method + Path` (vd: `POST /api/bookings`)
2. `Auth & Role` (vd: `Authenticated USER`)
3. `Request Schema` (tên schema Zod trong `src/schemas/*`)
4. `Response DTO & Error Codes` (`201`, `400`, `401`, `409`)

---

## 2. Tầng Cầu Nối Client (`src/services/`)

`ai-skill-design-web` viết các client service gọn nhẹ để `ai-template-2-fe` chỉ việc gọi:

```ts
export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!payload) {
    return {
      ok: false,
      error: { code: 'NETWORK_PARSE_ERROR', message: 'Không thể đọc phản hồi từ máy chủ.' },
    };
  }
  return payload;
}
```

---

## 3. 3 Câu Hỏi Phản Biện Hội Đồng Cho Phần Backend

Mỗi khi hoàn tất một phân hệ Backend/Cơ chế web, đảm bảo nhóm trả lời rành mạch được 3 câu hỏi sau:
1. **Luồng xử lý một request đi qua những lớp nào?**
   *(Client UI $\rightarrow$ `src/services/*` $\rightarrow$ Route Handler / Server Action $\rightarrow$ `requireUser()` + `zod` $\rightarrow$ `src/server/services/*` $\rightarrow$ Prisma/Postgres Transaction $\rightarrow$ `ApiResponse<T>`).*
2. **Nếu hai người dùng thao tác đồng thời vào cùng một tài nguyên (vd: đặt cùng 1 slot / mua món hàng cuối cùng) thì hệ thống chống xung đột thế nào?**
   *(Giải thích cơ chế Unique Constraint / `$transaction` + Atomic Conditional Update hoặc Row Lock ở Postgres).*
3. **Làm sao đảm bảo user A không thể xem hoặc sửa dữ liệu của user B bằng cách đổi ID trên URL/API?**
   *(Giải thích kiểm tra AuthN + Ownership check tại tầng Service/DB hoặc RLS policy trên server, không dựa vào ẩn nút ở Frontend).*
