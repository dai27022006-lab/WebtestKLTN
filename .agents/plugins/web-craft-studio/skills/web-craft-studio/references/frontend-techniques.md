# Kho Kỹ Thuật Frontend Thực Chiến (Production-Hardened)

Tổng hợp **21 kỹ thuật giá trị nhất** rút từ Đợt 1 (`Aleric`, `Misiom`, `Aurax`), Đợt 2 (`Archinex`, `Antra`, `Exploreist`), Đợt 3 (`Dinevo`, `Schon`) & Đợt 4 (`GridTech`, `IT-Infinite`), đã được viết lại để **chỉ dùng GPU (`transform`, `opacity`, `clip-path`, CSS vars)**, **không phụ thuộc plugin trả phí** và **tôn trọng `prefers-reduced-motion`**.

---

## Nhóm A — Chữ & Tiêu Đề (Typography & Text Motion)

### 1. Chữ "Tô Mực" Theo Nhịp Cuộn Không Cần Pin (Zero-Pin Scrub Ink Fill)
*Thay thế GSAP `SplitText` trả phí bằng gradient nền trượt trên từng dòng.*
```css
.ink-line {
  color: transparent;
  background-image: linear-gradient(90deg, var(--ink) 50%, var(--ink-soft) 51%);
  background-size: 200% 100%;
  background-position-x: calc(100% * (1 - var(--line-progress, 0)));
  -webkit-background-clip: text;
  background-clip: text;
}
@media (prefers-reduced-motion: reduce) {
  .ink-line { background-position-x: 0; }
}
```

### 2. Tự Tách Dòng & Tách Chữ Chờ `document.fonts.ready`
- **Cơ chế:** Lưu `el.dataset.original`, tách từ thành `<span class="word">`, nhóm các từ có cùng `offsetTop` vào `<span class="line"><span class="words">`.
- **Quy tắc bắt buộc (tránh lỗi tiếng Việt):**
  1. Bọc toàn bộ trong `await document.fonts.ready` để font web load xong mới đo `offsetTop` (tránh nhảy chiều cao dòng).
  2. Trên `.line` đặt `overflow: hidden` kèm `padding-bottom: 0.16em; margin-bottom: -0.16em;` để **không chém mất chân dấu nặng tiếng Việt** (`ạ, ệ, ộ, ự`) và chữ `g, j, p, q, y`.
  3. Khi cập nhật/đổi slide hoặc resize, luôn gọi `.revert()` (khôi phục `dataset.original`) trước khi split lại; ưu tiên dùng helper DOM thuần thay vì nạp trùng `SplitText` + `SplitType`.
  4. Tách ký tự 3D (`rotateY`) chỉ áp dụng cho **1 từ hoặc headline 2–4 từ tại Hero**, không dùng cho đoạn văn dài.

### 3. Tô Màu Từng Từ Đồng Bộ Biến CSS Theme
- Đọc màu đích trực tiếp từ CSS custom property `getComputedStyle(el).getPropertyValue("--char-active").trim()` thay vì hardcode hex trong JS, giúp Light/Dark mode đổi màu tức thì không bị lệch tông.

### 4. Headline Kẹp Pill Ảnh Inline (`Archinex`)
- Chèn cụm pill ảnh nhỏ bo tròn (`aspect-ratio` cố định, `vertical-align: middle`) nằm giữa dòng H2 để tạo chất tạp chí editorial nhẹ nhàng mà gần như không tốn JS.

---

## Nhóm B — Bố Cục & Chiều Sâu (Layout, Scroll & Depth)

### 5. Màn Mờ Dần 8 Lớp Đáy Viewport (Progressive Bottom Blur)
*Giữ chiều sâu khi cuộn nội dung nhưng tự thu gọn ở footer để không che nút CTA.*
```css
.blur-dock {
  position: fixed;
  inset: auto 0 0 0;
  height: clamp(140px, 22vh, 260px);
  z-index: 10;
  pointer-events: none;
  clip-path: inset(0 0 0 0);
  transition: clip-path 480ms cubic-bezier(0.23, 1, 0.32, 1), opacity 320ms ease;
}
.blur-dock.is-hidden {
  clip-path: inset(100% 0 0 0);
  opacity: 0;
}
.blur-dock > i {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(var(--b));
  -webkit-backdrop-filter: blur(var(--b));
  mask-image: linear-gradient(to bottom, transparent var(--s), #000 var(--m), transparent var(--e));
}
```

### 6. Ma Trận Ảnh 3×3 Mở Đường Chéo (`clip-path` Bậc Thang)
- Nhân bản ảnh thành 9 lớp `clip-path: polygon(...)` theo lưới `3×3`, mở theo 5 nhịp đường chéo (`[1] -> [2,4] -> [3,5,7] -> [6,8] -> [9]`).
- **Mẹo production:** Thêm độ dư overlap `0.3%` giữa các ô để không bị hở đường chỉ tóc 1px khi người dùng zoom trình duyệt `125%`. Chỉ dùng cho **1 khoảnh khắc Reveal đắt giá**.

### 7. Parallax Ngang Trên Ảnh Nền (Zero Layout Thrash)
- Khung chứa `overflow: hidden`, lớp ảnh bên trong `width: 125%; max-width: none; will-change: transform;` rồi scrub `translate3d(-12.5% -> 0%, 0, 0)` theo cuộn. Cho cảm giác êm hơn hẳn parallax dọc dễ giật.

### 8. Case Study Bung Toàn Khung Bằng GPU FLIP
- **Nâng cấp bắt buộc từ `Misiom`:** Tuyệt đối **không** tween `top, left, width, height` (gây reflow). Dùng kỹ thuật **FLIP**: đo `getBoundingClientRect()` trước/sau, tính `(dx, dy, sx, sy)`, animation thuần bằng `transform` + `clip-path`.
- **Cơ chế kích hoạt an toàn:** Chuyển từ `mouseenter` (dễ cướp màn hình khi user đang cuộn) sang **Click-to-Expand + phím `Esc` / nút Đóng**.

### 9. Bố Cục Bất Đối Xứng Thay Thế Grid 3 Cột Đều
- **Bento `1 + 2`** (`Exploreist home-2`): 1 card dọc lớn bên trái + 2 card ngang bên phải.
- **Staggered Lệch Tầng** (`Archinex` / `Aurax`): Các khối card xen kẽ kích thước (`medium / big / small`) hoặc so le lề trên nền watermark cố định.
- **Sticky Sidebar Tự Bù Header:** Khi làm mục lục (TOC) hoặc sidebar bám dính, tính `top = headerEl.offsetHeight + 24px` (hoặc dùng CSS variable `--header-h`) để không bị thanh nav đè mất dòng đầu.

---

## Nhóm C — Tương Tác Chuột, Điều Hướng & Theme

### 10. Custom Cursor Lerp Qua CSS Variables (`rAF`)
- Chạy `requestAnimationFrame` cập nhật biến CSS `--cx, --cy, --vx, --vy` trên phần tử `position: fixed; transform: translate3d(var(--vx), var(--vy), 0)`.
- **Bắt buộc:**
  1. Bọc trong `@media (hover: hover) and (pointer: fine)`.
  2. Gắn thêm **re-hit-test khi `scroll`**: lưu `(lastX, lastY)`, mỗi sự kiện cuộn kiểm tra `document.elementFromPoint(lastX, lastY)?.closest('[data-cursor]')` để tự thu badge `"View"` nếu thẻ đã trôi khỏi con trỏ.

### 11. Hover Hiện Ảnh / Service Thumbnail Theo Chuột (On-Demand rAF)
- Không chạy vòng lặp `rAF` vô tận ngay từ khi tải trang cho toàn bộ danh sách dịch vụ. Chỉ khởi động `rAF` khi hàng đang `mouseenter` và dừng ngay bằng `cancelAnimationFrame` khi `mouseleave`. Tắt hẳn trên màn hình cảm ứng.

### 12. Nút Progress Cuộn + Back-to-Top 2 Trong 1
- Dùng CSS `conic-gradient(..., var(--scroll-pct))` hoặc SVG `strokeDashoffset` hiển thị `%` cuộn và đổi thành mũi tên ở `>= 96%`.
- **UX tinh tế cho Mobile (`<= 991px`):** Chỉ hiện nút khi user **cuộn ngược lên** (`currentScroll < lastScrollTop`) để không chắn nội dung đọc.
- Tính an toàn `maxScroll`: `const pct = maxScroll > 0 ? Math.min(100, Math.round((window.scrollY / maxScroll) * 100)) : 0;` và gắn listener `{ passive: true }` thay vì ghi đè `window.onscroll`.

### 13. Nút Bấm Directional Ripple (`getBoundingClientRect`)
- Tính tọa độ điểm chuột đi vào/ra nút bằng `e.clientX - rect.left` và `e.clientY - rect.top` (không dùng `pageX - offset().left` vì dễ lệch trong container pin/scroll) để tâm sóng màu nở/thu đúng hướng con trỏ.

### 14. WebGL Context Pool Manager (`MAX_CONTEXTS`)
- Nếu dùng hiệu ứng WebGL/canvas (hover biến dạng ảnh, shader): giới hạn pool tối đa `<= 6–10` context, ưu tiên tạo on-demand qua `IntersectionObserver`/`mouseenter`, hủy context cũ nhất qua `gl.getExtension('WEBGL_lose_context')?.loseContext()`, và luôn giữ thẻ `<img>` tĩnh bên dưới làm fallback.

### 15. Hệ Thống Theme Light/Dark Toàn Cục
- Dùng thuộc tính gốc `data-theme` (hoặc `data-bs-theme`) lưu vào `localStorage`, tôn trọng `prefers-color-scheme` ở lần đầu, đồng bộ đổi cả SVG logo (`logo.svg` $\leftrightarrow$ `logo-light.svg`) khi lật theme, và hỗ trợ khóa cục bộ `data-theme="light"` cho các card ảnh không được đảo màu chữ.
- Khi dùng smooth scroll / animation thư viện (như GSAP), bọc vào `gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", ...)` và chỉ nạp duy nhất **1 thư viện carousel** (ví dụ `Swiper`).

---

## Nhóm D — Kỹ Thuật Thực Chiến Bổ Sung Từ Đợt 3 & Đợt 4

### 16. Bố Cục Zic-Zac Thuần CSS Grid (`:nth-of-type`) & Counter Hậu Tố `k`/`M` (`Dinevo`)
- Trên lưới `grid-template-columns: repeat(3, minmax(0, 1fr))`, đẩy so le card bằng `:nth-of-type(3n + 1)` (cột 1), `:nth-of-type(3n + 2)` (cột 3 + `margin-top: 120px`) và `:nth-of-type(3n + 3)` (cột 2 + `margin-block: 140px`), sau đó reset `grid-column: auto; margin: 0;` tại `@media (max-width: 991.98px)` — tạo nhịp bất đối xứng không tốn 1 dòng JS.
- Kết hợp ma trận `clip-path` mở rộng lên **4×3 (12 ô)** (`.tw-clip-anim` ở `Dinevo`) bên cạnh bản **3×3 (9 ô)**, và viết helper `counterUp` tự tách phần số với hậu tố (`10K+`, `1.5M+`) kèm số lẻ thay vì gán cứng text tĩnh.

### 17. Mưa Thẻ Vật Lý 2D Kiểm Soát CPU (`Matter.js` + 2 `IntersectionObserver`) & Showcase 3 Lớp (`Schon`)
- Khởi tạo **2 `IntersectionObserver`**: `enableRunner` đóng/mở `runner.enabled = entry.isIntersecting` để **đóng băng engine vật lý khi rời khỏi viewport**, còn `makeItRain` chỉ thả `[data-throwable-el]` cách nhau `80ms` khi section lọt khung hình rồi tự `disconnect()`.
- **Nâng cấp UX bắt buộc:** Chỉ dùng tối đa `5–7` thẻ; đo quãng kéo chuột — nếu `distance > 5px`, chặn `click` (`preventDefault()`) để user kéo ném thẻ không bị mở nhầm link; fallback về badge tĩnh trên mobile hoặc `prefers-reduced-motion: reduce`.
- Với danh sách dịch vụ 3 cột (`ảnh + list đánh số 01.. + thẻ nổi`), gắn thêm `focusin` và `click` bên cạnh `mouseover` để người dùng bàn phím & mobile thao tác trọn vẹn.

### 18. Hover Preview Mượt Bằng `gsap.quickTo` + Squeeze Cursor & Magnetic Button (`IT-Infinite`)
- Thay vì gọi mới `gsap.to()` mỗi lần `mousemove`, khởi tạo sẵn `gsap.quickTo(previewEl, "x", { duration: 0.5, ease: "power3" })` (tương tự cho `"y"`) để ảnh preview bám chuột cực mượt mà nhẹ CPU; **bắt buộc giữ nguyên tiêu đề/mô tả hàng khi hover** để không ẩn mất link user đang định bấm.
- Phiên bản cursor cao cấp có thể tính vận tốc di chuyển để nén nhẹ (`getSqueeze` $\le 0.15$) và đổi nhãn ngữ cảnh (`"Drag"` trên slider), kết hợp nút hút chuột `attractHover` tính offset quanh tâm nút (luôn null-check phần tử trước khi khởi tạo).

### 19. Card Khoét Góc CSS (`::before`) & Đổi 2 Ảnh Trượt Mờ Không Cần WebGL (`GridTech`)
- Tạo ô vuông bo góc trùng `--bg-canvas` bằng `.card::before` ở góc dưới bên phải để "khoét lỗ" đặt nút mũi tên CTA sạch sẽ.
- Chồng 2 thẻ `<img>`: khi `:hover`, ảnh mới lướt từ `translateX(50%) scaleX(2)` về vị trí chuẩn trong khi ảnh cũ trượt ra `translateX(-50%) scaleX(2)` kèm `filter: blur(10px)` — cho hiệu ứng motion-blur ấn tượng hoàn toàn bằng CSS, không tốn 1 WebGL context nào.

### 20. Panel Pin-Scale Thu Nhỏ (`0.8 -> 1`) & Step Timeline Scrub (`GridTech`)
- Pin từng `.panel` ở `start: "top 14%"` và thu nhẹ panel trước đó về `scale: 0.8` (panel cuối giữ `1`), đồng thời scrub màu badge số + `scaleY(0 -> 1)` cho thanh nối dọc `.number-line-fill` theo tiến độ cuộn.
- **Quy tắc dọn dẹp an toàn:** Khi bọc trong `gsap.matchMedia()`, luôn trả về hàm cleanup tự thu hồi đúng timeline của chính section đó (`ctx.revert()` / `panels.forEach(st => st.kill())`), **tuyệt đối không** gọi `ScrollTrigger.getAll().forEach(t => t.kill())`.

### 21. Vào Trang Tức Thì (`delay(0)`) & Sticky Footer Reveal (`IT-Infinite`)
- Bỏ preloader chờ giả bằng cách dùng `delay(0)` hoặc ẩn ngay khi DOM/tài nguyên chính sẵn sàng; áp dụng `stickyFooter()` tính chiều cao footer gán vào `margin-bottom` của `.site-content` (kèm cập nhật lại khi `resize`) để tạo hiệu ứng vén màn lộ footer phía sau mà không che khuất nội dung cuối trang.
