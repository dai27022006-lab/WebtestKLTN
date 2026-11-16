# Quy Chuẩn Phong Cách & Danh Sách Visual Asset (`image-style.md`) — `DreamTeam`

> Tài liệu chuẩn hóa bởi **`ai-template-1-ux`** theo quy trình Bước 0 & Bước 1 của [`image-pipeline.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/.agents/plugins/web-craft-studio/skills/web-craft-studio/references/image-pipeline.md), đã cập nhật đồng bộ bảng màu **DreamTeam (`DreamsCore` Aligned)**.  
> **Nguyên tắc MVP:** Mọi thumbnail và khung preview sản phẩm số mặc định dùng **HTML/CSS/SVG Framing bằng code** (hiển thị wireframe layout thật cho Template, thẻ snippet cho Prompt Pack, sơ đồ node cho Workflow) để đảm bảo **0 lỗi ảnh vỡ (404)**, **CLS = 0**, và **tự động thích ứng Light/Dark Mode**. Chỉ dùng ảnh `.webp` khi nhóm nạp ảnh sản phẩm thật hoặc tạo ảnh neo theo bảng dưới đây.

---

## Bước 0 — Quy Chuẩn Phong Cách Duy Nhất (Style Guide)

- **Phong cách duy nhất:** Không gian làm việc gọn gàng, sáng rõ, chuyên nghiệp nhưng gần gũi với chủ shop nhỏ Việt Nam (1–3 người bán trên Shopee, TikTok Shop, Facebook) — phong thái **Modern Emerald & Slate SaaS Commerce (`DreamsCore` Aligned)**.
- **Bảng màu đồng bộ từ `src/styles/tokens.css` & `src/styles/themes.css`:**
  - Nền chính (`--bg-canvas`): `#FFFFFF` (Light) / `#0D1512` (Dark)
  - Nền phụ / Dải mềm (`--bg-surface-subtle` / `--bg-surface`): `#F8FAFC` / `#FFFFFF` (Light) / `#16241F` / `#111C18` (Dark)
  - Mực chính (`--ink`): `#0F172A` (Light) / `#F1F5F9` (Dark)
  - Mực phụ (`--ink-soft`): `#475569` (Light) / `#A3B8B0` (Dark)
  - Màu nhấn chính duy nhất (`--accent`): `#187F65` Emerald (Light) / `#48B594` Mint (Dark)
  - Màu nhấn ấm phụ trợ (`--dg-copper`): `#E8830F` (dùng tiết chế cho điểm nhấn phụ trợ)
- **Ánh sáng:** Ánh sáng tự nhiên dịu từ trên-trái, bóng đổ Slate mảnh nhẹ, không đánh đèn neon hay phản chiếu nhựa bóng.
- **Nền ảnh:** Nền sáng sạch (`#F8FAFC` / `#F1F5F9`) hoặc nền tối Emerald Obsidian (`#0D1512`) tùy vùng đặt ảnh, kèm độ hạt (film grain) cực nhẹ để tránh cảm giác giả tạo của AI.
- **Tỉ lệ khung chuẩn:**
  - Hero Mockup / Showcase Card: `16:10` (chuẩn `DreamsCore`) hoặc `4:3`
  - Inner Pages & Card sản phẩm (CSS Framing): `4:3` hoặc `16:10`
  - Empty State / 404 (SVG code thuần): `1:1`
- **Danh sách CẤM tuyệt đối:**
  - Chữ, slogan, số giá hay watermark nằm trong file ảnh (mọi chữ tiếng Việt đều render bằng HTML/CSS).
  - Logo thương hiệu thật (Shopee, TikTok, Facebook logo chính thức trong ảnh AI).
  - Gradient tím neon kiểu AI (*AI-purple glow*), bề mặt bóng nhựa, da người quá mịn, bàn tay/ngón tay cận cảnh dễ méo, bố cục nhiều chủ thể rối rắm.

---

## Bước 1 — Bảng Danh Sách Visual Asset Tối Giản

> **Quy tắc khóa:** `image-generator` và `ai-template-2-fe` **KHÔNG** tạo hoặc nhúng ảnh nằm ngoài bảng này.

| ID | Vị trí sử dụng | Mục đích | Tỉ lệ | Vùng trống đặt chữ | Nguồn (thật / AI / code) | Đường dẫn / Thành phần | Trạng thái |
|---|---|---|---|---|---|---|---|
| `ASSET-UI-01` | Hero 3D Mockup Stack `/` (cột phải) | Khung trình diễn xếp lớp 3 tầng (`back-2`, `back-1`, `dg-hero-mockup-frame`) mô phỏng giao diện Template / Prompt / Workflow | `16:10` | Nằm trọn cột phải Hero; cột trái 100% chữ HTML sạch | **Code (HTML/CSS/SVG Framing)** *(zero network, đổi màu Light/Dark tự động)* | Component `WorkspaceShowcaseFrame` + Hero Stack | Khóa thiết kế (Code) |
| `ASSET-PROD-FRAME` | Thẻ sản phẩm `/`, `/products`, `/products/[slug]`, Chatbot Card | Hiển thị preview cấu trúc gói theo `product_type`: wireframe layout (`template`), thẻ prompt có token (`prompt_pack`), sơ đồ 3 nút kết nối (`workflow`) | `16:10` / `4:3` | Vùng badge `product_type` & `source_type` bằng HTML | **Code (HTML/CSS/SVG Framing)** *(hoặc thay bằng ảnh chụp `.webp` thật khi nhóm nạp sản phẩm thật)* | Component `ProductPlaceholderFrame` | Khóa thiết kế (Code) |
| `ASSET-EMPTY-01` | Empty State `/products`, `/cart`, `/orders/[id]` | Minh họa giỏ trống / không tìm thấy gói phù hợp / đơn chưa thanh toán | `1:1` | Dưới hình minh họa để chừa chỗ cho tiêu đề & nút CTA HTML | **Code (SVG nét mảnh 2 màu `--ink-soft` & `--accent`)** | Component `EditorialEmptyIllustration` | Khóa thiết kế (Code) |
| `ASSET-HERO-OPT` | *(Tùy chọn bổ sung)* Ảnh neo không gian bàn làm việc chủ shop nếu cần dùng cho banner/trang con | Ảnh neo (`assets/anchor.webp`) dùng khi nhóm muốn thay khung minh họa phụ bằng ảnh đời thường thật/AI | `16:9` | Chừa trống 45% bên trái cho khối Headline + CTA HTML | **AI (theo `image-pipeline.md`) hoặc Ảnh chụp thật của nhóm** | `assets/anchor.webp` → `public/images/hero-shop-workspace.webp` | Đề xuất tùy chọn (chưa bắt buộc để render) |

---

## Khung Prompt Chuẩn Nếu Kích Hoạt `ASSET-HERO-OPT` (Bước 3 — Tham Chiếu Cho `image-generator`)

Chỉ dùng khi nhóm quyết định tạo `assets/anchor.webp` → `public/images/hero-shop-workspace.webp`:

1. **Chủ thể:** Góc bàn làm việc gọn gàng, tối giản của một chủ shop online nhỏ với laptop mở giao diện sạch tối giản không chữ, quyển sổ ghi chú bìa vải xám slate, cốc gốm màu xanh ngọc trầm và 1 hộp đóng gói sản phẩm sạch chưa dán nhãn.
2. **Phong cách:** Modern editorial workspace photography, sạch sẽ, trung thực, độ nét mềm mại tự nhiên.
3. **Bảng màu:** Nền sáng dịu `#F8FAFC` / `#F1F5F9`, điểm nhấn xanh ngọc lục bảo `#187F65`, chi tiết gỗ ấm nhỏ tương ứng `#E8830F`, bóng đổ xám slate `#475569`.
4. **Ánh sáng:** Ánh sáng ban ngày tự nhiên từ cửa sổ bên trái-trên, bóng đổ mềm, không đèn flash.
5. **Bố cục:** Chủ thể đặt lệch về 55% bên phải khung hình `16:9`, chừa khoảng trống 45% bên trái (mặt bàn sáng sạch) để đặt chữ HTML.
6. **Negative:** `no text, no letters, no logos, no watermark, no neon purple, no plastic glossy surface, no hands, no distorted objects`
