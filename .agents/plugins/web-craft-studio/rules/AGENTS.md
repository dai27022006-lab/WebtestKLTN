# Web Craft Studio Rules (Always-On)

Khi thiết kế giao diện, kiến trúc Frontend hoặc viết code HTML/CSS/JS trong dự án web:

1. **Ưu tiên Web API hiện đại (`modern-web-guidance`)**: Trước khi viết HTML/CSS/client JS cho các thành phần UI (dialog, popover, table, form validation, dark mode, animations, layout), tra cứu hướng dẫn mới nhất qua `npx.cmd -y modern-web-guidance@latest search "<query>"` (hoặc `agy-node`).
2. **Tuân thủ `web-craft-studio` Skill**: Áp dụng Page Grammar rõ ràng, Taste Floor (spacing 4px, tối đa 2 font, bảng màu 6 vai trò 1 accent), không dùng cấu trúc template AI rập khuôn (3 cột giống nhau, gradient tím neon, font Inter mặc định không chủ đích, số đếm `01/06`).
3. **Chặn đứng lỗi QA Đợt 1 → 4**: Không preloader giả 1–4s, không lazy-load/`fade-anim` trễ (`top 85%`, `delay >= 0.25s`) gây nháy/mảng trắng, không nạp trùng/thừa thư viện, không đặt `setInterval` trong `mousemove`, không `ScrollTrigger.getAll().kill()` trong `matchMedia`, không hardcode màu light sang dark theme, không ghi đè `window.onscroll`/`onmousemove`, không ẩn tiêu đề khi hover; mọi tương tác phải null-check, tôn trọng `prefers-reduced-motion` và `(hover: hover)`.
4. **Code người viết, sẵn sàng bảo vệ hội đồng**: KISS & YAGNI, đặt tên theo nghiệp vụ, không comment thừa thãi kiểu AI, tách module rõ ràng để nhóm đọc hiểu 100%.
