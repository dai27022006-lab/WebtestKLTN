# TEMPLATE-UPLOAD-SPEC.md — Quy Cách Đưa File HTML Mẫu & Ảnh Thật Vào Dự Án

> **Đối tượng sử dụng:** Nhóm sinh viên thực hiện đồ án (nội dung, sản phẩm số, quản trị viên `/admin/products`).  
> **Mục tiêu:** Đảm bảo mọi **Template Website**, **Prompt Pack** và **Workflow** khi bổ sung hoặc thay thế đều hiển thị mượt trên khung **Live Preview (375px – 1280px)**, tải ảnh nhanh `< 120 KB`, không lỗi 404 và minh bạch bản quyền.

---

## 1. Bản đồ Thư mục Tài nguyên Chuẩn

| Loại tài nguyên | Đường dẫn lưu trong Repo | Đường dẫn URL khai báo ở sản phẩm | Ghi chú |
|---|---|---|---|
| **HTML Live Preview (Template)** | `public/demos/<slug>/index.html` | `demo_url = "/demos/<slug>/index.html"` | Chỉ áp dụng cho sản phẩm `product_type = "template"` |
| **Ảnh đại diện riêng từng gói** | `public/images/prod-<slug>.webp` | `thumbnail_url = "/images/prod-<slug>.webp"` | Ưu tiên ảnh chụp màn hình / mockup thật |
| **Ảnh mặc định theo nhóm** | `public/images/cat-template.webp`<br>`public/images/cat-prompt.webp`<br>`public/images/cat-workflow.webp` | `/images/cat-template.webp` (hoặc `cat-prompt.webp`, `cat-workflow.webp`) | Dùng làm ảnh nền mặc định theo `product_type` |
| **Dữ liệu seed gốc (tùy chọn)** | `data/catalog-v1.json` | Đồng bộ khi muốn đóng gói vào seed mặc định | Chạy `node scripts/generate-seed-sql.mjs` nếu đẩy lên Supabase |

---

## 2. Quy Cách Đưa File HTML Template Mẫu (`public/demos/<slug>/index.html`)

Khung xem trước (Live Preview) trên trang chi tiết sản phẩm `/products/<slug>` sẽ nhúng trực tiếp file tại `/demos/<slug>/index.html` vào thẻ `<iframe>` và cho phép người dùng chuyển qua lại giữa hai kích thước: **Desktop `1280px`** và **Mobile `375px`**.

### 2.1. Cấu trúc thư mục chuẩn

```text
public/demos/<slug>/
├── index.html          # BẮT BUỘC — Điểm vào chính của bản xem thử
├── style.css           # (Tùy chọn) CSS tách riêng, nhúng bằng ./style.css
├── app.js              # (Tùy chọn) JS tương tác tại chỗ, nhúng bằng ./app.js
└── assets/             # (Tùy chọn) Ảnh minh họa nội bộ cho riêng template
    └── hero.webp
```

> **Quy tắc đặt tên `<slug>`:** Chỉ dùng chữ thường không dấu, số và dấu gạch ngang (`^[a-z0-9-]+$`), khớp **100%** với trường `slug` của sản phẩm (ví dụ: `landing-page-my-pham-tiktok-shop`).

### 2.2. 5 Nguyên tắc bắt buộc cho file HTML Demo

1. **Dùng đường dẫn tương đối nội bộ (`./...`), tránh tuyệt đối link ngoài dễ chết:**
   - Nhúng CSS/JS/ảnh bằng `./style.css`, `./app.js`, `./assets/hero.webp`.
   - **Không** dùng `http://localhost:...`, **không** hotlink ảnh từ Shopee/Facebook/Google Drive (hay bị chặn CORS/403 sau vài ngày), **không** phụ thuộc CDN nặng làm chậm iframe.
2. **Hỗ trợ Responsive chuẩn từ `375px` đến `1280px`:**
   - Bắt buộc khai báo `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
   - Dùng `box-sizing: border-box`, `max-width`, `display: grid` với `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` và cỡ chữ linh hoạt `clamp(...)`.
   - Tuyệt đối không đặt `width: 1200px` cứng khiến chế độ **Mobile 375px** bị thanh cuộn ngang.
3. **Tương tác tại chỗ, không phá khung iframe:**
   - Các nút CTA (`Mua qua TikTok Shop`, `Giữ size`, `Gửi đơn qua Zalo`) chỉ nên hiển thị thông báo toast, bộ lọc nhanh, hoặc cập nhật giỏ thử ngay bên trong trang demo.
   - Không gọi `window.top.location = ...` hay đặt `<a target="_top">`.
4. **Banner đánh dấu bản xem thử rõ ràng:**
   - Đặt thanh nhãn nhỏ ở đầu trang demo (ví dụ: `Bản xem thử minh họa (HTML Demo) • Tương thích Desktop & Mobile 375px`) để người dùng phân biệt với trang thật.
5. **Tuân thủ nội dung an toàn theo ngành hàng:**
   - Với mỹ phẩm: không dùng từ ngữ cam kết điều trị/chữa bệnh.
   - Với mọi ngành: không dùng số liệu thu nhập phóng đại thiếu căn cứ.

### 2.3. Khung HTML Boilerplate Chuẩn (Copy & Sửa Nhanh)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Demo — Tên Mẫu Website</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      background: #fafaf9;
      color: #1c1917;
      line-height: 1.55;
    }
    .demo-banner {
      background: #0f172a;
      color: #e2e8f0;
      text-align: center;
      font-size: 12px;
      padding: 6px 12px;
    }
    .wrap {
      max-width: 1080px;
      margin: 0 auto;
      padding: 20px 16px 56px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    img { max-width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
  <div class="demo-banner">
    Bản xem thử minh họa (HTML Demo) • Tương thích Desktop &amp; Mobile 375px
  </div>
  <main class="wrap">
    <!-- Nội dung mẫu của bạn ở đây -->
  </main>
</body>
</html>
```

---

## 3. Quy Cách Ảnh Sản Phẩm (`public/images/prod-<slug>.webp`)

1. **Định dạng & Dung lượng:**
   - Bắt buộc xuất sang định dạng **`.webp`** (hoặc `.avif`).
   - Dung lượng mỗi file **dưới `120 KB`** để giữ điểm LCP nhanh trên mạng 4G và repo gọn nhẹ.
2. **Kích thước & Tỷ lệ khuyến nghị:**
   - Tỷ lệ **`16:10`** (ví dụ `1200×750 px` hoặc `960×600 px`) — khớp với khung thẻ Storefront và khung xem trước chi tiết.
3. **Quy ước đặt tên:**
   - Ảnh riêng của sản phẩm `<slug>`: `public/images/prod-<slug>.webp`  
     *(Ví dụ: `public/images/prod-landing-page-my-pham-tiktok-shop.webp`)*
   - Nếu chưa có ảnh riêng, giữ ảnh mặc định theo loại:
     - `template` $\rightarrow$ `/images/cat-template.webp`
     - `prompt_pack` $\rightarrow$ `/images/cat-prompt.webp`
     - `workflow` $\rightarrow$ `/images/cat-workflow.webp`
4. **Chất lượng thẩm mỹ:**
   - Chụp màn hình giao diện sạch (không dính thanh bookmark trình duyệt, không watermark nguồn lạ).
   - Không nhồi chữ quá nhỏ vào thumbnail vì khi thu nhỏ ở thẻ Storefront sẽ khó đọc.

---

## 4. Quy Trình Khai Báo & Cập Nhật Qua `/admin/products`

Sau khi đã chép file HTML và ảnh `.webp` vào thư mục `public/`:

### Bước 1: Mở trang Quản trị Sản phẩm
- Đăng nhập bằng tài khoản có quyền `admin`, truy cập **`/admin/products`**.

### Bước 2: Tạo mới hoặc Chỉnh sửa sản phẩm
Điền chính xác các trường hợp lệ theo schema kiểm duyệt của hệ thống:

| Trường trong Form `/admin/products` | Giá trị mẫu / Quy tắc bắt buộc |
|---|---|
| `slug` | `landing-page-my-pham-tiktok-shop` *(trùng tên thư mục trong `public/demos/`)* |
| `product_type` | `template` \| `prompt_pack` \| `workflow` |
| `demo_url` | `/demos/<slug>/index.html` *(với `template`)* hoặc để trống/`null` *(với `prompt_pack`, `workflow`)* |
| `thumbnail_url` | `/images/prod-<slug>.webp` hoặc `/images/cat-template.webp` |
| `source_type` | `original` *(tự làm)* \| `adapted` *(chuyển thể có nguồn)* \| `licensed` *(có giấy phép)* |
| `license_note` | Ghi rõ phạm vi sử dụng thương mại & nguồn gốc tài nguyên |
| `specs.preview_highlights` | Mảng 3–4 điểm nổi bật ngắn gọn hiện ngay dưới khung Live Preview |
| `specs.case_studies` | Mảng các phản hồi shop nhỏ thực tế (`shop_name`, `shop_type`, `rating`, `quote`, `outcome`) |

### Bước 3: Kiểm thử thực tế trên Storefront (`/products/<slug>`)
1. Mở `/products/<slug>` ở tab ẩn danh (hoặc không cần đăng nhập thí nghiệm).
2. Kiểm tra ảnh thumbnail hiển thị sắc nét, không lỗi 404 trong tab **Network** của DevTools.
3. Trong khung **Live Preview**:
   - Bấm **Desktop 1280px**: bố cục cân đối, không khoảng trắng thừa.
   - Bấm **Mobile 375px**: chữ rõ ràng, không tràn viền ngang, các nút CTA bấm được bình thường.
4. Nếu thêm/sửa sản phẩm dùng cho tập dữ liệu chuẩn mặc định, cập nhật đồng bộ vào `data/catalog-v1.json`.
