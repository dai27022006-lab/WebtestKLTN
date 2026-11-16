# UI-BRIEF.md — Chuẩn giao diện mong muốn (Bước 0)

> File này khóa mục tiêu thẩm mỹ và mức độ bám sát template mẫu trước khi AI phân tích `reference/` và lập `docs/DESIGN.md`.
> Toàn bộ Backend/API/DB/Tracking/F11 giữ nguyên theo `RULES.md` (v3) và `docs/API-CONTRACT.md`.

---

## 1. Dự án làm gì?
- **Nền tảng:** Cửa hàng số cho **chủ shop nhỏ Việt Nam (1–3 người)** bán hàng trên Shopee, TikTok Shop, Facebook (bán template web, prompt pack, 1–2 workflow đơn giản) tích hợp **Trợ lý ảo tư vấn (F7)**, **Thí nghiệm có nhiệm vụ A/B (F11)**, **Thanh toán Mock Sandbox & Giao hàng token (F5–F6)** và **Dashboard phân tích (F10)**.
- **Yêu cầu thực dụng:** Giao diện phải trông như một sản phẩm thương mại thật, rõ ràng, dễ bấm, đáng tin cậy — **không** sơ sài dạng wireframe/demo thô.

---

## 2. Lấy gì từ giao diện mẫu (`/reference/`)?
- *(Chờ bạn chốt sau khi bỏ mẫu vào `/reference/` — gợi ý mặc định:)*
  - Bố cục các section, tỷ lệ chia cột, khoảng cách (spacing), nhịp cuộn.
  - Kiểu card sản phẩm, kiểu nút bấm (CTA), hệ thống header/footer và hiệu ứng hover tinh tế.

---

## 3. Đổi gì?
- **Ngôn ngữ & nội dung:** 100% tiếng Việt tự nhiên cho chủ shop nhỏ; thay toàn bộ chữ mẫu, số liệu, tên thương hiệu.
- **Hình ảnh:** Dùng ảnh thật / WebP sạch đặt trong `public/images/` (đồng bộ tông màu, dung lượng nhẹ).
- **Màu sắc & Font:** *(Chờ bạn chọn 1 trong 2 hướng bên dưới)*
  - **Phương án A:** Giữ bảng màu & font của template mẫu (chỉ đổi sang font hỗ trợ đầy đủ dấu tiếng Việt nếu font gốc lỗi dấu).
  - **Phương án B:** Giữ 90% bố cục template mẫu, đổi màu & font về Design Tokens riêng của dự án.

---

## 4. Bỏ gì? (Khóa cứng theo `RULES.md` & `web-craft-studio`)
- Bỏ **preloader giả** (màn hình loading 1–4s).
- Bỏ **con trỏ chuột custom** gây giật/lệch khi cuộn.
- Bỏ **số liệu bịa, testimonial giả, chữ `Lorem ipsum`**, số đếm `01/06` rập khuôn.
- Bỏ **thư viện JS thừa/cũ** (jQuery, plugin scroll nặng) — thay bằng CSS hiện đại + `IntersectionObserver` tôn trọng `prefers-reduced-motion`.

---

## 5. Giống mẫu đến mức nào?
- **Mục tiêu:** `Visually faithful` (~85–90% bố cục, tỷ lệ khoảng cách và nhịp thị giác của template mẫu ở cả Desktop `1280px` và Mobile `375px`), nhưng **100% chức năng** phải nối thật với `src/services/**`, `useCart()`, `useExperiment()` và `14 sự kiện tracking`.
