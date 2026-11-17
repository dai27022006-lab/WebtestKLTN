# Nhật Ký Tạo Ảnh & Prompt Tài Nguyên (`assets/prompts.md`) — `DreamTeam`

> Hồ sơ minh bạch nguồn gốc, prompt song ngữ (Tiếng Việt / English), hậu kỳ và kiểm duyệt Bước 6–7 theo [`image-pipeline.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/.agents/plugins/web-craft-studio/skills/web-craft-studio/references/image-pipeline.md) và [`image-style.md`](file:///d:/Dự%20án%20web%20tốt%20nghiệp/image-style.md).  
> Mục đích phục vụ kiểm định QA nội bộ và khai báo nguồn tài nguyên trong báo cáo Đồ án Tốt nghiệp.

---

## Bảng Tổng Hợp Tài Nguyên Đã Duyệt (`public/images/`)

| Asset ID | Đường dẫn | Tỉ lệ | Dung lượng thực tế | Phương thức tạo & Hậu kỳ | Trạng thái |
|---|---|---|---|---|---|
| `ASSET-HERO-WS` | `public/images/hero-workspace.webp` | `16:9` | **43.9 KB** *(giới hạn `< 300 KB`)* | Tạo bằng `image-generator` (AI) + cắt tỉ lệ `16:9` & nén WebP qua `sharp` | **Đã duyệt** |
| `ASSET-CAT-TEMPLATE` | `public/images/cat-template.webp` | `16:10` | **5.5 KB** *(giới hạn `< 120 KB`)* | Tạo bằng `image-generator` (AI) + cắt tỉ lệ `16:10` & nén WebP qua `sharp` | **Đã duyệt** |
| `ASSET-CAT-PROMPT` | `public/images/cat-prompt.webp` | `16:10` | **11.3 KB** *(giới hạn `< 120 KB`)* | Tạo bằng `image-generator` (AI) + cắt tỉ lệ `16:10` & nén WebP qua `sharp` | **Đã duyệt** |
| `ASSET-CAT-WORKFLOW` | `public/images/cat-workflow.webp` | `16:10` | **14.1 KB** *(giới hạn `< 120 KB`)* | Render từ vector SVG sạch + nén WebP qua `sharp` *(dự phòng khi model sinh ảnh AI hết quota HTTP `429`)* | **Đã duyệt** |

---

## Chi Tiết Nguồn Gốc & Prompt Từng File

### 1. `public/images/hero-workspace.webp` (`ASSET-HERO-WS` — 43.9 KB, 16:9)

- **Nguồn gốc & Công cụ:** Sinh bằng `image-generator` (AI Image Generation), đồng thời giữ vai trò ảnh chuẩn tông bàn làm việc Emerald/Slate cho bộ asset; hậu kỳ crop `16:9` và tối ưu WebP qua `sharp`.
- **Prompt Tiếng Việt:**
  > Góc bàn làm việc gọn gàng của chủ shop nhỏ kinh doanh trực tuyến, đặt lệch về 55% bên phải khung hình `16:9`: laptop nhôm mở hiển thị các khối hình học màu xanh Emerald (`#187F65`) và xanh Slate đậm (`#0F172A`) hoàn toàn không có chữ, quyển sổ tay bìa vải xám slate, cốc gốm màu xanh ngọc trầm và hộp đóng gói tối giản sạch trơn; giữ khoảng trống mặt bàn sáng sạch ở 45% bên trái để đặt tiêu đề HTML; ánh sáng ban ngày dịu tự nhiên từ cửa sổ bên phải/trên, không logo, không watermark, không tím neon.
- **English Generation Prompt:**
  > Clean modern editorial workspace desk of a small online shop owner, objects arranged cleanly on the right 55% of a 16:9 frame: open silver laptop displaying minimal abstract geometric color blocks in emerald green (#187F65) and deep slate navy (#0F172A) with zero text, a slate fabric notebook, a matte deep emerald ceramic mug, and a minimal unbranded white packaging box with a blank craft tag; clean empty white desk surface on the left 45% for HTML headline placement; soft natural daylight, subtle realistic grain.
- **Negative Prompt:**
  > `no text, no letters, no numbers, no logos, no watermark, no neon purple, no plastic glossy surface, no hands, no fingers, no distorted objects`
- **`alt` text tiếng Việt:** `"Góc bàn làm việc gọn gàng của chủ shop kinh doanh trực tuyến theo tông màu xanh ngọc và xám slate"`
- **Kiểm tra Bước 6:** Không chữ/logo lạ, đúng bảng màu Emerald/Slate, có khoảng trống trái cho chữ, dung lượng `43.9 KB` (`< 300 KB`).

---

### 2. `public/images/cat-template.webp` (`ASSET-CAT-TEMPLATE` — 5.5 KB, 16:10)

- **Nguồn gốc & Công cụ:** Sinh bằng `image-generator` (AI Image Generation), hậu kỳ chuẩn tỉ lệ `16:10` và nén WebP qua `sharp`.
- **Prompt Tiếng Việt:**
  > Khung cửa sổ giao diện website tối giản nổi nhẹ trên nền studio sáng sạch (`#F8FAFC` / `#F1F5F9`), hiển thị các khối bố cục hình học trừu tượng (thanh điều hướng tối `#0F172A`, các thẻ khối màu xanh Emerald `#187F65` và bề mặt trắng sắc nét) hoàn toàn không có chữ hay số; bóng đổ mềm tự nhiên bên dưới, phong cách gọn gàng đồng bộ tông DreamTeam.
- **English Generation Prompt:**
  > Minimalist floating browser UI frame card on a clean bright studio surface (#F8FAFC / #F1F5F9), displaying abstract geometric layout blocks with a deep slate header (#0F172A), clean white inner cards, and emerald green (#187F65) action block placeholders with strictly zero text or typography; soft studio shadow underneath, 16:10 aspect ratio.
- **Negative Prompt:**
  > `no text, no letters, no UI words, no numbers, no logos, no watermark, no neon purple, no glossy plastic, no hands, no distorted screen`
- **`alt` text tiếng Việt:** `"Laptop hiển thị cấu trúc bố cục giao diện website bán hàng tối giản"`
- **Kiểm tra Bước 6:** Sạch hoàn toàn chữ và ký tự, khớp tông Emerald/Slate sáng, dung lượng `5.5 KB` (`< 120 KB`).

---

### 3. `public/images/cat-prompt.webp` (`ASSET-CAT-PROMPT` — 11.3 KB, 16:10)

- **Nguồn gốc & Công cụ:** Sinh bằng `image-generator` (AI Image Generation), hậu kỳ chuẩn tỉ lệ `16:10` và nén WebP qua `sharp`.
- **Prompt Tiếng Việt:**
  > Ảnh flat-lay tối giản góc chụp hơi nghiêng trên nền xám nhạt sạch (`#F1F5F9`): bộ thẻ biên tập giấy dày trắng và xanh bạc hà nhạt (`#48B594` pha dịu) xếp lớp gọn gàng cùng kẹp giấy đồng mảnh và điểm nhấn hình học nhỏ màu đồng ấm Copper (`#E8830F`); hoàn toàn không có chữ viết tay hay chữ in; ánh sáng tự nhiên dịu từ trên-trái tạo bóng đổ nhẹ giữa các lớp thẻ.
- **English Generation Prompt:**
  > Tactile minimalist editorial flat-lay shot on a clean soft slate-white studio surface (#F1F5F9): layered thick matte paper cards in crisp white and soft mint tint with a slim copper metal paperclip and tiny warm copper (#E8830F) geometric tab accents; strictly blank cards with zero printed text or handwriting; soft top-left daylight casting gentle layered shadows, 16:10 composition.
- **Negative Prompt:**
  > `no text, no handwriting, no printed letters, no numbers, no logos, no watermark, no neon purple, no plastic glare, no hands, no cluttered desk`
- **`alt` text tiếng Việt:** `"Sổ tay và bộ thẻ biên tập tối giản đại diện cho bộ prompt bán hàng"`
- **Kiểm tra Bước 6:** Không có chữ viết tay/chữ in, đồng bộ màu Slate/Mint/Copper, dung lượng `11.3 KB` (`< 120 KB`).

---

### 4. `public/images/cat-workflow.webp` (`ASSET-CAT-WORKFLOW` — 14.1 KB, 16:10)

- **Nguồn gốc & Công cụ (Minh bạch 100%):**
  - Trong quá trình sinh ảnh đợt cuối, model sinh ảnh AI gặp giới hạn **quota HTTP `429`**.
  - Thay vì dùng ảnh lỗi hoặc ảnh mạng không rõ bản quyền, tài nguyên `cat-workflow.webp` được **thiết kế bằng Vector SVG sạch nội bộ** theo đúng bảng màu DreamTeam (`#F8FAFC` nền lưới mảnh, nút kết nối trắng / Emerald `#187F65` / Copper `#E8830F` / Slate `#0F172A`) và **render + nén sang WebP bằng thư viện `sharp`** ở tỉ lệ `16:10`.
- **Prompt ý định gốc / Đặc tả thiết kế Vector SVG:**
  - *Tiếng Việt:* Sơ đồ các khối mô-đun kết nối tối giản sạch sẽ trên nền lưới sáng nhạt (`#F8FAFC`), gồm các nút bo góc màu trắng, xanh Emerald (`#187F65`), điểm nhấn Copper (`#E8830F`) và xanh Slate đậm (`#0F172A`) nối với nhau bằng đường dẫn cong mảnh và chấm tín hiệu, hoàn toàn không chứa chữ hoặc logo ứng dụng ngoài.
  - *English Vector Spec:* Clean minimal geometric workflow node graph on a subtle soft slate grid background (#F8FAFC), connecting rounded-square cards in white, emerald green (#187F65), warm copper accent (#E8830F), and deep slate (#0F172A) with smooth bezier connector paths and node dots, strictly zero text or third-party app icons, 16:10 ratio.
- **`alt` text tiếng Việt:** `"Các khối mô-đun kết nối tối giản minh họa quy trình tự động hóa đơn hàng"`
- **Kiểm tra Bước 6:** Không chữ/logo bên thứ ba, đồng nhất 100% bảng màu DreamTeam, sắc nét trên cả Light/Dark card frame, dung lượng `14.1 KB` (`< 120 KB`).
