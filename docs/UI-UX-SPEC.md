# UI-UX-SPEC.md — Đặc Tả Kiến Trúc 3 Không Gian, Giao Diện & Design System (`DreamTeam`)

> **Phiên bản:** v3.0 *(Nâng cấp Tách 3 Không Gian Rạch Ròi + Interactive Live HTML Preview + Sửa lỗi Font & Hiệu ứng GPU 60fps)*  
> **Sở hữu & Ban hành:** `ai-template-1-ux`  
> **Đối tượng bàn giao:**  
> - `ai-template-2-fe` (`src/components/**`, `src/sections/**`, `src/motion/**`, `src/app/**/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`)  
> - `ai-skill-design-web` (`src/app/api/**`, `src/services/**`, `src/schemas/**`, `src/types/api.ts`)  
> - `image-generator` (`public/images/*.webp`, `assets/anchor.webp`, `assets/prompts.md`)  
> - `web-qa-verifier` (Kiểm định QA 8 cổng & Desktop/Mobile `375px`)  
> **Tài liệu đối chiếu:** [`docs/DESIGN.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/DESIGN.md), [`RULES.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/RULES.md), [`docs/API-CONTRACT.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/API-CONTRACT.md), [`FINGERPRINTS.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/FINGERPRINTS.md), [`image-style.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/image-style.md).

---

## 1. Kiến Trúc Tách 3 Không Gian Rạch Ròi (3-Space Separation)

Để người mua hàng thực tế không bị rối bởi thuật ngữ nghiên cứu/lập trình, người tham gia khảo sát không bị sai lệch hành vi, và quản trị viên có buồng điều hành riêng: hệ thống **DreamTeam** được tách thành **3 không gian độc lập hoàn toàn về ngôn ngữ UI và Shell điều hướng**:

| Không gian | Tuyến đường (Routes) | Đối tượng mục tiêu | Ngôn ngữ UI & Quy tắc bắt buộc | Layout Shell |
|---|---|---|---|---|
| **1. Mặt tiền Cửa hàng** | `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/auth` | Chủ shop nhỏ 1–3 người (Shopee, TikTok Shop, Facebook) | **100% ngôn ngữ thương mại tự nhiên.** **CẤM** hiển thị `F1–F12`, `Thí nghiệm F11`, `Phân tích Admin`, `RAG`, `Grounding DB`, `AB/BA`, `Within-subject`, `Stub`, `Gemini Key`, `Eval Set`, `participant_code`, `is_simulated`. | `SiteHeader` (thương mại) + `SiteFooter` (chỉ có 1 link nhẹ ở Footer tới `/experiment`) + `AdvisorChatDrawer` (ngôn ngữ tư vấn mua sắm). |
| **2. Không gian Khảo sát** | `/experiment` *(+ `ScenarioContextBar` khi có nhiệm vụ mở)* | Người tham gia trải nghiệm chọn gói có nhiệm vụ | Tách khỏi Header chính. **Ẩn mã `P-...`, `SC-01`, `SC-02`, `F11`, `AB/BA`** khỏi màn hình nhiệm vụ. **KHÔNG lộ nhãn `"Không trợ lý ảo"` / `"chatbot_off"`** để chống sai lệch hành vi. | `ExperimentFocusHeader` (tối giản + nút `"Thoát khảo sát"`). `ScenarioContextBar` chỉ hiện khi đang làm nhiệm vụ chưa hoàn tất ngoài `/experiment` và `/admin/*`. |
| **3. Không gian Quản trị** | `/admin/analytics`, `/admin/products`, `/admin/orders`, `/admin/chat-logs` | Quản trị viên / Nhóm vận hành (`role === 'admin'`) | Bảo vệ chặt theo `role === 'admin'`. Nơi tập trung toàn bộ số liệu đối chứng A/B, CRUD sản phẩm + gắn Demo HTML/ảnh, quản lý đơn hàng và kiểm định log AI (`model_name`, `Stub/LLM`, `cost_usd`, `retrieved_product_ids`). | `AdminShell` riêng (Sidebar trái `260px` desktop / Drawer mobile + Topbar `64px`). Không render `SiteFooter`, `ScenarioContextBar` hay `AdvisorChatDrawer`. |

> **Lưu ý ranh giới Backend (`RULES.md` Mục 9–10):** Các tên sự kiện tracking (`src/lib/tracking/events.ts`), trường JSON DTO (`src/types/api.ts`) và bảng DB vẫn giữ nguyên cấu trúc chuẩn ở tầng API/DB. Việc "làm sạch ngôn ngữ" áp dụng cho **văn bản hiển thị (UI Copy), nhãn điều hướng và thành phần giao diện** của từng không gian.

---

## 2. Hệ Thống Design System & Khắc Phục Lỗi Font (`src/styles/**`)

### 2.1. Sửa Lỗi Chí Mạng Rơi Về Font Times New Roman (`tokens.css` & `typography.css`)

- **Nguyên nhân gốc đã xử lý:** Biến `--font-sans` trong `src/styles/tokens.css` trước đây tham chiếu `var(--font-be-vietnam-pro)` dù `src/app/layout.tsx` chỉ nạp `Plus_Jakarta_Sans` (`--font-plus-jakarta-sans`) và `JetBrains_Mono` (`--font-jetbrains-mono`). Theo chuẩn CSS, khi `var(--custom-prop)` không có fallback và trỏ tới biến chưa định nghĩa, toàn bộ giá trị `--font-sans` bị đánh dấu *invalid at computed-value time* khiến trình duyệt rơi về **Times New Roman**.
- **Chuỗi font đã khóa trong `src/styles/tokens.css`:**
  - `--font-sans`: `var(--font-plus-jakarta-sans), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
  - `--font-mono`: `var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;`
- **Kiểm soát chặt 2 họ font & tiếng Việt (`src/styles/typography.css`):**
  - Mọi lớp `.type-display`, `.type-h1..h3`, `.type-lead`, `.type-body`, `.type-body-sm`, `.type-caption` gắn tường minh `font-family: var(--font-sans);`.
  - Các lớp dữ liệu `.type-eyebrow`, `.type-mono`, `.type-price`, `.type-timer`, `.type-code` dùng `font-family: var(--font-mono); font-variant-numeric: tabular-nums;`.
  - Bảo toàn `.text-line-clip` (`overflow: hidden; padding-bottom: 0.16em; margin-bottom: -0.16em;`) để tránh cắt chân dấu nặng/huyền tiếng Việt (`ạ, ệ, ộ, ự`).
  - Bảo toàn và tăng cường bù quang học Dark Mode trên `[data-theme="dark"]`, `.dg-dark-band`, `[data-surface="dark"]` (`letter-spacing: 0.008em`, `line-height: 1.66–1.70` cho `body`, `.type-body`, `.type-body-sm`), và reset lại về chuẩn sáng khi lồng `[data-surface="light"]`.

### 2.2. Bảng Màu 6 Vai Trò + Emerald Accent + Copper Highlight (`tokens.css` & `themes.css`)

Mọi component bắt buộc dùng CSS Custom Properties — **tuyệt đối không hardcode `#fff`, `#000` hay mã màu Light cố định**.

| Vai trò Token | Token chính (`CSS var`) | Light Mode (`[data-theme="light"]`) | Dark Mode (`[data-theme="dark"]`) | Mục đích sử dụng |
|---|---|---|---|---|
| **1. Canvas** | `--bg-canvas` *(alias `--surface`)* | `#ffffff` | `#0d1512` | Nền trang tổng thể (`color-scheme: light dark`) |
| **2. Subtle & Surface** | `--bg-surface` / `--bg-surface-subtle` / `--bg-surface-sunken` | `#ffffff` / `#f8fafc` / `#f1f5f9` | `#111c18` / `#16241f` / `#090f0d` | Card nổi, dải xen kẽ, input, thead bảng |
| **3. Primary Ink** | `--ink` *(alias `--ink-primary`, `--dg-ink`)* | `#0f172a` | `#f1f5f9` | Tiêu đề, nội dung chính, giá VND (`>= 14.5:1`) |
| **4. Muted Ink** | `--ink-soft` / `--ink-tertiary` | `#475569` / `#64748b` | `#a3b8b0` / `#7f968d` | Mô tả phụ, metadata (`>= 4.7:1` cả 2 mode) |
| **5. Borders** | `--border-hairline` / `--border-strong` | `#e2e8f0` / `#cbd5e1` | `rgba(226,232,240,0.12)` / `0.24` | Viền card `1px`, đường kẻ bảng, khung preview |
| **6. Primary Accent** | `--accent` / `--accent-hover` / `--accent-soft` / `--accent-ink` | `#187f65` / `#146553` / `10%` / `#ffffff` | `#48b594` / `#5ec7a7` / `16%` / `#071712` | CTA chính, tab đang chọn, link active (`>= 4.9:1`) |
| **Header Backdrop** | `--header-bg` / `--header-bg-scrolled` | `rgba(255,255,255,0.92)` / `0.98` | `rgba(13,21,18,0.92)` / `0.98` | Nền Header đục hơn khi cuộn để **không lọt chữ bên dưới** |
| **GPU Spotlight** | `--spotlight-color` / `--spotlight-border` | `rgba(24,127,101,0.14)` / `0.36` | `rgba(72,181,148,0.18)` / `0.42` | Specular Spotlight bám con trỏ (`--mx`, `--my`) |
| **Dark Bands** | `.dg-dark-band` / `[data-surface="dark"]` | `#1e293b→#0a0f1c` hoặc `#0d1512→#000`, `--ink-soft` `0.78`, `--ink-tertiary` `0.66` | Đồng bộ nền tối Emerald | Hero, dải Lợi ích, Dark CTA Strip, Footer, Auth Panel |
| **Semantic States** | `--status-success` / `warning` / `danger` / `info` | `#15803d` / `#9a5b00` / `#b91c1c` / `#0e7490` | `#4ade80` / `#fbbf24` / `#f87171` / `#38bdf8` | Đơn `paid`, cảnh báo dữ liệu mô phỏng, lỗi `422` |

### 2.3. Layout, Spacing & Motion Tokens (`tokens.css`)

- Thang `4px`: `--space-1` (`4px`) → `--space-24` (`96px`), `--container-max: 1280px`, `--container-px: clamp(16px, 3vw, 24px)`.
- Admin & Live Preview tokens:
  - `--admin-sidebar-width: 260px`, `--admin-topbar-height: 64px`.
  - `--preview-frame-height: clamp(420px, 56vh, 640px)`, `--viewport-mobile-width: 375px`.
- Motion tokens:
  - `--duration-cart-pop: 320ms`, `--duration-viewport-morph: 320ms`, `--tilt-perspective: 1000px`, `--spotlight-size: 320px` (tự về `0ms` khi `prefers-reduced-motion: reduce`).

---

## 3. Đặc Tả Không Gian 1 — Mặt Tiền Cửa Hàng

### 3.1. Quy Chuẩn Làm Sạch Ngôn Ngữ Thương Mại

`ai-template-2-fe` phải rà soát toàn bộ UI thuộc Không gian 1 (bao gồm `src/app/layout.tsx` metadata, `SiteHeader`, `SiteFooter`, `HomeLanding`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/auth`, `AdvisorChatDrawer`) và thực hiện quy đổi:

| Cụm từ cũ (CẤM ở Mặt tiền) | Thay bằng ngôn ngữ thương mại tự nhiên cho chủ shop |
|---|---|
| `F1–F12`, `(F1)`, `(F2)`, `(F3)`, `(F4)`, `(F5)`, `(F6)`, `(F7)`, `(F10)`, `(F11)` | Xóa hoàn toàn mã `F*` khỏi mọi badge, eyebrow, nút bấm, tiêu đề, footer. |
| `Thí nghiệm F11`, `Thử F11`, `Tham gia Thí nghiệm A/B` (trên Header/Hero) | Xóa khỏi Header và Hero. Ở Footer chỉ đặt 1 link nhẹ: `"Tham gia khảo sát trải nghiệm"`. |
| `Phân tích Admin`, `Dashboard Phân tích & RAG` (trên Header) | Xóa khỏi Header chính. Chỉ hiện lối vào `"Quản trị cửa hàng"` khi user đã đăng nhập với `role === 'admin'`, hoặc qua `/admin/analytics` / link gọn ở Footer. |
| `Grounding 100% ID thật DB`, `RAG`, `Gemini RAG` | Đổi thành `"Tư vấn từ kho sản phẩm thực tế"`, `"Trợ lý Tư vấn DreamTeam"`. |
| `Chế độ Stub — Dữ liệu thử nghiệm (Chưa gắn Gemini Key)` | Đổi thành `"Trợ lý gợi ý nhanh theo danh mục"` (chuyển thông tin kỹ thuật `Stub/Model/Tokens` về `/admin/chat-logs`). |
| `AB/BA`, `Within-subject`, `Eval Set` | Không dùng trên Mặt tiền. Chỉ giữ tuyên bố rõ ràng về đơn hàng thử nghiệm không thu tiền thật ở `/checkout` & Footer. |
| `Mock Webhook HMAC`, `download_grants` | Đổi thành `"Xác nhận đơn hàng thử nghiệm"`, `"Kho link tải an toàn (hạn 7 ngày)"`. |

### 3.2. Global Storefront Header (`SiteHeader`) & Footer (`SiteFooter`)

- **Header (`SiteHeader`):**
  - Sticky `top: 0`, chiều cao `72px` desktop (`60px` mobile `<= 700px`), `background-color: var(--header-bg)` (`92%`), `backdrop-filter: blur(18px) saturate(160%)`.
  - **Trạng thái cuộn (`.dg-header.fixed` khi `scrollY >= 24px`):** Chuyển `background-color: var(--header-bg-scrolled)` (`98%` độ đục) + `box-shadow: var(--shadow-md)` để **ngăn tuyệt đối hiện tượng lọt chữ/card bên dưới** qua thanh Header.
  - Thanh tiến độ cuộn `3px` ở mép trên (`animation-timeline: scroll()` + fallback `rAF`).
  - **1 hàng gọn trên Desktop (`>= 992px`):**
    - *Trái:* Logo lục giác **DreamTeam** (`subtitle="Công cụ số cho shop nhỏ"`).
    - *Giữa (4 liên kết thương mại):* `Trang chủ` (`/`), `Sản phẩm` (`/products`), `Đơn hàng` (`/orders`), `Hỏi đáp` (`/#faqs`).
    - *Phải:* Nút Sáng/Tối (`aria-label`), Giỏ hàng (`/cart`) kèm `.cart-badge` (`cart-pop` micro-interaction khi số lượng tăng), Tài khoản (`/auth` hoặc tên user + nút `Quản trị` chỉ khi `user.role === 'admin'` + `Thoát`), và CTA `Khám phá gói số` (`/products`).
  - *Mobile (`<= 991px`):* Drawer `<dialog class="nav-dialog">` chứa link thương mại sạch (`/`, `/products`, `/orders`, `/cart`, `/#faqs`, `/auth`, và link `/admin/analytics` chỉ khi `user?.role === 'admin'`).
- **Footer (`SiteFooter`):**
  - 3 cột cân đối trên nền tối `.dg-dark-band`:
    1. Thương hiệu **DreamTeam** + mô tả thương mại cho chủ shop 1–3 người + badge nhẹ (`Tối ưu Mobile 375px`, `Bản quyền minh bạch`, `Tải file tức thì`).
    2. **Sản phẩm & Hỗ trợ:** `/products`, `/products?product_type=template`, `/products?product_type=prompt_pack`, `/products?product_type=workflow`, `/orders`, `/#faqs`.
    3. **Tài khoản & Khảo sát:** `/auth` (`Đăng nhập / Đăng ký`), `/cart` (`Giỏ hàng`), `/experiment` (*"Tham gia khảo sát trải nghiệm"* — **lối vào nhẹ duy nhất từ mặt tiền**), và `/admin/analytics` (*"Khu vực quản trị"*).
  - Dòng đáy ghi rõ: *"© 2026 DreamTeam • Cửa hàng sản phẩm số cho chủ shop nhỏ — Chế độ thanh toán thử nghiệm không thu tiền thật."*

### 3.3. Trang Chủ `/` — Page Grammar & Feeling Curve (100% Thương Mại)

- **Page Grammar:** **2. Chaptered editorial** (xen kẽ sáng `#ffffff` / slate dịu `#f8fafc` / dải tối Emerald `#0d1512`).
- **Danh sách CẤM:** Cấm preloader giả `1–4s`; cấm testimonial tự nhận `"Verified Buyer 5.0 ★"` không gắn nhãn thử nghiệm; cấm thuật ngữ `F1–F12`/`RAG`/`AB/BA`; cấm số liệu ảo; cấm `"Scroll to explore"`; cấm `01 / 06`.
- **Peak:** Chặng 3 (Showcase Gallery + Live Filter Tabs + Specular Spotlight).
- **Signature Move:** **Interactive 3D Hero Showcase Stack + Specular Spotlight Catalog Tabs**.

| STT | Chặng / Section | Cảm xúc | Thành phần UI & Ngôn ngữ Thương Mại |
|---|---|---|---|
| **1** | **Hero + 3D Mockup Stack + Typewriter** (`#hero`) | **Tin cậy & Tầm nhìn** | Badge *"DÀNH CHO CHỦ SHOP 1–3 NGƯỜI • SHOPEE / TIKTOK / FACEBOOK"*. H1 *"Vận hành nhanh hơn với DreamTeam — Chọn đúng [Web Bán Hàng / Prompt Chốt Đơn / Workflow Tự Động]"*. Lead thương mại tự nhiên. 2 CTA: `Khám phá kho sản phẩm` (`/products`) & `Xem mẫu nổi bật` (`/#showcase`). 3 trust chips (`3 Nhóm giải pháp`, `100% Chuẩn Mobile 375px`, `Bản quyền 3 cấp rõ ràng`). Phải: **3D Mockup Stack** (`WorkspaceShowcaseFrame` dùng nhãn `Giao diện Web` / `Bộ Prompt AI` / `Luồng Tự Động`) kết hợp ảnh nền/lớp phụ từ `public/images/hero-workspace.webp` (tối ưu `0ms` instant entry, `rAF` 3D tilt trong `@media (hover: hover)`). |
| **2** | **6 Nhóm Giải Pháp & Ngành Hàng** (`#categories`) | **Định hướng nhanh** | Lưới 6 cột (`Template Website`, `Prompt Pack AI`, `Workflow Tự Động`, `Shop Mỹ Phẩm`, `Shop Thời Trang`, `Gia Dụng & F&B`). 3 thẻ đầu kết hợp visual từ `cat-template.webp`, `cat-prompt.webp`, `cat-workflow.webp`; 3 thẻ ngành dùng icon tròn tinh gọn xoay `-6deg` khi hover. |
| **3** | **Showcase Gallery + Filter Tabs — PEAK** (`#showcase`, `--bg-surface-subtle`) | **Hào hứng khám phá** | Pill tabs lọc trực tiếp `GET /api/products` (`Tất cả giải pháp`, `Template Website`, `Prompt Pack`, `Workflow Tự Động`). Lưới 3 cột `.dg-showcase-card` có **Specular Spotlight** (`--mx`/`--my`), hiển thị ảnh `thumbnail_url` (hoặc ảnh `cat-*.webp` / `ProductPlaceholderFrame` fallback), badge loại gói + nhãn bản quyền (`Chính chủ 100%` / `Chuyển thể` / `Bản quyền hợp lệ`), giá VND `tabular-nums`, 2 nút `Xem chi tiết` & `Thêm vào giỏ`. |
| **4** | **8 Lợi Ích Vận Hành Cho Shop Nhỏ** (`#features`, `.dg-dark-band`) | **Thuyết phục thực tiễn** | Nền `--dg-dark-bg`, lưới 4×2 (`8` thẻ không đánh số `01/06`): *Tư vấn chọn gói theo ngân sách*, *Xem thử giao diện sống 1280px ↔ 375px*, *Minh bạch bản quyền 3 cấp*, *Đặt hàng thử nghiệm không rủi ro*, *Nhận file tức thì qua link riêng*, *Hướng dẫn cài đặt 15–30 phút*, *Tối ưu cho team 1–3 người*, *Đồng bộ Shopee · TikTok · Facebook*. |
| **5** | **12 Tiêu Chuẩn Nền Tảng** (`#stack`) | **Chắc chắn chất lượng** | Lưới 6×2 (`12` ô `.dg-stack-tile`): *Tốc độ tải tức thì*, *Chuẩn Mobile 375px*, *Giao diện Sáng & Tối*, *Trợ lý Tư vấn AI*, *Tìm kiếm theo nhu cầu*, *Cấu trúc Sạch Chuẩn SEO*, *Link tải bảo mật 7 ngày*, *Bản quyền Minh bạch*, *Cài đặt Nhanh 15 phút*, *Dễ sửa Không Cần Code Sâu*, *Tối ưu Đa kênh Bán hàng*, *Thanh toán Thử nghiệm An toàn*. |
| **6** | **Trải Nghiệm Màn Hình Mua Hàng** (`#pages`, `--bg-surface-subtle`) | **Toàn cảnh mua sắm** | Lưới 3 cột `.dg-ip2-card` (`4:3`) trình diễn 6 chặng mua hàng thật: `/products` (Tìm & Lọc), `/products/[slug]` (Live Preview 1280px ↔ 375px), `/cart` (Giỏ hàng), `/checkout` (Xác nhận đơn thử nghiệm), `/orders/[id]` (Kho tải file 7 ngày), `/auth` (Quản lý tài khoản & đơn hàng). *(Ẩn `/experiment` và `/admin/*` khỏi gallery trang chủ).* |
| **7** | **Đánh Giá & Case Study Mẫu Minh Bạch** (`#reviews`) | **Đồng cảm & Tin tưởng** | Carousel 3 thẻ (CSS Scroll Snap + Prev/Next). **Bắt buộc gắn nhãn rõ ràng** ở header section & huy hiệu trên thẻ: **`"Phản hồi từ đợt chạy thử nghiệm mẫu"`** kèm chú thích *"Tổng hợp trải nghiệm từ các chủ shop & người dùng thử nghiệm mẫu quy mô 1–3 người; không phải đánh giá thương mại tự phát"*. Trình bày 4 hồ sơ thật từ dữ liệu thử nghiệm (Mỹ phẩm TikTok Shop, Thời trang Instagram/Shopee, Quán đồ uống QR/Zalo, Shop đa kênh giờ cao điểm), kèm mức ngân sách và link xem nhóm sản phẩm tương ứng. |
| **8** | **FAQ Accordion** (`#faqs`, `--bg-surface-subtle`) | **Giải tỏa băn khoăn** | 6 câu hỏi thuần thương mại: (1) Cách dùng ngay sau khi nhận file? (2) Thanh toán thử nghiệm Sandbox có trừ tiền thật không? (3) Ý nghĩa 3 cấp bản quyền `Chính chủ / Chuyển thể / Có giấy phép`? (4) Trợ lý tư vấn lấy gợi ý từ đâu? (5) Quyền tải file trong 7 ngày & 5 lượt tải? (6) Xem thử giao diện trước khi mua trên Mobile 375px như thế nào? Kèm 4 tile lối tắt (`/products`, `/orders`, `/cart`, `/auth`). |
| **9** | **Dark CTA Strip** (`.dg-cta-dark`) | **Thúc đẩy mua sắm** | Banner bo `32px` nền tối Emerald: H2 *"Sẵn sàng chọn bộ công cụ số phù hợp cho shop nhỏ của bạn?"*, 2 CTA: `Khám phá toàn bộ sản phẩm` (`/products`), `Mở Trợ lý tư vấn` (trigger chat nếu khả dụng hoặc `/products`). Phải: khung mockup xem thử sản phẩm nghiêng `-2deg` + chip `"Xem thử 375px • Nhận file tức thì"`. |
| **10** | **Footer + Back-to-Top** (`.dg-footer`) | **An tâm & Khép lại** | Footer 3 cột sạch (có 1 link nhẹ ở Footer tới `/experiment` *"Tham gia khảo sát trải nghiệm"*) + nút `conic-gradient` Back-to-Top tự ẩn khi cuộn xuống trên mobile. |

### 3.4. Trang Danh Mục `/products` & Chi Tiết `/products/[slug]` (Interactive Live HTML Preview Frame)

1. **`/products` (Page Grammar 6: Gallery / Catalog):**
   - Compact Utility Header (bỏ `(F2)`), Sticky Filter Ribbon (tìm kiếm, tabs `product_type`, `industry`, ngân sách tối đa, sắp xếp).
   - Card sản phẩm hiển thị ảnh thật `.webp` (`thumbnail_url` hoặc ảnh theo `product_type`: `cat-template.webp` / `cat-prompt.webp` / `cat-workflow.webp`) kết hợp overlay/badge sạch; nếu chưa có ảnh thì fallback `ProductPlaceholderFrame`.
   - Nút `Xem chi tiết`, `Thêm vào giỏ` (bắn `add_to_cart` + kích hoạt `cart-pop` trên Header). Nếu người dùng đang mở một nhiệm vụ khảo sát chưa xong, hiện thêm nút nhẹ `"Chọn gói này cho nhiệm vụ"` ở đáy card.

2. **`/products/[slug]` (Page Grammar 7: Split Stage + Interactive Live HTML Preview Frame):**
   - **Cột trái — Interactive Live HTML Preview Frame (`LiveHtmlPreviewFrame`):**
     - Header khung xem thử: Tiêu đề `"Xem thử giao diện trực tiếp"` (bỏ `(F3)`), cụm nút **Viewport Switcher**: `Desktop 1280px` ↔ `Mobile 375px`, nút **`Phóng to toàn khung`** (mở Preview Modal `<dialog>`), và nút **`Mở tab mới`** (nếu có `product.demo_url`).
     - **Cơ chế hiển thị Live HTML khi `product.demo_url` có dữ liệu:**
       - Render `<iframe src={product.demo_url} title={...} sandbox="allow-scripts allow-same-origin" />` bên trong khung trình duyệt `.viewport-frame` (kèm thanh mac dots + URL bar + badge `1280px` / `375px` + skeleton loading đến khi `onLoad`).
       - **Desktop 1280px mode:** Để trang web rộng `1280px` hiển thị trọn vẹn trong cột trái (`~700–760px`) mà không bị cắt ngang hay sinh thanh cuộn ngang, wrapper ngoài dùng `ResizeObserver` đo `containerWidth`, đặt `iframe` bên trong `width: 1280px; height: calc(var(--preview-frame-height) / scale)` và áp `transform: scale(containerWidth / 1280); transform-origin: top left;` (đảm bảo GPU compositing, không vỡ layout).
       - **Mobile 375px mode:** Khung `.viewport-frame--mobile` morph `max-width` mượt về `375px` (`transition: max-width var(--duration-viewport-morph) var(--ease-out-expo)`), `iframe` đặt `width: 375px; transform: scale(1)` trong bezel điện thoại gọn gàng căn giữa, chiều cao `--preview-frame-height`.
       - **Fallback an toàn:** Nếu `product.demo_url` trống (`null`), hiển thị ảnh sản phẩm `.webp` hoặc `ProductPlaceholderFrame` + cấu trúc chi tiết `deliverables` ngay trong khung viewport mà không báo lỗi.
     - **Modal Xem Thử (`PreviewModal` dùng native `<dialog class="editorial-dialog">`):**
       - Kích thước rộng `min(1180px, calc(100vw - 24px))`, có thanh điều khiển chuyển qua lại `Desktop 1280px ↔ Mobile 375px` ngay trong modal để chủ shop soi kỹ từng chi tiết trước khi thêm giỏ.
   - **Cột phải (Sticky Dock):**
     - Giá niêm yết VND (`type-price`), thời gian cài đặt, **Hộp Minh Bạch Bản Quyền** (`source_type` dịch sang nhãn tiếng Việt rõ ràng + `license_note`), nút `Thêm vào giỏ` (`cart-pop`), nút `Mua ngay`, và khối `"Chọn gói này cho nhiệm vụ"` (chỉ hiện khi đang trong phiên khảo sát chưa hoàn tất).
     - Mobile (`<= 700px`): Dock bỏ sticky, hiện thanh CTA đáy tôn trọng `safe-area-inset-bottom`.

### 3.5. Giỏ Hàng `/cart`, Thanh Toán `/checkout`, Lịch Sử Đơn `/orders`, Chi Tiết Đơn `/orders/[id]` & `/auth`

- **Ngôn ngữ thương mại thống nhất:** Xóa hoàn toàn `(F4)`, `(F5)`, `(F6)`, `(F1)`, `(F10)`, `(F11)`, `Mock Sandbox Webhook HMAC`, `Dev Store`, câu lệnh `SQL` khỏi UI người mua hàng.
- **`/orders` (Mới — cần bổ sung route trang danh sách đơn hàng):**
  - Page Grammar **3. Live surface** (Ledger danh sách đơn hàng từ `GET /api/orders` theo user hoặc `visitor_id` hiện tại).
  - Hiển thị bộ lọc trạng thái nhẹ (`Tất cả`, `Đã thanh toán`, `Chờ thanh toán`, `Thất bại`), bảng/thẻ từng đơn gồm `order_code`, ngày tạo, danh sách gói, tổng tiền VND `tabular-nums`, badge trạng thái, nút `Xem đơn & Tải file` → `/orders/[id]`.
  - Empty State: `EditorialEmptyIllustration` + nút `Khám phá sản phẩm` (`/products`).
- **`/checkout` & `/orders/[id]`:**
  - Stepper 3 bước sạch: `1. Giỏ hàng` → `2. Xác nhận đơn thử nghiệm` → `3. Nhận file ngay`.
  - Giải thích thân thiện bằng tiếng Việt: *"Hệ thống đang chạy chế độ đặt hàng thử nghiệm (Sandbox) — bạn có thể kiểm tra quy trình tạo đơn và nhận file ngay mà không bị trừ tiền thật."*
- **`/auth`:**
  - Split-Panel sạch đẹp (`login` / `register` + 4-bar Password Strength Meter). Cột phải `.dg-dark-band` trình bày 3 giá trị cửa hàng cho chủ shop 1–3 người + 1 **Case Study mẫu thử nghiệm** có gắn nhãn rõ ràng `"Từ đợt thử nghiệm mẫu"`, không dùng testimonial giả và không nhắc `F11` / `SC-01`.

### 3.6. Trợ Lý Tư Vấn (`AdvisorChatDrawer`)

- Chỉ hiển thị FAB & Drawer khi `active_variant === 'chatbot_on'`.
- Ngôn ngữ UI 100% thương mại:
  - Tiêu đề: **`Trợ lý Tư vấn DreamTeam`**
  - Phụ đề: **`Gợi ý sản phẩm phù hợp theo ngành hàng & ngân sách`**
  - Mode Badge (thân thiện với khách): Nếu LLM thật → xanh Emerald `"Đang trực tuyến • Tư vấn theo kho sản phẩm"`; nếu chế độ fallback nội bộ → badge nhẹ trung tính `"Gợi ý nhanh theo danh mục"` (**KHÔNG** hiển thị chữ `"Chế độ Stub"`, `"Chưa gắn Gemini Key"`, `"RAG"`, `"Grounding DB"` hay `"F11"` cho khách mua hàng).
  - 3 Quick Prompt Chips theo bài toán chủ shop + tối đa 3 Suggested Product Cards có ảnh/frame, giá VND, lý do phù hợp.

---

## 4. Đặc Tả Không Gian 2 — Không Gian Khảo Sát (`/experiment` & `ScenarioContextBar`)

### 4.1. Nguyên Tắc Tách Biệt & Chống Sai Lệch Hành Vi (Anti-Bias)

1. **Tách khỏi Header chính:** Link tới `/experiment` chỉ nằm nhẹ nhàng ở `SiteFooter` (*"Tham gia khảo sát trải nghiệm"*), không đặt trên `SiteHeader` hay Hero trang chủ.
2. **Ẩn toàn bộ mã kỹ thuật & nhãn nhóm đối chứng:**
   - **KHÔNG hiển thị** mã `P-018` (`participant_code`), `SC-01`, `SC-02` (`scenario.code`), `F11`, `AB/BA`, `Within-subject`, `chatbot_on`, `chatbot_off` trên màn hình làm nhiệm vụ của người tham gia! *(Lưu ý: mã phiên chỉ có thể hiển thị gọn ở màn hình hoàn tất cuối cùng để người tham gia đối chiếu nếu cần, tuyệt đối không hiện trong lúc làm bài).*
   - **KHÔNG hiển thị nhãn `"Không trợ lý ảo"` hay `"Lượt này TẮT Trợ lý ảo (đối chứng)"`** ở Header, `ScenarioContextBar` hay Banner nhiệm vụ — vì việc tiết lộ trạng thái đối chứng gây sai lệch hành vi (Hawthorne / Demand Characteristics).
   - **Thay bằng hướng dẫn tự nhiên:**
     - Khi lượt hiện tại có trợ lý (`active_variant === 'chatbot_on'`): *"Gợi ý: Ở nhiệm vụ này, bạn có thể bấm nút Trợ lý tư vấn ở góc dưới bên phải hoặc tự duyệt danh mục sản phẩm."*
     - Khi lượt hiện tại không có trợ lý (`active_variant === 'chatbot_off'`): *"Hướng dẫn: Ở nhiệm vụ này, bạn hãy tự tìm kiếm, lọc và so sánh các gói trong danh mục sản phẩm để chọn giải pháp phù hợp nhất."*
3. **Focus Header trên `/experiment` & Nút `"Thoát khảo sát"`:**
   - Khi đang ở `/experiment`, `SiteHeader` chuyển sang chế độ Focus tối giản: Logo DreamTeam + nhãn `"Khảo sát Trải nghiệm Chọn Gói"` + tiến độ tự nhiên (`"Nhiệm vụ 1/2"` hoặc `"Nhiệm vụ 2/2"`) + nút Đổi Sáng/Tối + nút **`Thoát khảo sát`** (bấm để kết thúc phiên khảo sát cục bộ qua `resetSession()` và điều hướng về `/` hoặc `/products`).

### 4.2. Thanh Ngữ Cảnh Nhiệm Vụ (`ScenarioContextBar`)

- **Điều kiện hiển thị duy nhất:**
  `Boolean(assignment?.consent_given && scenarioState?.scenario_run_id && scenarioState.scenario && !scenarioState.is_finished && pathname !== '/experiment' && !pathname.startsWith('/admin'))`
- **Thành phần hiển thị tự nhiên:**
  - *Trái:* Pill tiến độ `"Nhiệm vụ 1/2"` (hoặc `2/2`) + Tiêu đề tình huống tự nhiên (`scenario.title`, không ghép tiền tố `SC-01:`). **Không hiện `P-...` và không hiện badge `"Có/Không trợ lý ảo"`.**
  - *Phải:* Đồng hồ thời gian thực (`tabular-nums`), nút **`Xem đề bài`** (mở `<dialog>` xem lại `prompt_text`, ngành hàng, ngân sách tối đa — ẩn `scenario.code`), nút **`Về chọn đáp án`** (`/experiment`), và nút **`Thoát khảo sát`** (`resetSession()`, ẩn ngay thanh bar và trả người dùng về cửa hàng bình thường).

---

## 5. Đặc Tả Không Gian 3 — Không Gian Quản Trị (`/admin/*`)

### 5.1. Admin Sidebar Shell (`AdminShell`)

- **Kiểm soát truy cập:** Mọi route `/admin/*` kiểm tra `user?.role === 'admin'`. Nếu chưa đăng nhập hoặc không phải `admin`, hiển thị thẻ thông báo quyền truy cập + nút tới `/auth`.
- **Cấu trúc Shell tách biệt (không dùng Header/Footer của cửa hàng):**
  - *Desktop (`> 991px`):* Lưới 2 cột `grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr)` (`260px` Sidebar trái cố định `100dvh` sticky + Vùng nội dung chính bên phải có Topbar `64px`).
  - *Mobile (`<= 991px`):* Topbar `64px` có nút mở Drawer Sidebar (`<dialog class="nav-dialog">` bên trái hoặc tab ngang cuộn gọn).
  - **4 mục điều hướng chính trong Sidebar Admin:**
    1. **`/admin/analytics`** — *Tổng quan & Phân tích A/B*
    2. **`/admin/products`** — *Quản lý Sản phẩm & Demo HTML*
    3. **`/admin/orders`** — *Đơn hàng & Quyền tải file*
    4. **`/admin/chat-logs`** — *Nhật ký Trợ lý AI & Grounding*
  - *Chân Sidebar:* Thông tin tài khoản Admin hiện tại + công tắc Sáng/Tối + nút `"Xem Mặt tiền Cửa hàng"` (`/`) + `"Đăng xuất"`.

### 5.2. Đặc Tả 4 Màn Hình Quản Trị

1. **`/admin/analytics` (Cockpit Phân tích):**
   - Executive Hero Banner (nền Emerald gradient + trạng thái Live + nút `Làm mới dữ liệu` + công tắc `include_simulated`).
   - Simulated Data Amber Guard Banner (`--status-warning-bg`) khi `include_simulated === true`.
   - 4 Executive KPI Cards (`Tổng người tham gia`, `Lượt hoàn thành`, `Đơn hàng Sandbox`, `Chi phí & Độ trễ AI`).
   - Bảng so sánh đối chứng `chatbot_on` vs `chatbot_off`, Phễu 14 sự kiện chuẩn (`EVENT_NAMES`), Unit Economics AI, và khu vực Xuất dữ liệu nghiên cứu ẩn danh 0-PII (CSV/JSON).

2. **`/admin/products` (CRUD Sản phẩm + Gắn Demo HTML / Ảnh):**
   - Thanh công cụ: Tìm kiếm tên/slug, lọc `product_type`, lọc trạng thái (`Tất cả` / `Đang bán` / `Đang ẩn`), nút **`+ Thêm sản phẩm mới`**.
   - Bảng sản phẩm: Thumbnail 16:10, Tên & Slug, Loại & Ngành, Giá VND (`tabular-nums`), Bản quyền (`source_type`), Trạng thái gắn Demo (`Có Demo HTML` / `Chưa gắn`), Trạng thái `is_active`, nút `Sửa`, `Xem thử Live`, `Bật/Ẩn`.
   - **Form Modal / Slide-over Tạo & Sửa Sản phẩm (`POST` / `PATCH /api/admin/products`):**
     - Nhóm 1 (Thông tin cơ bản): `name`, `slug` (tự gợi ý từ tên khi tạo mới), `product_type`, `industry`, `price_vnd`, `short_description`, `description`.
     - Nhóm 2 (**Gắn Demo HTML & Ảnh sản phẩm**):
       - Input `demo_url` (nhận path nội bộ `/demos/...` hoặc URL `https://...`, kèm nút **`Xem thử trong khung 1280px ↔ 375px`** ngay trong form để Admin kiểm tra giao diện HTML live trước khi lưu).
       - Input `thumbnail_url` (chọn nhanh các ảnh chuẩn `/images/cat-*.webp` hoặc nhập URL ảnh thật + preview khung `16:10`).
     - Nhóm 3 (Bản quyền & Thông số): `source_type` (`original` | `adapted` | `licensed`), `license_note`, `specs.target_shop_size`, `specs.setup_time_minutes`, `specs.platforms`, `specs.deliverables`, `specs.tech_stack`, `specs.guide_summary`, công tắc `is_active`.

3. **`/admin/orders` (Quản lý Đơn hàng & Cấp quyền tải):**
   - Bộ lọc theo `status` (`Tất cả`, `pending`, `paid`, `failed`, `cancelled`) + công tắc `include_simulated`.
   - Bảng đơn hàng (`GET /api/admin/orders`): Mã đơn (`order_code`), Ngày tạo, Gói sản phẩm, Tổng tiền VND, Cổng thanh toán (`mock_sandbox` / `payos`), Nhãn nguồn (`Thật` / `Mô phỏng`), Trạng thái badge, nút `Chi tiết / Quyền tải` → `/orders/[id]` (hoặc Drawer xem `download_grants` & `download_count/max_downloads`).

4. **`/admin/chat-logs` (Nhật ký Tư vấn AI & Kiểm định Grounding):**
   - Nơi tiếp nhận toàn bộ thông số kỹ thuật đã được tách khỏi UI người mua hàng: `model_name` (phân biệt rõ **Gemini LLM** vs **Stub/Mock**), `prompt_version`, `retrieved_product_ids`, `suggested_product_ids`, `latency_ms`, `tokens_used`, `cost_usd`, `is_simulated`.
   - Thanh lọc: Lọc theo nguồn model (`Tất cả` / `Gemini thật` / `Stub`), lọc `include_simulated`, lọc phiên có gợi ý sản phẩm vs từ chối.
   - Bảng / Master-Detail Stream: Danh sách phiên/tin nhắn (chỉ dùng `participant_code`, `assignment_id` — 0 PII), khi chọn 1 dòng hiện đầy đủ câu hỏi khách hàng, câu trả lời của trợ lý, danh sách ID truy xuất & ID gợi ý đã đối chiếu DB, và badge kiểm định (`Hợp lệ 100%` / `Không có gợi ý`).

### 5.3. Bảng Nhu Cầu Backend Bổ Sung (Bàn Giao `ai-skill-design-web`)

| Màn hình | Endpoint hiện có | Nhu cầu bổ sung / xác nhận từ `ai-skill-design-web` |
|---|---|---|
| `/admin/products` | `GET, POST, PATCH /api/admin/products` | Đã hỗ trợ `demo_url`, `thumbnail_url`, `is_active`, `specs`, `source_type`, `license_note` qua `adminCreateProductSchema` & `adminUpdateProductSchema`. Không cần xóa cứng (dùng `PATCH { is_active: false }`). |
| `/admin/orders` | `GET /api/admin/orders` | Đã hỗ trợ lọc `status`, `include_simulated`, phân trang `page/limit`. Đảm bảo trả kèm `items` và `download_grants` (nếu cần hiển thị nhanh trong Drawer Admin). |
| `/admin/chat-logs` | `GET /api/admin/export?dataset=rag_logs&format=json` *(chỉ có metadata)* | **Đề xuất thêm `GET /api/admin/chat-logs`** (hoặc mở rộng service) trả `AdminChatLogItemDto[]` gồm `message_id`, `session_id`, `participant_code`, `user_prompt`, `assistant_reply`, `model_name`, `prompt_version`, `retrieved_product_ids`, `suggested_product_ids`, `latency_ms`, `tokens_used`, `cost_usd`, `is_simulated`, `created_at` (bảo vệ `requireAdmin()`, 0 PII). |
| `/orders` | `GET /api/orders` | Đã có sẵn! Trả danh sách `OrderDto[]` theo `user_id` hoặc `visitor_id` phiên hiện tại. |

---

## 6. Đặc Tả Gói Hiệu Ứng GPU 60fps (`src/motion/**` & `globals.css`)

Mọi hiệu ứng bắt buộc giữ chuẩn **60fps GPU compositing** (chỉ animate `transform`, `opacity`, CSS custom properties `--mx`/`--my` hoặc `conic-gradient`), **tuyệt đối không `setInterval` trong `mousemove`**, và **tôn trọng `prefers-reduced-motion`**:

1. **Specular Spotlight (`--mx`, `--my`):**
   - Áp dụng cho `.dg-showcase-card`, `.dg-feature-card`, `.dg-kpi-card` bằng pseudo-element `::after` có `pointer-events: none` và `background: radial-gradient(var(--spotlight-size) circle at var(--mx, -999px) var(--my, -999px), var(--spotlight-color), transparent 65%)`.
   - Listener `pointermove` gắn trên container lưới hoặc card chỉ kích hoạt trong `@media (hover: hover) and (pointer: fine)` và `prefers-reduced-motion: no-preference`, throttle bằng `requestAnimationFrame` và cache `getBoundingClientRect()` (không đo layout mỗi pixel).
2. **3D Tilt (`@media (hover: hover)`):**
   - Áp dụng trên `.dg-hero-stack` (và tùy chọn card nổi bật) qua `perspective(var(--tilt-perspective)) rotateX(...) rotateY(...)`.
   - Ngắt hoàn toàn trên màn hình cảm ứng (`hover: none`) và khi người dùng bật `prefers-reduced-motion: reduce` (hoặc nhấn nút tạm dừng trên khung Hero).
3. **Viewport Switcher Mượt (`Desktop 1280px ↔ Mobile 375px`):**
   - Chuyển đổi `.viewport-frame--desktop` ↔ `.viewport-frame--mobile` dùng `transition: max-width var(--duration-viewport-morph) var(--ease-out-expo)` kết hợp scale `iframe` GPU (`transform: scale(...)`, `transform-origin: top left`) trong container có chiều cao cố định `--preview-frame-height` → giữ **`CLS = 0`**.
4. **Cart Pop Micro-interaction:**
   - Khi `cart.item_count` tăng, `.cart-badge` trên `SiteHeader` gắn class `.is-popping` chạy `@keyframes dgCartPop` (`transform: scale(1) -> scale(1.28) -> scale(1)`) trong `var(--duration-cart-pop)` (`320ms` `--ease-spring`), tự gỡ class sau khi xong `onAnimationEnd`. Không chạy khi `prefers-reduced-motion: reduce`.
5. **Header Nền Đục Hơn Khi Cuộn:**
   - `.dg-header` dùng `background-color: var(--header-bg); backdrop-filter: blur(18px) saturate(160%);`.
   - Khi `scrollY >= 24px` (`.dg-header.fixed`), chuyển mượt sang `background-color: var(--header-bg-scrolled)` (`98%` độ đục) + `box-shadow: var(--shadow-md)` để văn bản và hình ảnh bên dưới không bao giờ lọt chữ qua thanh Header.

---

## 7. Checklist Kiểm Định QA 8 Cổng (Cập Nhật Đợt Tách 3 Không Gian)

1. **Font & Hiển thị tiếng Việt tức thì (`0ms`):** Xác nhận Computed `font-family` của `body` và `h1` là `"Plus Jakarta Sans"` (tuyệt đối không rơi về Times New Roman); giữ `.text-line-clip` ở dòng clip/mask; mở trang `0ms` không có preloader giả.
2. **Sạch 100% Ngôn ngữ Thương mại tại Không gian 1 (Mặt tiền):** Kiểm tra Header, Hero, Cards, Footer, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/orders`, `/auth`, `AdvisorChatDrawer` — **0 lần xuất hiện** `F1–F12`, `Thí nghiệm F11`, `Phân tích Admin`, `RAG`, `Grounding DB`, `AB/BA`, `Stub`, `Gemini Key`.
3. **Chống Sai Lệch Hành Vi tại Không gian 2 (`/experiment` & `ScenarioContextBar`):** Không xuất hiện trên Header chính; `ScenarioContextBar` ẩn khi chưa có phiên hoặc đã hoàn tất; ẩn `P-...` & `SC-xx`; **0 lần xuất hiện nhãn `"Không trợ lý ảo"`**; có nút `"Thoát khảo sát"` hoạt động sạch sẽ.
4. **Phân tách & Bảo mật Không gian 3 (`/admin/*`):** Sidebar 4 mục (`analytics`, `products`, `orders`, `chat-logs`) tách khỏi Header/Footer cửa hàng; chặn `role !== 'admin'`; bảng/drawer CRUD sản phẩm gắn được `demo_url` & `thumbnail_url`.
5. **Interactive Live HTML Preview Frame (`1280px ↔ 375px`):** Chuyển mượt Desktop/Mobile cả trên `/products/[slug]` và Modal `<dialog>`, `CLS = 0`, không tràn ngang `375px`, có fallback sạch nếu sản phẩm chưa có `demo_url`.
6. **Header không lọt chữ & Hiệu ứng GPU 60fps:** Cuộn qua Hero và Cards không bị lọt chữ qua nền Header; Spotlight `--mx`/`--my`, 3D Tilt, Cart Pop chạy mượt trên GPU, bọc `(hover: hover) and (pointer: fine)` và tôn trọng `prefers-reduced-motion`.
7. **Đồng bộ Light/Dark qua Tokens & Ảnh WebP:** Mọi component đọc biến từ `tokens.css` / `themes.css`; các ảnh `.webp` mới (`hero-workspace.webp`, `cat-template.webp`, `cat-prompt.webp`, `cat-workflow.webp`) đúng bảng `image-style.md`, không vỡ ảnh (`404`), có `alt` tiếng Việt.
8. **Minh bạch Đánh giá Mẫu & Dữ liệu Thật:** Section đánh giá trên `/` gắn nhãn rõ `"Phản hồi từ đợt chạy thử nghiệm mẫu"`; không còn testimonial bịa, `Lorem ipsum`, `href="#"` chết, hay icon font lỗi `▯`.
