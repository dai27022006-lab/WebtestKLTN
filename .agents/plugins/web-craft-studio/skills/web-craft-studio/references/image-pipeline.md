# Quy Trình Tạo Ảnh Cho Website (Bắt Buộc Tuân Thủ)

> Tài liệu chuẩn hóa quy trình tạo, hậu kỳ và kiểm duyệt mọi tài nguyên hình ảnh trong dự án, áp dụng đồng bộ cho **`ai-template-1-ux`**, **`ai-template-2-fe`**, **`image-generator`** và **`web-qa-verifier`**.

## Mục tiêu
Mọi ảnh trên web phải cùng một phong cách, hòa với bảng màu của giao diện, không có "mùi AI" (bóng nhựa, tím neon, chữ lỗi, mỗi tấm một kiểu).

---

## BƯỚC 0 – Chuẩn bị (làm 1 lần đầu dự án)
1. **`ai-template-1-ux`** tạo file `image-style.md` gồm:
   - **Phong cách duy nhất:** *[vd: ảnh đời thường sáng, tự nhiên, gần gũi với chủ shop nhỏ]*
   - **Bảng màu:** lấy token từ `ai-template-1-ux`: chính `[#______]`, phụ `[#______]`, nền `[#______]`, nhấn `[#______]`
   - **Ánh sáng:** một hướng cố định *[vd: sáng mềm từ trên-trái, bóng đổ nhẹ]*
   - **Nền ảnh:** `[sáng / tối]` để khớp nền web
   - **Tỉ lệ khung chuẩn:** Hero `16:9` | Card `4:3` | Empty state/404 `1:1` | Banner `3:1`
   - **Danh sách CẤM:** chữ/slogan trong ảnh, logo thương hiệu thật, tím neon, bề mặt bóng nhựa, da quá mịn, bàn tay/ngón tay, vật thể méo, nhiều chủ thể rối
2. Tạo và duyệt **1 ẢNH NEO (anchor image)** đúng phong cách.
   - Lưu tại `assets/anchor.webp`. Mọi ảnh sau phải tham chiếu ảnh này.

---

## BƯỚC 1 – Lập danh sách ảnh cần có (trước khi tạo bất cứ ảnh nào)
Lập bảng ngay trong `image-style.md` (hoặc `docs/UI-UX-SPEC.md`). **Không có trong bảng thì KHÔNG được tạo.**

| ID | Vị trí | Mục đích | Tỉ lệ | Vùng trống đặt chữ | Nguồn (thật / AI / code) | Trạng thái |
|----|--------|----------|-------|--------------------|--------------------------|------------|
| | | | | | | |

---

## BƯỚC 2 – Chọn nguồn ảnh cho từng dòng trong bảng
- **Screenshot sản phẩm/template thật** $\rightarrow$ dùng ảnh thật, ghép vào khung laptop/điện thoại bằng code (HTML/CSS hoặc Python). **KHÔNG** để AI vẽ giao diện.
- **Ảnh thật của đề tài** (sản phẩm, địa điểm, mẫu thực tế do nhóm Đại cung cấp) $\rightarrow$ ưu tiên cho nội dung chính.
- **Icon, hình minh họa đơn giản** $\rightarrow$ **SVG/CSS** (`ai-template-2-fe`), không dùng AI.
- **Chỉ dùng AI (`image-generator`) cho:** ảnh Hero, nền tạo chiều sâu, minh họa 404/Empty State, banner.

---

## BƯỚC 3 – Viết prompt theo khung cố định (điền đủ 6 mục mới được chạy)
1. **Chủ thể:** ...
2. **Phong cách:** theo `image-style.md` + tham chiếu `assets/anchor.webp`
3. **Bảng màu:** các mã hex ở Bước 0
4. **Ánh sáng:** theo `image-style.md`
5. **Bố cục:** chừa vùng trống `[trái / phải / trên]` cho chữ HTML đè lên
6. **Negative:** `no text, no letters, no logos, no watermark, no neon purple, no plastic glossy surface, no hands, no distorted objects`

---

## BƯỚC 4 – Tạo ảnh
- Tạo **3–4 phương án** cho mỗi ID, chọn **1**.
- Luôn dùng ảnh neo `assets/anchor.webp` làm tham chiếu phong cách.
- Chữ tiếng Việt (tiêu đề, slogan, nút) **KHÔNG** nằm trong ảnh; giao cho `ai-template-2-fe` render bằng HTML/CSS.

---

## BƯỚC 5 – Hậu kỳ (áp dụng cho CẢ ảnh thật và ảnh AI)
Dùng pipeline **Python / OpenCV** (hoặc script hậu kỳ trong dự án):
1. Đồng bộ màu về cùng tông (*color grade* theo ảnh neo `assets/anchor.webp`).
2. Thêm *grain/noise* nhẹ để phá vẻ mịn nhựa của ảnh AI.
3. Cắt đúng tỉ lệ đã khóa ở Bước 1.
4. Xuất định dạng **WebP**, tối ưu dung lượng: **hero `< 300KB`**, **card `< 120KB`**.

---

## BƯỚC 6 – Kiểm tra (checklist có/không; sai 1 câu là tạo lại)
1. Có chữ, logo, hoặc ký tự lạ trong ảnh không?
2. Màu có nằm trong bảng màu không?
3. Ánh sáng có cùng hướng với các ảnh đã duyệt không?
4. Có chi tiết lạ (ngón tay, vật thể méo, bóng sai) không?
5. Có vùng trống để đặt chữ không?
6. Đặt cạnh 3 ảnh đã duyệt có thấy lệch phong cách không?

---

## BƯỚC 7 – Lưu trữ và ghi nhận
- Đặt tên chuẩn: `[loai]-[vi-tri]-[so].webp` *(vd: `hero-home-01.webp`, đặt tại `public/images/` hoặc thư mục static phục vụ web)*.
- Lưu prompt đã dùng vào `assets/prompts.md` để tái tạo được.
- Cập nhật cột **Trạng thái** trong bảng Bước 1: `Đã duyệt` / `Cần làm lại`.
- Mỗi ảnh có `alt` text mô tả bằng tiếng Việt (cho SEO và accessibility).
- Ghi rõ ảnh nào do AI tạo trong `assets/prompts.md` (để nhóm Đại khai báo nguồn tài nguyên trong báo cáo đồ án).

---

## QUY TẮC KHÔNG ĐƯỢC VI PHẠM
- Không tạo ảnh ngoài danh sách Bước 1.
- Không sinh chữ trong ảnh.
- Không bỏ qua Bước 6.
- Không đổi phong cách giữa chừng. Muốn đổi thì cập nhật `image-style.md` và tạo lại ảnh neo `assets/anchor.webp` trước.
