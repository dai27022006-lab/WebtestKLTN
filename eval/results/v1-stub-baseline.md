# Báo cáo Đánh giá Chatbot F12 (stub_baseline)

- **Bộ Eval:** `eval/eval-set-v1.json` (60 câu: 42 trong danh mục + 18 câu bẫy)
- **Danh mục đối chiếu:** `data/catalog-v1.json` (12 sản phẩm active)
- **Model / Prompt:** `stub-keyword-v1` / `v1`
- **Thời gian chạy:** `2026-11-16T16:36:16.970Z`

## 1. Bốn Chỉ số Bắt buộc (RULES.md Mục 13)

| Chỉ số | Kết quả | Mục tiêu / Ghi chú |
|---|---:|---|
| **Accuracy (Tổng thể)** | **100.00%** (60/60) | Trong danh mục: 100.00% (42/42) • Chặn bẫy: 100.00% (18/18) |
| **Hallucination Rate (Post-Grounding)** | **0.00%** (0/60) | Mục tiêu bắt buộc: `0%` (không ID ngoài DB) |
| **P95 Latency** | **1.83 ms** | Trung bình: 0.93 ms |
| **Avg Cost / Query & Total Tokens** | **$0.000000** / **0 tokens** | Tổng chi phí toàn bộ 60 câu: $0.000000 |

## 2. Phân tích Bẫy Ngoài Danh Mục & Chi tiết Lỗi

- **Tỷ lệ gợi ý nhầm trên câu bẫy (`trap_false_suggestion_rate`):** 0.00% (0/18)
- **Tỷ lệ hallucination thô trước kiểm tra DB (`raw_llm_hallucination_rate`):** 0.00%

Tất cả 60/60 câu hỏi đều vượt qua tiêu chí đánh giá (`0` lỗi).

## 3. Bảng Kết quả Đầy đủ 60 Câu

| ID | Phân loại | Ngân sách | Kết quả | Gợi ý trả về | Latency (ms) |
|---|---|---:|---|---|---:|
| `EV-01` | in_catalog | 600.000đ | **PASS** | Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop | 6.5 |
| `EV-02` | in_catalog | 500.000đ | **PASS** | Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop | 1.65 |
| `EV-03` | in_catalog | — | **PASS** | Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop | 1.83 |
| `EV-04` | in_catalog | 350.000đ | **PASS** | Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm | 0.89 |
| `EV-05` | in_catalog | 300.000đ | **PASS** | Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm | 1.04 |
| `EV-06` | in_catalog | — | **PASS** | Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm | 0.94 |
| `EV-07` | in_catalog | 700.000đ | **PASS** | Workflow Nhắc Lịch Mua Lại & CSKH Mỹ Phẩm Tự Động | 4.19 |
| `EV-08` | in_catalog | 800.000đ | **PASS** | Workflow Nhắc Lịch Mua Lại & CSKH Mỹ Phẩm Tự Động | 1.46 |
| `EV-09` | in_catalog | 850.000đ | **PASS** | Prompt Pack Mô Tả & Kịch Bản Video Mỹ Phẩm + Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop | 0.89 |
| `EV-10` | in_catalog | 1.200.000đ | **PASS** | Workflow Nhắc Lịch Mua Lại & CSKH Mỹ Phẩm Tự Động + Template Landing Page Mỹ Phẩm Chuẩn TikTok Shop | 1.08 |
| `EV-11` | in_catalog | 650.000đ | **PASS** | Template Lookbook Thời Trang Shop Nhỏ | 1.52 |
| `EV-12` | in_catalog | 600.000đ | **PASS** | Template Lookbook Thời Trang Shop Nhỏ | 1.25 |
| `EV-13` | in_catalog | — | **PASS** | Template Lookbook Thời Trang Shop Nhỏ | 0.86 |
| `EV-14` | in_catalog | 570.000đ | **PASS** | Template Landing Page Flash Sale & Livestream Thời Trang | 1.19 |
| `EV-15` | in_catalog | 600.000đ | **PASS** | Template Landing Page Flash Sale & Livestream Thời Trang | 1.06 |
| `EV-16` | in_catalog | — | **PASS** | Template Landing Page Flash Sale & Livestream Thời Trang | 0.87 |
| `EV-17` | in_catalog | 350.000đ | **PASS** | Prompt Pack Phối Đồ, Tư Vấn Size & Kịch Bản Live Thời Trang | 0.87 |
| `EV-18` | in_catalog | 400.000đ | **PASS** | Prompt Pack Phối Đồ, Tư Vấn Size & Kịch Bản Live Thời Trang | 1.26 |
| `EV-19` | in_catalog | — | **PASS** | Prompt Pack Phối Đồ, Tư Vấn Size & Kịch Bản Live Thời Trang | 0.94 |
| `EV-20` | in_catalog | 950.000đ | **PASS** | Template Lookbook Thời Trang Shop Nhỏ + Prompt Pack Phối Đồ, Tư Vấn Size & Kịch Bản Live Thời Trang | 1.16 |
| `EV-21` | in_catalog | 900.000đ | **PASS** | Prompt Pack Phối Đồ, Tư Vấn Size & Kịch Bản Live Thời Trang + Template Landing Page Flash Sale & Livestream Thời Trang | 2 |
| `EV-22` | in_catalog | 500.000đ | **PASS** | Template Menu & Đặt Món Nhanh Quán F&B Nhỏ | 1.1 |
| `EV-23` | in_catalog | 480.000đ | **PASS** | Template Menu & Đặt Món Nhanh Quán F&B Nhỏ | 0.97 |
| `EV-24` | in_catalog | — | **PASS** | Template Menu & Đặt Món Nhanh Quán F&B Nhỏ | 0.92 |
| `EV-25` | in_catalog | 550.000đ | **PASS** | Template Website Đặt Combo Tiệm Bánh & Quà Tặng F&B | 1.29 |
| `EV-26` | in_catalog | 600.000đ | **PASS** | Template Website Đặt Combo Tiệm Bánh & Quà Tặng F&B | 1.13 |
| `EV-27` | in_catalog | — | **PASS** | Template Website Đặt Combo Tiệm Bánh & Quà Tặng F&B + Template Menu & Đặt Món Nhanh Quán F&B Nhỏ | 1.2 |
| `EV-28` | in_catalog | 300.000đ | **PASS** | Prompt Pack Mô Tả Món Ăn & Kịch Bản Video Review F&B | 1.07 |
| `EV-29` | in_catalog | — | **PASS** | Prompt Pack Mô Tả Món Ăn & Kịch Bản Video Review F&B | 0.82 |
| `EV-30` | in_catalog | 750.000đ | **PASS** | Prompt Pack Mô Tả Món Ăn & Kịch Bản Video Review F&B + Template Menu & Đặt Món Nhanh Quán F&B Nhỏ | 0.85 |
| `EV-31` | in_catalog | 850.000đ | **PASS** | Prompt Pack Mô Tả Món Ăn & Kịch Bản Video Review F&B + Template Website Đặt Combo Tiệm Bánh & Quà Tặng F&B | 0.81 |
| `EV-32` | in_catalog | 420.000đ | **PASS** | Template Trang Bio Link & Cửa Hàng Mini Đa Kênh | 1.18 |
| `EV-33` | in_catalog | 400.000đ | **PASS** | Template Trang Bio Link & Cửa Hàng Mini Đa Kênh | 0.83 |
| `EV-34` | in_catalog | — | **PASS** | Template Trang Bio Link & Cửa Hàng Mini Đa Kênh | 0.85 |
| `EV-35` | in_catalog | 280.000đ | **PASS** | Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh | 1.49 |
| `EV-36` | in_catalog | 260.000đ | **PASS** | Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh | 1.6 |
| `EV-37` | in_catalog | — | **PASS** | Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh | 0.89 |
| `EV-38` | in_catalog | 750.000đ | **PASS** | Workflow Tự Động Ghi Đơn & Cảnh Báo Tồn Kho | 0.98 |
| `EV-39` | in_catalog | 700.000đ | **PASS** | Workflow Tự Động Ghi Đơn & Cảnh Báo Tồn Kho | 1.16 |
| `EV-40` | in_catalog | — | **PASS** | Workflow Tự Động Ghi Đơn & Cảnh Báo Tồn Kho | 0.92 |
| `EV-41` | in_catalog | 700.000đ | **PASS** | Template Trang Bio Link & Cửa Hàng Mini Đa Kênh + Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh | 0.97 |
| `EV-42` | in_catalog | 1.000.000đ | **PASS** | Workflow Tự Động Ghi Đơn & Cảnh Báo Tồn Kho + Prompt Pack Chăm Sóc Khách & Chốt Đơn Đa Kênh | 0.89 |
| `EV-43` | out_of_catalog_trap | 2.000.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
| `EV-44` | out_of_catalog_trap | 1.500.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
| `EV-45` | out_of_catalog_trap | 1.000.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-46` | out_of_catalog_trap | 2.000.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-47` | out_of_catalog_trap | 1.000.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-48` | out_of_catalog_trap | 1.200.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-49` | out_of_catalog_trap | 800.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-50` | out_of_catalog_trap | 900.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-51` | out_of_catalog_trap | 600.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-52` | out_of_catalog_trap | 500.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
| `EV-53` | out_of_catalog_trap | 700.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-54` | out_of_catalog_trap | 50.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.03 |
| `EV-55` | out_of_catalog_trap | 100.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
| `EV-56` | out_of_catalog_trap | 0đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-57` | out_of_catalog_trap | 150.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
| `EV-58` | out_of_catalog_trap | 800.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-59` | out_of_catalog_trap | 900.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.01 |
| `EV-60` | out_of_catalog_trap | 500.000đ | **PASS** | *(Từ chối / Ngoài danh mục)* | 0.02 |
