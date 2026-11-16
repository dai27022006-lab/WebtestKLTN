# UI-UX-SPEC.md — Đặc Tả Kiến Trúc Giao Diện, Trải Nghiệm & Design System (`DreamTeam`)

> **Phiên bản:** v2.0 (Bước 2 — Đồng bộ thương hiệu **DreamTeam** 90–95% theo mẫu [`DreamsCore-Tailwind-Admin`](file:///d:/templates/16_ADMIN_DASHBOARD/DreamsCore-Tailwind-Admin/index.html))  
> **Đối tượng bàn giao:** `ai-template-2-fe` (Frontend UI/Motion & `src/app/**/page.tsx`), `ai-skill-design-web` (API/Tracking Bridge), `web-qa-verifier` (Kiểm định QA 8 cổng).  
> **Tài liệu nguồn đối chiếu:** [`docs/DESIGN.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/DESIGN.md), [`RULES.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/RULES.md), [`docs/API-CONTRACT.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/API-CONTRACT.md), [`src/types/api.ts`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/src/types/api.ts), [`src/lib/tracking/events.ts`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/src/lib/tracking/events.ts), [`FINGERPRINTS.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/FINGERPRINTS.md), [`image-style.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/image-style.md).

---

## 1. Linh Hồn Thị Giác & Chân Dung Khách Hàng (`DreamTeam`)

- **Thương hiệu:** **DreamTeam** — Cửa hàng sản phẩm số (Template Website, Prompt Pack, Workflow tự động) tích hợp Trợ lý ảo RAG (`F7`) và Thí nghiệm A/B (`F11`).
- **Người dùng cốt lõi:** Chủ shop nhỏ Việt Nam (**1–3 người**, bán hàng trên Shopee, TikTok Shop, Facebook) và người tham gia thí nghiệm định lượng có kiểm soát.
- **Tông thẩm mỹ — *Emerald & Slate SaaS Commerce (`DreamsCore` Aligned)*:**
  - **90–95% đồng bộ ngôn ngữ thị giác của `DreamsCore-Tailwind-Admin`:** Bề mặt sáng sắc nét (`#ffffff`, `#f8fafc`, `#f1f5f9`), mực Slate đậm (`#0f172a`), điểm nhấn Emerald (`#187f65` Light / `#48b594` Dark) kết hợp Copper ấm (`#e8830f`) cho các chi tiết làm nổi phụ trợ, xen kẽ dải Hero Slate-Navy (`#1e293b → #0f172a → #0a0f1c`) và các dải tối Emerald Obsidian (`#0d1512 → #070a09`).
  - **Độ tin cậy thương mại thật:** Trình bày rõ ràng, khoảng thở rộng (`container 1280px`), nút bấm to rõ, minh bạch bản quyền & giá VND, kết nối 100% dữ liệu thật từ `src/services/**`.
- **Danh sách từ chối bắt buộc (Anti-AI Template & `RULES.md`):**
  - **CẤM** preloader giả `1–4s` (vào trang tức thì `0ms`).
  - **CẤM** testimonial bịa đặt, `Lorem ipsum`, số liệu ảo (`20 Dashboards`, `400+ Pages`, `12,000+ teams`), chữ tiếng Anh mẫu còn sót, liên kết `href="#"` chết, dòng `"Scroll to explore"`, hoặc chỉ số trang trí `01 / 06`.
  - **CẤM** gradient tím neon (*AI-purple glow*) hoặc font `Inter` mặc định.
  - **CẤM** nạp Bootstrap CSS/JS, jQuery, AOS, Owl, GLightbox hoặc Lucide icon font dễ lỗi ô vuông `▯` — dùng CSS thuần + Inline SVG Lucide-style.

---

## 2. Hệ Thống Design System (`src/styles/**`)

### 2.1. Bảng Màu 6 Vai Trò + Emerald Accent + Copper Highlight (`tokens.css` & `themes.css`)

Mọi component **bắt buộc** đọc màu qua CSS Custom Properties — tuyệt đối không hardcode `#fff`, `#000` hay mã hex Light Mode cố định trong component để tránh lỗi tàng hình chữ khi lật Dark Mode.

| Vai trò Token | Token chính (`CSS var`) | Light Mode (`[data-theme="light"]`) | Dark Mode (`[data-theme="dark"]`) | Mục đích sử dụng |
|---|---|---|---|---|
| **1. Canvas** | `--bg-canvas` *(alias `--surface`)* | `#ffffff` | `#0d1512` | Nền trang tổng thể (`color-scheme: light dark`) |
| **2. Subtle & Surface** | `--bg-surface` / `--bg-surface-subtle` / `--bg-surface-sunken` | `#ffffff` / `#f8fafc` / `#f1f5f9` | `#111c18` / `#16241f` / `#090f0d` | Card nổi, dải section xen kẽ (`dg-bg-soft`), tag pill, input |
| **3. Primary Ink** | `--ink` *(alias `--ink-primary`, `--dg-ink`)* | `#0f172a` | `#f1f5f9` | Tiêu đề, nội dung chính, giá VND (`>= 14.5:1` contrast) |
| **4. Muted Ink** | `--ink-soft` / `--ink-tertiary` | `#475569` / `#64748b` | `#a3b8b0` / `#7f968d` | Mô tả phụ, metadata, URL bar (`>= 4.7:1` contrast) |
| **5. Borders** | `--border-hairline` / `--border-strong` | `#e2e8f0` / `#cbd5e1` | `rgba(226,232,240,0.12)` / `0.24` | Viền card `1px`, đường kẻ chia bảng, viền header |
| **6. Primary Accent** | `--accent` / `--accent-hover` / `--accent-soft` / `--accent-ink` | `#187f65` / `#146553` / `10%` / `#ffffff` | `#48b594` / `#5ec7a7` / `16%` / `#071712` | CTA chính, link active, tab đang chọn (`>= 4.9:1` cả 2 mode) |
| **Brand Primitives** | `--dg-blue`, `--dg-indigo`, `--dg-emerald`, `--dg-cyan`, `--dg-copper` | `#146553`, `#187f65`, `#24997c`, `#48b594`, `#e8830f` | Giữ nguyên hệ hue Emerald & Copper cho gradient/glow | `--dg-gradient-brand`, `.dg-grad-1..6`, ambient glows |
| **Dark Bands** | `.dg-dark-band` (`--dg-hero-bg`, `--dg-dark-bg`) | Nền tối `#1e293b→#0a0f1c` hoặc `#0d1512→#000000`, chữ `#ffffff` | Đồng bộ `#0d1512` / `#111c18`, chữ `#f1f5f9` | Hero, Dark Feature Highlights, Dark CTA Strip, Footer, Auth Right Panel |
| **Semantic States** | `--status-success` / `warning` / `danger` / `info` | `#15803d` / `#9a5b00` / `#b91c1c` / `#0e7490` | `#4ade80` / `#fbbf24` / `#f87171` / `#38bdf8` | Đơn `paid`, banner Stub / `is_simulated`, lỗi `422`, nhánh `chatbot_off` |

- **Quy tắc Theme Switcher:** Lưu vào `localStorage` (`dsa-theme`) và gắn `data-theme="light" | "dark"` lên `<html>` (tôn trọng `prefers-color-scheme` khi chưa lưu, mặc định Light khớp `DreamsCore`). Logo lục giác **DreamTeam** dùng `var(--brand-mark-ink)`, `var(--brand-mark-accent)`, `var(--brand-mark-mint)` để đổi màu đồng bộ mà không cần tải 2 file SVG.

### 2.2. Typography (`src/styles/typography.css`)

- **Tối đa 2 họ font** nạp qua `next/font/google` trong `src/app/layout.tsx` *(nhắc `ai-template-2-fe` cập nhật `Plus_Jakarta_Sans` vào `layout.tsx`; `tokens.css` đặt `--font-plus-jakarta-sans` ưu tiên hàng đầu và giữ `--font-be-vietnam-pro` làm fallback an toàn trong lúc chuyển tiếp)*:
  1. `Plus_Jakarta_Sans` (`subsets: ['vietnamese', 'latin']`, `weight: ['400', '500', '600', '700', '800']`, `variable: '--font-plus-jakarta-sans'`) — Display + UI Body.
  2. `JetBrains_Mono` (`subsets: ['vietnamese', 'latin']`, `weight: ['400', '500', '600']`, `variable: '--font-jetbrains-mono'`) — Giá tiền VND, `participant_code`, đồng hồ bấm giờ F11, token, metrics F10.
- **Quy tắc tiếng Việt & Mobile (`<= 700px`):**
  - `--text-display`: `clamp(2rem, 3.2vw + 0.75rem, 2.75rem)` desktop → hạ xuống `clamp(1.75rem, 6vw + 0.4rem, 2.25rem)` tại `@media (max-width: 700px)`.
  - Bỏ `white-space: nowrap` trên tiêu đề H2 và chuỗi Typewriter ở mobile để tuyệt đối không tràn ngang `375px`; dùng `text-wrap: balance` cho heading và `max-width: 62ch` (`text-wrap: pretty`) cho văn bản.
  - Mọi text có `overflow: hidden` gắn `.text-line-clip` (`padding-bottom: 0.16em; margin-bottom: -0.16em`) bảo vệ chân dấu nặng/huyền tiếng Việt (`ạ, ệ, ộ, ự`).
  - Bù quang học Dark Mode: tăng nhẹ `letter-spacing: 0.008em` và `line-height: 1.66` trên `[data-theme="dark"]` và `.dg-dark-band`.

### 2.3. Spacing, Container & Radius (`src/styles/tokens.css`)

- Thang `4px`: `--space-1` (`4px`) → `--space-24` (`96px`), `--container-max: 1280px`, `--container-px: clamp(16px, 3vw, 24px)`.
- Section padding: `--section-py: clamp(56px, 6vw, 80px)`, khoảng trống trên tiêu đề (`--heading-mt`) luôn lớn hơn dưới tiêu đề (`--heading-mb`).
- Radius: `--dg-radius: 5px` (khối chuẩn DreamsCore), `--radius-sm: 10px`, `--radius-md: 12px` (buttons), `--radius-lg: 16px` (tiles/FAQ/cards), `--radius-xl: 20px` (Hero mockup/carousel cards), `--radius-2xl: 32px` (Dark CTA banner).

---

## 3. Khung Điều Hướng Toàn Cục & Layout Shell

### 3.1. Global Top Header (`SiteHeader` — Theo mẫu `.dg-header`)

- **Cấu trúc:** Fixed/sticky `top: 0`, chiều cao `72px` desktop (`60px` mobile `<= 700px`), nền kính mờ (`backdrop-filter: blur(16px)`), viền đáy `1px solid var(--border-hairline)`.
- **Thanh tiến độ cuộn (`3px` ở mép trên Header):** Dùng GPU `animation-timeline: scroll()` + `transform: scaleX(...)` với `--dg-gradient-brand` (có fallback scroll listener `{ passive: true }`).
- **Bố cục 1 hàng:**
  - *Trái:* DreamTeam Hexagon SVG Logo (`BrandMark` nâng cấp theo lục giác `logo.svg` DreamsCore) + tên **DreamTeam** *(sub: Cửa hàng số & Trợ lý RAG)*.
  - *Giữa (Desktop `>= 992px`):* 4 liên kết sạch: `Sản phẩm` (`/products`), `Thí nghiệm F11` (`/experiment`), `Phân tích Admin` (`/admin/analytics`), `Hỏi đáp` (`/#faqs`).
  - *Phải:* Nút chuyển Sáng/Tối (`aria-label`), nút Giỏ hàng (`/cart`) kèm badge `CartDto.item_count` (`tabular-nums`), nút Tài khoản (`/auth` hoặc tên user + Thoát), và CTA gradient `Thử F11` (`/experiment`).
  - *Mobile (`<= 991px`):* Nút Drawer mở native `<dialog>` slide từ phải (`min(320px, 88vw)`), có `overscroll-behavior: contain` và focus trap.
- **Ngoại lệ trang `/experiment`:** Ẩn nav mua sắm rườm rà khi người tham gia đang trong phiên làm bài; thay bằng **Focus Experiment Bar** (`participant_code`, `Lượt 1/2` hoặc `2/2`, biến thể `chatbot_on` / `chatbot_off`, nút quay lại `/products`).

### 3.2. F11 Scenario Context Bar

- Hiển thị dính ngay dưới Header (`top: var(--header-height)`) khi phiên có `scenario_run_id` chưa hoàn tất trên `/products`, `/products/[slug]`, hoặc khi mở Chatbot.
- Gồm: Mã phiên + Nhánh AB/BA, Tóm tắt đề bài + Popover đọc đầy đủ `prompt_text`, Đồng hồ đếm thực (`tabular-nums`), Nút `Về trang chốt gói (/experiment)`.

---

## 4. Đặc Tả Page Grammar, Feeling Curve & Thành Phần Từng Trang

### 4.1. Trang Chủ `/` — *DreamTeam Landing (90–95% Cấu Trúc `DreamsCore-Tailwind-Admin`)*

- **Page Grammar:** **2. Chaptered editorial** (xen kẽ nhịp nhàng các chương Light `#ffffff`, Soft Slate `#f8fafc` và Dark Emerald `#0d1512` dứt khoát theo cấu trúc 11 section của `DreamsCore`).
- **Danh sách CẤM (Forbids):** Cấm preloader giả; cấm AOS delay gây mảng trắng; cấm testimonial bịa; cấm số liệu ảo; cấm `"Scroll to explore"`; cấm icon font ô vuông `▯`.
- **Mở đầu tức thì (`0ms`):** Toàn bộ Fold 1 (Hero headline, Typewriter, 2 CTA, 3D Mockup Stack) hiển thị ngay tại `opacity: 1` lúc tải trang (`delay(0)`).
- **Feeling Curve (11 chặng khớp `DreamsCore`, không trùng cảm xúc kề nhau):**

| STT | Chặng / Section | Cảm xúc | Thành phần UI & Ánh xạ Nghiệp Vụ `DreamTeam` |
|---|---|---|---|
| **1** | **Hero + 3D Stack + Typewriter** (`#hero`) | **Tin cậy & Tầm nhìn** *(Authoritative Clarity)* | Nền `--dg-hero-bg` + dot grid GPU `translate3d` + 2 glow Emerald/Copper. Trái (`6/12`): Pill badge *"Dành cho chủ shop nhỏ 1–3 người"*, H1 *"Vận hành nhanh hơn với DreamTeam — Chọn đúng [Typewriter: Template Web / Prompt Pack / Workflow Chốt Đơn / Trợ Lý RAG]"*, Lead copy, 2 CTA (`Khám phá gói số` → `/products`, `Tham gia Thí nghiệm F11` → `/experiment`), 2 trust chips có `useCountUp` (*3 Nhóm giải pháp thực chiến*, *100% Grounding từ DB thật*). Phải (`6/12`): **3D Mockup Stack** (`back-2`, `back-1`, `dg-hero-mockup-frame` với mac dots + URL `dreamteam.vn/store` + pill `F11 Sẵn sàng`) tích hợp `WorkspaceShowcaseFrame` cho phép bấm chuyển 3 chế độ ngay trên Hero + `rAF` 3D tilt khi hover chuột. |
| **2** | **6 Category Cards** (`#categories`) | **Định hướng nhanh** *(Quick Orientation)* | Lưới 6 cột (`col-6 col-md-4 col-lg-2` CSS Grid): `Template Website`, `Prompt Pack AI`, `Workflow Tự Động`, `Shop Mỹ Phẩm`, `Shop Thời Trang`, `Gia Dụng & F&B`. Icon tròn `64×64px` viền mảnh xoay nhẹ `-6deg` khi hover chuột, click dẫn thẳng `/products?product_type=...` hoặc `?industry=...`. |
| **3** | **Showcase Gallery + Filter Tabs — PEAK** (`#showcase`, `--bg-surface-subtle`) | **Hào hứng khám phá** *(Focused Discovery)* | Section header + pill icon + gạch chân gradient `64×4px`. Hàng **Filter Tabs** (`Tất cả`, `Template Website`, `Prompt Pack`, `Workflow Tự Động`) lọc trực tiếp dữ liệu từ `GET /api/products` (và bắn `filter_applied`). Lưới 3 cột `.dg-showcase-card` (`16:10`, viền trên `3px` brand gradient lộ khi hover, overlay trên desktop giữ link bấm trực tiếp trên mobile, badge `source_type`, giá VND `tabular-nums`). |
| **4** | **Dark Feature Highlights** (`#features`, `.dg-dark-band`) | **Thuyết phục kỹ thuật** *(Technical Rigor)* | Nền `--dg-dark-bg` (`#0d1512 → #070a09`). Lưới 4×2 (`8` thẻ `.dg-feature-card` không đánh số `01/06` trang trí thừa): `F7 RAG Grounding`, `F8 AB/BA Crossover`, `F11 Task Timer & Likert`, `F3 Minh Bạch Bản Quyền`, `F5 Sandbox HMAC`, `F6 Token Download`, `F10 14 Events Tracking`, `F12 Eval Tự Động`. |
| **5** | **Tech Stack Tiles** (`#stack`) | **Chắc chắn nền tảng** *(Stack Trust)* | Lưới 6×2 (`12` ô `.dg-stack-tile` bo `16px`, icon tròn `.dg-grad-1..6`): `Next.js 16`, `TypeScript`, `Supabase Postgres`, `pgvector 768d`, `Gemini Flash`, `Zod Contract`, `HMAC Webhook`, `Signed URL F6`, `14 Events`, `Eval Set F12`, `Light/Dark Mode`, `Mobile 375px`. |
| **6** | **Inner Pages Gallery** (`#pages`, `--bg-surface-subtle`) | **Toàn cảnh hệ thống** *(System Breadth)* | Lưới 3 cột `.dg-ip2-card` (`4:3` preview frame + scrim emerald đáy `#082720` + nút mở trang + tag chức năng): dẫn tới `/products`, `/products/[slug]`, `/experiment`, `/cart` & `/checkout`, `/orders/[id]`, `/admin/analytics` & `/auth`. |
| **7** | **3-Card Carousel — Kịch Bản Thực Tế F11** (`#scenarios`) | **Đồng cảm thực tiễn** *(Relatable Scenarios)* | **Thay thế hoàn toàn testimonial bịa bằng Carousel Kịch Bản & Hồ Sơ Chủ Shop F11:** CSS Scroll Snap + nút Prev/Next mượt (card giữa nổi nhẹ `scale(1.04)`). Hiển thị các thẻ kịch bản thật từ đề tài (`SC-01 Shop Mỹ phẩm TikTok`, `SC-02 Shop Thời trang đa kênh`, `SC-03 Shop Gia dụng cần Landing 375px`, `SC-04 Chủ shop mới tối ưu mô tả`), gồm ngân sách VND, quy mô `1–3 người`, tag ngành và link `Thử kịch bản này tại /experiment`. |
| **8** | **FAQ Accordion** (`#faqs`, `--bg-surface-subtle`) | **Giải tỏa băn khoăn** *(Clarifying Relief)* | Khối `max-width: 820px` + 6 câu hỏi thật (không ép tạo tài khoản F11, bản chất thanh toán Sandbox, bản quyền `original/adapted/licensed`, chống bịa RAG, giới hạn token tải file, ẩn danh nghiên cứu) + dải 4 tile lối tắt (`.dg-faq-help`). |
| **9** | **Dark CTA Strip** (`.dg-cta-dark`) | **Thúc đẩy hành động** *(Decisive Momentum)* | Banner bo `32px` nền tối `#0d1512`, bên trái 2 CTA (`Tham gia Thí nghiệm F11`, `Khám phá Danh mục`), bên phải mockup preview F11 nghiêng `-2deg` + chip *"Within-subject AB/BA • Miễn tạo tài khoản"*. |
| **10** | **Footer + Back-to-Top** (`.dg-footer`) | **An tâm & Khép lại** *(Calm Closure)* | Footer tối `#0d1512` viền trên `3px` gradient, 3 cột gọn (Tóm tắt DreamTeam + Khám phá + Nghiên cứu/API Health), tuyên bố Sandbox đo ý định mua + nút **Progress + Back-to-Top (`conic-gradient`)** thông minh. |

- **Peak:** Chặng 3 (Showcase Gallery + Live Filter Tabs nối dữ liệu DB thật).
- **Signature Move:** **Interactive 3D Mockup Stack + In-Place Showcase Filter Tabs** (`rAF` mouse-tilt an toàn + lọc danh mục tức thì trên lưới Showcase chuẩn `DreamsCore`).

---

### 4.2. Trang Danh Mục `/products` (`F2`)

- **Page Grammar:** **6. Gallery / Catalog** (quét nhanh, lọc chính xác, không đặt Hero ảnh lớn choán chỗ).
- **Thành phần:**
  - Compact Utility Header: Tiêu đề + bộ đếm tổng sản phẩm + nút Reset bộ lọc.
  - Sticky Filter Ribbon: Thanh tìm kiếm (`search_used`), dải pill tab theo loại giống `.dg-fw-tabs` (`Tất cả`, `Template Website`, `Prompt Pack`, `Workflow`), bộ lọc `industry`, khoảng giá (`Dưới 300k`, `300k–700k`, `Dưới 1 triệu`), sắp xếp (`Mới nhất`, `Giá tăng dần`, `Giá giảm dần`).
  - Lưới **3 cột Showcase Cards** (`.dg-showcase-card` với `aspect-ratio: 16/10` hoặc `4/3`, badge `product_type` + `source_type`, giá VND `tabular-nums`, 2 nút rõ trên card: `Xem chi tiết` & `Thêm vào giỏ` — kèm nút `Chọn cho kịch bản` khi đang trong F11).
  - *Loading / Empty / Error:* Skeleton giữ `CLS = 0`; `EditorialEmptyIllustration` SVG 2 màu `--ink-soft` & `--accent`; banner lỗi API kèm nút `Thử tải lại`.

---

### 4.3. Trang Chi Tiết Sản Phẩm `/products/[slug]` (`F3`)

- **Page Grammar:** **7. Split stage** (trái cuộn xem preview & specs, phải ghim dock mua hàng / chọn gói F11).
- **Thành phần:**
  - Breadcrumb + Scenario Return Pill (nếu đang chạy F11).
  - *Cột trái:* **CSS Desktop (`1280px`) ↔ Mobile (`375px`) Viewport Switcher**, khối `deliverables`, `platforms`, `tech_stack`, `guide_summary`, `setup_time_minutes`.
  - *Cột phải (Sticky Dock):* Giá VND lớn (`type-price`), quy mô shop phù hợp, **Hộp Minh Bạch Bản Quyền** (`source_type`: `original` | `adapted` | `licensed` + toàn văn `license_note`), nút `Thêm vào giỏ` & `Mua ngay (Sandbox)`, và khối nổi bật `Chọn gói này cho Kịch bản F11` (nếu đang có `scenario_run_id`).
  - *Mobile (`<= 700px`):* Bỏ sticky, hiện thanh CTA cố định ở đáy màn hình tôn trọng `safe-area-inset-bottom`.

---

### 4.4. Giỏ Hàng `/cart`, Thanh Toán `/checkout` & Giao Hàng Số `/orders/[id]` (`F4–F6`)

- **Page Grammar:** **3. Live surface** (thực dụng, minh bạch giá 100% từ DB).
- **Thành phần:**
  - **3-Step Stepper:** `1. Giỏ hàng` → `2. Thanh toán Sandbox` → `3. Nhận file`.
  - **`/cart`:** Danh sách item từ `GET /api/cart`, nút xóa, tạm tính `subtotal_vnd`, CTA `Tiến hành Thanh toán Sandbox`.
  - **`/checkout`:** Cột trái đối chiếu đơn (`POST /api/orders` + bắn `checkout_started`); Cột phải là **Mock Sandbox Webhook Simulator Panel** với 2 nút test (`Mô phỏng Thanh toán Thành công (Paid)` → bắn `purchase` & chuyển `/orders/[id]`, `Mô phỏng Thanh toán Thất bại (Failed)` → hiện lỗi + thử lại).
  - **`/orders/[id]`:** Header trạng thái đơn (`pending` / `paid` / `failed`), bảng `download_grants` hiển thị `download_count / max_downloads`, `expires_at`, nút `Tải gói sản phẩm` (`GET /api/downloads/:token` + bắn `download_completed`) và xử lý rõ lỗi `422 DOWNLOAD_EXPIRED` / `DOWNLOAD_LIMIT_EXCEEDED`.

---

### 4.5. Chế Độ Thí Nghiệm A/B `/experiment` (`F8`, `F11`)

- **Page Grammar:** **1. Filmic one-shot** (tập trung, tuyến tính 4 pha, không lộ `expected_product_id` hay `rubric_note`).
- **4 Pha tuyến tính:**
  1. **Consent & Hồ sơ shop ngắn:** Giải thích ẩn danh `participant_code`, form tùy chọn `shop_profile`, checkbox đồng ý (`POST /api/experiments/consent`).
  2. **Thẻ Kịch Bản & Bấm Giờ:** **AB/BA Condition Banner** báo rõ lượt hiện tại `chatbot_on` hay `chatbot_off`, hiển thị `scenario.code`, `title`, `prompt_text`, `industry`, `budget_vnd`, **Live Tabular Timer** (`tabular-nums`), nút `Đi tới Danh mục sản phẩm` (`/products`).
  3. **Chốt Gói & Chấm Tự Tin:** Tóm tắt `selected_product_id` + **Thang Likert 1–5 chạm lớn** (`>= 48×48px`) + `decision_note` → `POST /api/scenarios/:id/complete` + `scenario_completed`.
  4. **Đảo Chéo / Hoàn Tất:** Thông báo đảo trạng thái (`AB → BA` / `BA → AB`) cho lượt 2 hoặc màn cảm ơn kèm `participant_code` khi `is_finished === true`.

---

### 4.6. Đăng Nhập / Đăng Ký `/auth` (`F1` — Split-Panel Theo Mẫu `DreamsCore` `login.html` & `register.html`)

- **Page Grammar:** **7. Split stage (Auth Split-Panel)**.
- **Bố cục 2 cột `lg:grid-cols-2` (`min-height: calc(100dvh - var(--header-height))`):**
  - **Cột trái (Form — `max-width: 420px` căn giữa):**
    - Logo **DreamTeam** + chuyển Tab `Đăng nhập` / `Đăng ký`.
    - Input kèm icon SVG bên trái (`Mail`, `Lock`, `User`, `Store`) và nút ẩn/hiện mật khẩu.
    - Ở Tab `Đăng ký`: Hiện thêm ô `full_name`, `shop_category` (tùy chọn) và **Password Strength Meter 4 nấc** (CSS thuần đồng bộ với `register.html`).
    - **Callout thông tin (`--status-info`):** *"Bạn đang muốn tham gia thí nghiệm F11? Không cần đăng nhập hoặc tạo tài khoản — Bấm vào đây để bắt đầu ngay"* → link `/experiment`.
  - **Cột phải (Brand Panel — ẩn trên `<= 991px`, nền `.dg-dark-band` Emerald gradient `#146553 → #0d1512` + lưới chấm):**
    - Tiêu đề *"Mọi công cụ số tinh gọn cho chủ shop 1–3 người"*.
    - 3 giá trị thực tế kèm icon check Emerald Mint: (1) *Template & Prompt tối ưu cho Shopee, TikTok Shop, Facebook*; (2) *Minh bạch bản quyền `original / adapted / licensed`*; (3) *Trợ lý RAG đối chiếu 100% ID thật từ danh mục*.
    - **Thẻ Kịch Bản Mẫu F11** (thẻ glass `bg-white/10 border-white/15` trình bày tóm tắt 1 kịch bản thí nghiệm thật — **tuyệt đối không dùng testimonial giả `Marcus Lee` hay `12,000+ teams`**).

---

### 4.7. Dashboard Phân Tích `/admin/analytics` (`F10` — KPI Cards Theo Mẫu `DreamsCore` Dashboard)

- **Page Grammar:** **3. Live surface (Operational Cockpit)** — chỉ truy cập khi `role === 'admin'`.
- **Cấu trúc đồng bộ `tailwind/index.html`:**
  1. **Executive Hero Banner:** Khối gradient Emerald (`#146553 → #187f65 → #0d1512`) bo `16px` có lưới vuông mờ, trạng thái `Live`, nút `Làm mới dữ liệu`, và **Công tắc lọc dữ liệu `include_simulated`** (`false` mặc định / `true`).
  2. **Simulated Data Guard Banner:** Khi `include_simulated === true`, hiện dải cảnh báo `--status-warning-bg` toàn chiều rộng ghi rõ *"ĐANG HIỂN THỊ DỮ LIỆU MÔ PHỎNG (`is_simulated = true`) — Tuyệt đối không dùng cho kết luận báo cáo."*
  3. **4 Executive KPI Cards (`bento-grid` 4 cột desktop / 2 tablet / 1 mobile):** Theo đúng anatomy thẻ KPI của `DreamsCore` (icon chip `.dg-grad-*` góc trên-trái + pill badge ngữ cảnh góc trên-phải + nhãn chỉ số + số liệu lớn `tabular-nums` + 2 dòng metadata phụ phía dưới) nối trực tiếp `AdminDashboardSummaryDto`:
     - Card 1: **Người tham gia** (`total_participants`) — metadata: *Đã đồng ý consent (`consented_participants`)*, *Tỷ lệ consent*.
     - Card 2: **Lượt hoàn thành F11** (`total_completed_runs`) — metadata: *Thiết kế Within-subject AB/BA*.
     - Card 3: **Đơn hàng Sandbox** (`orders_summary.paid_orders / total_orders`) — metadata: *Tổng giá trị ý định mua (`total_sandbox_value_vnd`)*.
     - Card 4: **Chi phí & Tốc độ RAG** (`rag_metrics.avg_cost_per_message_usd`) — metadata: *P95 Latency (`p95_latency_ms` ms)* & *Tổng token (`total_tokens_used`)*.
  4. **Bảng So Sánh Đối Chứng A/B (`variants[]`):** `chatbot_on` vs `chatbot_off` (Số lượt, Accuracy chọn đúng, Thời gian TB, Độ tự tin TB 1–5, Số ý định mua sandbox).
  5. **Phễu 14 Sự Kiện Chuẩn (`EVENT_NAMES`):** Tách rõ 3 sự kiện `chatOnly` (`chat_opened`, `chat_message_sent`, `product_suggested`).
  6. **Tóm Tắt Kinh Tế Đơn Vị RAG (`rag_metrics`):** Tổng tin nhắn bot, Avg/P95 Latency, Tổng tokens, Tổng USD & Cost/Query.

---

### 4.8. Trợ Lý Ảo RAG Drawer (`AdvisorChatDrawer` — `F7` Overlay)

- **Điều kiện hiển thị tuyệt đối:** Chỉ render FAB (Emerald gradient pill) và Drawer khi `active_variant === 'chatbot_on'`. Khi `chatbot_off`, không render DOM drawer và backend chặn `403 CHATBOT_DISABLED_FOR_VARIANT`.
- **Responsive:** Desktop (`> 700px`): Side Drawer `410px` × `min(680px, 84dvh)` bo `--radius-lg`, viền `--border-strong`, `--shadow-lg`. Mobile (`<= 700px`): Full-height Bottom Sheet (`100dvh`, `overscroll-behavior: contain`) có nút đóng `44×44px`.
- **Thành phần bên trong:**
  - Header + **Mode Badge bắt buộc:** Xanh Emerald *"Gemini RAG • 100% Grounding DB"* khi chạy LLM thật; Hổ phách `--status-warning` *"Chế độ Stub — Dữ liệu thử nghiệm"* nếu `model_name` chứa `stub`/`mock`.
  - Tối đa 3 Quick Prompt Chips theo nhu cầu chủ shop.
  - Bong bóng User & Assistant + **Suggested Product Cards (tối đa 3 thẻ từ `suggested_products`):** Bấm thẻ bắn `suggestion_clicked` và mở `/products/[slug]`.
  - Input bar (tối đa `1500` ký tự) + trạng thái loading + xử lý lỗi `429` / `422`.

---

## 5. Bản Đồ API Contract & 14 Sự Kiện Tracking

Giữ nguyên 100% danh sách 14 sự kiện chuẩn trong [`src/lib/tracking/events.ts`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/src/lib/tracking/events.ts) và [`docs/API-CONTRACT.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/API-CONTRACT.md). Mọi sự kiện gửi `POST /api/events` phải đủ 4 trường bắt buộc (`visitor_id`, `assignment_id`, `variant`, `created_at` kèm `scenario_run_id` khi trong F11).

---

## 6. Checklist Kiểm Định QA 8 Cổng Dành Cho `ai-template-2-fe` & `web-qa-verifier`

1. **Mở đầu tức thì `0ms`:** Không đặt màn hình preloader giả; Hero H1 & Mockup Stack hiển thị ngay `opacity: 1`.
2. **Không dùng AOS / `.fade-anim` trễ:** Reveal nhẹ bằng `IntersectionObserver` (`rootMargin: '-6% 0px'`, `translate3d <= 12px`) hoặc hiển thị sẵn — không gây mảng trắng khi cuộn nhanh.
3. **Zero Library Bloat & Zero Icon Font `▯`:** Không dùng Bootstrap, jQuery, AOS, Swiper, Owl, GLightbox; dùng Inline SVG Lucide-style components + native `<dialog>` + CSS Scroll Snap.
4. **CLS = 0:** Mọi frame `16:10` / `4:3`, skeleton và cụm Typewriter giữ sẵn kích thước cố định.
5. **Khóa Hover & Reduced Motion:** Mọi hover elevation/overlay/3D tilt bọc trong `@media (hover: hover) and (pointer: fine)` và `prefers-reduced-motion: no-preference`; không ẩn tiêu đề card khi hover.
6. **Đồng bộ Light/Dark qua Tokens:** Mọi class đều dùng CSS variables từ `tokens.css` & `themes.css`; các khối tối cố định trên nền sáng (Hero, Features, Dark CTA, Footer, Auth panel) dùng scoped `.dg-dark-band` để không lệch chữ.
7. **An toàn Tiếng Việt & Mobile `375px`:** Bỏ `white-space: nowrap` trên tiêu đề/Typewriter ở mobile; gắn `.text-line-clip` ở dòng có mask/clip; `0px` tràn ngang tại `375px`; touch target tối thiểu `44×44px` (`48×48px` cho Likert `1–5`); Back-to-Top `conic-gradient` tự ẩn khi cuộn xuống trên mobile để không che CTA đáy.
8. **100% Nội dung & Nghiệp vụ thật:** Không còn testimonial giả, số liệu bịa, `Lorem ipsum`, `cdn-cgi`, hay `href="#"` chết.
