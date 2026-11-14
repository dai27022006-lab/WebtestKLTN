# RULES.md — Quy ước dự án (v3 — Đồng bộ AI Agent Army)

> File quy ước chuẩn dùng chung cho cả **Nhóm sinh viên (5 thành viên)** và **Đội quân AI Agent** trong workspace. Khi có xung đột về quy ước kỹ thuật giữa `PROJECT_BRIEF.md` và `RULES.md`, **`RULES.md` là nguồn chuẩn cao nhất**. Mọi thay đổi file này phải đi qua Pull Request.

---

## 1. Bối cảnh & Nguyên tắc tối thượng

- **Đồ án tốt nghiệp:** Nền tảng thương mại điện tử kinh doanh sản phẩm số cho chủ shop nhỏ, tích hợp trợ lý ảo tư vấn thông minh (RAG) và phân tích hành vi chuyển đổi.
- **Sản phẩm MVP:** Cửa hàng số bán template website bán hàng do nhóm tự thiết kế + prompt pack bán hàng online + 1–2 mẫu workflow tự động hóa đơn giản.
- **Khách hàng chính:** Chủ shop nhỏ 1–3 người bán trên Shopee, TikTok Shop, Facebook. Nhóm ngách (freelancer/agency nhỏ, sinh viên khởi nghiệp) không thiết kế riêng trong MVP.
- **Câu hỏi nghiên cứu:** *"Trợ lý ảo tư vấn có giúp người dùng chọn đúng gói sản phẩm nhanh hơn và tự tin hơn so với tự duyệt danh mục không, và chi phí cho việc đó là bao nhiêu?"*
- **Nguyên tắc lọc tính năng:** Mọi tính năng, endpoint và bảng dữ liệu phải phục vụ trực tiếp cho **câu hỏi nghiên cứu** hoặc **luồng mua hàng cốt lõi**. Không phục vụ thì không làm.

---

## 2. Nguồn lực, Phân vai Người thật & Đội quân AI Agent

Nhóm **5 người**, thời gian thực hiện **3–6 tháng** *(kế hoạch bắt buộc hoàn thành bản nghiệm thu trong **3 tháng**, tháng 4–6 là mở rộng)*.

### 2.1. Vai trò thành viên người thật (Human Ownership)

| Vai trò (Human) | Thành viên | Trách nhiệm chính & Quyền duyệt (Reviewer) |
|---|---|---|
| **Trưởng kỹ thuật Backend + AI** | _________ | Duyệt PR vùng `src/app/api/**`, `src/lib/**`, `src/services/**`, `supabase/**`; kiểm tra bảo mật, giải trình kiến trúc & RAG trước hội đồng |
| **Trưởng giao diện Frontend + UX** | _________ | Duyệt PR vùng `src/components/**`, `src/sections/**`, `src/styles/**`, `src/app/**/page.tsx`; nghiệm thu UI/UX desktop & mobile `375px` |
| **Data & Analytics** | _________ | Quản lý chuẩn tracking (`src/lib/tracking`), pipeline `analysis/**`, dashboard số liệu, kiểm định thống kê, tính `cost_usd/phiên` & phân cụm hành vi |
| **Nội dung + Marketing** | _________ | Thiết kế dữ liệu sản phẩm chuẩn (`data/**`), bộ template gốc, prompt pack, kiểm soát bản quyền (`source_type`, `license_note`), SEO, GA4/GTM |
| **Nghiên cứu + QA** | _________ | Thiết kế kịch bản thí nghiệm (`docs/**`), tuyển 30–40 người tham gia, quản lý `eval/**` (đáp án chuẩn từ ≥ 3 người chấm), nghiệm thu chất lượng tính năng |

> **Quy tắc trách nhiệm:** Mỗi vùng có **1 người thật đứng tên chịu trách nhiệm chính** (giải thích được 100% code và dữ liệu thuộc vùng mình trước hội đồng). Thành viên vắng mặt 2 tuần liên tiếp không báo trước thì nhóm họp phân công lại.

### 2.2. Phối hợp với Đội quân AI Agent (`docs/AI-AGENT-ARMY.md`)

- **AI Agent phụ trách thực thi kỹ thuật theo vùng khóa quyền:**
  - `ai-template-1-ux`: Design System, `docs/UI-UX-SPEC.md`, `src/styles/tokens.css`, `themes.css`, `FINGERPRINTS.md`.
  - `ai-template-2-fe`: UI Components, `src/components/**`, `src/sections/**`, `src/motion/**`, giao diện `src/app/**/page.tsx`.
  - `image-generator`: Ảnh nền/hero/banner đặt tại `public/images/**` (không nhét chữ vào ảnh, tối ưu dung lượng WebP).
  - `ai-skill-design-web`: Contract-First & Backend (`docs/API-CONTRACT.md`, `src/types/api.ts`, `src/schemas/**`, `src/app/api/**`, `src/services/**`, `src/lib/**`, `supabase/**`).
  - `web-devops-release`: CI/CD, `.env.example`, `next.config.*`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/api/health/route.ts`, Preview Deploy.
  - `web-qa-verifier` + `browser`: Kiểm tra tĩnh (`tsc`, `lint`, `build`), QA 8 cổng, bảo mật & test giao diện thực tế (chỉ đọc và báo lỗi, không tự sửa code nhánh khác).
- **Ranh giới tuyệt đối:** AI Agent **không** viết hộ báo cáo/slide tốt nghiệp hay tự bịa dữ liệu khảo sát — phần nghiên cứu thực địa, thu thập nội dung thật và viết báo cáo thuộc về nhóm sinh viên.

---

## 3. Phạm vi MVP và Mức ưu tiên

- **P0** = Bắt buộc hoàn thành trong 3 tháng đầu.
- **P1** = Chỉ làm sau khi toàn bộ P0 đã chạy ổn định và pass QA.

| Mã | Tính năng | Ưu tiên | Ghi chú triển khai |
|---|---|---|---|
| F1 | Đăng ký, đăng nhập, phân quyền khách/admin | P0 | Dùng Supabase Auth; thí nghiệm F11 hỗ trợ mã phiên không ép đăng ký |
| F2 | Danh sách sản phẩm + lọc theo ngành, loại, giá | P0 | Phục vụ cả nhóm `chatbot_on` và `chatbot_off` |
| F3 | Trang chi tiết sản phẩm (live demo, specs, hướng dẫn) | P0 | Phải có `source_type` và `license_note` |
| F4 | Giỏ hàng | P0 | Tính tiền, kiểm tra tồn tại sản phẩm ở server |
| F5 | Thanh toán sandbox + tạo đơn | P0 | Mặc định Mock Sandbox Webhook (ổn định 100%); PayOS chỉ làm nếu dư thời gian |
| F6 | Giao hàng số: tải file theo đơn đã thanh toán | P0 | Signed URL / token có hạn (`expires_at`), không public link |
| F7 | Chatbot tư vấn (RAG) gợi ý gói theo ngành, ngân sách, nhu cầu | P0 | Grounding 100% ID từ DB thật, chống bịa |
| F8 | Chia nhóm A/B: bật/tắt chatbot ngẫu nhiên | P0 | Gán 1 lần vào `experiment_assignments`, không đổi giữa chừng |
| F9 | Admin quản lý sản phẩm/đơn | P1 | Dùng Supabase Studio ở giai đoạn đầu; UI quản trị tự làm sau |
| F10 | Tracking sự kiện + dashboard | P0 (gọn) | 14 sự kiện chuẩn trong DB + dashboard gọn (`/admin/analytics` hoặc Looker Studio) |
| F11 | Chế độ thí nghiệm có nhiệm vụ (thẻ kịch bản) | P0 | Giao thẻ kịch bản, bấm giờ, ghi gói chọn & độ tự tin (1–5) |
| F12 | Bộ đánh giá chatbot tự động (eval set) | P0 | 50–100 câu hỏi chuẩn + câu bẫy, chạy qua script `scripts/run-eval` |

**Ngoài phạm vi (chỉ nêu ở mục "Hướng phát triển" trong báo cáo):** chợ đa người bán, thanh toán tiền thật, review/đánh giá công khai, coupon, wishlist, đa ngôn ngữ, ứng dụng di động.

---

## 4. Thiết kế thí nghiệm (Phần quyết định chất lượng đồ án)

1. **Thí nghiệm có nhiệm vụ (Task-based Experiment):** Không dựa vào traffic tự nhiên. Mỗi người tham gia thực hiện **2–3 thẻ kịch bản** (ví dụ: *"Shop mỹ phẩm không trị liệu, ngân sách 1 triệu, cần landing page và prompt mô tả sản phẩm"*).
2. **Thiết kế thống kê & cỡ mẫu nhất quán (chọn và giữ cố định 1 trong 2 trước khi chạy):**
   - **Phương án khuyến nghị — Within-subject đảo chéo (AB / BA):** Cùng 1 người tham gia làm **2 kịch bản có độ khó tương đương**: 1 lần với `chatbot_on`, 1 lần với `chatbot_off` (đảo thứ tự ngẫu nhiên để khử hiệu ứng quen tay). Với **cỡ mẫu `N = 30–40` người**, phương pháp này cho `30–40` cặp quan sát đối chứng và đạt sức mạnh thống kê cao hơn hẳn chia đôi độc lập (dùng kiểm định **Wilcoxon signed-rank** cho thời gian & độ tự tin; **McNemar's test** cho tỉ lệ đúng/sai).
   - **Phương án dự phòng — Between-subject độc lập:** Nếu buộc phải gán 1 người cố định 1 nhánh từ đầu đến cuối, tổng mẫu tối thiểu phải là **`N >= 50` người (≥ 25 người mỗi nhóm)** (dùng **Mann-Whitney U** và **Fisher's exact / Chi-square**).
   - Người phụ trách Data phải tính lại power/cỡ mẫu và xin xác nhận của GVHD trước khi tuyển người tham gia.
3. **Thang đo bắt buộc ghi nhận vào DB (`scenario_runs` & `events`):**
   - Tỉ lệ chọn đúng gói so với đáp án chuẩn (đáp án chuẩn do **≥ 3 người chấm độc lập**, trong đó có **≥ 1 người ngoài nhóm**).
   - Thời gian ra quyết định (`completed_at - started_at`).
   - Độ tự tin tự đánh giá (thang Likert 1–5).
   - Ý định mua trong sandbox (hoàn thành checkout giả lập).
4. **Giảm ma sát cho người tham gia (F11):** Hỗ trợ gán **Participant Code / Anonymous Experiment Session** ngay sau khi bấm đồng ý tham gia (consent), không bắt buộc người test tạo tài khoản email/mật khẩu mới được làm kịch bản.
5. **Người tham gia & Tính trung thực:** Ưu tiên chủ shop nhỏ thật; nếu thiếu thì bổ sung sinh viên nhập vai và ghi rõ vào mục *Giới hạn nghiên cứu*. Trong báo cáo, gọi đúng bản chất `purchase` sandbox là **"ý định mua"**, không gọi là "doanh thu/chuyển đổi thật". Nếu `p >= 0.05`, báo cáo trung thực kèm khoảng tin cậy 95% và effect size — **tuyệt đối không sửa dữ liệu cho đẹp**.
6. **Phân tích hành vi & RFM:** Kết luận chính rút ra từ thí nghiệm mục 4 và **phân cụm hành vi phiên thật** (K-Means từ log tracking). **RFM** chỉ trình bày ở mức minh họa phương pháp trên dữ liệu mô phỏng có gắn nhãn rõ.

---

## 5. Tech Stack & Kiểm chứng hạ tầng

- **Framework:** Next.js (App Router) + TypeScript
- **Database & Auth:** Supabase (PostgreSQL + `pgvector` + Auth)
- **Lưu trữ file sản phẩm giao hàng (F6):** Supabase Storage private bucket *(cần kiểm tra giới hạn egress 5GB/tháng)* hoặc Cloudflare R2 (10GB free, không tính egress) cấp Signed URL.
- **Thanh toán sandbox (F5):** Mock Sandbox Checkout Webhook nội bộ (mặc định cho thí nghiệm để đảm bảo 100% ổn định); PayOS chỉ tích hợp thêm cho phần demo nếu dư thời gian.
- **LLM API:** 1 nhà cung cấp duy nhất qua server API (ưu tiên model nhanh, chi phí thấp, hỗ trợ JSON/Structured Output như Gemini Flash hoặc GPT-4o-mini). **Cấm gọi LLM từ trình duyệt.**
- **Tracking & Dashboard:** Bảng `events` trong Postgres làm nguồn sự thật chính + GA4/GTM phía client; Dashboard dựng gọn bằng Looker Studio hoặc route `/admin/analytics` *(không tự host Metabase để tiết kiệm công sức vận hành)*.

**3 việc bắt buộc kiểm chứng xong trong 2 tuần đầu:**
1. Phương án thanh toán sandbox phù hợp tại VN (xác nhận dùng Mock Sandbox hay PayOS).
2. Giới hạn Supabase Free (500MB DB, auto-pause sau 7 ngày không traffic → cài cron ping `/api/health` mỗi 4–5 ngày) và nơi chứa file tải về.
3. Chi phí LLM ước tính thực tế trên 12 sản phẩm mẫu cho 100 phiên thí nghiệm.

---

## 6. Cấu trúc thư mục chuẩn (Bắt buộc dùng `src/`)

> **Cảnh báo:** Tuyệt đối không tạo thư mục `/app` hay `/components` ở root song song với `src/app`, tránh xung đột router của Next.js và xung đột với cấu hình AI Agent Army.

```text
/src
  /app                  Pages (UI) và Route Handlers (trong src/app/api/**)
    /api
      /health           GET /api/health (keep-alive & CI check)
  /components           UI components tái sử dụng
  /sections             Các section theo Page Grammar
  /motion               Animation / Scroll-craft GPU
  /styles               tokens.css, themes.css
  /schemas              Zod validation schemas (shared contract)
  /types                api.ts (Contract-First types)
  /services             Business logic phía server / client bridge
  /server               Server helpers (auth, db client, rate-limit)
  /lib
    /db                 Truy vấn database & SQL/ORM queries
    /ai                 Gọi LLM, RAG retrieval, /prompts (có version)
    /tracking           Hàm gửi sự kiện & danh sách sự kiện chuẩn
/supabase/migrations    File migration DB đánh số thứ tự
/scripts                Seed dữ liệu mô phỏng, run-eval, tiện ích
/eval                   Bộ câu hỏi eval (v1, v2...) và log kết quả
/data                   Dữ liệu sản phẩm gốc cho RAG, metadata bản quyền
/analysis               Notebook/script Python/R phân tích thống kê & clustering
/docs                   PROJECT_BRIEF.md, UI-UX-SPEC.md, API-CONTRACT.md, decisions.md
```

---

## 7. Vùng sở hữu & Khóa quyền ghi file

| Vùng thư mục | AI Agent phụ trách | Người thật đứng tên duyệt PR |
|---|---|---|
| `docs/UI-UX-SPEC.md`, `src/styles/**`, `FINGERPRINTS.md` | `ai-template-1-ux` | Trưởng Frontend + UX |
| `src/components/**`, `src/sections/**`, `src/motion/**`, UI `src/app/**/page.tsx` | `ai-template-2-fe` | Trưởng Frontend + UX |
| `public/images/**`, `assets/prompts.md` | `image-generator` | Nội dung + Marketing |
| `docs/API-CONTRACT.md`, `src/types/api.ts`, `src/schemas/**`, `src/app/api/**`, `src/services/**`, `src/server/**`, `src/lib/db`, `src/lib/ai`, `supabase/**` | `ai-skill-design-web` | Trưởng Backend + AI |
| `.github/**`, `.env.example`, `next.config.*`, `Dockerfile`, `robots.ts`, `sitemap.ts`, `src/app/api/health/**` | `web-devops-release` | Trưởng Backend + AI |
| `src/lib/tracking/**`, `analysis/**` | *(Data + Backend phối hợp)* | Data & Analytics |
| `data/**` | *(Nội dung chuẩn bị)* | Nội dung + Marketing |
| `eval/**`, kịch bản thí nghiệm trong `docs/**` | *(QA quản lý chuẩn)* | Nghiên cứu + QA |

- Sửa file ngoài vùng sở hữu phải báo trước cho người đứng tên vùng đó và bắt buộc được họ review PR.
- Review chéo bắt buộc: **Backend ↔ Frontend**; **Data ↔ Nghiên cứu + QA**.

---

## 8. Quy ước đặt tên

- Biến, hàm: `camelCase`. Component, Type, Interface: `PascalCase`.
- File Component: `PascalCase.tsx`. File logic/util/schema: `kebab-case.ts` (hoặc `route.ts` / `page.tsx` theo chuẩn Next.js App Router).
- Bảng DB: `snake_case`, số nhiều (`products`, `order_items`, `scenario_runs`). Cột: `snake_case`. Khóa chính luôn là `id` (`uuid`). Khóa ngoại: `<tên_bảng_số_ít>_id`.
- Endpoint API: Ưu tiên danh từ số nhiều cho tài nguyên CRUD (`/api/products`, `/api/orders`); ngoại lệ cho endpoint hành động nghiệp vụ rõ nghĩa (`/api/auth/*`, `/api/chat`, `/api/events`, `/api/scenarios/:id/complete`).
- Nhánh Git: `feature/f7-chatbot-rag`, `fix/cart-total`, `chore/seed-data`.
- Commit: `feat(f7): ...`, `fix(cart): ...`, `chore: ...`, `docs: ...`.

---

## 9. Tên sự kiện tracking (Nguồn sự thật duy nhất)

Danh sách định nghĩa cố định tại `src/lib/tracking/events.ts`. Không tự ý thêm tên sự kiện ngoài danh sách này. Hai trạng thái `chatbot_on` và `chatbot_off` phải đo bằng cùng bộ sự kiện (trừ 3 sự kiện chỉ phát sinh khi có khung chat).

| Tên sự kiện | Thời điểm kích hoạt |
|---|---|
| `page_viewed` | Mở hoặc chuyển trang |
| `product_viewed` | Xem trang chi tiết sản phẩm |
| `search_used` | Gửi từ khóa tìm kiếm |
| `filter_applied` | Lọc theo ngành / loại / giá |
| `scenario_started` | Bắt đầu 1 thẻ kịch bản (`F11`) |
| `scenario_completed` | Chốt gói cho kịch bản kèm độ tự tin (`F11`) |
| `chat_opened` | Mở khung chat *(chỉ `chatbot_on`)* |
| `chat_message_sent` | Gửi tin nhắn cho bot *(chỉ `chatbot_on`)* |
| `product_suggested` | Bot trả về gợi ý sản phẩm *(chỉ `chatbot_on`)* |
| `suggestion_clicked` | Người dùng bấm vào card sản phẩm bot gợi ý |
| `add_to_cart` | Thêm sản phẩm vào giỏ |
| `checkout_started` | Bắt đầu trang thanh toán sandbox |
| `purchase` | Hoàn tất thanh toán sandbox *(ý định mua)* |
| `download_completed` | Tải file thành công từ đơn `paid` |

**Trường bắt buộc ở mọi sự kiện:** `visitor_id`, `assignment_id`, `variant` (`chatbot_on` | `chatbot_off`), `created_at` (kèm `scenario_run_id` nếu đang trong luồng F11). Thiếu trường bắt buộc thì reject ở server, không ghi bản ghi lỗi.

---

## 10. Quy ước API & Contract-First

Mọi endpoint phải được mô tả trong `docs/API-CONTRACT.md`, đồng bộ kiểu dữ liệu tại `src/types/api.ts` và validate input bằng Zod tại `src/schemas/**` trước khi nối Frontend–Backend.

- **Format phản hồi chuẩn (thống nhất cho toàn hệ thống):**
  - Thành công: `{ "ok": true, "data": ... }`
  - Lỗi: `{ "ok": false, "error": { "code": "STRING_CODE", "message": "..." } }`
- **Mã HTTP chuẩn:** `200`, `201`, `400` (input sai), `401` (chưa xác thực), `403` (sai quyền), `404`, `429` (vượt rate-limit), `500`.
- **Danh sách Endpoint chuẩn:**

| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/api/health` | Kiểm tra sống hệ thống & keep-alive Supabase |
| `POST` | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Đăng ký, đăng nhập, đăng xuất |
| `GET` | `/api/auth/me` | Lấy thông tin người dùng hiện tại |
| `GET` | `/api/products`, `/api/products/:id` | Danh mục lọc & chi tiết sản phẩm |
| `GET, POST, DELETE` | `/api/cart` | Quản lý giỏ hàng |
| `POST` | `/api/orders` | Tạo đơn hàng *(giá lấy 100% từ DB, không tin client)* |
| `POST` | `/api/payments/webhook` | Nhận kết quả thanh toán sandbox |
| `GET` | `/api/downloads/:token` | Cấp luồng tải file theo đơn `paid` |
| `POST` | `/api/chat` | Gửi tin nhắn & nhận gợi ý RAG *(chặn nếu `chatbot_off`)* |
| `GET` | `/api/chat/sessions` | Khôi phục hội thoại trong phiên |
| `POST` | `/api/events` | Ghi nhận sự kiện tracking |
| `POST` | `/api/experiments/consent` | Ghi nhận đồng ý & tạo phiên thí nghiệm (`participant_code`) |
| `GET` | `/api/scenarios/next` | Lấy thẻ kịch bản kế tiếp theo thứ tự đã đảo |
| `POST` | `/api/scenarios/:id/complete` | Lưu gói chọn, độ tự tin (1–5) & thời gian kết thúc |
| `GET, POST, PATCH` | `/api/admin/products` | Quản trị sản phẩm (P1) |
| `GET` | `/api/admin/orders`, `/api/admin/dashboard` | Theo dõi đơn & số liệu tổng hợp |

---

## 11. Quy tắc Database & Bản quyền sản phẩm

- Nguồn sự thật là sơ đồ ERD trong `docs/`. Thay đổi bảng/cột phải cập nhật ERD và viết migration trong `supabase/migrations/` trong **cùng PR** (không sửa bảng trực tiếp trên dashboard).
- Bổ sung ngay vào schema trước khi code F11:
  1. Bảng `scenario_runs` (`id`, `assignment_id`, `scenario_id`, `selected_product_id`, `confidence_score`, `started_at`, `completed_at`).
  2. Cột `cost_usd` (`numeric`) trong `chat_messages`.
  3. Cột `is_simulated` (`boolean default false`) trong các bảng dữ liệu hành vi/giao dịch (`users`, `orders`, `events`, `chat_sessions`).
- **Không xóa cứng** đơn hàng, tin nhắn thí nghiệm hay sự kiện (`deleted_at` hoặc trạng thái hủy).
- **Bản quyền sản phẩm:** Mỗi sản phẩm trong `products` bắt buộc có `source_type` (`original` | `adapted` | `licensed`) và `license_note`. Thư viện 150+ template sưu tập chỉ dùng để tham khảo bố cục, tuyệt đối không đóng gói bán lại nguyên bản.

---

## 12. Quy tắc Dữ liệu & Đạo đức nghiên cứu

- **Tách bạch dữ liệu mô phỏng:** Mọi dữ liệu tạo để demo UI/dashboard phải có `is_simulated = true`. Mọi script phân tích trong `analysis/**` bắt buộc lọc `WHERE is_simulated = false`.
- **Consent & Ẩn danh:** Có màn hình xác nhận đồng ý trước khi lưu hội thoại và tracking hành vi. Xuất dữ liệu phân tích chỉ dùng `visitor_id` / `participant_code`, không xuất email hay họ tên.
- **Tiêu chí loại mẫu:** Nếu cần loại bỏ phiên bỏ dở/spam (ví dụ thời gian làm kịch bản < 5 giây), phải chốt quy tắc loại trừ trong `docs/` **trước** khi xem kết quả thí nghiệm.

---

## 13. Quy tắc Chatbot, RAG & Bộ Eval

1. **Chống bịa 100% (Strict Grounding):** Mọi `suggested_product_ids` LLM trả về phải được server đối chiếu tồn tại và `is_active = true` trong DB trước khi gửi xuống UI. Thiếu thông tin thì trả lời *"hiện chưa có thông tin trong danh mục"*, không bịa giá hay tính năng.
2. **Audit Log đầy đủ:** Mỗi lượt trả lời lưu đủ `retrieved_product_ids`, `suggested_product_ids`, `tokens_used`, `cost_usd`, `latency_ms`.
3. **Version Prompt:** System prompt đặt trong `src/lib/ai/prompts/` có đánh số phiên bản (`v1`, `v2`...). Mỗi lần sửa prompt hoặc đổi model phải ghi vào `docs/decisions.md` và chạy lại `scripts/run-eval`.
4. **Rate-limit & Bảo vệ chi phí:** Giới hạn số request/phút và độ dài tin nhắn đầu vào ở server. Nhóm `chatbot_off` bị chặn gọi `/api/chat` từ phía server (`403`), không chỉ ẩn nút trên giao diện.
5. **Eval Set độc lập:** 50–100 câu hỏi chuẩn trong `eval/` (bao gồm ≥ 20% câu bẫy ngoài danh mục hoặc ngân sách bất khả thi). Báo cáo 4 chỉ số: **Accuracy chọn đúng gói**, **Hallucination Rate (ID không tồn tại)**, **P95 Latency**, **Cost/Query**. Không chỉnh sửa đáp án chuẩn sau khi đã chạy eval, và không lấy chính câu trong bộ eval cuối để nhét vào prompt mẫu.

---

## 14. Quy tắc A/B & An toàn thí nghiệm

- Gán biến thể (`chatbot_on` / `chatbot_off` hoặc thứ tự AB/BA) **1 lần duy nhất** vào `experiment_assignments`.
- Trong lúc chạy thí nghiệm chính, **cấm thay đổi giao diện, giá sản phẩm hay prompt chatbot** giữa hai nhóm để không làm nhiễu kết quả.
- Gắn phiên làm việc bằng `participant_code` / session token phía server thay vì chỉ dựa vào cookie `visitor_id` dễ bị xóa.

---

## 15. Quy tắc Bảo mật & Chống lỗi QA Frontend

- **Biến môi trường:** Tuyệt đối không commit `.env*`. Luôn duy trì `.env.example` không chứa key thật. Mọi LLM API key và Payment secret chỉ tồn tại phía server (cấm đặt tiền tố `NEXT_PUBLIC_*`).
- **Xác thực & Phân quyền:** Mọi endpoint ghi dữ liệu hoặc admin phải kiểm tra AuthN/AuthZ trên server (`role = admin`), không tin dữ liệu giá/tổng tiền/role gửi từ client.
- **Giao hàng số:** Link tải file chỉ cấp sau khi đơn đạt trạng thái `paid`, dùng token có `expires_at` và giới hạn `download_count`.
- **Chuẩn QA Giao diện (`web-craft-studio`):** Không preloader giả, không dùng hiệu ứng ẩn nội dung quá trễ gây mảng trắng, tôn trọng `prefers-reduced-motion`, test sạch giao diện desktop và mobile `375px`, kiểm tra 0 console error và 0 lỗi layout shift.

---

## 16. Quy trình Git & Làm việc với AI

1. **Không push thẳng vào `main`:** Làm việc qua nhánh `feature/*`, `fix/*`, PR nhỏ theo từng tính năng/mốc.
2. **Bắt buộc Review:** Mỗi PR cần ít nhất 1 review từ người đứng tên sở hữu vùng file bị chạm; các PR lớn cần chạy qua `web-qa-verifier` trước khi merge.
3. **Kỷ luật Vibe Code:**
   - Làm từng bước nhỏ theo từng mã tính năng (`F1`–`F12`), không sinh cả hệ thống trong một lần.
   - Cấm AI tự ý thêm thư viện mới, đổi cấu trúc thư mục `src/`, hoặc đổi tên sự kiện/endpoint khi nhóm chưa đồng ý.
   - Người đứng tên vùng file phải đọc và giải thích được code AI tạo ra trước khi merge; không hiểu thì yêu cầu AI giải thích hoặc viết lại đơn giản hơn (KISS & YAGNI).
   - Không dán API key hay dữ liệu thật của người tham gia thí nghiệm vào prompt chat.

---

## 17. Định nghĩa "Xong" (Definition of Done)

Một tính năng chỉ được coi là hoàn thành khi đạt đủ 6 điều kiện:
1. Chạy đúng luồng chính và xử lý đủ trường hợp lỗi (`400`, `401`, `403`, rỗng dữ liệu).
2. Pass kiểm tra tự động: `tsc --noEmit`, `lint`, `build` (không lỗi TS/ESLint).
3. Pass kiểm tra bảo mật & giao diện thực tế (Desktop + Mobile `375px`, không lỗi QA 8 cổng).
4. Sự kiện tracking liên quan ghi vào DB đúng tên và đủ 4 trường bắt buộc tại Mục 9.
5. Đã cập nhật `docs/API-CONTRACT.md` / ERD / `docs/decisions.md` nếu có thay đổi cấu trúc.
6. PR đã được review và người sở hữu vùng giải thích được logic code.

---

## 18. Lộ trình 3 tháng & Quy tắc cắt giảm

| Mốc thời gian | Đầu ra bắt buộc |
|---|---|
| **Tuần 1–2 (Kiểm chứng)** | Chốt khung đề tài với GVHD; phỏng vấn **8–10 chủ shop** *(nếu < 4 người xác nhận nhu cầu/dùng được dạng bàn giao thì họp xoay trục)*; kiểm chứng 3 điểm hạ tầng ở Mục 5; chốt 3–4 thẻ kịch bản + đáp án chuẩn; dựng repo + ERD + `API-CONTRACT.md`. |
| **Tháng 1 (Lõi TMĐT + Dữ liệu chuẩn)** | Hoàn thành `F1–F6` chạy ổn định trên môi trường Preview; hoàn thiện **10–12 sản phẩm gốc chất lượng sâu** (6 template gốc + 4 prompt pack + 2 workflow mẫu) đủ phủ 3 ngành + tracking `events` hoạt động. *(Nếu kịp mới mở rộng lên 15–20 template ở tháng 2).* |
| **Tháng 2 (AI + Thí nghiệm + Eval)** | Hoàn thành `F7, F8, F10 (gọn), F11, F12`; có **Eval Set v1 (50–100 câu)** và bảng đo Baseline (Accuracy, Hallucination, Latency, Cost); chạy thử nghiệm nhỏ (pilot 5 người) để sửa lỗi kịch bản và UI. |
| **Tháng 3 (Thực nghiệm & Nghiệm thu)** | Chạy thí nghiệm chính (`30–40` người Within-subject hoặc `>= 50` người Between-subject); phân tích thống kê, kinh tế đơn vị & phân cụm hành vi (+ RFM minh họa); hoàn thiện báo cáo & luyện phản biện hội đồng. |

- **Mở rộng (Tháng 4–6 nếu còn thời gian):** Nâng số lượng lên 15–20 template, chạy vòng eval/prompt v2 so sánh cải thiện, hoàn thiện F9 Admin UI, tối ưu landing page SEO.
- **Quy tắc cắt giảm (khi trễ > 1 tuần ở bất kỳ mốc nào):** Họp nhóm trong vòng 48 giờ và cắt theo thứ tự ưu tiên từ trên xuống:
  1. Cắt UI Admin tự làm (`F9` — dùng thẳng Supabase Studio)
  2. Giảm phần mở rộng của RFM xuống mức minh họa ngắn gọn
  3. Cắt bớt số lượng workflow mẫu (giữ 1 mẫu)
  4. Giữ 10–12 sản phẩm thay vì cố lên 20
  5. Cắt hiệu ứng UI phức tạp
- **TUYỆT ĐỐI KHÔNG CẮT:** `F7` (RAG chống bịa), `F8` (A/B), `F11` (thí nghiệm kịch bản), `F12` (bộ eval), tracking `events`, và cỡ mẫu tối thiểu của thí nghiệm.

---

## 19. Nhịp làm việc tuần

- Họp ngắn cố định 1 buổi/tuần: cập nhật tiến độ theo mã `F1–F12`, điểm nghẽn, số PR đã merge, số bug mở.
- Mọi quyết định thay đổi thiết kế, prompt, model hoặc tiêu chí loại dữ liệu đều ghi vào `docs/decisions.md` để làm chứng cứ viết báo cáo đồ án.
