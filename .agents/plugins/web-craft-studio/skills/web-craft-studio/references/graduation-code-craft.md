# Kỷ Luật Kiến Trúc & Code Sạch Cho Đồ Án Web (Anti-AI & Council-Ready)

Quy chuẩn bắt buộc cho cấu trúc bên trong của ứng dụng web nhằm đảm bảo **chạy mượt, dễ bảo trì, không mang "mùi AI"** và **nhóm sinh viên làm chủ 100% khi bảo vệ trước hội đồng**.

---

## 1. Cấu Trúc Thư Mục & Kiến Trúc Bên Trong Web

Tổ chức mã nguồn theo hướng **Modular & Tách biệt trách nhiệm** (dù dùng Vanilla HTML/CSS/JS, Vite, React hay Next.js):

```text
src/
├── styles/          # Design tokens (6 vai trò màu, spacing 4px, type scale), reset, themes
├── components/      # UI component thuần tái sử dụng (Button, Dialog, Card, Navbar...)
├── sections/        # Các phân đoạn giao diện gắn liền nghiệp vụ trang (hoặc pages/features)
├── motion/          # Đóng gói riêng các hiệu ứng tương tác (scroll-progress, line-split, flip-expand...)
├── services/        # Tầng gọi API, xử lý fetch/auth, mapping dữ liệu
├── state/           # Quản lý state gọn nhẹ (store, context, localStorage theme)
└── utils/           # Helper thuần túy (format ngày/tiền tệ, sanitize, debounce/rAF)
```

- **Tách Motion ra khỏi Business Logic:** Không trộn code GSAP/IntersectionObserver/rAF vào thẳng file gọi API hay xử lý form nghiệp vụ. Mỗi hiệu ứng có hàm `initX()` và `destroyX()` (hoặc cleanup trong framework) để không rò rỉ bộ nhớ.
- **Ưu tiên Web Platform trước Framework/Library:**
  - Dùng `<dialog>` + `showModal()` thay vì tự viết portal modal phức tạp.
  - Dùng `popover` / CSS Anchor Positioning thay vì kéo Popper.js nếu bài toán thuần UI.
  - Dùng `:user-invalid` kết hợp HTML Constraint Validation trước khi viết hàng trăm dòng validate thủ công.

---

## 2. Chống "Mùi AI" Trong Mã Nguồn (Human-Crafted Code)

| Dấu hiệu code AI bị phát hiện ngay | Cách viết chuẩn Kỹ sư / Nhóm đồ án |
| :--- | :--- |
| Comment thừa thãi kiểu dịch máy ở mọi dòng (`// Initialize state`, `// Render component`, `// Return result`) | **Code tự giải thích bằng tên biến/hàm rõ nghĩa.** Chỉ comment **lý do (WHY)** ở những đoạn logic nghiệp vụ rắc rối hoặc mẹo xử lý trình duyệt (vd: `// Chờ font tải xong mới đo offsetTop để không lệch dòng`). |
| Over-engineering: Nhồi nhét Abstract Factory, Decorator, Proxy lắt léo cho một CRUD đơn giản | **KISS & YAGNI:** Giữ luồng dữ liệu thẳng, dễ lần theo từ UI $\rightarrow$ Service $\rightarrow$ API $\rightarrow$ DB. Trùng lặp 2–3 chỗ giống hệt nhau thì gom thành 1 helper tham số hóa, không tách quá vụn. |
| Đặt tên chung chung vô hồn (`data1`, `handleClick2`, `ItemComponent`, `tempObj`) | Đặt tên gắn chặt **nghiệp vụ đề tài** (`bookingSlot`, `calculateOrderTotal`, `CourseFilterBar`). |
| Commit Git 1 cục khổng lồ `"Done project"` | Chia nhỏ commit hợp lý theo từng tính năng/sửa lỗi: `feat(ui): ...`, `fix(motion): ...`, `refactor(api): ...`. |

---

## 3. Quy Tắc Sẵn Sàng Bảo Vệ Hội Đồng (Council Defense)

Mỗi khi thiết kế xong một module, luôn đảm bảo nhóm có thể trả lời trôi chảy 3 câu hỏi của giảng viên phản biện:
1. **Tại sao chọn giải pháp kỹ thuật này?** (Ví dụ: *Tại sao dùng `loading="lazy"` + `aspect-ratio` thay vì plugin lazy JS? $\rightarrow$ Tránh nháy khung trắng và giữ `CLS = 0`; Tại sao chọn `transform`/`clip-path`? $\rightarrow$ Chạy trên GPU compositor, không gây reflow*).
2. **Luồng dữ liệu & tương tác đi từ đâu tới đâu?** (Chỉ rõ điểm kích hoạt, hàm xử lý, chỗ cập nhật DOM/State và cách dọn dẹp khi unmount/scroll).
3. **Nếu thiết bị yếu, mạng chậm hoặc người dùng tắt hiệu ứng (`prefers-reduced-motion`) thì web xử lý thế nào?** (Luôn có fallback gọn nhẹ và semantic HTML hoạt động độc lập).
