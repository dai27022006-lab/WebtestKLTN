# Nhật Ký Lỗi QA & Checklist Bắt Buộc Trước Khi Bàn Giao

Tất cả các lỗi dưới đây đều là **lỗi thực tế đã bị phát hiện trực tiếp** khi kiểm tra source code và video quay màn hình **10 mẫu Đợt 1 → Đợt 4**: Đợt 1 (`Aleric`, `Misiom`, `Aurax`), Đợt 2 (`Archinex`, `Antra`, `Exploreist`), Đợt 3 (`Dinevo`, `Schon`) và Đợt 4 (`GridTech`, `IT-Infinite`). Tuyệt đối không để tái diễn trong dự án web.

---

## 1. Lỗi Hiệu Năng & Trải Nghiệm Tải Trang

| Lỗi thường gặp trong Template | Hậu quả thực tế | Cách xử lý chuẩn Production |
|---|---|---|
| **Preloader giả lập 1–4 giây** (`Archinex` `2s+1s`, `Antra` gọi `animateBars()` 2 lần + `remove()` 3000ms, `Dinevo` `delay(1000)`, `Schon` `1600ms`, `GridTech` `delay(600)`, `Aurax` chạy lặp từng trang con) | Chặn First Impression, user phải đợi mỗi lần chuyển trang | **Bỏ hoàn toàn preloader ở các trang con.** Ưu tiên vào trang tức thì (`delay(0)` như `IT-Infinite`); nếu có màn mở đầu trang chủ, giữ `<= 350–400ms`, chạy **1 lần duy nhất mỗi phiên** (`sessionStorage`), đảm bảo nội dung HTML tĩnh sẵn sàng ngay. |
| **Lazy-load JS đợi `readyState === 'complete'` + `threshold: 0.3`** (`Exploreist lazy.image.js`) | Ảnh nháy khung xám `placeholder.svg` lộ liễu ngay trước mắt khi cuộn | Dùng native `<img loading="lazy" decoding="async">` (hoặc `IntersectionObserver` với `rootMargin: '200px'`) kèm `width`/`height` hoặc `aspect-ratio` cố định để giữ `CLS = 0`. |
| **Scroll Reveal / `.fade-anim` giấu sạch hoặc trễ nhịp** (`opacity: 0` + `start: 'top 85%'` + `delay >= 0.25s–1.6s` trên 38 phần tử ở `Dinevo` & `Aleric`) | Khi user cuộn nhanh, nhiều khoảng màn hình bị trắng trống trơn | Kích hoạt sớm ở mép đáy (`top 92%–95%` / `rootMargin: '-8% 0px'`), `stagger: 30–80ms`, `translateY <= 14px`, dùng `cubic-bezier(0.23, 1, 0.32, 1)`, không đặt `delay > 0.1s` cho nội dung thân trang. |

---

## 2. Lỗi JavaScript, DOM & Thư Viện

1. **Nạp trùng/thừa thư viện & khởi tạo đúp:**
   - Không kéo cả `Swiper` lẫn `Owl Carousel`, hoặc cả `SplitText` lẫn `SplitType`, hoặc chồng `ScrollSmoother` + `WOW.js` + `parallaxie` (`GridTech`) hay tải hàng loạt GSAP plugin không dùng (`MotionPathPlugin`, `Draggable`, `InertiaPlugin`, `ScrollToPlugin` ở `Dinevo`).
   - Khi chạy lại hiệu ứng tách chữ (ví dụ lúc đổi slide carousel), bắt buộc gọi `.revert()` trước khi split lại hoặc chỉ animate phần tử bọc ngoài.
2. **Đấu ngược nút điều khiển Carousel:**
   - Kiểm tra kỹ `nextEl` phải trỏ đúng `.swiper-next` và `prevEl` trỏ đúng `.swiper-prev` (tránh lỗi như `Antra main.js#L634-L637` đấu ngược 2 nút).
3. **Rò rỉ timer, ghi đè sự kiện toàn cục, thiếu null-check & lỗi `NaN`:**
   - **Tuyệt đối không đặt `setInterval` bên trong `mousemove`** (`Schon .hover-reveal` sinh hàng trăm timer chạy ngầm vì không `clearInterval`) — luôn thay bằng một vòng `requestAnimationFrame` hoặc `gsap.quickTo`.
   - Tuyệt đối không gán `window.onscroll = ...` hay `window.onmousemove = ...` (`Schon`, dùng `addEventListener(..., { passive: true })`).
   - Không hủy toàn bộ ScrollTrigger bằng `ScrollTrigger.getAll().forEach(t => t.kill())` trong `gsap.matchMedia()` cleanup (`GridTech`) — chỉ kill/revert đúng context của module đó.
   - Luôn null-check DOM element trước khi thao tác (`if (!cursor) return;` — tránh lỗi văng crash như `IT-Infinite` khi bỏ `#cursor`) và kiểm tra `maxScroll > 0` trước khi chia phần trăm cuộn.
   - Không gắn click theo global ID chung chung (`#next`, `#prev`) dễ đụng độ khi có 2 slider trên cùng 1 trang.
4. **Custom Cursor bị "treo xác" khi cuộn bánh xe & khóa DevTools:**
   - Nếu chỉ nghe `mouseleave`, khi user giữ nguyên chuột và cuộn con lăn, thẻ trượt qua khỏi con trỏ khiến badge `"View"` kẹt cứng giữa màn hình. Bắt buộc re-hit-test bằng `document.elementFromPoint` trong listener `scroll`.
   - Không viết code chặn chuột phải (`contextmenu`) hay phím DevTools (`F12`, `Ctrl+Shift+I/C/J`, `Ctrl+U` như `Schon`) trong đồ án web thật.
5. **Tách chữ chưa chờ font, mất dấu tiếng Việt & lỗi ghép CSS sang Dark Theme:**
   - Luôn bọc trong `document.fonts.ready` và thêm `padding-bottom: 0.16em; margin-bottom: -0.16em` cho `.line` có `overflow: hidden`.
   - **Không hardcode mã màu light theme trong gradient chữ:** Lỗi `.text_invert-2` ở `GridTech` dùng `rgb(0, 0, 0)` nửa sau khiến tiêu đề tàng hình trên nền tối — phải đọc từ token `--ink` / `--ink-soft`.

---

## 3. Lỗi Responsive, UX Tương Tác, Đường Dẫn & Nội Dung Template

1. **Đường dẫn tài nguyên & UX tương tác hỏng khi kéo/hover:**
   - Tránh viết cứng `'/assets/...'` nếu web có thể deploy ở subpath hoặc mở tĩnh; dùng đường dẫn tương đối nhất quán hoặc `new URL(..., import.meta.url)` (trong Vite/ESM).
   - **Không ẩn tiêu đề/link đang định bấm khi hover** (lỗi `Case Studies` của `IT-Infinite` đặt `.case-studies-title { opacity: 0 }` lúc `:hover`).
   - Với vật lý/kéo thả (`Matter.js` của `Schon`), luôn kiểm tra quãng kéo `> 5px` để chặn mở nhầm thẻ `<a>`.
2. **Bỏ rơi Mobile (`<= 700px`) & Reduced Motion:**
   - Hạ cỡ chữ hero display xuống 1 bậc để không gãy 6 dòng; ẩn các badge/tag trang trí xoay góc trên màn hình nhỏ (`< 768px` như `Dinevo`).
   - Các khối **Horizontal Scroll (`pan`)** phải tự chuyển về **stack dọc** hoặc **`overflow-x: auto` + `scroll-snap-type`**, và **mưa thẻ vật lý 2D** phải trả về cụm badge tĩnh trên mobile hoặc khi `prefers-reduced-motion: reduce`.
3. **Rác nội dung từ Template (Template Smells):**
   - Kiểm tra 0% còn sót `Lorem ipsum`, `logoipsum`, lỗi chính tả (`cloud-ktchen`, `$50 OFF SKINCRE`, `servive-01.jpg`, `ISO Developer`, `"At our salun"`), tiêu đề/mô tả copy trùng y hệt giữa các card (ví dụ lặp feature bảng giá, lặp testimonial `Emily Carter` / `Robert Allison` / `Hope Diamond`).
   - Không dùng `href="#"` chết hay footer copyright bỏ trống; mọi liên kết nội bộ phải trỏ đúng route thực tế.
   - Không dùng `<span>&nbsp; &nbsp;</span>` để đẩy lề thụt đầu dòng (dùng `text-indent` hoặc `padding-inline-start` bằng CSS).
