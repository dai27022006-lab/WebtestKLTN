# Kiến Trúc Thị Giác, Ngữ Pháp Trang & Sàn Thẩm Mỹ (Design Grammar & Taste Floor)

Tài liệu hợp nhất nguyên lý thiết kế của `scroll-craft` (`uniqueness.md`, `taste.md`, `feel.md`, `hero-depth.md`) cùng bài học bố cục từ **Đợt 1 → Đợt 4 (10 mẫu)** (`docs/README-TEMPLATE-PACK-1-TO-4.md`).

---

## 1. 8 Ngữ Pháp Trang (Page Grammars) & Quy Tắc Cấm (Forbids)

Không bao giờ tự ý ghép layout theo thói quen AI. Chọn **1** grammar cho mỗi trang chính và tôn trọng danh sách **CẤM**:

| Grammar | Phù hợp khi | Kỹ thuật nên ghép (từ Đợt 1 → 4) | CẤM (Forbids) |
|---|---|---|---|
| **1. Filmic one-shot** | Kể 1 câu chuyện tuyến tính cho sản phẩm vật lý, giới thiệu dự án lớn | Hero 4–5 lớp có chiều sâu, pinned testimonials 1 cột ghim – 1 cột trôi, Stacked pin scale panels (`GridTech`) | Cấm đánh số chương, cấm index nhảy mục, cấm hard-cut đổi màu nền gắt. |
| **2. Chaptered editorial** | Trang giới thiệu chuyên sâu, bài viết, hồ sơ doanh nghiệp/kiến trúc | `.invert-text` tô mực theo cuộn, `3×3 / 4×3 Grid Reveal`, bài viết lệch tầng `medium/big/small`, Bento `1+2`, Step timeline scrub (`GridTech`), Sticky 2 cột (`IT-Infinite`) | Cấm gradient `drift` trôi lơ lửng (đổi nền dứt khoát theo chương + set lại `color`), cấm nút nam châm sến ở close. |
| **3. Live surface** | Sản phẩm SaaS, công cụ tương tác, dashboard/ứng dụng thực tế | Demo tương tác thật ngay trong trang, điều khiển chọn trực tiếp, mưa thẻ vật lý có ngưỡng kéo (`Schon` — tối đa 1 khu) | Cấm dashboard giả bằng ảnh tĩnh, cấm animation chặn thao tác người dùng. |
| **4. Continuous world** | Không gian 3D / Panorama / trải nghiệm tham quan liên tục | `Panolens` 360° VR, layer chiều sâu liên kết mượt | Cấm cắt cảnh vụn hoặc nhảy layout đột ngột làm gãy cảm giác không gian. |
| **5. Typographic poster** | Trang nghệ thuật chữ, tuyên ngôn thương hiệu, sự kiện sáng tạo | Headline cỡ lớn kẹp pill ảnh inline (`Archinex`), cặp font sans + serif italic đánh số `(01)–(07)`, Sticky footer reveal (`IT-Infinite`) | Cấm nhét card 3 cột đều hay mô tả dài dòng dưới mỗi heading. |
| **6. Gallery / Catalog** | Portfolio, danh mục sản phẩm, triển lãm dự án | Horizontal `pan` 3–4 chặng, Zic-zac CSS Grid `:nth-of-type` (`Dinevo`), Card khoét góc + 2-image CSS blur swap (`GridTech`), GPU FLIP Expand, hover preview `quickTo`/rAF giữ nguyên tiêu đề | Copy trên card cực ngắn (1–2 từ), `nav` đóng vai trò **index nhảy thẳng tới item**. |
| **7. Split stage** | So sánh đối chiếu, trước/sau, giải pháp vs vấn đề | Before/After slider (`twentytwenty`), bố cục 2 nửa đối xứng/bất đối xứng ghim 1 bên | Cấm chia đôi nhưng cả 2 bên đều trôi như nhau gây rối mắt. |
| **8. Rhythmic cutlist** | Thương hiệu trẻ, năng lượng cao, chuyển nhịp dứt khoát | Đảo cực sáng/tối mạnh giữa các chặng, directional ripple button, chữ footer cực đại | Cấm `pin` dai dẳng, cấm giữ nhịp chậm quá `1.4vh` mỗi cut. |

---

## 2. Đường Cong Cảm Xúc (Feeling Curve) & Điểm Nhấn Độc Bản

Trước khi chia section HTML, lập bảng hành trình cảm xúc 1 dòng mỗi chặng:
`[STT]  [Cảm xúc]  -->  [Thứ xuất hiện trên màn hình gây ra cảm xúc đó]`

- **Quy tắc chống nhàm chán:** Không bao giờ có **2 chặng liền kề cùng một cảm xúc** (nếu trùng $\rightarrow$ 1 chặng là nội dung thừa, phải cắt hoặc đổi cách thể hiện).
- **Peak-End Rule:** Cả trang chỉ tập trung đầu tư **1 Peak (đỉnh cao)** có không gian thoáng phía trước và **1 Signature Move** độc nhất vô nhị. Không nhồi 5–6 hiệu ứng rời rạc vào cùng 1 trang.

---

## 3. Sàn Thẩm Mỹ (The Taste Floor)

### Khoảng cách & Nhịp điệu (Spacing Rhythm)
- Dùng thang **cơ sở `4px`** (`4, 8, 12, 16, 24, 32, 48, 64, 96...`).
- **Khoảng trống PHÍA TRÊN tiêu đề luôn lớn hơn PHÍA DƯỚI tiêu đề** để tách rõ ranh giới section chứ không làm trang trông như một danh sách phẳng.
- Padding section phải co giãn (`clamp(...)`) theo viewport — tuyệt đối không bê nguyên `8rem` của desktop xuống màn hình `375px`.
- Nhóm các phần tử liên quan bằng khoảng cách (proximity) trước khi nghĩ tới việc vẽ `border` hay đóng khung card.

### Typography
- **Tối đa 2 họ font** (1 Display tạo cá tính + 1 Body dễ đọc). Không dùng font thứ 3 trừ khi có lý do đặc biệt.
- **Tránh dùng `Inter` làm lựa chọn mặc định lười biếng** (dấu hiệu nhận diện web AI). Ưu tiên *Geist, Archivo, Outfit, Satoshi, Cabinet Grotesk, Plus Jakarta Sans* hoặc ghép *Sans + Fraunces italic*.
- **Tracking & Line-height:** Cỡ chữ càng lớn (`display`), `letter-spacing` càng siết chặt (`-0.02em` đến `-0.04em`). Đoạn văn giữ độ rộng **45–75ch** (`max-width: 62ch`), dùng `text-wrap: balance` cho heading và `text-wrap: pretty` cho body.
- **Bù chữ sáng trên nền tối (Dark mode):** Tăng nhẹ `line-height`, mở thêm chút `letter-spacing`, và tăng 1 nấc `font-weight` hoặc giảm độ chói trắng nhẹ để chữ không bị "cháy viền".
- **Mobile Art Direction (`<= 700px`):** Hạ cỡ Display hero xuống 1 bậc (tránh headline rớt 5–6 dòng trên điện thoại).

### Bảng màu (6 Vai trò, 1 Hue Accent)
Mọi theme đều định nghĩa theo đúng 6 token ngữ nghĩa:
1. `--bg-canvas` (nền chính, tránh đen tuyệt đối `#000000` hay trắng lóa)
2. `--bg-surface` (nền khối nổi/card)
3. `--ink` (chữ chính)
4. `--ink-soft` (chữ phụ, pha sắc độ theo nền chứ không dùng xám chết)
5. `--accent` (**chỉ 1 màu nhấn duy nhất** xuyên suốt trang; nếu lật light $\leftrightarrow$ dark giữa trang thì giữ cùng hue và đổi lightness để đảm bảo tương phản `>= 4.5:1`)
6. `--accent-ink` (chữ nằm trên nền accent)

---

## 4. Hợp Đồng Chiều Sâu Hero (5-Layer Hero Contract)

Với các trang có Hero nổi khối (như `Misiom`, `Sonder`):
1. `far`: Nền xa / không gian / gradient môi trường.
2. `mid`: Khối kiến trúc / vòng 3D / vật thể phụ trợ.
3. `subject`: Chủ thể chính (ảnh cắt nền alpha thật hoặc render 3D).
4. `foreground`: Thẻ UI / chữ / tiền cảnh tạo độ che khuất (occlusion).
5. `atmosphere`: Sương / ánh sáng viền / hạt mịn + **bottom gradient fade (`200–300px`)** che tự nhiên đường cắt chân ảnh.

---

## 5. Danh Sách Từ Chối (Anti-AI & Anti-Template Refuse List)

- **CẤM** gradient tím neon kiểu AI (*AI-purple glow*).
- **CẤM** lưới 3 card tính năng giống hệt nhau nằm ngang làm khung mặc định (thay bằng Bento `1+2`, staggered lệch tầng, hoặc bố cục 2 cột ghim-trôi).
- **CẤM** các chỉ số sáo rỗng `01 / 06`, dòng chữ `"Scroll to explore"` vô nghĩa, fake dashboard hoặc số liệu bịa đặt.
- **CẤM** dùng `&nbsp;` để đẩy lề, dùng gradient text cho mọi tiêu đề, hay lạm dụng em-dash `—` trong mọi câu copy.
