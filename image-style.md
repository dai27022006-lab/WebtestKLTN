# Quy Chuẩn Phong Cách & Danh Sách Visual Asset (`image-style.md`) — `DreamTeam`

> Tài liệu chuẩn hóa bởi **`ai-template-1-ux`** theo quy trình Bước 0 & Bước 1 của [`image-pipeline.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/.agents/plugins/web-craft-studio/skills/web-craft-studio/references/image-pipeline.md), đồng bộ bảng màu **DreamTeam (`Emerald & Slate SaaS Commerce`)**.  
> **Nguyên tắc phối hợp Ảnh thật/WebP + Code Framing:**
> - Các khung giao diện chi tiết, wireframe sản phẩm và minh họa trạng thái rỗng (`Empty State`) tiếp tục dùng **HTML/CSS/SVG Framing bằng code** để đảm bảo `0` lỗi broken layout và đổi màu tự động Light/Dark.
> - Bổ sung **4 ảnh WebP chuẩn hóa trong `public/images/`** (do `image-generator` tạo từ ảnh neo `assets/anchor.webp`, qua hậu kỳ grain nhẹ & nén WebP) nhằm tăng chiều sâu thị giác đời thực cho Hero, 3 nhóm sản phẩm chủ đạo và fallback thumbnail sản phẩm.

---

## Bước 0 — Quy Chuẩn Phong Cách Duy Nhất (Style Guide)

- **Phong cách duy nhất:** Không gian làm việc gọn gàng, sạch sẽ, gần gũi với chủ shop nhỏ Việt Nam (1–3 người bán trên Shopee, TikTok Shop, Facebook) — phong thái **Modern Emerald & Slate Editorial Workspace**.
- **Bảng màu đồng bộ từ `src/styles/tokens.css` & `src/styles/themes.css`:**
  - Nền sáng sạch (`--bg-canvas` / `--bg-surface-subtle` / `--bg-surface-sunken`): `#FFFFFF` / `#F8FAFC` / `#F1F5F9`
  - Nền tối hài hòa (`--bg-canvas` dark / Hero slate): `#0D1512` / `#1E293B` / `#0F172A`
  - Xám mực & trung tính (`--ink` / `--ink-soft`): `#0F172A` / `#475569`
  - Màu nhấn chính duy nhất (`--accent` Emerald / Mint): `#187F65` / `#48B594`
  - Màu nhấn ấm phụ trợ (`--dg-copper` — dùng tiết chế ở chi tiết nhỏ như điểm nhấn sổ tay, gỗ ấm, bút): `#E8830F`
- **Ánh sáng:** Ánh sáng tự nhiên dịu từ trên-trái (soft daylight from top-left window), bóng đổ Slate mảnh nhẹ, không đánh đèn neon, không phản chiếu nhựa bóng.
- **Chất liệu & Hậu kỳ:** Có độ hạt (*film grain*) cực nhẹ để phá cảm giác trơn mịn nhân tạo của AI.
- **Tỉ lệ khung chuẩn:**
  - Hero Workspace Banner: `16:9` (`hero-workspace.webp`, `< 300KB`)
  - Category & Product Cards: `16:10` (`cat-template.webp`, `cat-prompt.webp`, `cat-workflow.webp`, `< 120KB`)
  - Empty State / 404 (SVG code thuần): `1:1`
- **Danh sách CẤM tuyệt đối trong ảnh:**
  - **KHÔNG** có chữ, chữ cái, số, slogan, UI text giả hay watermark trong file ảnh (mọi chữ tiếng Việt đều render bằng HTML/CSS).
  - **KHÔNG** chứa logo thương hiệu ngoài (Shopee, TikTok, Facebook, Notion, OpenAI...).
  - **KHÔNG** dùng gradient tím neon (*AI-purple glow*), bề mặt nhựa bóng láng, bàn tay/ngón tay cận cảnh, hoặc bố cục rối rắm nhiều vật thể.

---

## Bước 1 — Bảng Danh Sách Visual Asset Đã Khóa

> **Quy tắc khóa:** `image-generator` và `ai-template-2-fe` **KHÔNG** tạo hoặc nhúng file ảnh nào nằm ngoài bảng này.

| ID | Vị trí sử dụng | Mục đích | Tỉ lệ | Vùng trống đặt chữ | Nguồn | Đường dẫn / Component | Dung lượng & Trạng thái |
|---|---|---|---|---|---|---|---|
| `ASSET-UI-01` | Hero 3D Mockup Stack `/` (cột phải) | Khung trình diễn xếp lớp 3 tầng (`WorkspaceShowcaseFrame`) mô phỏng giao diện Web / Prompt / Workflow | `16:10` | Nằm trọn cột phải Hero; cột trái 100% chữ HTML sạch | **Code (HTML/CSS/SVG Framing)** | `WorkspaceShowcaseFrame` | `0 KB` • Đã khóa (Code) |
| `ASSET-PROD-FRAME` | Khung fallback / cấu trúc gói `/products`, `/products/[slug]`, Chatbot Card | Hiển thị khung wireframe chuẩn khi sản phẩm chưa gắn `thumbnail_url` hoặc `demo_url` | `16:10` / `4:3` | Vùng badge & tiêu đề render bằng HTML | **Code (HTML/CSS/SVG Framing)** | `ProductPlaceholderFrame` | `0 KB` • Đã khóa (Code) |
| `ASSET-EMPTY-01` | Empty State `/products`, `/cart`, `/orders`, `/orders/[id]` | Minh họa giỏ trống / không tìm thấy sản phẩm / chưa có đơn hàng | `1:1` | Dưới hình minh họa để chừa chỗ cho tiêu đề & nút CTA HTML | **Code (SVG 2 màu `--ink-soft` & `--accent`)** | `EditorialEmptyIllustration` | `0 KB` • Đã khóa (Code) |
| `ASSET-ANCHOR-00` | Ảnh neo tham chiếu phong cách (`image-pipeline.md` Bước 0) | Khóa tông màu, ánh sáng trên-trái, chất liệu bàn làm việc Emerald/Slate cho toàn bộ bộ ảnh WebP | `16:9` | Chừa trống 45% bên trái (mặt bàn/nền sạch) | **AI (`image-generator`) — hợp nhất làm chuẩn qua `hero-workspace.webp`** | `public/images/hero-workspace.webp` | `43.9 KB` • Đã duyệt |
| `ASSET-HERO-WS` | Hero `/` (lớp nền chiều sâu / thẻ bối cảnh bàn làm việc chủ shop) | Bàn làm việc chủ shop sạch sẽ tông Emerald/Slate, không chữ, tạo chiều sâu đời thực mà không lấn át chữ HTML | `16:9` | Chừa trống 45% bên trái cho khối Headline + CTA HTML | **AI (`image-generator`) + nén WebP qua `sharp`** | `public/images/hero-workspace.webp` | `43.9 KB` • Đã duyệt |
| `ASSET-CAT-TEMPLATE` | Thẻ nhóm **Template Website** (`/`, `/products`) & fallback sản phẩm nhóm `template` | Khung trình duyệt / bố cục giao diện tối giản hiển thị các khối hình học tông Emerald/Slate, hoàn toàn không chữ | `16:10` | Vùng góc trên cho badge HTML; chữ tiêu đề đặt ở thân card HTML bên dưới | **AI (`image-generator`) + nén WebP qua `sharp`** | `public/images/cat-template.webp` | `5.5 KB` • Đã duyệt |
| `ASSET-CAT-PROMPT` | Thẻ nhóm **Prompt Pack AI** (`/`, `/products`) & fallback sản phẩm nhóm `prompt_pack` | Sổ tay & các thẻ biên tập tối giản xếp gọn tông Emerald/Slate/Copper, không chữ, không ký tự | `16:10` | Vùng góc trên cho badge HTML; chữ tiêu đề đặt ở thân card HTML bên dưới | **AI (`image-generator`) + nén WebP qua `sharp`** | `public/images/cat-prompt.webp` | `11.3 KB` • Đã duyệt |
| `ASSET-CAT-WORKFLOW` | Thẻ nhóm **Workflow Tự Động** (`/`, `/products`) & fallback sản phẩm nhóm `workflow` | Sơ đồ khối mô-đun kết nối tối giản sạch sẽ tông Emerald/Slate/Copper (biểu đạt luồng kết nối gọn gàng, không chữ) | `16:10` | Vùng góc trên cho badge HTML; chữ tiêu đề đặt ở thân card HTML bên dưới | **Vector SVG render + nén WebP qua `sharp`** *(fallback khi model AI chạm quota 429)* | `public/images/cat-workflow.webp` | `14.1 KB` • Đã duyệt |

---

## Bước 3 — Khung Prompt 6 Mục Chuẩn Cho `image-generator`

> `image-generator` tạo **ảnh neo `assets/anchor.webp` trước**, sau đó dùng `assets/anchor.webp` làm tham chiếu đồng nhất phong cách cho 4 file trong `public/images/`, chạy hậu kỳ (color grade + grain nhẹ + crop đúng tỉ lệ + xuất WebP) và ghi lại prompt thực tế vào `assets/prompts.md`.

### 1. `ASSET-HERO-WS` → `public/images/hero-workspace.webp` (`16:9`, `< 300KB`)
1. **Chủ thể:** Góc bàn làm việc gọn gàng của một chủ shop online nhỏ với laptop nhôm tối giản gập mở hiển thị các khối giao diện hình học sạch không chữ, cốc gốm màu xanh ngọc lục bảo trầm, quyển sổ tay bìa vải xám slate và một hộp đóng gói tối giản sạch trơn.
2. **Phong cách:** Modern editorial workspace photography, tinh gọn, chân thực, độ hạt film grain nhẹ tự nhiên, đồng bộ `assets/anchor.webp`.
3. **Bảng màu:** Nền tối sâu hài hòa Slate-Emerald (`#0F172A`, `#1E293B`, `#0D1512`), bề mặt xám trung tính `#475569` / `#F1F5F9`, điểm nhấn xanh Emerald `#187F65` / `#48B594`, một chi tiết gỗ/đồng ấm nhỏ `#E8830F`.
4. **Ánh sáng:** Ánh sáng tự nhiên dịu từ trên-trái, bóng đổ mềm, không gắt, không phản chiếu nhựa bóng.
5. **Bố cục:** Cụm laptop và vật dụng đặt lệch sang 55% bên phải khung hình `16:9`; giữ 45% bên trái thông thoáng dịu tối để đặt Headline & CTA HTML.
6. **Negative:** `no text, no letters, no numbers, no logos, no watermark, no neon purple, no plastic glossy surface, no hands, no fingers, no distorted objects`

### 2. `ASSET-CAT-TEMPLATE` → `public/images/cat-template.webp` (`16:10`, `< 120KB`)
1. **Chủ thể:** Chiếc laptop tối giản đặt nghiêng góc 3/4 trên mặt bàn sáng sạch, màn hình hiển thị bố cục hình học trừu tượng dạng khối thẻ và thanh điều hướng tối giản hoàn toàn không chữ (màu Emerald & Slate).
2. **Phong cách:** Clean minimalist product studio photography, đồng bộ ánh sáng & sắc độ với `assets/anchor.webp`, có độ hạt nhẹ tự nhiên.
3. **Bảng màu:** Mặt bàn sáng dịu `#F8FAFC` / `#F1F5F9`, khung máy Slate `#0F172A` / `#475569`, các khối hình học trên màn hình dùng Emerald `#187F65` & Mint `#48B594`.
4. **Ánh sáng:** Ánh sáng ban ngày mềm từ trên-trái, bóng đổ mảnh dưới thân laptop.
5. **Bố cục:** Laptop căn trung tâm hơi chếch phải trong khung `16:10`, chừa khoảng thoáng quanh mép trên-trái cho badge HTML đè lên.
6. **Negative:** `no text, no letters, no UI words, no numbers, no logos, no watermark, no neon purple, no glossy plastic, no hands, no distorted screen`

### 3. `ASSET-CAT-PROMPT` → `public/images/cat-prompt.webp` (`16:10`, `< 120KB`)
1. **Chủ thể:** Quyển sổ tay bìa vải xám slate mở gọn cạnh 3 tấm thẻ biên tập giấy dày tối giản xếp lớp với các đường gạch hình học trừu tượng và kẹp kim loại nhỏ, đặt trên mặt bàn sạch.
2. **Phong cách:** Tactile minimalist editorial flat-lay / angled studio shot, đồng bộ ánh sáng & chất liệu với `assets/anchor.webp`, grain nhẹ.
3. **Bảng màu:** Nền sáng `#F8FAFC` / `#F1F5F9`, xám Slate `#475569`, điểm nhấn Emerald `#187F65` và Copper `#E8830F` trên thẻ và kẹp giấy.
4. **Ánh sáng:** Ánh sáng mềm từ trên-trái, tạo bóng đổ nhẹ giữa các lớp thẻ giấy.
5. **Bố cục:** Cụm sổ tay và thẻ đặt gọn trung tâm-phải khung `16:10`, chừa khoảng thoáng góc trên cho badge HTML.
6. **Negative:** `no text, no handwriting, no printed letters, no numbers, no logos, no watermark, no neon purple, no plastic glare, no hands, no cluttered desk`

### 4. `ASSET-CAT-WORKFLOW` → `public/images/cat-workflow.webp` (`16:10`, `< 120KB`)
1. **Chủ thể:** Các khối mô-đun hình học nhám mịn (3 khối vuông bo góc xếp nối tiếp bằng các thanh dẫn kim loại mỏng tạo thành chuỗi kết nối gọn gàng) đặt trên mặt bàn làm việc tối giản.
2. **Phong cách:** Clean architectural object photography, mô phỏng trực quan tư duy quy trình tự động hóa tinh gọn, đồng bộ hoàn toàn với `assets/anchor.webp`.
3. **Bảng màu:** Mặt bàn sáng `#F8FAFC` / `#F1F5F9`, khối vật thể Slate `#1E293B` / `#475569`, lõi/điểm nhấn Emerald `#187F65` & Mint `#48B594`, thanh nối đồng nhẹ `#E8830F`.
4. **Ánh sáng:** Ánh sáng tự nhiên dịu từ trên-trái, bóng đổ sạch, độ hạt film grain nhẹ.
5. **Bố cục:** 3 khối kết nối bố trí chéo cân đối trong khung `16:10`, vùng trên-trái thông thoáng để không che badge HTML.
6. **Negative:** `no text, no letters, no numbers, no app icons, no logos, no watermark, no neon purple, no glowing laser lines, no hands, no glossy plastic`

---

## Bước 7 — Chuẩn `alt` Text Tiếng Việt Cho `ai-template-2-fe`

| File ảnh | `alt` text khuyến nghị (Tiếng Việt) |
|---|---|
| `/images/hero-workspace.webp` | `"Góc bàn làm việc gọn gàng của chủ shop kinh doanh trực tuyến theo tông màu xanh ngọc và xám slate"` |
| `/images/cat-template.webp` | `"Laptop hiển thị cấu trúc bố cục giao diện website bán hàng tối giản"` |
| `/images/cat-prompt.webp` | `"Sổ tay và bộ thẻ biên tập tối giản đại diện cho bộ prompt bán hàng"` |
| `/images/cat-workflow.webp` | `"Các khối mô-đun kết nối tối giản minh họa quy trình tự động hóa đơn hàng"` |
