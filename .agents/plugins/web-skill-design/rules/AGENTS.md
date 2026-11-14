# Web Skill Design & Agent Army Rules (Always-On)

Khi thiết kế BackEnd, cơ chế bên trong web hoặc vận hành đội quân AI Agent trong dự án này:

1. **Phân vai rõ ràng — Không giẫm chân lên file nhau**:
   - `ai-template-1-ux`: Sở hữu `docs/UI-UX-SPEC.md`, `src/styles/tokens.css`, `themes.css`, `FINGERPRINTS.md`.
   - `ai-template-2-fe`: Sở hữu `src/components/**`, `src/sections/**`, `src/motion/**`, giao diện `src/app/**/page.tsx` (presentation/client UI).
   - `ai-skill-design-web`: Sở hữu `docs/API-CONTRACT.md`, `prisma/**`, `supabase/**`, `src/app/api/**`, `src/actions/**`, `src/server/**`, `src/lib/**`, `src/services/**`, `src/state/**`, `src/types/api.ts`, `src/schemas/**`, `src/middleware.ts`.
   - `web-devops-release`: Sở hữu `.gitignore`, `.github/**`, `Dockerfile`, `docker-compose.yml`, `.env.example`, deploy configs (`vercel.json`, `apphosting.yaml`), `next.config.*` (headers/images), `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/api/health/route.ts`.
   - `web-qa-verifier`: Chỉ đọc & chạy kiểm thử/build/lint; báo lỗi đích danh để tác giả sửa, không tự ý sửa code của nhánh khác.
   - **Tài nguyên ảnh & kiểm thử thực tế**: Dùng `image-generator` (tạo ảnh đồng bộ palette vào `public/images/**`) và `browser` subagent (test UI thật trên Preview/Localhost).
2. **Ranh giới giữa Đội AI và Nhóm Sinh Viên (Human Team)**:
   - Nghiên cứu dữ liệu chuyên sâu của đề tài và viết báo cáo/slide Đồ án Tốt nghiệp thuộc về **các thành viên người thật trong nhóm Đại** — các AI Agent không tự ý ôm việc viết báo cáo dài dòng, chỉ giữ mã nguồn và tài liệu kỹ thuật (`UI-UX-SPEC.md`, `API-CONTRACT.md`, schema) gọn rõ để nhóm dùng làm tư liệu.
3. **Contract-First trước khi nối Frontend–Backend**:
   - Định nghĩa rõ schema `zod` + kiểu dữ liệu trong `src/types/api.ts` (và `docs/API-CONTRACT.md`) trước hoặc song song khi Frontend code UI; chuẩn hóa format response `{ ok, data, error }`.
4. **Bảo mật, GitHub CI & Sẵn sàng bảo vệ hội đồng**:
   - Validate input ở server, kiểm tra AuthN/AuthZ ở đầu mỗi Route Handler/Server Action, tuyệt đối không commit `.env` hay lộ secret qua `NEXT_PUBLIC_*`, giữ kiến trúc KISS & YAGNI để nhóm giải trình 100% trước hội đồng.
