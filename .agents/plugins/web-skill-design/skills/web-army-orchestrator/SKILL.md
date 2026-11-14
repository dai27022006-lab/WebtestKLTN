---
name: web-army-orchestrator
description: >-
  Cẩm nang điều phối Đội Quân AI Agent cho Đồ án Tốt nghiệp Web: phối hợp song song
  hoặc tuần tự các nhánh chuyên trách (ai-template-1-ux, ai-template-2-fe,
  ai-skill-design-web, web-devops-release, web-qa-verifier) cùng image-generator và
  browser tester qua Subagents hoặc Swarm (/teamwork), khóa quyền sở hữu file và
  quy trình đẩy GitHub Preview cho Đại nghiệm thu.
---

# Web Army Orchestrator — Điều Phối Đội Quân AI Agent

Skill này hướng dẫn Agent điều phối chính (Coordinator) cách vận hành đội quân AI Agent cho Đồ án Tốt nghiệp:

- **Nhánh UX/UI & FrontEnd (`AI Template 1 + 2`)**: `ai-template-1-ux` + `ai-template-2-fe` (+ `image-generator` tạo visual asset)
- **Nhánh BackEnd & Cơ chế Web (`AI Skill Design Web`)**: `ai-skill-design-web`
- **Nhánh Hạ tầng & Phát hành (`DevOps / Release`)**: `web-devops-release`
- **Nhánh Kiểm định Chéo (`QA + Visual E2E`)**: `web-qa-verifier` (+ `browser` subagent test chạy thật)

> **Ranh giới với nhóm người thật của Đại:** Việc nghiên cứu dữ liệu đề tài và viết báo cáo đồ án do **thành viên người thật trong nhóm Đại** đảm nhận. Đội AI tập trung xây dựng phần mềm sạch, chạy ổn định và xuất tài liệu kỹ thuật rõ ràng (`UI-UX-SPEC.md`, `API-CONTRACT.md`, `prisma/schema.prisma`) làm đầu vào cho nhóm.

---

## 1. Ma Trận Phân Quyền File (Chống Đụng Độ Khi Chạy Song Song)

| Nhánh Agent | Thư mục / File ĐƯỢC PHÉP SỬA | Thư mục / File CẤM SỬA |
|---|---|---|
| `ai-template-1-ux` | `docs/UI-UX-SPEC.md`, `src/styles/tokens.css`, `src/styles/themes.css`, `src/styles/typography.css`, `FINGERPRINTS.md` | `src/app/api/**`, `src/server/**`, `prisma/**`, `.github/**` |
| `ai-template-2-fe` | `src/components/**`, `src/sections/**`, `src/motion/**`, giao diện `src/app/**/page.tsx`, tiêu thụ ảnh từ `public/images/**` | `src/app/api/**`, `src/server/**`, `src/lib/auth/**`, `prisma/**` |
| `ai-skill-design-web` | `docs/API-CONTRACT.md`, `prisma/**`, `supabase/**`, `src/types/api.ts`, `src/schemas/**`, `src/app/api/**`, `src/actions/**`, `src/server/**`, `src/lib/**`, `src/services/**`, `src/state/**`, `src/middleware.ts` | `src/styles/tokens.css`, `src/motion/**`, `src/components/**` |
| `web-devops-release` | `.gitignore`, `.github/**`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`, `vercel.json`, `apphosting.yaml`, `next.config.*` (headers/images), `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/api/health/route.ts` | `src/components/**`, `src/styles/**`, `src/server/services/**` |
| `web-qa-verifier` | *(Không sửa file code — chỉ đọc & chạy lệnh kiểm tra)* | Tất cả file mã nguồn |

> **Quy tắc với Visual Assets (`image-generator` + Python/OpenCV):** Tuân thủ tuyệt đối quy trình 8 bước tại `.agents/plugins/web-craft-studio/skills/web-craft-studio/references/image-pipeline.md`:
> 1. `ai-template-1-ux` lập `image-style.md`, tạo/duyệt ảnh neo `assets/anchor.webp` (Bước 0) và bảng danh sách ảnh (Bước 1). Không tạo ảnh ngoài bảng.
> 2. Với ảnh cần AI (chỉ Hero, nền chiều sâu, 404/Empty State, banner), điền đủ prompt 6 mục (Bước 3), dùng `image-generator` tạo 3–4 phương án chọn 1 tham chiếu `anchor.webp` (Bước 4). Icon đơn giản dùng SVG/CSS; screenshot thật ghép khung bằng HTML/CSS (Bước 2).
> 3. Chạy hậu kỳ Python/OpenCV đồng bộ màu + grain nhẹ + crop đúng tỉ lệ + xuất WebP (`hero < 300KB`, `card < 120KB`) vào `public/images/[loai]-[vi-tri]-[so].webp` (Bước 5), duyệt checklist 6 câu Bước 6 và ghi log prompt + nguồn AI vào `assets/prompts.md` + `alt` tiếng Việt (Bước 7).

---

## 2. Quy Trình Phối Hợp 5 Pha (Từ Khởi Tạo $\rightarrow$ GitHub Live Check)

### Pha 0: Khởi Tạo Hạ Tầng GitHub & CI (Chỉ chạy 1 lần lúc bắt đầu dự án)
- Giao `web-devops-release` dựng `.gitignore`, `.env.example`, `.github/workflows/ci.yml` (`tsc`, `lint`, `build`) và `/api/health`.

### Pha 1: Khởi Tạo Kiến Trúc, Visual & Hợp Đồng (Song Song)
- **`ai-template-1-ux`**: Chốt Page Grammar, Feeling Curve, `src/styles/tokens.css`, `docs/UI-UX-SPEC.md` + `image-style.md`, ảnh neo `assets/anchor.webp` và bảng danh sách ảnh (Bước 0–1 của `image-pipeline.md`).
- **`ai-skill-design-web`**: Chốt schema DB (`prisma/schema.prisma` hoặc SQL migration), Auth/RBAC, `docs/API-CONTRACT.md`, `src/types/api.ts` và `src/schemas/*.ts`.
- **`image-generator` + Hậu kỳ Python/OpenCV** *(chỉ chạy theo bảng Bước 1)*: Tạo 3–4 phương án chọn 1 theo prompt 6 mục (Bước 3–4), hậu kỳ đồng bộ màu/grain/crop/WebP (`hero < 300KB`, `card < 120KB`) vào `public/images/[loai]-[vi-tri]-[so].webp` (Bước 5), duyệt checklist 6 câu (Bước 6) và ghi log vào `assets/prompts.md` (Bước 7).

### Pha 2: Xây Dựng Song Song Frontend & Backend
- **`ai-template-2-fe`**: Tra `modern-web-guidance`, dựng UI components (`src/components/**`), sections (`src/sections/**`), motion GPU (`src/motion/**`), trang UI dùng type `src/types/api.ts`.
- **`ai-skill-design-web`**: Hiện thực hóa `src/lib/db/**`, `src/lib/auth/**`, `src/server/services/**`, `src/app/api/**`, `src/actions/**`, và cầu nối `src/services/**`.

### Pha 3: Ghép Nối Dữ Liệu Thật (Integration)
- `ai-template-2-fe` nối `src/services/**` và `src/server/queries/**`, xử lý đủ Loading / Empty / Error / Validation fieldErrors.
- `ai-skill-design-web` tinh chỉnh DTO, `revalidatePath`/`revalidateTag` và seed dữ liệu tối thiểu để test luồng chạy thật.

### Pha 4: Kiểm Định Chéo + Đẩy GitHub Để Đại Check Thực Tế
1. **`web-qa-verifier`** chạy static & security gate (`npx tsc --noEmit`, `npm run lint`, `npm run build`, QA 8 cổng Đợt 1→4, check Auth/RBAC/Zod/Secret). Nếu **FAIL**, gửi lỗi đích danh cho tác giả sửa.
2. **`browser` subagent** *(test E2E trên localhost hoặc Preview URL)*: Kiểm tra trực quan Desktop + Mobile (`375px`) và bấm thử các luồng chính.
3. **`web-devops-release`** *(sau khi được Đại xác nhận push)*: Kiểm tra `git status` sạch sẽ, commit theo milestone (`feat(...)`, `fix(...)`) và đẩy lên **GitHub repo** (kích hoạt CI + Preview Deploy để cả đội quân lẫn Đại tự mở link web check lại thành quả).

---

## 3. Chọn Chế Độ Chạy Phù Hợp

1. **Chế độ Subagent (`invoke_subagent`)**: Dùng cho từng module/tính năng vừa và nhỏ.
2. **Chế độ Swarm (`/teamwork` + `swarm` tool)**: Dùng khi dựng đồng thời nhiều trang + API.
   - Đặt `workspace: "share"` nếu nhiều nhánh cùng chạm cấu hình gốc, hoặc `inherit` khi mỗi nhánh chỉ sửa đúng thư mục trong Ma trận Mục 1.
   - Giữ `web-qa-verifier` ở chế độ `inherit` (read-only).
