# DESIGN.md — Phân Tích Mẫu `DreamsCore-Tailwind-Admin` → Hệ Thống Giao Diện `DreamTeam`

> **Tài liệu thiết kế (Bước 2):** Phân tích chi tiết mẫu tham chiếu [`DreamsCore-Tailwind-Admin`](file:///d:/templates/16_ADMIN_DASHBOARD/DreamsCore-Tailwind-Admin/index.html) và quy chuẩn hóa sang thương hiệu **DreamTeam** (*Cửa hàng sản phẩm số & Trợ lý ảo tư vấn RAG cho chủ shop nhỏ Việt Nam 1–3 người*).  
> **Mức độ bám sát mục tiêu:** **90–95%** bố cục, bảng màu Emerald/Copper/Slate, tỷ lệ khoảng cách, nhịp section và ngôn ngữ thị giác từ `DreamsCore-Tailwind-Admin`; đồng thời nâng cấp hiệu ứng mở đầu tức thì (`0ms`), tối ưu GPU từ [`frontend-techniques.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/.agents/plugins/web-craft-studio/skills/web-craft-studio/references/frontend-techniques.md) và khóa chặt 100% nghiệp vụ thật theo [`RULES.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/RULES.md) (v3).

---

## 1. Trích Xuất Đầy Đủ Design Tokens Từ `DreamsCore-Tailwind-Admin`

Các giá trị dưới đây được trích xuất trực tiếp từ `assets/css/style.min.css`, `assets/img/logo.svg`, `tailwind/login.html`, `tailwind/register.html` và `tailwind/index.html` trong thư mục mẫu gốc (chỉ đọc).

### 1.1. Bảng màu gốc (`assets/css/style.min.css` & `assets/img/logo.svg`)

| Nhóm màu | Biến gốc trong `style.min.css` | Giá trị Hex / Gradient | Vai trò thị giác trong DreamTeam |
|---|---|---|---|
| **Emerald Core** | `--dg-blue` | `#146553` | Điểm đầu của brand gradient, màu hover đậm trên Light Mode |
| **Emerald Primary** | `--dg-indigo` | `#187f65` | Accent chính Light Mode (tương phản `4.93:1` trên `#ffffff`), link active, category label |
| **Emerald Bright** | `--dg-purple`, `--dg-emerald` | `#24997c` | Điểm giữa/cuối gradient, pill `"Live"`, icon success chip |
| **Emerald Mint** | `--dg-cyan` | `#48b594` | Accent chính Dark Mode (tương phản `7.29:1` trên `#0d1512`), typewriter text, ring/glow |
| **SVG Logo Accents** | *(từ `logo.svg`)* | `#141414`, `#40BFA6`, `#40916C`, `#8CD9B3` | Chuyển thành token `--brand-mark-ink` / `--brand-mark-accent` để đổi sạch Light ↔ Dark |
| **Copper Secondary** | `--dg-copper`, `--dg-copper-dark` | `#e8830f`, `#c8682a` | Nhấn ấm phụ (ambient glow, badge/icon highlight, dark CTA phụ) — không lấn át Emerald |
| **Ink & Slate** | `--dg-ink` | `#0f172a` | Chữ chính Light Mode (`17.4:1` trên `#ffffff`), nền Hero tối |
| **Slate Body** | `--dg-slate` | `#475569` | Mô tả, văn bản phụ Light Mode (`7.58:1` trên `#ffffff`) |
| **Slate Muted** | `--dg-slate-light` | `#64748b` | Nhãn metadata, URL bar, chú thích (`4.76:1` trên `#ffffff`) |
| **Light Surfaces** | `--dg-white`, `--dg-bg-soft`, `--dg-bg-softer`, `--dg-border` | `#ffffff`, `#f8fafc`, `#f1f5f9`, `#e2e8f0` | Canvas chính (`#ffffff`), dải section xen kẽ (`#f8fafc`), chip/tag (`#f1f5f9`), viền `1px` (`#e2e8f0`) |
| **Hero Atmospheric** | `.dg-hero` | `linear-gradient(155deg, #1e293b 0%, #0f172a 55%, #0a0f1c 100%)` | Nền Hero Slate-Navy kèm 2 radial glow (`rgba(232,131,15,0.22)` & `rgba(30,41,59,0.55)`) + lưới chấm `24px` |
| **Dark Sections** | `.dg-dark-bg`, `.dg-cta-dark`, `.dg-footer` | `linear-gradient(155deg, #0d1512 0%, #070a09 55%, #000000 100%)` | Nền các dải tối Feature Highlights, CTA Strip, Footer kèm glow Mint (`0.16–0.25`) & Copper (`0.10–0.20`) |
| **Brand Gradients** | `--dg-gradient-brand`, `--dg-gradient-soft` | `linear-gradient(135deg, #146553 0%, #187f65 45%, #48b594 100%)` | Nút CTA chính, thanh underline tiêu đề `64×4px`, active filter tab, top accent line `3px` |

### 1.2. Mở rộng Dark Mode toàn cục đồng bộ với chính `DreamsCore`

Mẫu `index.html` gốc chỉ khóa `<meta name="color-scheme" content="light">`, nhưng các dải tối của chính `DreamsCore` (`#0d1512`, `#111c18`, `#48b594`) đã gợi mở sẵn bảng màu Dark Mode hoàn chỉnh cho **DreamTeam**:

| Token Semantic | Light Mode (`[data-theme="light"]`) | Dark Mode (`[data-theme="dark"]`) | Ghi chú tương phản & QA |
|---|---|---|---|
| `--bg-canvas` | `#ffffff` | `#0d1512` | Tránh `#000000` thuần cho nền đọc chữ chính |
| `--bg-surface` | `#ffffff` | `#111c18` | Card nổi, drawer, modal, input nền sáng dịu nhẹ |
| `--bg-surface-subtle` | `#f8fafc` | `#16241f` | Dải section xen kẽ (`dg-bg-soft`) |
| `--bg-surface-sunken` | `#f1f5f9` | `#090f0d` | Tag pill, browser bar, thead bảng dữ liệu |
| `--ink` | `#0f172a` | `#f1f5f9` | Cool-slate chalk, giảm chói halation trong Dark Mode |
| `--ink-soft` | `#475569` | `#a3b8b0` | Xám pha lục nhẹ ăn nhập nền `#0d1512` (`~8.2:1`) |
| `--border-hairline` | `#e2e8f0` | `rgba(226, 232, 240, 0.12)` | Viền card, đường phân cách mảnh |
| `--accent` / `--accent-ink` | `#187f65` / `#ffffff` | `#48b594` / `#071712` | Mint `#48b594` đạt `7.29:1` trên `#0d1512`; chữ trên nền Mint dùng `#071712` (`7.1:1`) |

### 1.3. Typography, Layout, Radius & Shadows

- **Họ chữ (tối đa 2 họ):**
  - Display & Body: `Plus Jakarta Sans` (`weight: 400, 500, 600, 700, 800`, `subsets: ['vietnamese', 'latin']`) thay thế hoàn hảo Google Font gốc của `DreamsCore` và hỗ trợ đầy đủ dấu tiếng Việt.
  - Mono & Telemetry: `JetBrains Mono` (`weight: 400, 500, 600`) cho giá tiền VND (`490.000đ`), đồng hồ bấm giờ F11 (`02:14`), mã phiên (`P-018`), chi phí `cost_usd`.
- **Container & Section Rhythm:**
  - `--container-max: 1280px`, padding ngang `24px` desktop → `16px` mobile (`clamp(16px, 3vw, 24px)`).
  - Section padding dọc: `80px` desktop → `64px` tablet/mobile (`clamp(48px, 6vw, 80px)`).
  - `.dg-section-heading`: Căn giữa, `margin-bottom: 56px` (desktop), có pill `.dg-sub-heading` ở trên (icon tròn gradient `24×24px` + chữ uppercase tracking `0.04em`), tiêu đề `clamp(22px, 3vw, 34px)` với vạch gradient `64×4px` ở `::after` và đoạn dẫn `max-width: 640px`.
- **Border Radius:**
  - `--dg-radius: 5px` (giá trị gốc panel/khối chuẩn DreamsCore, đồng thời ánh xạ thang `--radius-xs: 5px`, `--radius-sm: 10px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-xl: 20px`, `--radius-2xl: 32px`, `--radius-pill: 9999px` cho nút, thẻ stack, browser frame và CTA banner).
- **Elevation Shadows:**
  - `--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06)`
  - `--shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08)`
  - `--shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.12)`

---

## 2. Phân Tích Chi Tiết Từng Section `index.html` & Ánh Xạ Sang `DreamTeam`

### 2.1. Bảng ánh xạ 11 Section Trang Chủ (`/`)

| STT | Section gốc (`index.html`) | Cấu trúc & Tỷ lệ gốc | Ánh xạ sang `DreamTeam` | Xử lý nội dung & Ràng buộc `RULES.md` |
|---|---|---|---|---|
| **1** | **Header** (`#dgHeader`, `.dg-header`) | Fixed top glassmorphic `rgba(255,255,255,0.9)` + `blur(16px)`, thanh tiến độ `3px` ở mép trên (`#dgHeaderProgress`), logo trái, nav giữa 7 link, 2 nút phải + mobile drawer `300px`. | **DreamTeam Global Header:** Logo lục giác DreamTeam SVG (token hóa Light/Dark), 5 link gọn (`Trang chủ`, `Sản phẩm`, `Thí nghiệm F11`, `Phân tích Admin`, `Hỏi đáp`), cụm phải gồm **Theme Toggle**, **Giỏ hàng (`CartDto.item_count`)**, **Tài khoản (`/auth`)** và CTA `Thử Thí Nghiệm`. | Bỏ link ngoài ThemeForest & bootstrap collapse; mobile drawer dùng native `<dialog>` có focus-trap và `overscroll-behavior: contain`. |
| **2** | **Hero + 3D Mockup Stack + Typewriter** (`#hero`, `.dg-hero`) | Nền gradient `#1e293b -> #0f172a -> #0a0f1c` + dot grid. Chia 2 cột `6/6`: Trái có badge chấm xanh + H1 `40px` + Typewriter + lead + 2 CTA + 2 trust chips (`CountUp`); Phải là 3D `.dg-hero-stack` (`back-2` `-6deg`, `back-1` `+4deg`, `dg-hero-mockup-frame` có mac dots & pill `Live`). | **Hero Cửa Hàng Số & Thí Nghiệm A/B:** Badge *"DÀNH CHO CHỦ SHOP NHỎ 1–3 NGƯỜI • SHOPEE / TIKTOK / FB"*; H1 *"Vận hành nhanh hơn với DreamTeam — Chọn đúng [Template Web / Prompt Pack / Workflow Chốt Đơn / Trợ Lý RAG]"*; 2 CTA (`Khám phá gói giải pháp` → `/products`, `Tham gia Thí nghiệm F11` → `/experiment`); 2 trust chips thật (`3 Loại Giải Pháp` / `100% Grounding DB`, `Không Cần Tạo TK F11`). Cột phải hiển thị **3D Mockup Stack tương tác thật** (3 lớp preview Template / Prompt / Workflow + thanh địa chỉ `dreamteam.vn/store`). | **Xóa** `20 Dashboards / 400+ Pages`; **Xóa** `.dg-hero-scroll-cue` (*"Scroll to explore"* bị cấm); Typewriter tôn trọng `prefers-reduced-motion` và xuống dòng an toàn trên `375px`. |
| **3** | **6 Category Cards** (`#frameworks`, `.dg-frameworks-section`) | Nền `#fff`, viền đáy `1px`, lưới 6 cột ngang (`col-6 col-md-4 col-lg-2`), icon tròn `64×64px` nổi bật, tên + link `Live Preview ↗`. | **6 Nhóm Giải Pháp & Ngành Hàng Thực Chiến:**<br>1. `Template Website` (`/products?product_type=template`)<br>2. `Prompt Pack AI` (`/products?product_type=prompt_pack`)<br>3. `Workflow Tự Động` (`/products?product_type=workflow`)<br>4. `Shop Mỹ Phẩm` (`/products?industry=Mỹ phẩm`)<br>5. `Shop Thời Trang` (`/products?industry=Thời trang`)<br>6. `Gia Dụng & F&B` (`/products?industry=Gia dụng`) | Dùng icon SVG Lucide-style nội bộ thay vì file rời; link thật tới `/products` có query filter khớp `productListQuerySchema` & bắn `filter_applied`. |
| **4** | **Showcase Gallery + Filter Tabs** (`#showcase`, `.dg-bg-soft`) | Nền `#f8fafc`. Hàng pill tab ở giữa (`#dgFwTabs`) + lưới 3 cột `.dg-showcase-card` (aspect `16:10`, zoom ảnh khi hover, overlay tối kèm nút CTA, category label, H3, mô tả ngắn). | **Kho Gói Giải Pháp DreamTeam (Lọc Trực Tiếp DB):** Hàng tab lọc thật theo `product_type` (`Tất cả`, `Template Website`, `Prompt Pack`, `Workflow Tự Động`) gọi `GET /api/products` (hoặc lọc client kết hợp query). Card hiển thị `ProductPlaceholderFrame` (hoặc ảnh `.webp` thật), loại gói + badge `source_type` (`original`/`adapted`/`licensed`), tên gói, 1–2 dòng `short_description`, giá VND (`tabular-nums`) và CTA `Xem chi tiết` → `/products/[slug]`. | Khắc phục lỗi template gốc (tab chỉ đổi URL ngoài chứ không lọc card); giữ cố định `aspect-ratio` (`CLS = 0`); trên touch devices không ẩn nút chi tiết sau overlay hover. |
| **5** | **Dark Feature Highlights** (`#features`, `.dg-features-section.dg-dark-bg`) | Dải tối `#0d1512 -> #070a09` + radial glow Mint/Copper + dot grid. Lưới 4 cột card `.dg-feature-card` với thanh gradient `3px` trượt từ trái khi hover + icon hộp `56×56px` `.dg-grad-1..6`. | **8 Trụ Cột Hệ Thống & Nghiên Cứu (`F1–F12`):** Hiển thị lưới **4×2 (8 thẻ)** cô đọng, bỏ các ô trang trí thừa:<br>1. `Trợ lý RAG Gemini (F7)` — Grounding 100% ID thật.<br>2. `Phân nhánh AB/BA (F8)` — Đảo chéo khử hiệu ứng quen tay.<br>3. `Thẻ kịch bản F11` — Giao đề bài, bấm giờ thực, Likert 1–5.<br>4. `Minh bạch bản quyền (F3)` — Rõ `original / adapted / licensed`.<br>5. `Thanh toán Sandbox (F5)` — Mock Webhook HMAC ổn định 100%.<br>6. `Giao hàng Token (F6)` — Link tải có `expires_at` & giới hạn lượt.<br>7. `14 Sự kiện Tracking (F10)` — Đo lường đồng nhất hai nhánh.<br>8. `Bộ Eval Tự Động (F12)` — Kiểm định Accuracy, Hallucination & Cost/Query. | **Bỏ** `.dg-feature-index` (`01`, `02`... tránh vết rập khuôn `01/06` bị cấm); dùng màu card dark-surface tương thích Dark/Light qua biến CSS. |
| **6** | **Tech Stack Tiles** (`#stack`, `.dg-stack-section`) | Nền sáng có 2 glow mờ nhẹ góc đối xứng. Lưới 6 cột × 2 hàng (`12` ô `.dg-stack-tile` bo `16px`, icon tròn `56×56px` `.dg-grad-1..6`). | **12 Thành Phần Công Nghệ Thực Tế Của DreamTeam:** `Next.js App Router`, `TypeScript Strict`, `Supabase Postgres`, `pgvector 768d`, `Gemini Flash RAG`, `Zod Contract`, `HMAC Sandbox`, `Signed URL F6`, `14 Tracking Events`, `Eval Pipeline F12`, `Light & Dark Mode`, `Mobile 375px First`. | 100% đúng stack trong `package.json` và [`docs/decisions.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/decisions.md), không ghi thừa thư viện không dùng. |
| **7** | **Inner Pages Gallery** (`#pages`, `.dg-bg-soft`) | Lưới 3 cột `.dg-ip2-card`: ảnh `4:3`, scrim gradient emerald đậm ở đáy (`rgba(8,39,32,0.92)`), nút mũi tên tròn góc trên-phải, nút zoom góc trên-trái, tags pill phía dưới. | **Bản Đồ Các Màn Hình Nghiệp Vụ (`Routes`):** 6 thẻ màn hình cốt lõi dẫn thẳng tới route thật:<br>1. `/products` (Danh mục & Bộ lọc F2)<br>2. `/products/[slug]` (Chi tiết & Đổi khung Mobile F3)<br>3. `/experiment` (Phòng thí nghiệm AB/BA F11)<br>4. `/cart` & `/checkout` (Giỏ hàng & Webhook Sandbox F4–F5)<br>5. `/orders/[id]` (Kho bàn giao Token tải file F6)<br>6. `/admin/analytics` & `/auth` (Phân tích F10 & Tài khoản F1) | Thay `GLightbox` bằng preview modal `<dialog>` nội bộ hoặc link trực tiếp tới route thật; thẻ tag hiển thị chức năng thật (`F1–F11`). |
| **8** | **3-Card Carousel** (`#testimonials`) | `.dg-testi-nav-wrap` + 3 card xoay quanh tâm (`slide-active` phóng nhẹ `1.06`, 2 thẻ bên mờ `0.5` thu `0.92`) + 2 nút mũi tên tròn hai bên. | **Kịch Bản Thực Tế & Hồ Sơ Chủ Shop (F11):** **Xóa 100% testimonial bịa tiếng Anh.** Chuyển thành **Carousel 3 Thẻ Kịch Bản Thí Nghiệm & Chân Dung Chủ Shop Nhỏ** (`SC-01`: Shop Mỹ phẩm dưỡng da TikTok Shop ≤ 1.000.000đ; `SC-02`: Shop Thời trang nữ đa kênh Shopee/FB 1–3 người; `SC-03`: Shop Gia dụng tiện ích cần landing page 375px; `SC-04`: Shop mới mở cần bộ prompt không vi phạm chính sách). Mỗi thẻ gồm: Avatar minh họa vai trò/nhóm ngành (icon vector), mã kịch bản (`SC-01..04`), ngân sách tối đa (`tabular-nums`), mô tả tình huống thực tế và link `Làm kịch bản tại /experiment`. | Tuân thủ tuyệt đối `RULES.md` & `UI-BRIEF.md`: không bịa lời khen `5.0 ★ Verified Buyer`; không nạp thêm thư viện Swiper nếu dùng CSS Scroll Snap + nút điều hướng React nhẹ mượt. |
| **9** | **FAQ Accordion** (`#faqs`, `.dg-bg-soft.dg-features-section`) | `max-width: 820px`, danh sách câu hỏi `.dg-faq-item` viền mảnh bo `16px`, dấu `+` xoay `45deg` thành `×` khi mở. | **Giải Đáp Trước Khi Mua & Tham Gia Thí Nghiệm:** 6 câu hỏi thật bằng tiếng Việt tự nhiên: (1) Tham gia F11 có cần tạo tài khoản không? (2) Thanh toán Sandbox có trừ tiền thật không? (3) Ý nghĩa các nhãn bản quyền `original / adapted / licensed`? (4) Trợ lý ảo RAG gợi ý theo nguồn dữ liệu nào? (5) Quyền tải file & giới hạn token F6? (6) Dữ liệu thí nghiệm được ẩn danh như thế nào? | Bổ sung aria-expanded chuẩn accessibility; chỉ giữ nội dung phục vụ cửa hàng & nghiên cứu. |
| **10** | **Dark CTA Strip** (`.dg-cta-dark`) | Khối dark gradient bo `32px`, `padding: 56px`, chia `7/5`: Trái badge + H2 + mô tả + 2 nút; Phải ảnh mockup nghiêng `-2deg` + floating chip. | **Kêu Gọi Tham Gia Thí Nghiệm / Mua Gói:** Badge *"Sẵn sàng trải nghiệm ~5 phút"*; H2 *"Bắt đầu chọn gói chuẩn cho shop nhỏ hoặc tham gia Thí nghiệm A/B"*; 2 CTA (`Tham gia Thí nghiệm F11` → `/experiment`, `Xem toàn bộ gói số` → `/products`); Phải khung preview F11 nghiêng `-2deg` kèm chip *"Within-subject AB/BA • Miễn tạo tài khoản"*. | Không chứa số liệu bịa; responsive Mobile căn giữa gọn gàng và ẩn visual phụ hoặc thu gọn không tràn `375px`. |
| **11** | **Footer + Back-to-Top** (`.dg-footer`) | Nền dark `#0d1512 -> #070a09`, viền trên `3px` brand gradient, link đáy + social + nút Back-to-Top tròn góc dưới-phải. | **DreamTeam Footer & Smart Back-to-Top:** Thông tin đồ án **DreamTeam** (*Cửa hàng số cho chủ shop 1–3 người*), 2 cột link nội bộ sạch (`/products`, `/cart`, `/checkout`, `/auth`, `/experiment`, `/admin/analytics`, `/api/health`), tuyên bố Sandbox đo ý định mua + Nút **Progress + Back-to-Top 2-trong-1 (`conic-gradient`)**. | Bỏ mọi `href="#"` chết, bỏ form newsletter giả khi chưa có backend, bỏ link ThemeForest. |

### 2.2. Ánh xạ 2 mẫu Trang Trong từ `tailwind/` (`login.html`, `register.html`, `index.html`)

1. **`/auth` ← `tailwind/login.html` & `tailwind/register.html` (Split-Panel Auth):**
   - **Cột trái (Form ~50%, nội dung `max-width: 420px` căn giữa):** Logo DreamTeam, Tab chuyển `Đăng nhập` / `Đăng ký`, input có icon trái nội bộ (Email, Mật khẩu có nút ẩn/hiện, Họ tên & Ngành shop tùy chọn khi đăng ký), thanh **Password Strength Meter 4 nấc** (CSS thuần khi đăng ký), hộp **Callout thông tin F11** (*"Muốn thử thí nghiệm A/B? Không cần tạo tài khoản — Bắt đầu ngay tại `/experiment`"*).
   - **Cột phải (`hidden` trên mobile `<= 991px`, hiện `50%` trên desktop):** Nền Emerald gradient (`#146553 -> #0d1512`) + lưới chấm mờ, tiêu đề *"Một không gian chọn công cụ số rõ ràng cho shop nhỏ"*, 3 gạch đầu dòng giá trị thực (*Bàn giao file có token hạn dùng*, *Minh bạch bản quyền 3 cấp*, *Trợ lý RAG đối chiếu 100% từ DB*), và **1 Thẻ Kịch Bản Mẫu F11** (thay cho testimonial giả `Marcus Lee` & `12,000+ teams` trong file gốc).
2. **`/admin/analytics` ← `tailwind/index.html` (Dashboard KPI Cards & Hero Banner):**
   - **Executive Hero Banner:** Khối gradient Emerald (`#146553 -> #187f65 -> #0d1512`) bo `16px` có lưới vuông mờ, trạng thái `Live`, **Bộ lọc dữ liệu `include_simulated` (`false` mặc định / `true`)** nổi bật ngay đầu trang, và Banner cảnh báo hổ phách (`--status-warning-bg`) khi bật dữ liệu mô phỏng.
   - **4 Executive KPI Cards (`bento-grid` 4 cột desktop / 2 tablet / 1 mobile):** Theo cấu trúc card `DreamsCore` (icon chip góc trên-trái + badge delta/trạng thái góc trên-phải + nhãn phụ + số lớn `tabular-nums` + 2 dòng metadata phụ bên dưới) ánh xạ 1:1 vào `AdminDashboardSummaryDto`:
     1. *Tổng người tham gia (`total_participants`)* + đã consent (`consented_participants`).
     2. *Lượt hoàn thành kịch bản (`total_completed_runs`)* + tỷ lệ hoàn tất.
     3. *Đơn Sandbox (`orders_summary.paid_orders / total_orders`)* + tổng giá trị ý định mua (`total_sandbox_value_vnd`).
     4. *Chi phí RAG TB (`rag_metrics.avg_cost_per_message_usd`)* + P95 Latency (`p95_latency_ms`) & tổng token.
   - Bên dưới giữ nguyên **Bảng đối chứng A/B (`variants[]`)** và **Phễu 14 sự kiện chuẩn (`EVENT_NAMES`)** theo `RULES.md`.

---

## 3. Kho Hiệu Ứng Mẫu & Lộ Trình Nâng Cấp GPU (`0ms` Instant Entry)

### 3.1. Hiệu ứng sẵn có trong `script.js` & `style.min.css`

| Hiệu ứng gốc | Cơ chế trong `DreamsCore` | Đánh giá QA & Quyết định cho `DreamTeam` |
|---|---|---|
| **AOS Scroll Fade** | `AOS.init({ duration: 700, once: true, offset: 80 })` | **THAY THẾ:** Gây delay/ẩn phần tử lúc cuộn nhanh (vi phạm QA Cổng 2). Đổi sang reveal nhẹ GPU (`translate3d(0, 12px, 0)`, `opacity: 0.92 -> 1`, `rootMargin: '-6% 0px'`), **không ẩn Fold đầu**. |
| **Hero 3D Stack Tilt** | `mousemove` gán thẳng `transform: perspective(1000px) rotateX(...) rotateY(...)` mỗi pixel | **NÂNG CẤP GPU:** Bọc trong `requestAnimationFrame` throttle + `@media (hover: hover) and (pointer: fine)` + `prefers-reduced-motion: no-preference`, cache kích thước tránh reflow. |
| **Typewriter Headline** | `setTimeout` cắt chuỗi theo ký tự `charIndex` | **NÂNG CẤP TIẾNG VIỆT:** Dùng `Intl.Segmenter` / spread `[...str]` để không cắt đôi ký tự dấu; giữ `min-height` tránh `CLS`; ở `prefers-reduced-motion: reduce` hiện tĩnh cụm từ đầu tiên. |
| **Dot Grid Drift** | `@keyframes dgGridDrift` animate `background-position` | **NÂNG CẤP GPU:** Animate `transform: translate3d(...)` trên lớp pseudo-element kích thước dư thay cho `background-position` (chạy hoàn toàn trên Compositor thread). |
| **Header Progress Bar** | JS `onScroll` gán `style.width = pct + "%"` | **NÂNG CẤP GPU:** Dùng CSS Scroll-Driven Animation (`animation-timeline: scroll()`, `transform: scaleX(...)`, `transform-origin: left`), có listener `{ passive: true }` làm fallback cho trình duyệt cũ. |
| **Back-to-Top** | Hiện/ẩn tĩnh khi `scrollY >= 400` | **NÂNG CẤP (`frontend-techniques.md` #12):** Vòng tiến độ `conic-gradient` hiển thị `%` cuộn; trên mobile (`<= 991px`) chỉ hiện khi cuộn ngược lên để không đè CTA đáy màn hình; kiểm tra `maxScroll > 0`. |
| **CountUp.js UMD** | Thư viện ngoài `countUp.umd.js` + `IntersectionObserver` | **THAY BẰNG HELPER NỘI BỘ (~25 dòng):** `useCountUp` thuần `rAF` hỗ trợ hậu tố (`+`, `%`, `K`) theo Kỹ thuật #16, tôn trọng `prefers-reduced-motion`. |
| **Swiper + GLightbox + Bootstrap JS** | Kéo 3 plugin JS/CSS ngoài | **LOẠI BỎ:** Carousel 3 thẻ dùng CSS Scroll Snap + nút React `Prev/Next`; Mobile Drawer & Preview dùng native `<dialog>`; Accordion dùng `<button aria-expanded>` CSS Grid row/height. |

### 3.2. Chuẩn Mở Đầu Tức Thì (`0ms` — Kỹ thuật #21)

- **Tuyệt đối không dùng preloader chờ giả 1–4s.** Trang chủ và mọi trang con hiển thị ngay tại `0ms` (`opacity: 1` sẵn sàng trên toàn bộ Hero).
- Hoạt ảnh vào trang (nếu bật khi `prefers-reduced-motion: no-preference`) chỉ là micro-transition `<= 280ms` trên mockups phụ bằng `@starting-style` / CSS keyframe GPU `transform: translate3d(0, 12px, 0)`, **không chặn tương tác** và **không làm mờ chữ chính**.

---

## 4. Các Điểm Cần Khắc Phục Từ Template Gốc (Khớp `RULES.md` & 8 Cổng QA)

1. **Thay Bootstrap 5 & Icon Font (`lucide.css` hay bị lỗi ô vuông `▯`):**
   - `DreamsCore/index.html` phụ thuộc `bootstrap.min.css`, `bootstrap.bundle.min.js` và bộ icon font `.icon-*`. Khi font chưa kịp tải hoặc thiếu glyph sẽ hiện ô vuông `▯`.
   - **Khắc phục:** DreamTeam dùng 100% CSS Grid/Flexbox thuần nối với `tokens.css` & `themes.css`, và bộ **Inline SVG Lucide-style components** (`stroke="currentColor"`, `strokeWidth={1.75}`, `aria-hidden="true"`).
2. **Khóa Hover Trong `(hover: hover) and (pointer: fine)` & Bảo vệ Chức Năng Chạm:**
   - Trong `style.min.css`, `.dg-panel:hover`, `.dg-showcase-card:hover .dg-showcase-overlay`, `.dg-ip2-card:hover .dg-ip2-zoom` không bọc `@media (hover: hover)`, dễ gây kẹt overlay trên điện thoại cảm ứng.
   - **Khắc phục:** Toàn bộ hiệu ứng nhấc card / zoom ảnh / hiện overlay chỉ kích hoạt trong `@media (hover: hover) and (pointer: fine)`. Trên mọi thiết bị, tiêu đề card và nút bấm (`Xem chi tiết`) luôn hiển thị và bấm được ngay mà không cần hover.
3. **Sửa Lỗi Responsive Trên Mobile `375px`:**
   - Template gốc đặt `.dg-typewriter { white-space: nowrap }` và `.dg-section-heading h2 { white-space: nowrap }` (chỉ tắt ở `< 768px`), cùng `.dg-hero-visual { padding: 20px 20px 40px 46px }` và `.dg-cta-dark-chip` dịch âm `-14px` → dễ tràn ngang trên màn hình `375px` hoặc tablet `768px` khi gặp chữ tiếng Việt dài.
   - **Khắc phục:** Bỏ `white-space: nowrap` cho tiêu đề dài (thay bằng `text-wrap: balance`), hạ `--text-display` tại `<= 700px`, reset padding visual & tắt chip âm lấn biên trên `< 992px`, giữ `overflow-x: clip` ở `html/body` và `0px` tràn ngang tại `375px`.
4. **Sửa Lỗi Hardcode Light Theme & Đồng Bộ Dark Mode:**
   - `style.min.css` hardcode `background: #fff` trong 14 class (`.dg-panel`, `.dg-sub-heading`, `.dg-btn-outline`, `.dg-framework-card`, `.dg-stack-tile`, `.dg-testi2-card`, `.dg-faq-item`, `.dg-plan-card`, `.dg-browser-url`...) và gắn `<meta name="color-scheme" content="light">`.
   - **Khắc phục:** Toàn bộ màu nền, chữ, viền, đổ bóng trong DreamTeam đi qua biến CSS của `tokens.css` & `themes.css`; thêm `color-scheme: light dark` và lớp `.dg-dark-band` tách bạch dải tối cố định trên nền sáng.
5. **Xử lý Dấu Tiếng Việt Cho `Plus Jakarta Sans`:**
   - Khi tách dòng hoặc dùng `overflow: hidden` trên headline/card, luôn gắn `.text-line-clip` (`padding-bottom: 0.16em; margin-bottom: -0.16em`) tránh cắt chân dấu nặng/huyền (`ạ, ệ, ộ, ự`).
6. **Sạch 100% Nội Dung Thật Theo `RULES.md`:**
   - Xóa sạch chữ mẫu tiếng Anh, `Lorem ipsum`, testimonial bịa, nút newsletter giả, thẻ `cdn-cgi` ẩn và liên kết `href="#"` chết. Mọi dữ liệu sản phẩm, giá VND, giỏ hàng, thanh toán Sandbox, thí nghiệm F11, Chatbot RAG và Analytics đều lấy trực tiếp từ `src/services/**` và phát đủ **14 sự kiện tracking chuẩn**.
