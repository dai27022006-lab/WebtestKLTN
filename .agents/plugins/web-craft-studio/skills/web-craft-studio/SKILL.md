---
name: web-craft-studio
description: >
  Gói skill tổng hợp dành riêng cho thiết kế kiến trúc bên trong web, UI/UX hiện đại,
  hệ thống layout, hiệu ứng tương tác GPU và viết code sạch chuẩn kỹ sư cho dự án web
  (kết hợp Modern Web Guidance, Scroll-Craft, Playbook Đợt 1 → Đợt 4 và kỷ luật Anti-AI Code).
  Kích hoạt ngay khi thiết kế kiến trúc frontend, dựng trang/component/layout, làm theme
  dark/light, thêm animation/scroll/hover/cursor/slider, tối ưu hiệu năng (CWV), rà lỗi QA,
  hoặc tái cấu trúc template cũ sang code hiện đại, chuẩn đồ án tốt nghiệp.
---

# Web Craft Studio

Skill hợp nhất toàn bộ quy chuẩn **Thiết kế hệ thống bên trong web**, **Kỹ thuật Frontend thực chiến (Đợt 1 → Đợt 4, 10 mẫu)**, **Chuẩn Web API hiện đại (Chrome/MDN)** và **Kỷ luật code sạch không "mùi AI"** (chỉ mục kho mẫu tại `docs/README-TEMPLATE-PACK-1-TO-4.md`).

---

## Quy Trình Thực Thi 5 Bước

### Bước 1: Kiểm tra chuẩn Web Platform mới nhất (`modern-web-guidance`)
Trước khi viết HTML, CSS hoặc JS phía client (dialog, popover, table, form, theme, scroll animation, container queries, dates/sanitization, accessibility):
1. Tra cứu hướng dẫn mới nhất từ bộ skill `modern-web-guidance` đã cài trong dự án:
   ```powershell
   npx.cmd -y modern-web-guidance@latest search "<2-5 tu mo ta tinh nang>"
   npx.cmd -y modern-web-guidance@latest retrieve "<guide-id>"
   ```
   *(Nếu terminal chưa nhận `npx`, dùng `agy-node ".\.agents\skills\modern-web-guidance\modern-web.mjs"` thay thế).*
2. Ưu tiên dùng API gốc của trình duyệt (`<dialog>`, `popover`, `:has()`, `subgrid`, `@starting-style`, `:user-invalid`, `loading="lazy"`, View Transitions) thay vì kéo thêm thư viện JS nặng hoặc polyfill thừa.

### Bước 2: Định hình Kiến Trúc Thị Giác & Chống Bẫy Template AI
Đọc [references/design-grammar-and-taste.md](references/design-grammar-and-taste.md) trước khi dựng layout hoặc viết CSS token:
1. Chọn **1 Page Grammar** duy nhất phù hợp mục đích trang (trong 8 grammar: *Filmic one-shot, Chaptered editorial, Live surface, Continuous world, Typographic poster, Gallery/Catalog, Split stage, Rhythmic cutlist*) và tuân thủ danh sách **CẤM (Forbids)** của nó.
2. Vẽ **Feeling Curve** (mỗi section mang 1 trạng thái cảm xúc khác nhau, tối đa **1 Peak** chính và **1 Signature Move** độc bản).
3. Khóa **The Taste Floor**: hệ spacing cơ sở `4px`, tối đa 2 họ font chữ (tránh `Inter` làm mặc định vô thức), bảng màu 6 vai trò (`canvas`, `surface`, `ink`, `ink-soft`, `accent`, `accent-ink`) với đúng 1 màu nhấn chủ đạo.
4. Đối chiếu qua [templates/FINGERPRINTS.md](templates/FINGERPRINTS.md) để đảm bảo trang mới không tự biến thành bản sao rập khuôn của trang trước (khác tối thiểu `4/6` trục).

### Bước 3: Lựa chọn & Lắp ghép Kỹ Thuật Frontend Thực Chiến
Tra cứu [references/frontend-techniques.md](references/frontend-techniques.md) để lấy đúng **21 công thức** đã được nâng cấp lên **chuẩn GPU (`transform`, `opacity`, `clip-path`)** và miễn phí 100% từ 10 mẫu thực chiến Đợt 1 → Đợt 4:
- **Layout & Theme:** Bento `1+2`, Staggered Grid, Grid zic-zac CSS `:nth-of-type(3n+...)` (`Dinevo`), Sticky 2 cột (`Misiom`/`IT-Infinite`), Inline Pill Headline, Card khoét góc `::before` + Blur Swap (`GridTech`), Stacked Pin Scale Panels & Step Timeline Scrub (`GridTech`), Sticky Footer Reveal (`IT-Infinite`), Native Light/Dark (`data-theme` / `data-bs-theme` + `localStorage` + đổi cả SVG logo), Dynamic Sticky Header Offset.
- **Typography & Reveal:** Zero-Pin Ink Fill (`background-clip: text`), Tự tách dòng responsive (`document.fonts.ready` + `.revert()` + chừa đáy dấu tiếng Việt), Ma trận clip-path 3×3 & 4×3 (`Misiom`/`Dinevo`/`Schon`), `counterUp` giữ hậu tố `K+`/`M+` (`Dinevo`).
- **Tương tác & Motion:** Progressive Bottom Blur 8 lớp, GPU FLIP Expand (click + `Esc`), rAF / `gsap.quickTo` Hover Preview + Velocity Squeeze Cursor & Magnetic `attractHover` (`IT-Infinite`), 3-Layer Service Showcase (`Schon`, hỗ trợ `focusin`/`click`), 2D Physics Rain `Matter.js` dùng 2 `IntersectionObserver` + ngưỡng kéo `> 5px` (`Schon`), 2-in-1 Scroll Progress (`conic-gradient` / SVG smart mobile), Directional Ripple Button, WebGL Context Pool (`MAX_CONTEXTS`), 360° VR / Before-After.

### Bước 4: Rà soát Cổng Kiểm Duyệt QA (Bắt buộc trước khi bàn giao)
Kiểm tra toàn bộ code HTML/CSS/JS theo [references/qa-bug-checklist.md](references/qa-bug-checklist.md) để triệt tiêu các lỗi đã từng lộ trên video Đợt 1 → Đợt 4:
- Không preloader giả 1–4 giây hay gọi đúp `animateBars()` (`delay(0)` nếu chỉ dọn nhanh).
- Không dùng lazy-load JS `readyState complete` + `threshold: 0.3` hoặc `.fade-anim` trễ (`delay >= 0.25s`, `top 85%`) gây nháy/mảng trắng khi cuộn.
- Không nạp trùng/thừa thư viện (`Swiper` + `Owl`, `SplitText` + `SplitType`, 4 GSAP plugin không dùng); luôn kiểm tra `nextEl`/`prevEl` và tránh ghi đè `window.onscroll`/`onmousemove`.
- Không đặt `setInterval` trong `mousemove`, không `ScrollTrigger.getAll().kill()` trong `matchMedia` cleanup, không hardcode màu light sang dark theme (`.text_invert-2`), không ẩn tiêu đề project khi hover, và luôn null-check element (`#cursor`, button).
- Tự thu dọn custom cursor khi cuộn bằng `elementFromPoint`, không chặn chuột phải/DevTools, hỗ trợ `prefers-reduced-motion: reduce` và thiết kế riêng cho mobile (`<= 700px`).
- Sạch 100% nội dung: không `Lorem ipsum`, không `&nbsp;` căn lề, không link `#` chết, không trùng lặp copy/typo (`cloud-ktchen`, `servive-01.jpg`, `SKINCRE`, `ISO Developer`).

### Bước 5: Kỷ luật Code Sạch, Quy Trình Ảnh & Chuẩn Đồ Án Tốt Nghiệp
Áp dụng [references/image-pipeline.md](references/image-pipeline.md) cho mọi tài nguyên ảnh (Bước 0–7: `image-style.md`, `assets/anchor.webp`, bảng danh sách ảnh, hậu kỳ Python/OpenCV ra WebP `< 300KB`/`< 120KB`, checklist 6 câu, `assets/prompts.md` + `alt` tiếng Việt) và [references/graduation-code-craft.md](references/graduation-code-craft.md) cho mọi file code sinh ra:
- Kiến trúc thư mục module hóa gọn gàng (tách rõ UI, styles tokens, motion/interactions, services/API, state, utils).
- Giữ code theo nguyên lý KISS & YAGNI, đặt tên theo nghiệp vụ thực tế, **tuyệt đối không để comment ngây ngô kiểu AI**, đảm bảo mọi thành viên trong nhóm đọc hiểu tường tận để tự tin trả lời hội đồng phản biện.
