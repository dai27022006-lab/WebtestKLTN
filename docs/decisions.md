# Architectural Decision Records (`docs/decisions.md`)

Tài liệu lưu trữ các quyết định kiến trúc, công nghệ, mô hình AI, prompt và quy tắc dữ liệu của đồ án **Digital Store Advisor** theo chuẩn [`RULES.md`](../RULES.md) (Mục 12, 13, 19) để làm chứng cứ kỹ thuật khi bảo vệ trước hội đồng.

---

## ADR-001: Kiến trúc Nền tảng Pha 1 (Next.js App Router, Supabase pgvector 768d, Gemini API, Mock Sandbox, Within-Subject AB/BA)

- **Ngày quyết định:** 2026-11-14
- **Trạng thái:** Đã phê duyệt (Approved)
- **Phạm vi:** Nền tảng hệ thống, Schema DB (`001_init.sql`), API Contract, RAG Pipeline & Thiết kế thí nghiệm

### 1. Bối cảnh (Context)

Đề tài cần xây dựng một nền tảng thương mại điện tử bán sản phẩm số (template website, prompt pack, workflow tự động hóa) cho chủ shop nhỏ, đồng thời phục vụ **thí nghiệm định lượng có kiểm soát** để trả lời câu hỏi nghiên cứu:

> *"Trợ lý ảo tư vấn có giúp người dùng chọn đúng gói sản phẩm nhanh hơn và tự tin hơn so với tự duyệt danh mục không, và chi phí cho việc đó là bao nhiêu?"*

Hệ thống phải đạt độ ổn định cao trên gói hạ tầng miễn phí (Vercel + Supabase Free), đảm bảo bảo mật dữ liệu, chống bịa đặt (hallucination) trong RAG, và tách bạch rõ ràng giữa dữ liệu mô phỏng với dữ liệu thực nghiệm.

### 2. Các Quyết định Kỹ thuật (Decisions)

1. **Framework & Cấu trúc mã nguồn: Next.js App Router (TypeScript Strict) bắt buộc đặt trong `src/`**
   - Sử dụng `src/app/` cho UI pages và Route Handlers (`src/app/api/**`), tách biệt rõ tầng Contract (`src/types/api.ts`, `src/schemas/**`), tầng Nghiệp vụ (`src/server/**`), tầng Truy vấn/AI/Tracking (`src/lib/**`), và tầng Client Bridge (`src/services/**`).
   - Không tạo thư mục `/app` ở root để tránh xung đột router và giữ ranh giới sở hữu file rõ ràng giữa các thành viên & AI Agent.

2. **Cơ sở dữ liệu, Auth & Vector Search: Supabase PostgreSQL + `pgvector` (768 chiều) + RLS**
   - Lưu toàn bộ dữ liệu quan hệ (15 bảng trong `supabase/migrations/001_init.sql`) và vector embedding trên cùng một PostgreSQL instance để hỗ trợ JOIN trực tiếp `product_embeddings` với `products` (`WHERE is_active = true AND deleted_at IS NULL`) ngay trong một truy vấn SQL, loại bỏ hoàn toàn rủi ro lệch dữ liệu giữa DB chính và Vector DB rời.
   - Kích hoạt **Row Level Security (RLS)** trên toàn bộ 15 bảng: client công khai chỉ được phép `SELECT` sản phẩm `is_active = true` và kịch bản `is_active = true`; người dùng đăng nhập chỉ đọc `users`, `orders`, `order_items`, `download_grants` của chính mình với `(select auth.uid())`; mọi thao tác ghi tracking, gán nhóm thí nghiệm, RAG chat và webhook thanh toán đi qua Route Handler dùng `SUPABASE_SERVICE_ROLE_KEY` ở server.
   - **Quyết định số chiều vector `vector(768)` kèm HNSW Cosine Index:** Model embedding `gemini-embedding-001` hỗ trợ xuất mặc định tới 3072 chiều, nhưng `pgvector` giới hạn chỉ mục HNSW ở tối đa 2000 chiều. Do đó hệ thống cấu hình tham số `outputDimensionality: 768` (Matryoshka Representation Learning) để vừa dùng được HNSW index (`vector_cosine_ops`) tốc độ cao, vừa tiết kiệm ~75% dung lượng lưu trữ trên hạn mức 500MB của Supabase Free.
   - Giữ kết nối Supabase Free không bị auto-pause sau 7 ngày không có traffic bằng cron ping `GET /api/health` mỗi 4–5 ngày.

3. **LLM & RAG Grounding: Google Gemini API (`gemini-3.8-flash` + `gemini-embedding-001`) qua Server-Side**
   - Chỉ gọi Gemini API từ server (`src/app/api/chat/route.ts` / `src/lib/ai/**`) bằng `GEMINI_API_KEY` server-only; tuyệt đối không gọi từ trình duyệt.
   - Sử dụng `gemini-3.8-flash` kết hợp **Structured Output** (khớp `llmAdvisorStructuredOutputSchema` trong `src/schemas/chat.ts`) để ép model trả về danh sách `suggested_products` gồm UUID cụ thể.
   - **Strict Grounding:** Mọi UUID do LLM trả về đều được server đối chiếu lại với bảng `products` (`is_active = true AND deleted_at IS NULL`) trước khi lưu `chat_messages` và trả xuống UI; đồng thời ghi nhận đầy đủ `prompt_version`, `model_name`, `retrieved_product_ids`, `suggested_product_ids`, `latency_ms`, `tokens_used`, `cost_usd` để phục vụ tính kinh tế đơn vị (`cost_usd/phiên`) và đánh giá bộ Eval (`F12`).

4. **Thanh toán Sandbox: Mock Sandbox Payment Webhook làm mặc định (`payment_provider = 'mock_sandbox'`)**
   - Mặc định dùng luồng thanh toán giả lập nội bộ có ký HMAC-SHA256 (`POST /api/payments/webhook` xác thực bằng `MOCK_PAYMENT_WEBHOOK_SECRET`) thay vì phụ thuộc cổng thanh toán bên thứ ba trong lúc chạy thí nghiệm chính.
   - Lý do: Đảm bảo tỷ lệ ổn định 100% khi 30–40 người tham gia thực hiện thao tác checkout giả lập đo "ý định mua", không bị gián đoạn bởi sandbox bên ngoài bảo trì hoặc lỗi mạng cổng thanh toán. Cột `payment_provider` vẫn cho phép `'payos'` để mở rộng demo nếu còn thời gian ở giai đoạn sau.
   - Giỏ hàng (`/api/cart`) dùng signed HTTP-only cookie và luôn tính lại giá (`price_vnd`) từ DB khi tạo đơn (`POST /api/orders`), chống chỉnh sửa giá từ phía client.

5. **Thiết kế Thí nghiệm & Dữ liệu Nghiên cứu: Within-Subject Đảo Chéo AB/BA + Tách Bạch `is_simulated`**
   - Hỗ trợ đầy đủ cả 2 chế độ trong bảng `experiment_assignments` (`'abba_on_first'`, `'abba_off_first'`, `'chatbot_on'`, `'chatbot_off'`), nhưng mặc định áp dụng **Within-subject đảo chéo AB/BA**: mỗi người tham gia làm 2 thẻ kịch bản tương đương (`step_order = 1` và `2`), tự động đảo `active_variant` giữa `chatbot_on` và `chatbot_off` để khử hiệu ứng quen tay (order effect) và đạt sức mạnh thống kê cao với cỡ mẫu `N = 30–40` cặp quan sát đối chứng (Wilcoxon signed-rank + McNemar's test).
   - Giảm ma sát tham gia: `POST /api/experiments/consent` cấp `participant_code` và phiên server ngay sau khi người dùng đồng ý consent, không ép đăng ký tài khoản email/mật khẩu mới được làm kịch bản.
   - Mọi bảng dữ liệu hành vi/giao dịch (`users`, `products`, `orders`, `experiment_assignments`, `scenario_runs`, `chat_sessions`, `chat_messages`, `events`) đều có cờ `is_simulated boolean default false` (riêng `rfm_snapshots` mặc định `is_simulated = true`). Mọi truy vấn phân tích nghiên cứu chính thức bắt buộc lọc `WHERE is_simulated = false`.

### 3. Hệ quả & Ràng buộc Vận hành (Consequences)

- **Lợi ích:**
  - Frontend (`ai-template-2-fe`) và Backend (`ai-skill-design-web`) phát triển song song dựa trên hợp đồng khóa cứng tại `src/types/api.ts`, `src/schemas/**` và `docs/API-CONTRACT.md`.
  - Mọi chỉ số phản biện hội đồng (độ chính xác chọn gói, thời gian quyết định, độ tự tin Likert 1–5, độ trễ P95, tỷ lệ hallucination, chi phí USD/phiên) đều có cột lưu trữ chuẩn hóa trong Postgres ngay từ ngày đầu.
- **Đánh đổi & Lưu ý:**
  - Việc dùng `outputDimensionality: 768` yêu cầu đồng bộ nhất quán giữa script tạo embedding (`scripts/`), hàm RPC `match_product_embeddings`, và vector column `vector(768)` — mọi thay đổi về chiều vector hoặc model embedding về sau phải tạo migration mới và lập ADR kế tiếp.
  - Bảng `scenarios` chứa `expected_product_id` và `rubric_note` phục vụ chấm tự động ở server; Route Handler `GET /api/scenarios/next` bắt buộc map qua `ScenarioPublicDto` để không bao giờ rò rỉ đáp án chuẩn xuống client.
