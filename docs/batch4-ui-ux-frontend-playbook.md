# Playbook Đợt 4 — UX/UI, Kỹ Thuật AI/SaaS & Nhật Ký Bẫy Template

Tài liệu đóng gói kết quả kiểm định thực chiến từ **2 mẫu đã xem ở Đợt 4** (`01_AI_SAAS_STARTUP` — bởi **Nhân viên 2 / `AI - Template web`**, đối chiếu video quay màn hình + source code):

1. **Mẫu 1 — `GridTech-AI-Security-Marketing`** ([`index.html`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index.html), [`index-2.html`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index-2.html), [`main.js`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js), [`main.css`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/css/main.css))
2. **Mẫu 2 — `IT-Infinite-Solutions-Services-Company`** ([`index.html`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html), [`custom.js`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js), [`attractHover.js`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/attractHover.js), [`style.css`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/css/style.css))
*(Các mẫu còn lại của Đợt 4 như `Solutix`, `Hedpro`, `Portivio` dừng lại tại bước chốt gói tổng hợp.)*

---

## Phần 1: Bản Đồ So Sánh UI & Nhịp Điệu Thị Giác

| Trục thiết kế | Mẫu 1: `GridTech` (AI / Security SaaS) | Mẫu 2: `IT-Infinite` (IT Solutions Agency) | Bài học áp dụng cho Dự án Tốt nghiệp |
| :--- | :--- | :--- | :--- |
| **Palette & Polarity** | Dark navy/tím phát sáng, nhưng copy nhầm gradient chữ đen từ light theme sang dark theme | Đen tuyền `#000` + xanh lam neon nhẹ ở đường kẻ & icon | Tuyệt đối không hardcode mã màu trong hiệu ứng gradient chữ; dùng biến CSS `--ink` / `--ink-soft`. |
| **Typography & Hero** | Hero `SplitText` từng chữ + 3 card số/video phía dưới; nhiều heading dùng `.text_invert-2` scrub | Display khổng lồ `Infinite` + nút tròn xoay CTA; vào trang ngay (`preloader delay(0)`) | Bỏ preloader chờ giả giúp First Impression nhanh và tự nhiên hơn hẳn. |
| **Bố cục (Layout Rhythm)** | `Projects` ghim thu nhỏ panel (`scale 0.8 -> 1`) trên marquee nền; `index-2` dùng `Horizontal Scrub` & Step timeline dọc | Sticky trái + 6 thẻ dịch vụ cuộn phải (`Our Steps`); `Case Studies` hàng ngang + Sticky Footer reveal | Bố cục Sticky 2 cột và Case Study dạng list kết hợp preview bám chuột rất hợp làm trang giải pháp/sản phẩm B2B. |
| **Chi tiết định danh** | Card khoét góc `70×70px` (`::before`) + motion-blur swap 2 ảnh thuần CSS | Custom cursor co giãn theo vận tốc (`getSqueeze`) + chữ `"Drag"` trên carousel + nút hút chuột `attractHover` | Kết hợp `gsap.quickTo` với giữ nguyên tiêu đề hàng khi hover để vừa đẹp vừa dễ bấm. |

---

## Phần 2: Kho Kỹ Thuật Frontend Giá Trị Từ Đợt 4

### 1. Ảnh Preview Bám Chuột Mượt Với `gsap.quickTo` (`IT-Infinite`)
- **Nguồn:** [`custom.js#L494-L521`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L494-L521).
- **Cơ chế:** Thay vì tạo mới `gsap.to()` trên từng sự kiện `mousemove`, khởi tạo `gsap.quickTo(image, "x", {duration: 0.5, ease: "power3"})` (tương tự cho `y`), đồng bộ toạ độ `activeImage` khi con trỏ chuyển nhanh từ hàng trên xuống hàng dưới.

### 2. Card Khoét Góc & Đổi 2 Ảnh Trượt Mờ Thuần CSS (`GridTech` `index-2`)
- **Nguồn:** [`main.css#L7280-L7366`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/css/main.css#L7280-L7366).
- **Cơ chế:**
  - Dùng `.project-image-items-2::before` tạo ô `70×70px` bo góc trùng màu nền `--bg` ở góc dưới bên phải để "khoét lỗ" đặt nút `.arrow-icon`.
  - Xếp 2 thẻ `<img>` chồng lên nhau; khi `:hover`, ảnh mới kéo từ `translateX(50%) scaleX(2)` về bình thường còn ảnh cũ trượt sang `translateX(-50%) scaleX(2)` kèm `filter: blur(10px)` — không tốn WebGL.

### 3. Ghim & Thu Nhỏ Từng Panel + Step Timeline Scrub (`GridTech`)
- **Stacked Scale Panels:** [`main.js#L563-L601`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js#L563-L601) pin từng `.des-portfolio-panel` ở `start: "top 14%"`, thu `scale` panel phía sau về `0.8` (panel cuối giữ `1`), phối hợp pin dải nền `.tp-project-5-2-title` ([`#L642-L664`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js#L642-L664)).
- **Vertical Step Timeline:** [`main.js#L607-L636`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js#L607-L636) dùng ScrollTrigger `scrub: true` đổi màu badge số (`#8339ff`), kéo `.number-line-fill` (`scaleY: 1`), và xoay `.content` về `rotateY: 0`.

### 4. Custom Cursor Co Giãn Theo Vận Tốc + `"Drag"` Badge + Nút Hút Chuột (`IT-Infinite`)
- **Dynamic Squeeze Cursor:** [`custom.js#L598-L671`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L598-L671) tính `getAngle()` và `getSqueeze()` (nén tối đa `0.15`) theo vận tốc lia chuột, đồng thời đổi `data-cursor-text="Drag"` trên vùng slider `[data-cursor-type]`.
- **Magnetic Buttons:** `attractHover` ([`attractHover.js`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/attractHover.js), gọi tại [`custom.js#L742-L748`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L742-L748)) và `.wt-hover-btn-wrapper` ([`GridTech main.js#L162-L190`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js#L162-L190)) tính độ lệch tương đối quanh tâm nút.
- **Sticky Footer Reveal & Clean Preloader:** `IT-Infinite` dùng `delay(0)` cho preloader ([`custom.js#L63-L66`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L63-L66)) và `stickyFooter()` ([`#L780-L783`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L780-L783)) chừa `margin-bottom` cho `.site-content`.

---

## Phần 3: Nhật Ký Lỗi QA & "Bẫy Template" Bắt Qua Video Đợt 4

1. **Bug CSS tàng hình chữ do bê nguyên từ Light Theme sang Dark Theme (`GridTech` `index-2.html`):**
   - [`main.css#L11509-L11516`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/css/main.css#L11509-L11516): `.text_invert-2 > div` đặt `background-image: linear-gradient(to right, rgb(255, 119, 34) 50%, rgb(0, 0, 0) 50%)` + `color: transparent`. Do nửa sau là **đen tuyền `rgb(0,0,0)`** trên nền tối của `index-2.html`, các heading `Where...`, `Client Experiences...`, `Meet the Minds Behind...` gần như biến mất trước khi scroll quét qua (`00:24–00:36`).

2. **Cleanup `ScrollTrigger.matchMedia` "giết nhầm" toàn trang & thiếu Null Check (`GridTech` + `IT-Infinite`):**
   - [`GridTech main.js#L597-L599`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js#L597-L599): cleanup của `pr.add("(min-width: 1199px)", ...)` gọi `ScrollTrigger.getAll().forEach((trigger) => trigger.kill())` → resize ngang ngưỡng `1199px` sẽ hủy toàn bộ `ScrollTrigger` khác trên trang.
   - [`GridTech main.js#L120-L1614`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/assets/js/main.js): nạp chồng `ScrollSmoother` (`smooth: 2`), `WOW.js`, `parallaxie`, và cuộn `#back-top` bằng jQuery `animate({ scrollTop: 0 })` (`#L719`); preloader vẫn khóa `.delay(600)` (`#L963`).
   - [`IT-Infinite custom.js#L598-L600`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/js/custom.js#L598-L600): gọi `cursor.querySelector(...)` trực tiếp mà không kiểm tra `if (!cursor) return;` → nếu trang nào bỏ DOM `#cursor`, JS văng lỗi ngay dòng 599.

3. **Bẫy UX ở `Case Studies` hover: ẩn mất tên dự án đang định bấm (`IT-Infinite`):**
   - [`style.css#L3432-L3444`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/css/style.css#L3432-L3444) set `.case-studies-title` và `.case-studies-description` về `opacity: 0` lúc hover để bật dải `.marquee-wrapper` lặp lại (`Web Design | UI/UX Design | Developer | ISO Developer | Digital Agency`), khiến người dùng vừa rê chuột vào tên dự án (`Petfluent`, `Educatgenix`...) để bấm thì tên dự án biến mất. **Khắc phục:** Giữ nguyên tiêu đề dự án khi hover, chỉ trượt ảnh bám chuột và highlight hàng.

4. **Lỗi copy-paste nội dung nặng nề trên cả 2 mẫu:**
   - **`GridTech`:**
     - `index.html`: *How It Works* để nguyên `Lorem Ipsum` ở cả 3 bước ([`#L470-L528`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index.html#L470-L528)); Hero card 2 sai ngữ pháp `"Innovative solutions for modern businesses success. Innovative solution modern global"` ([`#L410`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index.html#L410)); 3 gói giá (`$29/$59/$99`) giống hệt feature và lặp `"Up to 3 user accounts"` **2 lần trong cùng 1 card** ([`#L804-L1050`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index.html#L804-L1050)); tên file ảnh gõ nhầm `servive-01.jpg` ([`#L629`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index.html#L629)).
     - `index-2.html`: 3 card Testimonial nối tiếp đều tên `Robert Allison /Sales manager` với quote dán đúp dính chữ `"...outline.From..."` ([`#L959-L1011`](file:///d:/templates/01_AI_SAAS_STARTUP/GridTech-AI-Security-Marketing/index-2.html#L959-L1011)).
   - **`IT-Infinite`:**
     - Thẻ *Information Security* & *Data Synchronization* ghi *"Remind yourself of someone you know who died suddenly..."* ([`#L396-L411`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html#L396-L411)).
     - *Case Studies* lặp 5 lần câu `"there are eight thing"` ([`#L521-L730`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html#L521-L730)) + gõ sai `"ISO Developer"` ([`#L541`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html#L541)).
     - *Testimonials* nhắc nhầm `"The IT-Hub database..."` và ghi tên tác giả là `"Key Benefits"` ([`#L813-L876`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html#L813-L876)).
     - *FAQ* 2 cột `01–04` và `05–08` trùng lặp y hệt, gồm cả `"It turned out to be the Hope Diamond?"` ([`#L1013-L1073`](file:///d:/templates/01_AI_SAAS_STARTUP/IT-Infinite-Solutions-Services-Company/index.html#L1013-L1073)).
