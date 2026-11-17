# API-CONTRACT.md — Hợp Đồng Giao Tiếp Frontend ↔ Backend

> **Phiên bản:** v1.0 (Pha 1 — Contract-First)  
> **Nguồn chuẩn TypeScript:** [`src/types/api.ts`](../src/types/api.ts)  
> **Nguồn chuẩn Validation (Zod v4):** [`src/schemas/`](../src/schemas/index.ts)  
> **Nguồn chuẩn Tracking (14 sự kiện):** [`src/lib/tracking/events.ts`](../src/lib/tracking/events.ts)  
> **Quy chuẩn gốc:** [`RULES.md` Mục 9 & 10](../RULES.md)

---

## 1. Quy ước chung & Phong bì Phản hồi (Response Envelope)

Mọi Route Handler dưới `src/app/api/**` **bắt buộc** trả về cùng một định dạng JSON:

### Thành công (`200`, `201`)

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 12,
    "totalPages": 1
  }
}
```

*(Trường `meta` chỉ xuất hiện ở các endpoint phân trang danh sách.)*

### Lỗi (`400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`)

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ.",
    "fieldErrors": {
      "confidence_score": ["Độ tự tin tối đa là 5."]
    }
  }
}
```

### Bảng mã HTTP & Error Code chuẩn

| HTTP | Error Code mẫu | Ý nghĩa |
|---|---|---|
| `400` | `INVALID_JSON`, `VALIDATION_ERROR` | JSON hỏng hoặc sai schema Zod |
| `401` | `UNAUTHORIZED`, `INVALID_CREDENTIALS` | Chưa đăng nhập hoặc sai token phiên |
| `403` | `FORBIDDEN`, `CHATBOT_DISABLED_FOR_VARIANT`, `INVALID_WEBHOOK_SIGNATURE` | Không đủ quyền / bị chặn ở nhóm `chatbot_off` / sai chữ ký webhook |
| `404` | `NOT_FOUND`, `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND`, `SCENARIO_NOT_FOUND` | Không tìm thấy tài nguyên |
| `409` | `CONFLICT`, `EMAIL_ALREADY_EXISTS`, `SCENARIO_ALREADY_COMPLETED`, `ORDER_ALREADY_PAID` | Xung đột trạng thái hoặc trùng khóa duy nhất |
| `422` | `DOWNLOAD_LIMIT_EXCEEDED`, `DOWNLOAD_EXPIRED`, `CONSENT_REQUIRED` | Vi phạm điều kiện nghiệp vụ |
| `429` | `RATE_LIMIT_EXCEEDED` | Vượt giới hạn tần suất (Auth / Gemini Chat) |
| `500` | `INTERNAL_ERROR` | Lỗi hệ thống không mong đợi (ẩn stack trace ở production) |

---

## 2. Danh sách Endpoint chuẩn (`RULES.md` Mục 10)

### 2.1. Hệ thống & Keep-Alive

1. **`GET /api/health`**
   - **Auth & Role:** Public (dùng cho CI/CD và cron ping chống auto-pause Supabase Free 7 ngày)
   - **Request Schema:** Không
   - **Response DTO (`200`):** `ApiResponse<HealthCheckData>`
   - **Error Codes:** `500 INTERNAL_ERROR`

### 2.2. Xác thực (`F1`)

2. **`POST /api/auth/register`**
   - **Auth & Role:** Public
   - **Request Schema:** `registerSchema` (`src/schemas/auth.ts`)
   - **Response DTO (`201`):** `ApiResponse<AuthSessionResponse>` (kèm HTTP-only Supabase SSR cookies)
   - **Error Codes:** `400 VALIDATION_ERROR`, `409 EMAIL_ALREADY_EXISTS`, `429 RATE_LIMIT_EXCEEDED`

3. **`POST /api/auth/login`**
   - **Auth & Role:** Public
   - **Request Schema:** `loginSchema` (`src/schemas/auth.ts`)
   - **Response DTO (`200`):** `ApiResponse<AuthSessionResponse>`
   - **Error Codes:** `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMIT_EXCEEDED`

4. **`POST /api/auth/logout`**
   - **Auth & Role:** Authenticated (`customer` | `admin`) hoặc có cookie phiên
   - **Request Schema:** Không
   - **Response DTO (`200`):** `ApiResponse<LogoutResponse>`
   - **Error Codes:** `500 INTERNAL_ERROR`

5. **`GET /api/auth/me`**
   - **Auth & Role:** Authenticated (`customer` | `admin`)
   - **Request Schema:** Không
   - **Response DTO (`200`):** `ApiResponse<AuthSessionResponse>`
   - **Error Codes:** `401 UNAUTHORIZED`

### 2.3. Sản phẩm số (`F2`, `F3`)

6. **`GET /api/products`**
   - **Auth & Role:** Public (chỉ trả sản phẩm `is_active = true` và `deleted_at IS NULL`)
   - **Request Schema (Query):** `productListQuerySchema` (`src/schemas/product.ts`)
   - **Response DTO (`200`):** `ApiResponse<ProductSummaryDto[]>` kèm `meta: PaginationMeta`
   - **Error Codes:** `400 VALIDATION_ERROR`

7. **`GET /api/products/:id`** *(hỗ trợ UUID `id` hoặc `slug`)*
   - **Auth & Role:** Public
   - **Request Schema (Params):** `productIdParamSchema` (`src/schemas/product.ts`)
   - **Response DTO (`200`):** `ApiResponse<ProductDetailDto>` (luôn có `source_type` và `license_note`)
   - **Error Codes:** `400 VALIDATION_ERROR`, `404 PRODUCT_NOT_FOUND`

### 2.4. Giỏ hàng (`F4`)

> **Lưu ý kiến trúc:** Giỏ hàng lưu trong HTTP-only signed cookie phía server và **luôn hydrate lại giá (`price_vnd`) trực tiếp từ bảng `products`** ở mỗi lần đọc/cập nhật.

8. **`GET /api/cart`**
   - **Auth & Role:** Public / Session cookie
   - **Request Schema:** Không
   - **Response DTO (`200`):** `ApiResponse<CartDto>`
   - **Error Codes:** `500 INTERNAL_ERROR`

9. **`POST /api/cart`**
   - **Auth & Role:** Public / Session cookie
   - **Request Schema:** `addToCartSchema` (`src/schemas/order.ts`)
   - **Response DTO (`200`):** `ApiResponse<CartDto>`
   - **Error Codes:** `400 VALIDATION_ERROR`, `404 PRODUCT_NOT_FOUND`

10. **`DELETE /api/cart`**
    - **Auth & Role:** Public / Session cookie
    - **Request Schema:** `removeFromCartSchema` (`src/schemas/order.ts`)
    - **Response DTO (`200`):** `ApiResponse<CartDto>`
    - **Error Codes:** `400 VALIDATION_ERROR`

### 2.5. Đơn hàng, Thanh toán Sandbox & Giao hàng số (`F5`, `F6`)

11. **`POST /api/orders`**
    - **Auth & Role:** Authenticated hoặc Experiment Participant (`assignment_id` / `visitor_id` hợp lệ)
    - **Request Schema:** `createOrderSchema` (`src/schemas/order.ts`) — **Cấm client gửi giá**, server tự tra `price_vnd` từ DB và tính `total_vnd`.
    - **Response DTO (`201`):** `ApiResponse<CreateOrderResponse>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `404 PRODUCT_NOT_FOUND`, `500 INTERNAL_ERROR`

11a. **`GET /api/orders`**
    - **Auth & Role:** Authenticated hoặc Participant sở hữu cookie phiên (`assignment_id` / `visitor_id`)
    - **Request Schema:** Không
    - **Response DTO (`200`):** `ApiResponse<OrderDto[]>`
    - **Error Codes:** `401 UNAUTHORIZED`

11b. **`GET /api/orders/:id`**
    - **Auth & Role:** Chủ sở hữu đơn hàng (`user_id`, `assignment_id` hoặc `visitor_id` khớp phiên) hoặc `admin`
    - **Request Schema:** Params `id` (UUID)
    - **Response DTO (`200`):** `ApiResponse<OrderDto>` (kèm `download_grants` nếu `status === 'paid'`)
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`

11c. **`POST /api/orders/:id/sandbox-pay`**
    - **Auth & Role:** Chủ sở hữu đơn hàng hoặc `admin` (server tự ký payload HMAC-SHA256 bằng `MOCK_PAYMENT_WEBHOOK_SECRET` và gọi xử lý webhook nội bộ, không lộ secret xuống trình duyệt)
    - **Request Schema:** `sandboxPaySchema` (`src/schemas/order.ts`)
    - **Response DTO (`200`):** `ApiResponse<PaymentWebhookResponse>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ORDER_NOT_FOUND`, `409 ORDER_ALREADY_PAID`

12. **`POST /api/payments/webhook`**
    - **Auth & Role:** Server-to-Server / Mock Sandbox (xác thực `signature` HMAC-SHA256 bằng `MOCK_PAYMENT_WEBHOOK_SECRET` ở server)
    - **Request Schema:** `mockPaymentWebhookSchema` (`src/schemas/order.ts`)
    - **Response DTO (`200`):** `ApiResponse<PaymentWebhookResponse>` (cập nhật `orders.status = 'paid'` + phát hành `download_grants` trong transaction)
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 INVALID_WEBHOOK_SIGNATURE`, `404 ORDER_NOT_FOUND`, `409 ORDER_AMOUNT_MISMATCH`

13. **`GET /api/downloads/:token`**
    - **Auth & Role:** Token-gated (kiểm tra `download_grants.token`, `revoked_at IS NULL`, `expires_at > now()`, `download_count < max_downloads`, đơn `orders.status = 'paid'`)
    - **Request Schema (Params):** `downloadTokenParamSchema` (`src/schemas/order.ts`)
    - **Response DTO (`200`):** `ApiResponse<DownloadAccessResponse>` (chứa Supabase Storage Signed URL ngắn hạn, tự tăng `download_count` atomic)
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 ORDER_NOT_PAID`, `404 DOWNLOAD_TOKEN_NOT_FOUND`, `422 DOWNLOAD_EXPIRED`, `422 DOWNLOAD_LIMIT_EXCEEDED`

### 2.6. Trợ lý ảo RAG Gemini (`F7`)

14. **`POST /api/chat`**
    - **Auth & Role — 2 chế độ rõ ràng:**
      - **Storefront Mode (không truyền `assignment_id`):** Public cho mọi khách hàng trên Mặt tiền Cửa hàng — **không** bắt ký consent F11 và **không** tạo bản ghi rác trong `experiment_assignments`/`scenario_runs`/`chat_sessions`. Server lấy danh mục active, gọi `runChatbotStub`, kiểm tra Strict Server-Side Grounding (`is_active = true` và `deleted_at IS NULL`) và trả `SendChatMessageResponse` hợp lệ (`session_id` giữ nguyên nếu có hoặc sinh UUID mới).
      - **Experiment Mode (có truyền `assignment_id`):** Participant đã `consent_given = true`, khớp `visitor_id` / cookie phiên và `active_variant === 'chatbot_on'` (**chặn cứng `403` nếu `chatbot_off`**); lưu lịch sử vào `chat_sessions` và `chat_messages` trong DB.
    - **Request Schema:** `sendChatMessageSchema` (`src/schemas/chat.ts`) — `assignment_id` & `visitor_id` optional ở Storefront; khi có `assignment_id` thì bắt buộc kèm `visitor_id` hợp lệ.
    - **Response DTO (`200`):** `ApiResponse<SendChatMessageResponse>` (tất cả `suggested_products` đã được server đối chiếu tồn tại & `is_active = true` trong DB)
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 CHATBOT_DISABLED_FOR_VARIANT`, `404 ASSIGNMENT_NOT_FOUND`, `422 CONSENT_REQUIRED`, `429 RATE_LIMIT_EXCEEDED`, `500 LLM_UPSTREAM_ERROR`

15. **`GET /api/chat/sessions`**
    - **Auth & Role:**
      - Nếu **không truyền `assignment_id`**: Public — trả ngay `{ sessions: [] }`.
      - Nếu **có truyền `assignment_id`**: Participant sở hữu `assignment_id` (kiểm tra session cookie / visitor khớp) hoặc `admin`.
    - **Request Schema (Query):** `chatSessionsQuerySchema` (`src/schemas/chat.ts` — `assignment_id` optional)
    - **Response DTO (`200`):** `ApiResponse<ChatSessionsResponse>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 ASSIGNMENT_NOT_FOUND`

### 2.7. Tracking Hành vi (`F10`)

16. **`POST /api/events`**
    - **Auth & Role:** Participant hợp lệ (`assignment_id` tồn tại)
    - **Request Schema:** `trackEventSchema` (`src/schemas/event.ts`) — Bắt buộc đủ `visitor_id`, `assignment_id`, `variant`, `event_name` (1 trong 14 tên chuẩn), `created_at`. Nếu thiếu hoặc gửi sự kiện chat khi `variant = 'chatbot_off'` thì reject `400`.
    - **Response DTO (`201`):** `ApiResponse<TrackEventResponse>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `404 ASSIGNMENT_NOT_FOUND`

### 2.8. Thí nghiệm A/B & Kịch bản nhiệm vụ (`F8`, `F11`)

17. **`POST /api/experiments/consent`**
    - **Auth & Role:** Public (không ép đăng ký tài khoản theo `RULES.md` Mục 4.4)
    - **Request Schema:** `experimentConsentSchema` (`src/schemas/experiment.ts`)
    - **Response DTO (`201`):** `ApiResponse<ExperimentAssignmentDto>` (sinh `participant_code`, gán ngẫu nhiên 1 lần duy nhất `abba_on_first` hoặc `abba_off_first` theo thiết kế Within-subject AB/BA, đặt cookie session HTTP-only)
    - **Error Codes:** `400 VALIDATION_ERROR`, `404 EXPERIMENT_NOT_FOUND`

18. **`GET /api/scenarios/next`**
    - **Auth & Role:** Participant đã consent (`assignment_id`)
    - **Request Schema (Query):** `scenarioNextQuerySchema` (`src/schemas/experiment.ts`)
    - **Response DTO (`200`):** `ApiResponse<ScenarioNextResponse>` (trả thẻ kịch bản kế tiếp + `active_variant` tự động đảo giữa bước 1 và bước 2; **tuyệt đối không lộ `expected_product_id` hay `rubric_note`**)
    - **Error Codes:** `400 VALIDATION_ERROR`, `404 ASSIGNMENT_NOT_FOUND`, `422 CONSENT_REQUIRED`

19. **`POST /api/scenarios/:id/complete`**
    - **Auth & Role:** Participant đã consent
    - **Request Schema:** `completeScenarioSchema` (`src/schemas/experiment.ts`)
    - **Response DTO (`200`):** `ApiResponse<CompleteScenarioResponse>` (chấm `is_correct` ở server, ghi `completed_at`, tính `duration_seconds`, không trả đáp án đúng khi người tham gia chưa xong toàn bộ thí nghiệm)
    - **Error Codes:** `400 VALIDATION_ERROR`, `404 SCENARIO_NOT_FOUND`, `409 SCENARIO_ALREADY_COMPLETED`

19a. **`POST /api/experiments/exit`**
    - **Auth & Role:** Public / Session cookie (dùng khi người tham gia bấm Thoát chế độ thí nghiệm để quay về Storefront sạch)
    - **Request Schema:** Không
    - **Response DTO (`200`):** `ApiResponse<ExperimentExitResponse>` (`{ exited: true }`, xóa cookie HTTP-only `dsa_experiment`)
    - **Error Codes:** `500 INTERNAL_ERROR`

### 2.9. Quản trị (`F9` — P1)

20. **`GET, POST, PATCH /api/admin/products`**
    - **Auth & Role:** Authenticated `role === 'admin'`
    - **Request Schema:**
      - `GET`: `productListQuerySchema`
      - `POST`: `adminCreateProductSchema`
      - `PATCH`: `adminUpdateProductSchema`
    - **Response DTO (`200` / `201`):** `ApiResponse<ProductDetailDto[]>` / `ApiResponse<ProductDetailDto>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 PRODUCT_NOT_FOUND`, `409 CONFLICT`

21. **`GET /api/admin/orders`**
    - **Auth & Role:** Authenticated `role === 'admin'`
    - **Request Schema (Query):** `adminOrderQuerySchema` (`src/schemas/order.ts`)
    - **Response DTO (`200`):** `ApiResponse<OrderDto[]>` kèm `meta: PaginationMeta`
    - **Error Codes:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

22. **`GET /api/admin/dashboard`**
    - **Auth & Role:** Authenticated `role === 'admin'`
    - **Request Schema (Query):** `adminDashboardQuerySchema` (`src/schemas/experiment.ts`, mặc định `include_simulated=false`)
    - **Response DTO (`200`):** `ApiResponse<AdminDashboardSummaryDto>`
    - **Error Codes:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

23. **`GET /api/admin/export`** *(Xuất dữ liệu ẩn danh cho pipeline phân tích `analysis/`)*
    - **Auth & Role:** Authenticated `role === 'admin'`
    - **Request Schema (Query):** `adminExportQuerySchema` (`src/schemas/experiment.ts`):
      - `dataset`: `'scenario_runs' | 'events' | 'rag_logs'` (bắt buộc)
      - `format`: `'csv' | 'json'` (mặc định `'csv'`)
      - `include_simulated`: `boolean` (mặc định `false`)
    - **Quy tắc ẩn danh bắt buộc (`RULES.md` Mục 12):** Tuyệt đối không truy vấn hoặc xuất `email`, `full_name`, `password_hash`, `user_id`; chỉ xuất định danh nghiên cứu `participant_code`, `assignment_id`, `visitor_id` cùng các cột số liệu phục vụ phân tích thống kê & phân cụm.
    - **Response DTO (`200`):**
      - Khi `format=csv`: Trả `text/csv; charset=utf-8` (`Content-Disposition: attachment`, kèm chống CSV Formula Injection) khớp trực tiếp schema đầu vào của `analysis/analyze_experiment.py` và `analysis/cluster_behavior_and_rfm.py`.
      - Khi `format=json`: Trả `ApiResponse<AdminExportJsonResponse>`.
    - **Error Codes:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

24. **`GET /api/admin/chat-logs`** *(Nhật ký hội thoại Chatbot ẩn danh cho Admin)*
    - **Auth & Role:** Authenticated `role === 'admin'`
    - **Request Schema (Query):** `adminChatLogsQuerySchema` (`src/schemas/chat.ts`):
      - `include_simulated`: `boolean` (mặc định `false`)
      - `limit`: `number` (`1..100`, mặc định `30`)
    - **Quy tắc ẩn danh:** Chỉ trả `participant_code`, không trả `email`, `full_name` hay `user_id`.
    - **Response DTO (`200`):** `ApiResponse<AdminChatLogItemDto[]>` (mỗi mục gồm `session_id`, `participant_code`, `title`, `created_at`, `is_simulated`, và danh sách `messages` gồm `id`, `role`, `content`, `model_name`, `suggested_products`, `latency_ms`, `tokens_used`, `cost_usd`, `created_at`)
    - **Error Codes:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

## 3. Ví dụ Payload Chi tiết Cho 3 Luồng Trọng Tâm

### 3.1. Mock Sandbox Payment Webhook (`POST /api/payments/webhook`)

**Request (`mockPaymentWebhookSchema`):**

```json
{
  "order_id": "8c8c6f3e-3d1a-4b40-9d6a-7e94c8a61c11",
  "order_code": "ORD-20261114-0042",
  "payment_provider": "mock_sandbox",
  "payment_reference": "MOCK-TX-992817",
  "status": "paid",
  "amount_vnd": 490000,
  "signature": "a4b8f19d0e3c...hmac_sha256_hex",
  "timestamp": "2026-11-14T08:15:30+07:00"
}
```

**Response (`200 OK` — `ApiSuccess<PaymentWebhookResponse>`):**

```json
{
  "ok": true,
  "data": {
    "order_id": "8c8c6f3e-3d1a-4b40-9d6a-7e94c8a61c11",
    "order_code": "ORD-20261114-0042",
    "status": "paid",
    "paid_at": "2026-11-14T08:15:31.042Z",
    "download_grants": [
      {
        "id": "b7b1f0c4-0b8b-4a34-8d12-3f9e56a41002",
        "order_id": "8c8c6f3e-3d1a-4b40-9d6a-7e94c8a61c11",
        "product_id": "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
        "token": "dl_94f8a21b7e6d4a0c8b91e234c5d6e7f8",
        "download_url": "/api/downloads/dl_94f8a21b7e6d4a0c8b91e234c5d6e7f8",
        "max_downloads": 5,
        "download_count": 0,
        "expires_at": "2026-11-21T08:15:31.042Z"
      }
    ]
  }
}
```

### 3.2. Gemini RAG Chat (`POST /api/chat`)

**Request (`sendChatMessageSchema` — Storefront Mode, không cần `assignment_id`):**

```json
{
  "visitor_id": "vis_01jcx9m3p9k2q1r5s8t0u4v7",
  "message": "Shop mình bán mỹ phẩm dưỡng da trên TikTok Shop, ngân sách dưới 1 triệu."
}
```

**Request (`sendChatMessageSchema` — Experiment Mode `/experiment`, có `assignment_id`):**

```json
{
  "assignment_id": "d47a1f10-7d5b-4a77-9498-a76f9814d001",
  "visitor_id": "vis_01jcx9m3p9k2q1r5s8t0u4v7",
  "scenario_run_id": "3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5",
  "message": "Shop mình bán mỹ phẩm dưỡng da không trị liệu trên TikTok Shop, ngân sách dưới 1 triệu, cần landing page và bộ prompt viết mô tả sản phẩm."
}
```

**Response khi hợp lệ (`200 OK` — `ApiSuccess<SendChatMessageResponse>`):**

```json
{
  "ok": true,
  "data": {
    "session_id": "5b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
    "user_message": {
      "id": "11111111-2222-4333-8444-555555555555",
      "session_id": "5b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
      "role": "user",
      "content": "Shop mình bán mỹ phẩm dưỡng da không trị liệu trên TikTok Shop, ngân sách dưới 1 triệu, cần landing page và bộ prompt viết mô tả sản phẩm.",
      "prompt_version": null,
      "model_name": null,
      "retrieved_product_ids": [],
      "suggested_product_ids": [],
      "suggested_products": [],
      "latency_ms": null,
      "tokens_used": null,
      "cost_usd": null,
      "created_at": "2026-11-14T08:10:00.120Z"
    },
    "assistant_message": {
      "id": "66666666-7777-4888-9999-aaaaaaaaaaaa",
      "session_id": "5b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e",
      "role": "assistant",
      "content": "Với ngân sách dưới 1 triệu cho shop mỹ phẩm dưỡng da bán trên TikTok Shop, bạn nên kết hợp 2 gói sản phẩm sau từ danh mục hiện có (tổng 780.000đ)...",
      "prompt_version": "v1",
      "model_name": "gemini-3.8-flash",
      "retrieved_product_ids": [
        "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
        "7a9c11d2-54e3-4c99-8b10-0f2d3e4a5b6c"
      ],
      "suggested_product_ids": [
        "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
        "7a9c11d2-54e3-4c99-8b10-0f2d3e4a5b6c"
      ],
      "suggested_products": [
        {
          "id": "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
          "slug": "landing-page-my-pham-tiktok-shop",
          "name": "Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop",
          "product_type": "template",
          "industry": "Mỹ phẩm",
          "price_vnd": 490000,
          "thumbnail_url": "/images/products/cosmetics-landing.webp",
          "reason": "Tối ưu chuyển đổi mobile 375px và gắn link giỏ hàng TikTok Shop."
        },
        {
          "id": "7a9c11d2-54e3-4c99-8b10-0f2d3e4a5b6c",
          "slug": "prompt-pack-mo-ta-my-pham",
          "name": "Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm",
          "product_type": "prompt_pack",
          "industry": "Mỹ phẩm",
          "price_vnd": 290000,
          "thumbnail_url": "/images/products/cosmetics-prompts.webp",
          "reason": "Bộ 60 prompt viết mô tả thành phần dịu nhẹ, tuân thủ chính sách không cam kết trị liệu."
        }
      ],
      "latency_ms": 842,
      "tokens_used": 615,
      "cost_usd": 0.000245,
      "created_at": "2026-11-14T08:10:00.962Z"
    }
  }
}
```

**Response khi bị chặn ở nhánh `chatbot_off` (`403 Forbidden`):**

```json
{
  "ok": false,
  "error": {
    "code": "CHATBOT_DISABLED_FOR_VARIANT",
    "message": "Trợ lý ảo không khả dụng trong lượt nhiệm vụ hiện tại (chatbot_off)."
  }
}
```

### 3.3. Luồng Thí nghiệm Within-Subject AB/BA (`F11`)

#### Bước 1: Ghi nhận đồng ý & Khởi tạo phiên (`POST /api/experiments/consent`)

```json
// Request
{
  "experiment_code": "exp_chatbot_advisor_v1",
  "visitor_id": "vis_01jcx9m3p9k2q1r5s8t0u4v7",
  "consent_given": true,
  "shop_profile": {
    "industry": "Mỹ phẩm",
    "monthly_orders": "50-200",
    "team_size": 2,
    "channels": ["TikTok Shop", "Shopee"],
    "role_in_study": "shop_owner"
  }
}

// Response (201 Created)
{
  "ok": true,
  "data": {
    "assignment_id": "d47a1f10-7d5b-4a77-9498-a76f9814d001",
    "experiment_id": "0f8fad5b-d9cb-469f-a165-70867728950e",
    "participant_code": "P-018",
    "variant": "abba_on_first",
    "active_variant": "chatbot_on",
    "consent_given": true,
    "consent_at": "2026-11-14T08:05:00.000Z",
    "created_at": "2026-11-14T08:05:00.000Z"
  }
}
```

#### Bước 2: Nhận thẻ kịch bản hiện tại (`GET /api/scenarios/next?assignment_id=...`)

```json
// Response (200 OK — Lượt 1 với active_variant = chatbot_on)
{
  "ok": true,
  "data": {
    "assignment_id": "d47a1f10-7d5b-4a77-9498-a76f9814d001",
    "participant_code": "P-018",
    "step_order": 1,
    "total_steps": 2,
    "active_variant": "chatbot_on",
    "scenario_run_id": "3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5",
    "scenario": {
      "id": "9f1e2d3c-4b5a-4678-8901-abcdef123456",
      "code": "SC-01",
      "title": "Kịch bản 1: Shop mỹ phẩm dưỡng da trên TikTok Shop",
      "prompt_text": "Bạn đang vận hành shop mỹ phẩm 2 người trên TikTok Shop, ngân sách dưới 1.000.000đ. Hãy chọn gói sản phẩm phù hợp nhất để làm trang bán hàng và bộ prompt mô tả sản phẩm an toàn chính sách.",
      "industry": "Mỹ phẩm",
      "budget_vnd": 1000000,
      "difficulty": "medium"
    },
    "started_at": "2026-11-14T08:05:12.000Z",
    "is_finished": false
  }
}
```

#### Bước 3: Ghi nhận sự kiện chuẩn (`POST /api/events`)

```json
// Request
{
  "visitor_id": "vis_01jcx9m3p9k2q1r5s8t0u4v7",
  "assignment_id": "d47a1f10-7d5b-4a77-9498-a76f9814d001",
  "variant": "chatbot_on",
  "event_name": "scenario_started",
  "created_at": "2026-11-14T08:05:12.100Z",
  "scenario_run_id": "3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5",
  "properties": {
    "scenario_code": "SC-01",
    "step_order": 1
  }
}
```

#### Bước 4: Hoàn thành thẻ kịch bản (`POST /api/scenarios/9f1e2d3c-4b5a-4678-8901-abcdef123456/complete`)

```json
// Request
{
  "assignment_id": "d47a1f10-7d5b-4a77-9498-a76f9814d001",
  "scenario_run_id": "3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5",
  "selected_product_id": "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
  "confidence_score": 4,
  "decision_note": "Gói này đúng ngành mỹ phẩm và vừa ngân sách."
}

// Response (200 OK)
{
  "ok": true,
  "data": {
    "scenario_run_id": "3e2b7a90-2b1c-4c88-b6a5-9901b2c3d4e5",
    "scenario_id": "9f1e2d3c-4b5a-4678-8901-abcdef123456",
    "step_order": 1,
    "active_variant": "chatbot_on",
    "selected_product_id": "2c5a98b1-90c4-4f88-a2b3-1c4f9b012a10",
    "confidence_score": 4,
    "duration_seconds": 148,
    "completed_at": "2026-11-14T08:07:40.000Z",
    "has_next_scenario": true
  }
}
```

*(Sau đó gọi lại `GET /api/scenarios/next?assignment_id=...`, server tự động chuyển sang `step_order = 2` với `active_variant = "chatbot_off"` đối với người tham gia có `variant = "abba_on_first"`.)*
