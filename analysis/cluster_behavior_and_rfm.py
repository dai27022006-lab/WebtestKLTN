"""Behavioral K-Means clustering (real sessions) & illustrative RFM analysis.

Uses Python 3 Standard Library only (Z-score standardization + K-Means++ + Silhouette).
Real behavioral clustering strictly filters out is_simulated == true by default
according to RULES.md Section 4.6 and Section 12.
RFM analysis is strictly labeled as an illustrative demonstration on simulated data.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


FEATURE_NAMES = [
    "total_events",
    "product_views",
    "search_and_filter",
    "chat_engagement",
    "cart_and_checkout",
    "session_span_seconds",
]


def parse_bool(value: Any) -> bool | None:
    if value is None:
        return None
    normalized = str(value).strip().lower()
    if normalized in {"true", "1", "yes", "y"}:
        return True
    if normalized in {"false", "0", "no", "n"}:
        return False
    return None


def parse_float(value: Any) -> float | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        num = float(text)
        return num if math.isfinite(num) else None
    except ValueError:
        return None


def parse_iso_timestamp(value: str | None) -> float | None:
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(text).timestamp()
    except ValueError:
        return None


def euclidean_sq(a: list[float], b: list[float]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b))


def euclidean_dist(a: list[float], b: list[float]) -> float:
    return math.sqrt(euclidean_sq(a, b))


def zscore_standardize(
    vectors: list[list[float]],
) -> tuple[list[list[float]], list[float], list[float]]:
    if not vectors:
        return [], [], []
    dims = len(vectors[0])
    means: list[float] = []
    stds: list[float] = []
    for j in range(dims):
        col = [row[j] for row in vectors]
        m = statistics.fmean(col)
        s = statistics.pstdev(col)
        means.append(m)
        stds.append(s)

    standardized: list[list[float]] = []
    for row in vectors:
        standardized.append(
            [
                ((row[j] - means[j]) / stds[j]) if stds[j] > 1e-12 else 0.0
                for j in range(dims)
            ]
        )
    return standardized, means, stds


def _kmeans_pp_init(
    data: list[list[float]], k: int, rng: random.Random
) -> list[list[float]]:
    n = len(data)
    centroids = [list(data[rng.randrange(n)])]
    while len(centroids) < k:
        distances = [
            min(euclidean_sq(point, c) for c in centroids) for point in data
        ]
        total = sum(distances)
        if total <= 1e-12:
            centroids.append(list(data[rng.randrange(n)]))
            continue
        target = rng.random() * total
        cumulative = 0.0
        chosen_idx = n - 1
        for idx, d in enumerate(distances):
            cumulative += d
            if cumulative >= target:
                chosen_idx = idx
                break
        centroids.append(list(data[chosen_idx]))
    return centroids


def run_kmeans_pp(
    data: list[list[float]],
    k: int,
    n_init: int = 10,
    max_iter: int = 100,
    seed: int = 42,
) -> tuple[list[int], list[list[float]], float]:
    n = len(data)
    dims = len(data[0])
    best_labels: list[int] = [0] * n
    best_centroids: list[list[float]] = []
    best_inertia = math.inf

    for init_idx in range(n_init):
        rng = random.Random(seed + init_idx)
        centroids = _kmeans_pp_init(data, k, rng)
        labels = [0] * n

        for _ in range(max_iter):
            changed = False
            point_dists: list[float] = []
            for i, point in enumerate(data):
                best_c = 0
                best_d = euclidean_sq(point, centroids[0])
                for c_idx in range(1, k):
                    d = euclidean_sq(point, centroids[c_idx])
                    if d < best_d:
                        best_d = d
                        best_c = c_idx
                if labels[i] != best_c:
                    labels[i] = best_c
                    changed = True
                point_dists.append(best_d)

            # Recompute centroids and guard against empty clusters
            counts = [0] * k
            sums = [[0.0] * dims for _ in range(k)]
            for i, point in enumerate(data):
                c = labels[i]
                counts[c] += 1
                for j in range(dims):
                    sums[c][j] += point[j]

            for c_idx in range(k):
                if counts[c_idx] == 0:
                    farthest_i = max(range(n), key=lambda idx: point_dists[idx])
                    labels[farthest_i] = c_idx
                    centroids[c_idx] = list(data[farthest_i])
                    changed = True
                else:
                    centroids[c_idx] = [
                        sums[c_idx][j] / counts[c_idx] for j in range(dims)
                    ]

            if not changed:
                break

        inertia = sum(
            euclidean_sq(data[i], centroids[labels[i]]) for i in range(n)
        )
        if inertia < best_inertia:
            best_inertia = inertia
            best_labels = labels
            best_centroids = centroids

    return best_labels, best_centroids, best_inertia


def silhouette_score(data: list[list[float]], labels: list[int], k: int) -> float:
    n = len(data)
    if k <= 1 or n <= k:
        return 0.0

    clusters: dict[int, list[int]] = defaultdict(list)
    for idx, label in enumerate(labels):
        clusters[label].append(idx)

    if len(clusters) < 2:
        return 0.0

    scores: list[float] = []
    for i in range(n):
        own_cluster = labels[i]
        own_members = clusters[own_cluster]
        if len(own_members) <= 1:
            scores.append(0.0)
            continue

        a_i = statistics.fmean(
            euclidean_dist(data[i], data[j]) for j in own_members if j != i
        )
        b_i = math.inf
        for other_label, other_members in clusters.items():
            if other_label == own_cluster or not other_members:
                continue
            mean_other = statistics.fmean(
                euclidean_dist(data[i], data[j]) for j in other_members
            )
            if mean_other < b_i:
                b_i = mean_other

        denom = max(a_i, b_i)
        scores.append(((b_i - a_i) / denom) if denom > 1e-12 else 0.0)

    return statistics.fmean(scores) if scores else 0.0


def build_session_features(
    events_csv: Path, allow_simulated: bool
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    stats = {
        "raw_events": 0,
        "filtered_simulated_events": 0,
        "retained_events": 0,
        "sessions_count": 0,
    }
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)

    with events_csv.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            stats["raw_events"] += 1
            is_sim = parse_bool(row.get("is_simulated")) is True
            if is_sim and not allow_simulated:
                stats["filtered_simulated_events"] += 1
                continue

            assignment_id = (row.get("assignment_id") or "").strip()
            participant_code = (row.get("participant_code") or "").strip()
            session_key = assignment_id or participant_code
            if not session_key:
                continue

            stats["retained_events"] += 1
            grouped[session_key].append(
                {
                    "assignment_id": assignment_id,
                    "participant_code": participant_code,
                    "visitor_id": (row.get("visitor_id") or "").strip(),
                    "event_name": (row.get("event_name") or "").strip(),
                    "ts": parse_iso_timestamp(row.get("created_at")),
                }
            )

    sessions: list[dict[str, Any]] = []
    for key, evts in grouped.items():
        counts: dict[str, int] = defaultdict(int)
        timestamps: list[float] = []
        for e in evts:
            counts[e["event_name"]] += 1
            if e["ts"] is not None:
                timestamps.append(e["ts"])

        span = (max(timestamps) - min(timestamps)) if len(timestamps) >= 2 else 0.0
        sessions.append(
            {
                "session_key": key,
                "participant_code": evts[0]["participant_code"] or key,
                "visitor_id": evts[0]["visitor_id"],
                "has_purchase": counts["purchase"] > 0,
                "features": {
                    "total_events": float(len(evts)),
                    "product_views": float(counts["product_viewed"]),
                    "search_and_filter": float(
                        counts["search_used"] + counts["filter_applied"]
                    ),
                    "chat_engagement": float(
                        counts["chat_opened"]
                        + counts["chat_message_sent"]
                        + counts["suggestion_clicked"]
                    ),
                    "cart_and_checkout": float(
                        counts["add_to_cart"]
                        + counts["checkout_started"]
                        + counts["purchase"]
                    ),
                    "session_span_seconds": round(max(0.0, span), 2),
                },
            }
        )

    stats["sessions_count"] = len(sessions)
    return sessions, stats


def infer_cluster_label(centroid_z: dict[str, float]) -> str:
    if centroid_z["chat_engagement"] >= 0.5 and centroid_z["cart_and_checkout"] >= 0.2:
        return "Tương tác trợ lý sâu & Chuyển đổi cao"
    if centroid_z["search_and_filter"] >= 0.45 and centroid_z["product_views"] >= 0.2:
        return "Tự duyệt danh mục & Lọc chuyên sâu"
    if centroid_z["total_events"] <= -0.45:
        return "Phiên ngắn / Khám phá nhanh"
    return "Hành vi hỗn hợp trung bình"


def score_quintiles(values: list[float], reverse: bool = False) -> list[int]:
    """Assign 1..5 quintile scores deterministically via rank ordering."""
    n = len(values)
    if n == 0:
        return []
    if n == 1:
        return [3]

    indexed = sorted(enumerate(values), key=lambda x: x[1], reverse=reverse)
    scores = [3] * n
    for rank_idx, (orig_idx, _) in enumerate(indexed):
        bucket = min(5, max(1, math.floor((rank_idx / n) * 5) + 1))
        scores[orig_idx] = bucket
    return scores


def classify_rfm_segment(r: int, f: int, m: int) -> str:
    if r >= 4 and f >= 4 and m >= 4:
        return "Champions"
    if f >= 4 and m >= 3 and r >= 3:
        return "Loyal Customers"
    if r >= 4 and f <= 3:
        return "Potential Loyalist"
    if r <= 2 and (f >= 3 or m >= 3):
        return "At Risk"
    return "Hibernating"


def analyze_rfm_simulated(rfm_csv: Path | None) -> dict[str, Any]:
    if rfm_csv is None or not rfm_csv.exists():
        return {
            "available": False,
            "is_simulated_illustration": True,
            "disclaimer": "Minh họa RFM chỉ áp dụng trên dữ liệu mô phỏng (is_simulated=true). Không cung cấp file CSV RFM.",
        }

    records: list[dict[str, Any]] = []
    with rfm_csv.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            recency = parse_float(row.get("recency_days"))
            frequency = parse_float(row.get("frequency_count"))
            monetary = parse_float(row.get("monetary_vnd"))
            if recency is None or frequency is None or monetary is None:
                continue
            is_sim = parse_bool(row.get("is_simulated"))
            records.append(
                {
                    "visitor_id": (row.get("visitor_id") or "").strip(),
                    "recency_days": int(round(recency)),
                    "frequency_count": int(round(frequency)),
                    "monetary_vnd": int(round(monetary)),
                    "is_simulated": True if is_sim is None else is_sim,
                }
            )

    if not records:
        return {
            "available": False,
            "is_simulated_illustration": True,
            "disclaimer": "File RFM không có bản ghi hợp lệ.",
        }

    r_scores = score_quintiles([r["recency_days"] for r in records], reverse=True)
    f_scores = score_quintiles([r["frequency_count"] for r in records], reverse=False)
    m_scores = score_quintiles([r["monetary_vnd"] for r in records], reverse=False)

    segments: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rec, r_s, f_s, m_s in zip(records, r_scores, f_scores, m_scores):
        seg = classify_rfm_segment(r_s, f_s, m_s)
        rec["r_score"] = r_s
        rec["f_score"] = f_s
        rec["m_score"] = m_s
        rec["segment_name"] = seg
        segments[seg].append(rec)

    segment_summary = []
    for seg_name, items in sorted(segments.items(), key=lambda x: -len(x[1])):
        segment_summary.append(
            {
                "segment_name": seg_name,
                "count": len(items),
                "avg_recency_days": round(statistics.fmean(i["recency_days"] for i in items), 1),
                "avg_frequency": round(statistics.fmean(i["frequency_count"] for i in items), 2),
                "avg_monetary_vnd": round(statistics.fmean(i["monetary_vnd"] for i in items), 0),
            }
        )

    return {
        "available": True,
        "is_simulated_illustration": True,
        "disclaimer": "[MINH HỌA PHƯƠNG PHÁP — DỮ LIỆU MÔ PHỎNG is_simulated=true] Bảng RFM này chỉ minh họa cách phân khúc khách hàng số và KHÔNG dùng để rút ra kết luận thực nghiệm.",
        "total_profiles": len(records),
        "segments_summary": segment_summary,
        "profiles": records,
    }


def render_markdown_report(report: dict[str, Any]) -> str:
    meta = report["meta"]
    km = report["behavior_kmeans"]
    rfm = report["rfm_illustration"]

    lines: list[str] = [
        "# Báo cáo Phân cụm Hành vi Phiên (K-Means) & Minh họa RFM",
        "",
    ]

    if meta["allow_simulated"]:
        lines.append(
            "> **CẢNH BÁO (`is_simulated = true`):** Phần phân cụm K-Means đang chạy với `--allow-simulated` trên dữ liệu mô phỏng để kiểm thử pipeline."
        )
        lines.append("")

    lines.extend(
        [
            f"- **Thời gian chạy:** `{meta['generated_at']}`",
            f"- **Nguồn sự kiện:** `{meta['events_csv']}` ({meta['filtering']['retained_events']}/{meta['filtering']['raw_events']} sự kiện, **{meta['filtering']['sessions_count']}** phiên).",
            "",
            "## 1. Phân cụm Hành vi Phiên bằng K-Means++ (Chuẩn hóa Z-score)",
            "",
        ]
    )

    if not km.get("available"):
        lines.append(f"- {km.get('reason')}")
    else:
        lines.extend(
            [
                f"- **Số cụm được chọn (`k`):** **{km['chosen_k']}** (chế độ `{km['k_mode']}`, Silhouette Score = **{km['silhouette_score']}**, Inertia SSE = `{km['inertia']}`).",
                "",
                "| Cụm | Nhãn diễn giải | Số phiên | Tỷ lệ Intent Mua | TB Events | TB Xem SP | TB Tìm/Lọc | TB Tương tác Bot | TB Giỏ/Checkout | Thời lượng (s) |",
                "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|",
            ]
        )
        for c in km["clusters"]:
            m = c["mean_original_features"]
            lines.append(
                f"| **C{c['cluster_id']}** | {c['suggested_label']} | {c['size']} | {(c['purchase_intent_rate'] * 100):.1f}% | "
                f"{m['total_events']:.1f} | {m['product_views']:.1f} | {m['search_and_filter']:.1f} | "
                f"{m['chat_engagement']:.1f} | {m['cart_and_checkout']:.1f} | {m['session_span_seconds']:.1f} |"
            )

    lines.extend(["", "## 2. Minh họa Phân khúc RFM (Dữ liệu Mô phỏng)", ""])
    if not rfm.get("available"):
        lines.append(f"- {rfm.get('disclaimer')}")
    else:
        lines.append(f"> {rfm['disclaimer']}")
        lines.append("")
        lines.append("| Phân khúc RFM | Số khách mô phỏng | Recency TB (ngày) | Frequency TB | Monetary TB (VNĐ) |")
        lines.append("|---|---:|---:|---:|---:|")
        for seg in rfm["segments_summary"]:
            lines.append(
                f"| **{seg['segment_name']}** | {seg['count']} | {seg['avg_recency_days']:.1f} | {seg['avg_frequency']:.2f} | {int(seg['avg_monetary_vnd']):,}đ |"
            )

    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run K-Means++ behavioral clustering on events and illustrative RFM."
    )
    parser.add_argument(
        "--events",
        required=True,
        type=Path,
        help="Path to events CSV exported from /api/admin/export",
    )
    parser.add_argument(
        "--rfm-csv",
        type=Path,
        default=None,
        help="Optional simulated RFM CSV for methodological illustration.",
    )
    parser.add_argument(
        "--k",
        default="auto",
        help="Number of clusters (integer >= 2) or 'auto' to pick best Silhouette score.",
    )
    parser.add_argument(
        "--allow-simulated",
        action="store_true",
        help="Allow is_simulated=true events (for testing sample-demo only).",
    )
    parser.add_argument(
        "--out-json",
        type=Path,
        default=Path("analysis/output/behavior_and_rfm_report.json"),
        help="Output JSON path.",
    )
    parser.add_argument(
        "--out-md",
        type=Path,
        default=Path("analysis/output/behavior_and_rfm_report.md"),
        help="Output Markdown path.",
    )
    args = parser.parse_args()

    sessions, filter_stats = build_session_features(args.events, args.allow_simulated)
    n_sessions = len(sessions)

    kmeans_result: dict[str, Any]
    if n_sessions < 3:
        kmeans_result = {
            "available": False,
            "reason": f"Cần tối thiểu 3 phiên hợp lệ để phân cụm K-Means (hiện có {n_sessions} phiên sau khi lọc is_simulated).",
        }
    else:
        raw_vectors = [
            [s["features"][name] for name in FEATURE_NAMES] for s in sessions
        ]
        z_vectors, feat_means, feat_stds = zscore_standardize(raw_vectors)

        if args.k == "auto":
            max_k = min(5, n_sessions - 1)
            candidates: list[dict[str, Any]] = []
            best_run: tuple[int, list[int], list[list[float]], float, float] | None = None
            for k_val in range(2, max_k + 1):
                labels, centroids, inertia = run_kmeans_pp(z_vectors, k_val)
                sil = silhouette_score(z_vectors, labels, k_val)
                candidates.append(
                    {"k": k_val, "silhouette_score": round(sil, 4), "inertia": round(inertia, 4)}
                )
                if best_run is None or sil > best_run[4]:
                    best_run = (k_val, labels, centroids, inertia, sil)
            assert best_run is not None
            chosen_k, labels, centroids_z, inertia, sil = best_run
            k_mode = "auto_silhouette"
        else:
            chosen_k = max(2, min(int(args.k), n_sessions - 1))
            labels, centroids_z, inertia = run_kmeans_pp(z_vectors, chosen_k)
            sil = silhouette_score(z_vectors, labels, chosen_k)
            candidates = [
                {"k": chosen_k, "silhouette_score": round(sil, 4), "inertia": round(inertia, 4)}
            ]
            k_mode = "fixed"

        clusters_out: list[dict[str, Any]] = []
        for c_id in range(chosen_k):
            member_indices = [i for i, lbl in enumerate(labels) if lbl == c_id]
            members = [sessions[i] for i in member_indices]
            centroid_z_dict = {
                FEATURE_NAMES[j]: round(centroids_z[c_id][j], 4)
                for j in range(len(FEATURE_NAMES))
            }
            centroid_orig_dict = {
                FEATURE_NAMES[j]: round(
                    statistics.fmean(m["features"][FEATURE_NAMES[j]] for m in members), 2
                )
                if members
                else 0.0
                for j in range(len(FEATURE_NAMES))
            }
            purchase_rate = (
                sum(1 for m in members if m["has_purchase"]) / len(members)
                if members
                else 0.0
            )
            clusters_out.append(
                {
                    "cluster_id": c_id,
                    "suggested_label": infer_cluster_label(centroid_z_dict),
                    "size": len(members),
                    "purchase_intent_rate": round(purchase_rate, 4),
                    "centroid_z_scores": centroid_z_dict,
                    "mean_original_features": centroid_orig_dict,
                    "member_participant_codes": [
                        m["participant_code"] for m in members
                    ],
                }
            )

        clusters_out.sort(key=lambda c: -c["size"])
        kmeans_result = {
            "available": True,
            "k_mode": k_mode,
            "chosen_k": chosen_k,
            "silhouette_score": round(sil, 4),
            "inertia": round(inertia, 4),
            "k_candidates": candidates,
            "standardization": {
                FEATURE_NAMES[j]: {
                    "mean": round(feat_means[j], 4),
                    "std": round(feat_stds[j], 4),
                }
                for j in range(len(FEATURE_NAMES))
            },
            "clusters": clusters_out,
        }

    rfm_result = analyze_rfm_simulated(args.rfm_csv)

    report: dict[str, Any] = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "events_csv": str(args.events),
            "rfm_csv": str(args.rfm_csv) if args.rfm_csv else None,
            "allow_simulated": args.allow_simulated,
            "filtering": filter_stats,
        },
        "behavior_kmeans": kmeans_result,
        "rfm_illustration": rfm_result,
    }

    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_json.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    args.out_md.write_text(render_markdown_report(report), encoding="utf-8")

    if kmeans_result.get("available"):
        print(
            f"K-Means++ completed: n_sessions={n_sessions}, k={kmeans_result['chosen_k']}, "
            f"silhouette={kmeans_result['silhouette_score']}."
        )
    else:
        print(f"K-Means++ skipped: {kmeans_result.get('reason')}")
    print(f"Reports saved to {args.out_json} and {args.out_md}")


if __name__ == "__main__":
    main()
