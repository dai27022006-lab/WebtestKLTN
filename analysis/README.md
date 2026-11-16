# Pipeline Phân tích Thống kê, Kinh tế Đơn vị & Phân cụm (`analysis/`)

Thư mục này chứa bộ script phân tích định lượng phục vụ câu hỏi nghiên cứu trong [`RULES.md`](../RULES.md) (Mục 4, 12, 18):

> *"Trợ lý ảo tư vấn có giúp người dùng chọn đúng gói sản phẩm nhanh hơn và tự tin hơn so với tự duyệt danh mục không, và chi phí cho việc đó là bao nhiêu?"*

## 1. Yêu cầu môi trường

- **Python >= 3.9** (chỉ sử dụng **Python Standard Library thuần**, không bắt buộc cài `scipy`, `pandas` hay `scikit-learn`).
- File `requirements.txt` chỉ liệt kê các gói tùy chọn nếu muốn mở rộng trực quan hóa ở Jupyter Notebook.

## 2. Quy tắc Đạo đức & Dữ liệu Bắt buộc (`RULES.md` Mục 12)

1. **Mặc định loại bỏ `is_simulated == true`:** Cả `analyze_experiment.py` và `cluster_behavior_and_rfm.py` mặc định lọc bỏ mọi bản ghi mô phỏng.
2. **Cờ `--allow-simulated` chỉ dùng khi kiểm thử cấu trúc trên `analysis/sample-demo/`:** Khi bật cờ này, báo cáo tự động gắn cảnh báo không dùng để kết luận thực nghiệm.
3. **Ẩn danh tuyệt đối:** Dữ liệu đầu vào từ `GET /api/admin/export` chỉ chứa `participant_code`, `assignment_id`, `visitor_id` — không bao giờ có `email`, `full_name` hay thông tin định danh cá nhân.
4. **Quy tắc loại mẫu trước khi xem kết quả:** Mặc định loại lượt chạy ngắn hơn `5.0` giây (`--min-duration-seconds 5.0`) để loại thao tác bấm nhầm/spam.

## 3. Xuất dữ liệu thật từ Hệ thống

Đăng nhập tài khoản `admin` và gọi endpoint ẩn danh (hoặc tải từ giao diện quản trị):

- `GET /api/admin/export?dataset=scenario_runs&format=csv&include_simulated=false`
- `GET /api/admin/export?dataset=events&format=csv&include_simulated=false`
- `GET /api/admin/export?dataset=rag_logs&format=csv&include_simulated=false`

## 4. Chạy Phân tích Dữ liệu Thật

```bash
# 1) Kiểm định cặp Within-subject AB/BA (McNemar + Wilcoxon + Kinh tế đơn vị)
python3 analysis/analyze_experiment.py \
  --runs path/to/dsa-scenario_runs-real-only.csv \
  --rag-logs path/to/dsa-rag_logs-real-only.csv \
  --min-duration-seconds 5 \
  --out-json analysis/output/real_experiment_report.json \
  --out-md analysis/output/real_experiment_report.md

# 2) Phân cụm hành vi phiên thật (Z-score + K-Means++ + Silhouette)
python3 analysis/cluster_behavior_and_rfm.py \
  --events path/to/dsa-events-real-only.csv \
  --rfm-csv analysis/sample-demo/rfm_demo.csv \
  --k auto \
  --out-json analysis/output/real_behavior_report.json \
  --out-md analysis/output/real_behavior_report.md
```

## 5. Chạy thử trên Dữ liệu Demo Mô phỏng (`sample-demo/`)

Tất cả các file trong `analysis/sample-demo/` đều gắn cờ `is_simulated=true` để nhóm Data kiểm tra pipeline trước khi thu thập mẫu thật:

```bash
python3 analysis/analyze_experiment.py \
  --runs analysis/sample-demo/scenario_runs_demo.csv \
  --rag-logs analysis/sample-demo/rag_logs_demo.csv \
  --allow-simulated \
  --out-json analysis/output/demo_experiment_report.json \
  --out-md analysis/output/demo_experiment_report.md

python3 analysis/cluster_behavior_and_rfm.py \
  --events analysis/sample-demo/events_demo.csv \
  --rfm-csv analysis/sample-demo/rfm_demo.csv \
  --allow-simulated \
  --k 3 \
  --out-json analysis/output/demo_behavior_report.json \
  --out-md analysis/output/demo_behavior_report.md
```

## 6. Tóm tắt Phương pháp Toán học đã Cài đặt

- **McNemar's Test (`analyze_experiment.py`):** Tính cả **Exact Binomial Two-sided p-value** (chính xác ở cỡ mẫu nhỏ `N = 30–40`), **Edwards Continuity-Corrected Chi-square**, **Odds Ratio** (exact & Haldane-corrected), và **95% CI** hiệu tỉ lệ ghép cặp.
- **Wilcoxon Signed-Rank Test (`analyze_experiment.py`):** Loại hiệu bằng 0, xếp hạng trung bình cho các giá trị trùng (tie handling), tính **Exact Permutation p-value** khi không trùng và $n_r \le 18$ hoặc **Normal Approximation hiệu chỉnh phương sai tie + liên tục**, kèm **Effect Size ($r$ và Rank-Biserial Correlation $r_{\text{rb}}$)** và **95% Bootstrap CI** (`seed=42`).
- **K-Means++ Clustering (`cluster_behavior_and_rfm.py`):** Trích xuất 6 đặc trưng hành vi cấp phiên từ bảng `events`, chuẩn hóa **Z-score**, khởi tạo **K-Means++** (`n_init=10`, xử lý cụm rỗng), tự chọn số cụm `k` tối ưu theo **Silhouette Score**.
- **Minh họa RFM:** Chấm điểm quintile 1–5 (R đảo chiều, F & M thuận chiều) và gán nhãn phân khúc trên dữ liệu mô phỏng có cảnh báo tách bạch rõ ràng.
