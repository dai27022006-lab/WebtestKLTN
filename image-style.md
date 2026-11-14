# Quy Chuẩn Phong Cách & Danh Sách Visual Asset (`image-style.md`)

> Tài liệu chuẩn hóa bởi **`ai-template-1-ux`** theo quy trình Bước 0 & Bước 1 của [`image-pipeline.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/.agents/plugins/web-craft-studio/skills/web-craft-studio/references/image-pipeline.md).  
> **Nguyên tắc MVP:** Do nhóm chưa nạp bộ ảnh sản phẩm thật ở Pha 1, mọi thumbnail và màn hình demo sản phẩm sử dụng **HTML/CSS/SVG Framing bằng code** (hiển thị wireframe layout thật cho Template, thẻ snippet cho Prompt Pack, sơ đồ node cho Workflow) để đảm bảo **0 lỗi ảnh vỡ (404)**, **CLS = 0**, và **tự động thích ứng Light/Dark Mode**. Chỉ đề xuất tối đa 1–2 tài nguyên minh họa ở mức Hero / Empty-State nếu thật sự cần.

---

## Bước 0 — Quy Chuẩn Phong Cách Duy Nhất (Style Guide)

- **Phong cách duy nhất:** Ảnh đời thường sáng tự nhiên, bàn làm việc gọn gàng, gần gũi với chủ shop nhỏ Việt Nam (1–3 người bán trên Shopee, TikTok Shop, Facebook) — phong thái **Warm Editorial Craft / Thực dụng hiện đại**.
- **Bảng màu đồng bộ từ `src/styles/tokens.css`:**
  - Nền canvas (`--bg-canvas`): `#FAF7F2` (Light) / `#141210` (Dark)
  - Bề mặt nổi (`--bg-surface`): `#FFFFFF` (Light) / `#1E1B18` (Dark)
  - Mực chính (`--ink`): `#1C1917` (Light) / `#F5F1EB` (Dark)
  - Mực phụ (`--ink-soft`): `#57534E` (Light) / `#B5ADA3` (Dark)
  - Màu nhấn duy nhất (`--accent`): `#B93815` (Light) / `#F06A3E` (Dark)
- **Ánh sáng:** Ánh sáng tự nhiên mềm từ cửa sổ hướng trên-trái, bóng đổ nhẹ ấm áp, không đánh đèn studio gắt hay phản chiếu nhựa.
- **Nền ảnh:** Nền sáng ấm (`#FAF7F2` / `#F2ECE3`) khớp với canvas chính, ảnh có độ nhiễu hạt (film grain) cực nhẹ để tránh cảm giác mượt giả tạo của AI.
- **Tỉ lệ khung chuẩn:**
  - Hero Showcase: `16:9` (hoặc `4:3` trong Hero Split bên phải)
  - Card sản phẩm (CSS Framing): `4:3`
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
| `ASSET-UI-01` | Hero Split `/` (bên phải) & Bento Showcase | Khung mô phỏng không gian làm việc & preview sản phẩm số (`Template` / `Prompt` / `Workflow`) | `4:3` | Nằm trọn cột phải Hero; cột trái 100% chữ HTML sạch | **Code (HTML/CSS/SVG Framing)** *(mặc định Pha 1 — zero network, đổi màu Light/Dark)* | Component `WorkspaceShowcaseFrame` | Khóa thiết kế (Code) |
| `ASSET-PROD-FRAME` | Thẻ sản phẩm `/`, `/products`, `/products/[slug]`, Chatbot Card | Hiển thị preview cấu trúc gói theo `product_type`: wireframe 3 khối (`template`), thẻ prompt có dấu ngoặc (`prompt_pack`), sơ đồ 3 nút kết nối (`workflow`) | `4:3` | Vùng header badge `source_type` ở góc trên-trái (HTML) | **Code (HTML/CSS/SVG Framing)** *(hoặc thay bằng ảnh thật `.webp` khi nhóm nạp sản phẩm thật ở Mục 18 `RULES.md`)* | Component `ProductPlaceholderFrame` | Khóa thiết kế (Code) |
| `ASSET-EMPTY-01` | Empty State `/products`, `/cart`, `/orders/[id]` | Minh họa giỏ trống / không tìm thấy gói phù hợp / đơn chưa thanh toán | `1:1` | Dưới hình minh họa để chừa chỗ cho tiêu đề & nút CTA HTML | **Code (SVG nét mảnh 2 màu `--ink-soft` & `--accent`)** | Component `EditorialEmptyIllustration` | Khóa thiết kế (Code) |
| `ASSET-HERO-OPT` | *(Tùy chọn bổ sung)* Ảnh neo không gian bàn làm việc chủ shop tại `/` hoặc trang `/experiment` | Ảnh neo (`assets/anchor.webp`) dùng khi nhóm muốn thay khung minh họa Hero bằng ảnh đời thường thật/AI | `16:9` | Chừa trống 45% bên trái cho khối Headline + CTA HTML | **AI (theo `image-pipeline.md`) hoặc Ảnh chụp thật của nhóm** | `assets/anchor.webp` → `public/images/hero-shop-workspace.webp` | Đề xuất tùy chọn (chưa bắt buộc để render) |

---

## Khung Prompt Chuẩn Nếu Kích Hoạt `ASSET-HERO-OPT` (Bước 3 — Tham Chiếu Cho `image-generator`)

Chỉ dùng khi nhóm quyết định tạo `assets/anchor.webp` → `public/images/hero-shop-workspace.webp`:

1. **Chủ thể:** Góc bàn làm việc mộc mạc, gọn gàng của một chủ shop online nhỏ với laptop mở màn hình trống sáng dịu, quyển sổ tay bìa giấy kraft, tách cà phê gốm men ấm và 1 hộp carton nhỏ chưa dán nhãn.
2. **Phong cách:** Editorial lifestyle photography, tông ấm tự nhiên, trung thực, độ nét mềm mại.
3. **Bảng màu:** Nền gỗ sồi nhạt và giấy kem `#FAF7F2`, chi tiết gốm đất nung `#B93815`, bóng đổ xám ấm `#57534E`.
4. **Ánh sáng:** Ánh sáng ban ngày tự nhiên từ cửa sổ bên trái-trên, bóng đổ mềm, không đèn flash.
5. **Bố cục:** Chủ thể đặt lệch về 55% bên phải khung hình `16:9`, chừa khoảng trống 45% bên trái (mặt bàn và tường kem mịn) để đặt chữ HTML.
6. **Negative:** `no text, no letters, no logos, no watermark, no neon purple, no plastic glossy surface, no hands, no distorted objects`
