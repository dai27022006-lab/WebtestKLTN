# UI-UX-SPEC.md — Đặc Tả Kiến Trúc Giao Diện, Trải Nghiệm & Design System

> **Phiên bản:** v1.0 (Pha 1A — `ai-template-1-ux`)  
> **Đối tượng bàn giao:** `ai-template-2-fe` (Frontend UI/Motion), `ai-skill-design-web` (API/Tracking Bridge), `web-qa-verifier` (Kiểm định QA 8 cổng).  
> **Tài liệu nguồn đối chiếu:** [`RULES.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/RULES.md), [`docs/API-CONTRACT.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/docs/API-CONTRACT.md), [`src/types/api.ts`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/src/types/api.ts), [`src/lib/tracking/events.ts`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/src/lib/tracking/events.ts), [`FINGERPRINTS.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/FINGERPRINTS.md), [`image-style.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/image-style.md).

---

## 1. Linh Hồn Thị Giác & Chân Dung Khách Hàng

- **Người dùng cốt lõi:** Chủ shop online nhỏ Việt Nam (quy mô **1–3 người**, bán trên Shopee, TikTok Shop, Facebook) và người tham gia thí nghiệm A/B (`F11`).
- **Tông thẩm mỹ — *Warm Editorial Craft / Thực dụng hiện đại*:**
  - Cảm giác như một **xưởng biên tập giải pháp số** gần gũi, minh bạch, dễ đọc nhanh trong lúc chủ shop đang bận xử lý đơn hàng.
  - Bề mặt giấy ấm (`#FAF7F2`), mực than ấm (`#1C1917`), đường viền mảnh (`1px` hairline) phân tách khối thông tin thay vì đổ bóng nặng nề; duy nhất 1 màu nhấn đất nung (`#B93815` Light / `#F06A3E` Dark).
- **Danh sách từ chối bắt buộc (Anti-AI Template):**
  - **CẤM** gradient tím neon (*AI-purple glow*), gradient chữ cho mọi heading, hoặc glow phát sáng ở card/button.
  - **CẤM** dùng `Inter` mặc định hoặc nhồi 3+ họ font.
  - **CẤM** lưới 3 card bằng phẳng giống hệt nhau ở trang chủ; thay bằng **Bento `1+2`** hoặc **Sticky 2 cột** / **Asymmetric Grid**.
  - **CẤM** số đếm trang trí sáo rỗng `01 / 06`, dòng `"Scroll to explore"`, `Lorem ipsum`, hoặc số liệu/testimonial bịa đặt.

---

## 2. Hệ Thống Design System (`src/styles/**`)

### 2.1. Bảng Màu 6 Vai Trò + 1 Hue Accent + Semantic States (`tokens.css` & `themes.css`)

Mọi component **bắt buộc** đọc màu qua CSS Custom Properties — tuyệt đối không hardcode mã hex hoặc `rgb(0,0,0)` trong component CSS/Tailwind để tránh lỗi tàng hình chữ khi đổi sang Dark Mode (lỗi QA Đợt 4).

| Vai trò Token | Token chính (`CSS var`) | Giá trị Light (`[data-theme="light"]`) | Giá trị Dark (`[data-theme="dark"]`) | Mục đích sử dụng |
|---|---|---|---|---|
| **1. Surface (Canvas)** | `--bg-canvas` *(alias `--surface`)* | `#FAF7F2` | `#141210` | Nền trang tổng thể (tránh trắng lóa `#FFF` và đen tuyền `#000`) |
| **2. Elevated Surface** | `--bg-surface` / `--bg-surface-subtle` | `#FFFFFF` / `#F2ECE3` | `#1E1B18` / `#282420` | Card sản phẩm, drawer, modal, input, banner đảo sắc nhẹ |
| **3. Primary Ink** | `--ink` *(alias `--ink-primary`)* | `#1C1917` | `#F5F1EB` | Tiêu đề, văn bản chính, giá VND (`>= 15:1` contrast) |
| **4. Muted Ink** | `--ink-soft` *(alias `--ink-muted`)* | `#57534E` | `#B5ADA3` | Mô tả phụ, nhãn metadata, placeholder (`>= 7:1` contrast) |
| **5. Border Hairline** | `--border-hairline` / `--border-strong` | `rgba(28,25,23,0.12)` / `0.24` | `rgba(245,241,235,0.12)` / `0.24` | Đường kẻ chia bảng, viền card, đường phân cách header |
| **6. Primary Accent** | `--accent` / `--accent-hover` / `--accent-soft` / `--accent-ink` | `#B93815` / `#9A2D10` / `10%` / `#FFFFFF` | `#F06A3E` / `#F4835E` / `16%` / `#141210` | CTA chính, trạng thái active, indicator (`>= 5.3:1` contrast ở cả 2 mode) |
| **Semantic: Success** | `--status-success` / `-bg` / `-border` | `#166534` / `#EEF7F1` | `#4ADE80` / `12%` | Đơn `paid`, bản quyền `original`, nút tải sẵn sàng |
| **Semantic: Warning** | `--status-warning` / `-bg` / `-border` | `#9A5B00` / `#FDF5E6` | `#FBBF24` / `12%` | Cảnh báo chế độ **Stub Chatbot**, cảnh báo dữ liệu `is_simulated = true` |
| **Semantic: Danger** | `--status-danger` / `-bg` / `-border` | `#B91C1C` / `#FEF0F0` | `#F87171` / `12%` | Đơn `failed`, lỗi validation, hết hạn/lượt tải `422` |
| **Semantic: Info** | `--status-info` / `-bg` / `-border` | `#1E5B70` / `#EDF5F8` | `#67B7D1` / `12%` | Trạng thái nhánh đối chứng `chatbot_off`, thông tin hướng dẫn F11 |

- **Quy tắc Theme Switcher:** Lưu vào `localStorage` (`dsa-theme`) và gắn `data-theme="light" | "dark"` lên `<html>` (mặc định `light`). Logo SVG của cửa hàng dùng `var(--brand-mark-ink)` và `var(--brand-mark-accent)` để tự đổi màu sạch sẽ không cần 2 file ảnh riêng.

### 2.2. Typography (`src/styles/typography.css`)

- **Tối đa 2 họ font** nạp qua `next/font/google` trong `src/app/layout.tsx`:
  1. `Be_Vietnam_Pro` (`subsets: ['vietnamese', 'latin']`, `weight: ['400', '500', '600', '700']`, `variable: '--font-be-vietnam-pro'`) — Display + UI Body.
  2. `JetBrains_Mono` (`subsets: ['vietnamese', 'latin']`, `weight: ['400', '500', '600']`, `variable: '--font-jetbrains-mono'`) — Giá tiền VND, `participant_code`, đồng hồ bấm giờ F11, slug/token, bảng số liệu F10.
- **Thang chữ & Quy tắc Việt hóa:**
  - `.type-display`: `clamp(2.125rem, 4.2vw + 0.75rem, 3.75rem)` trên Desktop; tự động hạ 1 bậc về `clamp(1.875rem, 6vw + 0.5rem, 2.375rem)` tại `@media (max-width: 700px)` để tiêu đề Hero không rớt 5–6 dòng trên mobile `375px`.
  - Độ rộng đoạn văn (`max-width: 62ch`), `text-wrap: balance` cho heading, `text-wrap: pretty` cho đoạn mô tả.
  - Mọi số tiền (`490.000đ`), thời gian (`02:28`), tỉ lệ (`84.5%`) dùng `.type-mono` (`font-variant-numeric: tabular-nums`) để không giật số khi đếm.
  - Mọi text có mask/clip dòng dùng class `.text-line-clip` (`padding-bottom: 0.16em; margin-bottom: -0.16em`) tránh cắt dấu huyền/nặng tiếng Việt.

### 2.3. Spacing & Nhịp Điệu (`src/styles/tokens.css`)

- Thang `4px`: `--space-1` (`4px`) → `--space-24` (`96px`).
- Khoảng trống trên tiêu đề section (`--heading-mt: clamp(32px, 4vw, 56px)`) luôn lớn hơn khoảng trống dưới tiêu đề (`--heading-mb: clamp(12px, 1.5vw, 20px)`).
- Padding section dùng `clamp(48px, 6vw, 96px)` theo chiều dọc và `clamp(16px, 4vw, 48px)` theo chiều ngang.

---

## 3. Khung Điều Hướng Toàn Cục & Layout Shell

### 3.1. Global Top Navigation (`Header`)

- **Chiều cao:** `64px` desktop, `56px` mobile `<= 700px`, nền `--bg-canvas` có hairline đáy `--border-hairline`.
- **Cấu trúc tối giản 1 hàng:**
  - Trái: Brand Mark SVG + tên cửa hàng (vd: *Tiệm Số Thực Chiến* / *Digital Store Advisor*).
  - Giữa (Desktop): 3 liên kết chính: `Sản phẩm` (`/products`), `Thí nghiệm A/B (F11)` (`/experiment`), `Phân tích (Admin)` (`/admin/analytics` — chỉ hiện hoặc gắn nhãn rõ khi đăng nhập `admin`).
  - Phải:
    - Nút chuyển Light/Dark (`aria-label="Đổi giao diện Sáng/Tối"`).
    - Nút Giỏ hàng (`/cart`) kèm badge số lượng từ `CartDto.item_count` (`tabular-nums`).
    - Nút Tài khoản (`/auth` hoặc menu `full_name` + Đăng xuất).
  - Mobile `<= 700px`: Hiện Brand Mark, Giỏ hàng, Theme Toggle, và nút Menu (`<dialog>` hoặc slide-down panel sạch sẽ, có focus trap).
- **Ngoại lệ trang `/experiment`:** Ẩn thanh điều hướng mua sắm rườm rà khi người tham gia đang trong phiên làm bài; thay bằng **Focus Experiment Bar** (hiển thị `participant_code`, bước `1/2` hoặc `2/2`, biến thể hiện tại).

### 3.2. F11 Scenario Context Bar (Thanh Giữ Bối Cảnh Kịch Bản Toàn Cục)

- **Điều kiện hiển thị:** Xuất hiện ngay dưới Header khi phiên làm việc đang có `scenario_run_id` chưa hoàn thành (trên `/products`, `/products/[slug]`, hoặc khi mở Chatbot).
- **Thành phần trên thanh (`--scenario-bar-height: 52px` trên desktop, xếp gọn 2 dòng trên mobile `375px`):**
  1. Mã phiên + Nhánh hiện tại (`P-018 • Lượt 1/2 • Có trợ lý ảo` hoặc `Không trợ lý ảo`).
  2. Tóm tắt đề bài kịch bản (1 dòng cắt gọn + nút `Xem đề bài` mở popover đọc đầy đủ `prompt_text`, `industry`, `budget_vnd`).
  3. Đồng hồ thời gian đã trôi qua (`tabular-nums`, tính từ `started_at`).
  4. Nút `Về trang chốt gói (/experiment)`.

---

## 4. Đặc Tả Page Grammar & Feeling Curve Theo Từng Màn Hình

### 4.1. Trang Chủ `/` — *Cửa hàng & Lối vào Thí nghiệm F11*

- **Page Grammar:** **2. Chaptered editorial** (bố cục biên tập phân chương dứt khoát, xen Bento `1+2` và Sticky 2 cột).
- **Danh sách CẤM (Forbids):** Cấm lưới 3 card bằng nhau; cấm preloader giả; cấm gradient drift trôi lơ lửng; cấm số đếm `01/06`; cấm fake social proof.
- **Feeling Curve (5 chặng, không trùng cảm xúc liền kề):**

| STT | Cảm xúc | Thành phần trên màn hình | Chi tiết UI & Component |
|---|---|---|---|
| **1** | **Tin cậy & Rõ ràng** *(Grounded Clarity)* | **Asymmetric Editorial Hero Split** | Cột trái (`55%`): Eyebrow *"Dành cho shop nhỏ 1–3 người"*, Headline `type-display` 1 câu súc tích + 2 CTA rõ (`Khám phá gói giải pháp` → `/products`, `Tham gia Thí nghiệm F11` → `/experiment`).<br>Cột phải (`45%`): `WorkspaceShowcaseFrame` (HTML/CSS/SVG framing xếp lớp nhẹ 3 định dạng: Template, Prompt Pack, Workflow — hoặc ảnh neo `ASSET-HERO-OPT`). |
| **2** | **Đồng cảm vấn đề** *(Empathic Recognition)* | **Sticky 2-Column Pain-to-Tool** *(kiểu `IT-Infinite`)* | Cột trái ghim (`position: sticky; top: 96px`): Câu hỏi trọng tâm của chủ shop nhỏ (làm web đắt, viết mô tả chậm, sót đơn).<br>Cột phải trôi 3 hàng nhu cầu có tương tác (bấm/hover đổi chế độ xem trước bên `WorkspaceShowcaseFrame` hoặc highlight trực tiếp). **Không ẩn tiêu đề khi hover.** |
| **3** | **Hào hứng khám phá — PEAK** *(Focused Discovery)* | **Bento `1+2` Gói Giải Pháp Nổi Bật** *(kiểu `Exploreist home-2`)* | Lấy tối đa **3 gói tiêu biểu** từ `GET /api/products?limit=3`: 1 card dọc lớn bên trái (Template flagship) + 2 card ngang xếp chồng bên phải (Prompt Pack & Workflow). Mỗi card có `ProductPlaceholderFrame`, loại gói, ngành, giá VND (`tabular-nums`), và badge `source_type`. |
| **4** | **Tò mò khoa học & Minh bạch** *(Research Invitation)* | **Dải Đảo Sắc Ấm — Mời Tham Gia Thí Nghiệm F11** (`--bg-surface-subtle`) | Giải thích ngắn gọn câu hỏi nghiên cứu: *"Trợ lý ảo có giúp chủ shop chọn gói nhanh và tự tin hơn?"*. Hiển thị 3 bước tham gia thực tế (Đồng ý ẩn danh → Làm 2 kịch bản ~5 phút → Chấm độ tự tin 1–5) + nút `Bắt đầu ngay (Không cần tạo tài khoản)` → `/experiment`. |
| **5** | **An tâm bản quyền & Bàn giao** *(Calm Assurance)* | **Close Pattern — Cam kết Nguồn gốc & Giao hàng số** | 2 khối song song gọn: (A) Minh bạch bản quyền `original` / `adapted` / `licensed` theo `RULES.md` Mục 11; (B) Quy trình nhận file sau thanh toán sandbox qua token có hạn (`F6`) + Footer tối giản. |

- **Peak:** Chặng 3 (Bento `1+2` Gói Giải Pháp).
- **Signature Move:** **Interactive Need-to-Frame Switcher** (ở Chặng 2 hoặc Hero: chọn 1 trong 3 loại nhu cầu *Trang bán hàng* / *Bộ Prompt viết bài* / *Workflow chốt đơn* để preview framing chuyển trạng thái mượt bằng CSS `transform`/`opacity`).
- **Mobile (`<= 700px`):** Hero xếp dọc (chữ trước, showcase gọn 4:3 sau), Bento `1+2` rớt về stack 1 cột thẳng hàng, tắt hiệu ứng `sticky` 2 cột ở Chặng 2.

---

### 4.2. Trang Danh Mục `/products` — *Lọc, Tìm Kiếm & Ngữ Cảnh Kịch Bản*

- **Page Grammar:** **6. Gallery / Catalog** (tập trung quét nhanh, lọc chính xác, giữ ngữ cảnh F11).
- **Danh sách CẤM (Forbids):** Cấm hero ảnh lớn chiếm chỗ đẩy danh mục xuống dưới fold; cấm nhồi mô tả dài > 2 dòng trên card; cấm ẩn tiêu đề card khi hover.
- **Feeling Curve (3 chặng):**
  1. **Chủ động tìm kiếm** *(Active Control)* → **Compact Utility Header + Sticky Filter Ribbon**: Ô tìm kiếm từ khóa (`search_used`), chip lọc theo Loại (`Tất cả`, `Template`, `Prompt Pack`, `Workflow`), Dropdown/Chip Ngành hàng (`industry` lấy từ dữ liệu thực, vd: Mỹ phẩm, Thời trang, Gia dụng...), Khoảng giá (`Dưới 300k`, `300k–700k`, `Dưới 1 triệu`, hoặc `min_price`/`max_price`), Sắp xếp (`Mới nhất`, `Giá tăng dần`, `Giá giảm dần`). Bấm bất kỳ bộ lọc nào gọi `GET /api/products` & bắn `filter_applied`.
  2. **So sánh thực tế — PEAK** *(Clear Evaluation)* → **Asymmetric Catalog Grid**: Desktop 2–3 cột thoáng (với card đầu tiên mỗi hàng hoặc featured type có độ nhấn viền tinh tế, hoặc zic-zac nhẹ theo hàng không quá lố để vẫn dễ so sánh giá), Mobile `375px` 1 cột gọn rõ. Mỗi card hiển thị: `ProductPlaceholderFrame` (`4:3`), Badge loại + `source_type`, Tên gói, 1 dòng `short_description`, Ngành hàng, Giá VND (`type-price`), 2 nút: `Xem chi tiết` và `Thêm vào giỏ` *(hoặc thêm nút `Chọn cho kịch bản` khi đang chạy F11)*.
  3. **Chốt bước tiếp theo** *(Clear Next Step)* → **Pagination Bar + F11 Context Summary**.
- **Trạng thái bắt buộc:**
  - *Loading:* Skeleton card giữ đúng `aspect-ratio: 4 / 3` + chiều cao text ước lượng (`CLS = 0`).
  - *Empty:* `EditorialEmptyIllustration` + thông điệp *"Chưa tìm thấy gói phù hợp với bộ lọc hiện tại"* + nút `Xóa toàn bộ bộ lọc`.
  - *Error:* Banner thông báo lỗi từ `ApiError.error.message` + nút `Thử tải lại`.

---

### 4.3. Trang Chi Tiết Sản Phẩm `/products/[slug]` — *Preview, Bản Quyền & Bàn Giao*

- **Page Grammar:** **7. Split stage** (cột trái cuộn chi tiết & preview, cột phải ghim thông số chốt đơn / chọn gói F11).
- **Danh sách CẤM (Forbids):** Cấm thiếu `source_type` hoặc `license_note`; cấm nhồi carousel thừa thư viện; cấm trôi cả 2 cột rối mắt trên desktop.
- **Feeling Curve (3 chặng):**
  1. **Định vị nhanh** *(Context Orientation)* → Breadcrumb (`Sản phẩm / Ngành / Tên gói`) + Scenario Return Pill (nếu đang trong F11).
  2. **Kiểm chứng cấu trúc — PEAK** *(Tactile Inspection)* → **2-Column Split Stage**:
     - *Cột trái (Scrollable):*
       - **Interactive Placeholder Preview Stage:** Hiển thị `ProductPlaceholderFrame` cỡ lớn kèm **Signature Move: Nút chuyển Viewport `Desktop (1280px)` ↔ `Mobile (375px)`** bằng CSS thuần (cho phép chủ shop hình dung template/workflow hiển thị ra sao trên điện thoại khách hàng), kèm link `Mở Demo trực tiếp` nếu `demo_url` khác `null`.
       - Khối **Gói này bao gồm gì (`specs.deliverables`)**, **Nền tảng phù hợp (`specs.platforms`)**, **Tech stack (`specs.tech_stack`)**, và **Hướng dẫn bàn giao & cài đặt (`specs.guide_summary`, `specs.setup_time_minutes`)**.
     - *Cột phải (Sticky Dock `top: 88px`):*
       - Tên gói, Giá VND (`type-price` cỡ lớn), Quy mô shop phù hợp (`specs.target_shop_size`).
       - **Hộp Minh Bạch Bản Quyền (bắt buộc):** Badge `source_type` (`original` = *Nhóm tự thiết kế gốc*, `adapted` = *Điều chỉnh có ghi nguồn*, `licensed` = *Bản quyền hợp lệ*) + toàn văn `license_note`.
       - Hành động chính: Nút `Thêm vào giỏ hàng` (`POST /api/cart` + bắn `add_to_cart`) và nút `Mua ngay (Sandbox)`.
       - **Nếu đang trong F11 (`scenario_run_id` active):** Hiện thêm khối nổi bật `Chọn gói này cho Kịch bản hiện tại` → dẫn thẳng về `/experiment?selected_product_id=...` để chấm độ tự tin 1–5.
  3. **Liên kết an tâm** *(Gentle Continuation)* → 2 gói gợi ý cùng ngành hoặc nút quay lại `/products`.
- **Tracking:** Bắn `product_viewed` ngay khi trang load dữ liệu sản phẩm thành công.
- **Mobile (`<= 700px`):** Bỏ `sticky` cột phải; hiển thị thanh CTA cố định gọn ở đáy màn hình (`Giá VND` + `Thêm vào giỏ` / `Chọn cho kịch bản`) tôn trọng `safe-area-inset-bottom`.

---

### 4.4. Giỏ Hàng & Thanh Toán Sandbox `/cart` & `/checkout`

- **Page Grammar:** **3. Live surface** (mặt phẳng giao dịch thực dụng, không animation rườm rà, ưu tiên minh bạch giá DB và luồng test webhook).
- **Danh sách CẤM (Forbids):** Cấm tự cộng giá từ `localStorage` để gửi lên server (luôn dùng `CartDto` trả về từ `GET /api/cart`); cấm đánh lừa người dùng rằng đây là cổng thanh toán tiền thật.
- **Feeling Curve (3 chặng):**
  1. **Kiểm tra đơn gọn nhẹ** *(Ledger Clarity)* → Stepper 3 bước ở đỉnh (`1. Giỏ hàng` → `2. Thanh toán Sandbox` → `3. Nhận file`).
  2. **Đối chiếu & Mô phỏng thanh toán — PEAK** *(Confident Execution)*:
     - **Ở `/cart`:** Bảng/danh sách item (`ProductPlaceholderFrame` nhỏ, tên gói, `product_type`, đơn giá VND, nút xóa `DELETE /api/cart`) + Khối Tóm tắt tạm tính (`subtotal_vnd`) + nút `Tiến hành Thanh toán Sandbox` → `/checkout`. *(Empty state: `EditorialEmptyIllustration` + nút `Xem danh mục sản phẩm`.)*
     - **Ở `/checkout`:**
       - Cột trái: Tóm tắt đơn hàng chốt giá từ server. Khi bấm `Tạo đơn Sandbox`, gọi `POST /api/orders` (gắn `assignment_id`, `visitor_id` nếu có) + bắn `checkout_started`.
       - Cột phải (**Signature Move — Mock Sandbox Webhook Simulator Panel**): Sau khi có `CreateOrderResponse` (`order`, `payment_intent`), hiển thị rõ hộp mô phỏng cổng thanh toán nội bộ (`mock_sandbox`) với mã đơn `order_code`, số tiền `amount_vnd`, và **2 nút kiểm thử luồng rõ ràng**:
         1. `Mô phỏng Thanh toán Thành công (Paid)` → gửi webhook `status: 'paid'`, bắn sự kiện `purchase`, và chuyển sang `/orders/[id]`.
         2. `Mô phỏng Thanh toán Thất bại (Failed)` → gửi webhook `status: 'failed'`, hiển thị trạng thái lỗi rõ ràng + nút `Thử thanh toán lại`.
       - Ghi chú chân khối: *"Thanh toán Sandbox phục vụ đo ý định mua trong đồ án nghiên cứu, không thu tiền thật."*

---

### 4.5. Đơn Hàng & Giao Hàng Số `/orders/[id]` (F6)

- **Page Grammar:** **3. Live surface** (bảng trạng thái đơn & kho tải file an toàn).
- **Feeling Curve (2 chặng):**
  1. **Xác nhận trạng thái đơn** *(Instant Status)* → Header đơn hàng (`order_code`, `created_at`, badge trạng thái `pending` / `paid` / `failed`, tổng tiền `total_vnd`, `paid_at`). Nếu `failed` hoặc `pending`, hiện nút quay lại thanh toán sandbox hoặc liên hệ hỗ trợ.
  2. **Nhận bàn giao file — PEAK** *(Secure Fulfillment)* → Khi `status === 'paid'`, hiển thị danh sách `download_grants`:
     - Tên sản phẩm tương ứng từ `items`.
     - Thanh trạng thái lượt tải: `Đã tải X / Y lượt` (`download_count / max_downloads`, `tabular-nums`).
     - Thời hạn link: `Hết hạn lúc DD/MM/YYYY HH:mm` (`expires_at`).
     - Nút `Tải gói sản phẩm`: Gọi `GET /api/downloads/:token`, nhận `DownloadAccessResponse.download_url` (Signed URL), kích hoạt tải file và bắn `download_completed`.
     - **Xử lý lỗi `422` / `403` rõ ràng:** Nếu trả về `DOWNLOAD_EXPIRED` hoặc `DOWNLOAD_LIMIT_EXCEEDED`, disable nút tải và hiện badge cảnh báo giải thích lý do ngay trên dòng grant đó.

---

### 4.6. Chế Độ Thí Nghiệm A/B `/experiment` (F11)

- **Page Grammar:** **1. Filmic one-shot** (trải nghiệm tập trung, tuyến tính từng chặng, loại bỏ nhiễu).
- **Danh sách CẤM (Forbids):** Cấm lộ `expected_product_id` hoặc `rubric_note` dưới mọi hình thức trong lúc làm bài; cấm cho phép tự chuyển đổi `chatbot_on`/`chatbot_off` bằng tay (chỉ server quyết định theo `step_order` và `variant` AB/BA); cấm ép đăng ký tài khoản email/mật khẩu mới được tham gia.
- **Feeling Curve (4 chặng tuyến tính khép kín):**

| Pha | Cảm xúc | Thành phần giao diện | API & Tracking liên quan |
|---|---|---|---|
| **Pha 1: Consent & Hồ sơ ngắn** | **Minh bạch & An tâm** *(Informed Trust)* | Màn hình đồng ý tham gia nghiên cứu: giải thích mục đích ẩn danh, dữ liệu thu thập chỉ gắn với `participant_code`, thời gian dự kiến ~5 phút (2 kịch bản). Form phụ tùy chọn `shop_profile` (ngành hàng, quy mô 1–3 người, kênh bán, vai trò `shop_owner` / `student_roleplay`) + checkbox bắt buộc `Tôi đồng ý tham gia`. | `POST /api/experiments/consent` → Nhận `participant_code` (vd `P-018`), `variant` (`abba_on_first` / `abba_off_first`), `active_variant`. |
| **Pha 2: Thẻ Kịch Bản & Bấm Giờ** | **Tập trung nhiệm vụ** *(Mission Clarity)* | Hiển thị `participant_code`, thanh bước `Lượt 1 / 2` hoặc `Lượt 2 / 2`, **AB/BA Condition Banner** báo rõ lượt này **CÓ Trợ lý ảo** (`chatbot_on`, nút mở Chatbot nổi bật) hay **KHÔNG có Trợ lý ảo** (`chatbot_off`, hướng dẫn tự duyệt danh mục `/products`).<br>Hiển thị Thẻ Kịch Bản (`scenario.code`, `title`, `prompt_text`, `industry`, `budget_vnd`) + **Đồng hồ đếm thời gian thực (`tabular-nums`)** + nút `Đi tới Danh mục sản phẩm để chọn gói` (`/products`). | `GET /api/scenarios/next` → Nhận `scenario_run_id`, `scenario`, `started_at`. Bắn `scenario_started`. |
| **Pha 3: Chốt Gói & Chấm Tự Tin — PEAK** | **Quyết đoán & Phản hồi** *(Decisive Reflection)* | Sau khi người tham gia chọn 1 gói (từ `/products`, `/products/[slug]` hoặc chọn trực tiếp trong dropdown/card tại `/experiment`), hiển thị tóm tắt gói đã chọn (`selected_product_id`) + **Thanh Likert 1–5 chạm lớn** (*1: Rất không chắc chắn → 5: Rất tự tin*) + ô ghi chú lý do ngắn (`decision_note`, tùy chọn) + nút `Xác nhận hoàn thành kịch bản`. | `POST /api/scenarios/:id/complete` + bắn `scenario_completed`. |
| **Pha 4: Chuyển lượt / Kết thúc** | **Hoàn tất nhẹ nhàng** *(Satisfying Closure)* | Nếu `has_next_scenario === true`: Hiện màn chuyển tiếp ngắn thông báo vừa xong lượt 1, lượt 2 sẽ **đảo trạng thái trợ lý ảo** (`AB → BA` hoặc `BA → AB`) + nút `Nhận kịch bản tiếp theo`.<br>Nếu `is_finished === true`: Hiện màn hình cảm ơn kèm `participant_code` và nút quay lại cửa hàng tự do. | Gọi lại `GET /api/scenarios/next` cho lượt 2. |

- **Signature Move:** **AB/BA Crossover State Indicator + Live Tabular Timer + Tactile Likert 1–5 Selector** (các nút 1–5 có nhãn mô tả rõ bên dưới, vùng chạm tối thiểu `48×48px` trên mobile `375px`).

---

### 4.7. Chatbot Drawer / Floating Panel (F7 Overlay)

- **Điều kiện hiển thị tuyệt đối:**
  - **CHỈ** render nút kích hoạt nổi (Floating Action Button) và Panel khi `active_variant === 'chatbot_on'` (khi `chatbot_off`, không render cả nút lẫn DOM drawer, đồng thời backend chặn `403 CHATBOT_DISABLED_FOR_VARIANT`).
- **Vị trí & Kích thước Responsive:**
  - *Desktop (`> 700px`):* Nút neo ở góc dưới-phải (`bottom: 24px; right: 24px`); khi mở trượt thành Side Drawer rộng `400px`, cao `min(680px, 85dvh)` bo góc `--radius-lg`, có viền `--border-strong` và `--shadow-lg` (không chặn toàn màn hình để user vẫn nhìn thấy sản phẩm bên trái).
  - *Mobile (`<= 700px`):* Khi mở bung thành Bottom Sheet / Full-height Modal (`100dvh`, `overscroll-behavior: contain`) có nút Đóng `44×44px` rõ ràng ở góc trên-phải.
- **Cấu trúc bên trong Panel:**
  1. **Header + Badge Trạng thái LLM (Bắt buộc):**
     - Tên: *Trợ lý Tư vấn Gói Số*.
     - **Status Badge:**
       - Nếu đang chạy LLM thật (`model_name` là model Gemini thật): Badge xanh/trung tính *"AI RAG (Gemini) • Chỉ gợi ý gói có trong DB"*.
       - Nếu đang ở chế độ **Stub / Chưa nối LLM key thật** (vd `model_name` chứa `stub`/`mock` hoặc flag cấu hình server): Badge cảnh báo màu hổ phách (`--status-warning-bg` / `--status-warning`): **"Chế độ Stub — Chưa nối LLM thật (Dữ liệu thử nghiệm)"** để người dùng và hội đồng nhận diện minh bạch ngay trên UI.
  2. **Vùng Hội Thoại:**
     - Lời chào ban đầu + tối đa 3 Quick Prompt Chips gợi ý theo ngành chủ shop hay hỏi (vd: *"Shop mỹ phẩm ngân sách dưới 1 triệu"*, *"Cần prompt viết mô tả TikTok Shop"*).
     - Bong bóng tin nhắn User (`--accent` / `--accent-ink` hoặc `--bg-surface-subtle` dễ đọc) & Assistant (`--bg-surface` viền hairline).
     - **Suggested Product Cards (tối đa 3 card từ `assistant_message.suggested_products`):** Mỗi card hiện thumbnail framing nhỏ, tên gói, `product_type`, giá VND (`tabular-nums`), và dòng `reason` ngắn gọn từ RAG. **Khi bấm vào card:** bắn sự kiện `suggestion_clicked` (kèm `product_id`, `session_id`, `scenario_run_id`) rồi mở `/products/[slug]`.
  3. **Input Bar:** Textarea tự giãn tối đa 4 dòng (giới hạn `1500` ký tự theo `sendChatMessageSchema`) + nút Gửi + trạng thái `isLoading` (*"Đang tra cứu danh mục..."*) + xử lý lỗi `429 RATE_LIMIT_EXCEEDED` hoặc `422 CONSENT_REQUIRED` ngay trong luồng chat.

---

### 4.8. Đăng Nhập / Đăng Ký `/auth` (F1) & Dashboard Phân Tích `/admin/analytics` (F10)

- **Page Grammar:** **3. Live surface (Operational)** — Rõ ràng, trung thực dữ liệu, không trang trí thừa.
- **Màn hình `/auth`:**
  - Khung card căn giữa (`max-width: 440px`), chuyển tab mượt `Đăng nhập` / `Đăng ký`.
  - Form Đăng ký gồm: `full_name`, `email`, `password`, `shop_category` (tùy chọn).
  - **Callout quan trọng (`--status-info`):** *"Bạn đang muốn tham gia thí nghiệm F11? Không cần đăng nhập hoặc tạo tài khoản — Bấm vào đây để bắt đầu ngay"* → link `/experiment`.
- **Màn hình `/admin/analytics` (`role === 'admin'`):**
  - **Thanh Kiểm Soát Dữ Liệu Mô Phỏng (`is_simulated`) — Bắt buộc theo `RULES.md` Mục 12:**
    - Toggle/Segmented Filter: `Chỉ dữ liệu thật (Mặc định: include_simulated=false)` vs `Bao gồm dữ liệu mô phỏng (include_simulated=true)`.
    - **Banner Cảnh Báo Tĩnh Khi Bật `include_simulated=true`:** Dải `--status-warning-bg` toàn chiều rộng ghi rõ: *"ĐANG HIỂN THỊ DỮ LIỆU MÔ PHỎNG (`is_simulated = true`) — Tuyệt đối không dùng bộ số liệu này để kết luận báo cáo thí nghiệm."*
  - **4 Khối Dữ Liệu Khớp `AdminDashboardSummaryDto`:**
    1. **KPI Tổng Quan (4 ô số `tabular-nums`):** Tổng người tham gia (`total_participants`), Đã consent (`consented_participants`), Lượt hoàn thành (`total_completed_runs`), Tổng đơn sandbox (`orders_summary.paid_orders` / `total_orders` kèm nhãn *"Ý định mua sandbox"*).
    2. **Bảng So Sánh Đối Chứng A/B (`variants[]`):** So sánh `chatbot_on` vs `chatbot_off` trên 5 cột: Số lượt (`completed_runs`), Tỉ lệ chọn đúng (`accuracy_rate`), Thời gian TB (`avg_duration_seconds`), Độ tự tin TB (`avg_confidence_score`), Số ý định mua (`sandbox_purchase_count`).
    3. **Phễu 14 Sự Kiện Chuẩn (`EVENT_NAMES`):** Hiển thị 14 tên sự kiện từ `src/lib/tracking/events.ts` tách rõ 3 sự kiện chỉ phát sinh khi `chatbot_on` (`chat_opened`, `chat_message_sent`, `product_suggested`).
    4. **Chi Phí & Hiệu Năng RAG (`rag_metrics`):** Tổng tin nhắn bot, Độ trễ TB (`avg_latency_ms`), P95 Latency (`p95_latency_ms`), Tổng token (`total_tokens_used`), Tổng chi phí USD (`total_cost_usd`), và Chi phí trung bình/lượt (`avg_cost_per_message_usd`).

---

## 5. Bản Đồ Tích Hợp UI ↔ API Contract & 14 Sự Kiện Tracking

> Bảng đối chiếu để `ai-template-2-fe` và `ai-skill-design-web` nối đúng endpoint & sự kiện theo `RULES.md` Mục 9–10.

| Màn hình / Tương tác | API Endpoint | Tracking Event (`POST /api/events`) | Ghi chú bảo mật / Trạng thái |
|---|---|---|---|
| Mở / chuyển bất kỳ trang nào | — | `page_viewed` | Gửi kèm `visitor_id`, `assignment_id`, `variant`, `scenario_run_id` (nếu có) |
| Tìm kiếm ở `/products` | `GET /api/products?q=...` | `search_used` | Debounce `350ms` hoặc khi submit Enter |
| Bấm chip lọc ngành / loại / giá | `GET /api/products?industry=...` | `filter_applied` | Gửi `properties: { industry, product_type, min_price, max_price }` |
| Mở trang `/products/[slug]` | `GET /api/products/:id` | `product_viewed` | Hiển thị `source_type`, `license_note` |
| Consent tại `/experiment` | `POST /api/experiments/consent` | — | Sinh `participant_code`, lưu session HTTP-only |
| Nhận thẻ kịch bản F11 | `GET /api/scenarios/next` | `scenario_started` | Không trả `expected_product_id` về client |
| Hoàn thành thẻ kịch bản F11 | `POST /api/scenarios/:id/complete` | `scenario_completed` | Gửi `selected_product_id`, `confidence_score` (1–5) |
| Mở Chatbot Drawer | `GET /api/chat/sessions` | `chat_opened` | Chỉ cho phép khi `active_variant === 'chatbot_on'` |
| Gửi câu hỏi cho Chatbot | `POST /api/chat` | `chat_message_sent` | Server chặn `403` nếu `chatbot_off` |
| Bot trả về `suggested_products` | *(response của `/api/chat`)* | `product_suggested` | Chỉ hiển thị sản phẩm đã ground tồn tại trong DB |
| Bấm vào card gợi ý trong Chatbot | Điều hướng `/products/[slug]` | `suggestion_clicked` | Giữ `scenario_run_id` nếu đang chạy F11 |
| Bấm `Thêm vào giỏ` | `POST /api/cart` | `add_to_cart` | Server hydrate giá VND từ bảng `products` |
| Mở/bắt đầu thanh toán `/checkout` | `POST /api/orders` | `checkout_started` | Cấm client gửi giá; server tự tính `total_vnd` |
| Webhook Sandbox trả `paid` | `POST /api/payments/webhook` | `purchase` | Đánh dấu ý định mua sandbox; phát hành `download_grants` |
| Tải file thành công ở `/orders/[id]` | `GET /api/downloads/:token` | `download_completed` | Kiểm tra `expires_at` và `max_downloads` |

---

## 6. Quy Chuẩn Chống Lỗi QA (8 Cổng Bắt Buộc Cho `ai-template-2-fe` & `web-qa-verifier`)

Mọi code UI và motion dựng từ spec này **phải** tuân thủ toàn bộ 8 cổng kiểm định từ Đợt 1 → Đợt 4:

1. **Không Preloader Giả:** Tuyệt đối không đặt màn hình chờ `1–4s` lúc mở trang chủ hoặc khi chuyển trang con (`delay(0)` tức thì).
2. **Không `.fade-anim` Che Nội Dung:** Không đặt `opacity: 0` với ngưỡng kích hoạt trễ (`top 85%`) hay `delay >= 0.25s` làm người dùng thấy mảng trắng khi cuộn nhanh. Mọi nội dung chính trên fold đầu tiên phải hiển thị sẵn sàng ngay (`opacity: 1`).
3. **Skeleton & `aspect-ratio` Cố Định (`CLS = 0`):** Mọi ảnh và placeholder framing `4:3` / `16:9` phải khai báo rõ `aspect-ratio` để không nhảy layout khi dữ liệu về.
4. **Không Nạp Thừa / Trùng Thư Viện:** Không kéo `Swiper` + `Owl`, `WOW.js`, hay các GSAP plugin không dùng. Ưu tiên CSS transitions/animations nhẹ (`transform`, `opacity`) chạy trên GPU.
5. **Tôn Trọng `prefers-reduced-motion` & Touch Devices:** Mọi chuyển động trang trí (preview switcher, drawer slide) tự động tắt hoặc chuyển về tức thì khi `prefers-reduced-motion: reduce)`. Mọi hover effect bọc trong `@media (hover: hover) and (pointer: fine)` — không ẩn tiêu đề card khi hover.
6. **Không Hardcode Màu Light Sang Dark:** Mọi gradient chữ, border, shadow, SVG logo đều đọc từ biến CSS trong `tokens.css` & `themes.css`.
7. **Null-Check & Cleanup An Toàn:** Không dùng `window.onscroll = ...` hay `setInterval` trong `mousemove`; không gọi `ScrollTrigger.getAll().kill()` toàn cục nếu có dùng GSAP `matchMedia`.
8. **Responsive Sạch Tại `375px` & Nội Dung Thật:**
   - Kiểm tra `0px` tràn ngang (`horizontal overflow`) tại `375px` cho tất cả 8 màn hình.
   - Touch target tối thiểu `44×44px` cho nút bấm, bộ lọc chip, nút Likert `1–5` và nút Đóng Drawer.
   - `0%` nội dung `Lorem ipsum`, `href="#"` chết, hay lỗi copy-paste mô tả trùng lặp.
