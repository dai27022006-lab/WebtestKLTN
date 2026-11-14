# Playbook Đợt 3 — UX/UI, Kỹ Thuật Tương Tác & Nhật Ký Bẫy Template (F&B & Beauty/Wellness)

Tài liệu đóng gói toàn bộ kết quả kiểm định thực chiến từ **2 mẫu đã chốt ở Đợt 3** (bởi **Nhân viên 2 / `AI - Template web`**, đối chiếu trực tiếp video quay màn hình + source code):

1. **Mẫu 1 — `Dinevo-Restaurant-Cafe`** (`06_RESTAURANT_CAFE_FOOD`: [`index.html`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html), [`main.js`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js), [`style.css`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/css/style.css))
2. **Mẫu 2 — `Schon-Spa-Wellness-Salon`** (`14_BEAUTY_SPA_FASHION`: [`demo/index.html`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/index.html), [`demo/assets/js/main.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/main.js), [`demo/assets/js/throwable.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/throwable.js), [`home-hair-Salon.html`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/home-hair-Salon.html), [`about.html`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/about.html))
*(Mẫu dự kiến thứ 3 `BeauTen-Beauty-Cosmetic` được chủ dự án loại bỏ trước khi kiểm định.)*

---

## Phần 1: Bản Đồ So Sánh UI & Nhịp Điệu Thị Giác

| Trục thiết kế | Mẫu 1: `Dinevo` (Cloud Kitchen / F&B) | Mẫu 2: `Schon` (Beauty & Wellness Spa) | Bài học áp dụng cho Dự án Tốt nghiệp |
| :--- | :--- | :--- | :--- |
| **Palette & Tông cảm xúc** | Xanh rừng đậm + vàng bơ + cam năng lượng; badge nghiêng vui mắt | Nền spa dịu kết hợp video promotion & điểm nhấn cam/kem trên các thẻ ưu đãi | Chọn bảng màu theo nhịp ngành hàng, nhưng giữ **1 màu nhấn chủ đạo** trên toàn site. |
| **Typography & Hero** | Display đậm kèm `.top-tag` / `.bottom-tag` xoay `-15deg` / `21.95deg` ([`style.css#L6475-L6542`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/css/style.css#L6475-L6542)) | Hero WebGL slide (`Three.js` `ShaderMaterial` + `distortion.jpg`) | Tag nghiêng ở Hero nên ẩn tự động trên mobile `< 768px` như `Dinevo` để không che chữ tiêu đề. |
| **Bố cục (Layout Rhythm)** | Grid 3 cột zic-zac so le (`Today's Special`); Testimonials 3N đổi màu nền theo chu kỳ + nghiêng `.active` `-10deg` ([`style.css#L12148-L12217`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/css/style.css#L12148-L12217)) | Showcase dịch vụ 3 cột (`ảnh dọc + danh sách 01.. + thẻ nổi VIEW DETAILS`) + khu tương tác vật lý trên nền video | Có thể tạo nhịp lệch tầng zic-zac hoàn toàn bằng CSS Grid `:nth-of-type(3n+...)` mà không tốn 1 dòng JS. |
| **Chi tiết định danh** | Lưới zic-zac thuần CSS Grid + 12-cell diagonal clip-path reveal (`.tw-clip-anim`) | **Mưa thẻ vật lý 2D (`Matter.js`)** kéo-ném được + rèm nước `ripples` / `.th-clip-anim` 9 ô | Nếu dùng vật lý 2D làm điểm nhấn, chỉ dùng cho **1 section tương tác**, tắt trên mobile và có ngưỡng phân biệt kéo vs bấm. |

---

## Phần 2: Kho Kỹ Thuật Frontend Giá Trị Từ Đợt 3

### 1. Mưa Thẻ Vật Lý 2D Có Kiểm Soát CPU (`Matter.js` + 2 `IntersectionObserver`)
- **Nguồn:** `Schon` — [`throwable.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/throwable.js) gắn trên `[data-throwable-scene="true"]`.
- **Cơ chế hay:**
  1. `enableRunner` (`IntersectionObserver`) tự bật/tắt `this.runner.enabled = entry.isIntersecting` để **đóng băng engine vật lý khi user cuộn khỏi section** (tránh đốt CPU chạy ngầm).
  2. `makeItRain` (`IntersectionObserver`) chờ section vào khung nhìn mới thả rơi từng `[data-throwable-el]` cách nhau `80ms` (`Matter.Body.setStatic(body, false)`) rồi tự `disconnect()`.
  3. Kết hợp `Matter.MouseConstraint` cho phép cầm-kéo-ném thẻ và sync về DOM qua `gsap.quickSetter`.
- **Nâng cấp bắt buộc khi đưa vào dự án thật:**
  - Phân biệt **kéo vs click**: nếu quãng di chuột `> 5px`, `preventDefault()` link `<a href="...">` bên trong thẻ để khỏi mở nhầm trang khi đang chơi kéo thẻ.
  - Giới hạn `5–7` thẻ; ở mobile hoặc `prefers-reduced-motion: reduce`, trả về cụm badge tĩnh.

### 2. Bố Cục Zic-Zac So Le 3 Cột Thuần CSS Grid (`Today's Special`)
- **Nguồn:** `Dinevo` — [`style.css#L14472-L14516`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/css/style.css#L14472-L14516).
- **Cơ chế:** Trên `grid-template-columns: repeat(3, minmax(0, 1fr))`, đẩy các card theo quy luật `:nth-of-type(3n + 1)` ở cột 1, `:nth-of-type(3n + 2)` ở cột 3 kèm `margin-top: 120px`, và `:nth-of-type(3n + 3)` ở cột 2 kèm `margin-block: 140px`; tại `max-width: 991.98px` reset `grid-column: auto; margin: 0;` để rớt về 2 cột / 1 cột sạch sẽ.

### 3. Showcase Dịch Vụ 3 Lớp Tương Tác (`Beauty Care services`)
- **Nguồn:** `Schon` — `.service-list.hover-item` trong [`demo/index.html`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/index.html) + [`main.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/main.js).
- **Cơ chế:** Cột trái hiển thị ảnh dọc, cột giữa liệt kê danh sách đánh số `01...`, khi `mouseover` đổi class `.item-active` để thay ảnh và bật badge nổi `VIEW DETAILS`.
- **Nâng cấp UX:** Gắn thêm sự kiện `focusin` và `click` để hỗ trợ điều hướng bàn phím lẫn màn hình cảm ứng.

### 4. Ma Trận Clip-Path Đường Chéo 4×3 (12 Ô) & 3×3 (9 Ô) + `counterUp` Hậu Tố `k`/`M`
- **Ma trận 4×3 (12 ô `.mask-1..12`):** [`Dinevo main.js#L1477-L1562`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js#L1477-L1562) (`.tw-clip-anim`); phiên bản 3×3 là `.th-clip-anim` trong `Schon`.
- **Counter giữ định dạng `k` / `M` & số lẻ:** [`Dinevo main.js#L464-L537`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js#L464-L537) tách chuỗi số và hậu tố tự động (`10K+`, `1.5M+`), animate qua `gsap.to(proxy, ...)`.
- **Helper đổi trạng thái `.active` dùng lại nhiều khu:** `setHoverActiveClass()` ở [`Dinevo main.js#L333-L413`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js#L333-L413) dùng chung cho cả lưới logo đối tác lẫn dàn thẻ testimonial 3N.

---

## Phần 3: Nhật Ký Lỗi QA & "Bẫy Template" Bắt Qua Video Đợt 3

1. **Rò rỉ timer `setInterval` bên trong `mousemove` (`Schon`):**
   - Trong [`Schon demo/assets/js/main.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/main.js), phần `.hover-reveal` gắn `setInterval(..., 100)` ngay bên trong `addEventListener("mousemove", ...)` mà không gọi `clearInterval` → càng rê chuột càng đẻ thêm hàng trăm timer chạy ngầm. **Bắt buộc thay bằng `requestAnimationFrame` đơn lẻ.**

2. **Khối lượng `.fade-anim` trễ nhịp gây mảng nền trống khi cuộn nhanh (`Dinevo`):**
   - Video ở `00:05`, `00:08`, `00:14`, `00:22`, `00:26` liên tục lộ mảng trống do [`Dinevo main.js#L829-L886`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js#L829-L886) gán cho **38 phần tử** hiệu ứng từ `opacity: 0` với `delay: 0.25`, `duration: 1.15`, `start: "top 85%"` — riêng Hero còn gán `data-delay="1".."1.6"` ([`index.html#L760-L821`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L760-L821)) kèm preloader `.delay(1000).fadeOut("slow")` ([`main.js#L72-L84`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/assets/js/main.js#L72-L84)).
   - Trong `Schon`, preloader rèm cũng ép chờ cứng `1600ms` và chạy lặp lại giữa trang chọn demo với trang `demo/index.html`.

3. **Chặn chuột phải & DevTools + Cursor viết kiểu cũ (`Schon`):**
   - Cuối [`Schon main.js`](file:///d:/templates/14_BEAUTY_SPA_FASHION/Schon-Spa-Wellness-Salon/demo/assets/js/main.js) khóa `contextmenu`, `F12`, `Ctrl+Shift+I/C/J`, `Ctrl+U`; custom cursor gán thẳng `window.onmousemove = ...` (ghi đè listener khác) và không bọc trong `@media (hover: hover) and (pointer: fine)`.

4. **Nạp thư viện GSAP thừa & Typo class toàn cục (`Dinevo`):**
   - [`Dinevo index.html#L3392-L3417`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L3392-L3417) tải 17 script vendor nhưng `MotionPathPlugin`, `Draggable`, `InertiaPlugin`, `ScrollToPlugin` **không được gọi bất kỳ dòng nào** trong `main.js`; riêng class chính `cloud-ktchen` bị gõ thiếu chữ `i` **178 lần** trong `index.html`.

5. **Lỗi copy-paste & chính tả lộ thẳng trên màn hình:**
   - **`Dinevo`:** Món *Chicken Alfredo* ở cả 2 section ([`#L1352-L1359`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L1352-L1359), [`#L2100-L2107`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L2100-L2107)) mang mô tả *"Soft donut with rich chocolate glaze"*; Burger `$99`, Salad `$89`; 2 card `Emily Carter` trùng nguyên quote ([`#L2315-L2390`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L2315-L2390)); footer copyright bỏ trống ([`#L3379`](file:///d:/templates/06_RESTAURANT_CAFE_FOOD/Dinevo-Restaurant-Cafe/index.html#L3379)).
   - **`Schon`:** Thẻ ưu đãi sai chính tả `"$50 OFF SKINCRE"`, lặp `"Buy 2 Get 20% off"`, Hero/Service sót lỗi `"At our salun"`, `"where are commited"`.
