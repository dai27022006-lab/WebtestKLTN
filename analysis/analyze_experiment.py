"""Statistical analysis pipeline for Digital Store Advisor (AB/BA experiment).

Uses Python 3 Standard Library only (no external scipy/pandas required).
Default behavior strictly filters out rows where is_simulated == true
according to RULES.md Section 12.
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


def parse_int(value: Any) -> int | None:
    num = parse_float(value)
    if num is None:
        return None
    return int(round(num))


def quantile_sorted(sorted_vals: list[float], q: float) -> float:
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = q * (len(sorted_vals) - 1)
    lo = math.floor(pos)
    hi = math.ceil(pos)
    if lo == hi:
        return sorted_vals[lo]
    weight = pos - lo
    return sorted_vals[lo] * (1.0 - weight) + sorted_vals[hi] * weight


def summarize_numeric(values: list[float]) -> dict[str, float]:
    if not values:
        return {
            "n": 0,
            "mean": 0.0,
            "sd": 0.0,
            "median": 0.0,
            "q1": 0.0,
            "q3": 0.0,
            "iqr": 0.0,
            "min": 0.0,
            "max": 0.0,
        }
    s = sorted(values)
    q1 = quantile_sorted(s, 0.25)
    med = quantile_sorted(s, 0.5)
    q3 = quantile_sorted(s, 0.75)
    mean_v = statistics.fmean(values)
    sd_v = statistics.stdev(values) if len(values) > 1 else 0.0
    return {
        "n": len(values),
        "mean": round(mean_v, 4),
        "sd": round(sd_v, 4),
        "median": round(med, 4),
        "q1": round(q1, 4),
        "q3": round(q3, 4),
        "iqr": round(q3 - q1, 4),
        "min": round(s[0], 4),
        "max": round(s[-1], 4),
    }


def bootstrap_ci_95(
    values: list[float], stat_fn: str = "mean", iterations: int = 2000, seed: int = 42
) -> tuple[float, float]:
    if not values:
        return (0.0, 0.0)
    if len(values) == 1:
        return (round(values[0], 4), round(values[0], 4))

    rng = random.Random(seed)
    n = len(values)
    samples: list[float] = []
    for _ in range(iterations):
        draw = [values[rng.randrange(n)] for _ in range(n)]
        if stat_fn == "median":
            samples.append(statistics.median(draw))
        else:
            samples.append(statistics.fmean(draw))
    samples.sort()
    return (
        round(quantile_sorted(samples, 0.025), 4),
        round(quantile_sorted(samples, 0.975), 4),
    )


def log_binom_pmf(k: int, n: int, p: float = 0.5) -> float:
    log_c = math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)
    return math.exp(log_c + k * math.log(p) + (n - k) * math.log(1.0 - p))


def mcnemar_test(on_correct: list[bool], off_correct: list[bool]) -> dict[str, Any]:
    n = len(on_correct)
    n11 = sum(1 for a, b in zip(on_correct, off_correct) if a and b)
    n10 = sum(1 for a, b in zip(on_correct, off_correct) if a and not b)
    n01 = sum(1 for a, b in zip(on_correct, off_correct) if not a and b)
    n00 = sum(1 for a, b in zip(on_correct, off_correct) if not a and not b)

    discordant = n10 + n01
    if discordant == 0:
        exact_p = 1.0
        chi2_cc = 0.0
        asymp_p = 1.0
    else:
        smaller = min(n10, n01)
        tail_prob = sum(log_binom_pmf(i, discordant, 0.5) for i in range(smaller + 1))
        exact_p = min(1.0, 2.0 * tail_prob)
        diff_abs = abs(n10 - n01)
        chi2_cc = ((max(0.0, diff_abs - 1.0)) ** 2) / discordant
        asymp_p = math.erfc(math.sqrt(chi2_cc / 2.0))

    p_on = sum(1 for v in on_correct if v) / n if n > 0 else 0.0
    p_off = sum(1 for v in off_correct if v) / n if n > 0 else 0.0
    diff_prop = p_on - p_off

    if n > 0:
        var_term = max(0.0, discordant - ((n10 - n01) ** 2) / n)
        se_diff = math.sqrt(var_term) / n
        ci_low = max(-1.0, diff_prop - 1.96 * se_diff)
        ci_high = min(1.0, diff_prop + 1.96 * se_diff)
    else:
        ci_low, ci_high = 0.0, 0.0

    odds_ratio_exact = (n10 / n01) if n01 > 0 else None
    odds_ratio_haldane = (n10 + 0.5) / (n01 + 0.5)

    return {
        "n_pairs": n,
        "contingency_2x2": {
            "both_correct_n11": n11,
            "on_only_correct_b_n10": n10,
            "off_only_correct_c_n01": n01,
            "both_wrong_n00": n00,
        },
        "accuracy_chatbot_on": round(p_on, 4),
        "accuracy_chatbot_off": round(p_off, 4),
        "accuracy_diff_on_minus_off": round(diff_prop, 4),
        "accuracy_diff_95_ci": [round(ci_low, 4), round(ci_high, 4)],
        "odds_ratio_exact": round(odds_ratio_exact, 4) if odds_ratio_exact is not None else None,
        "odds_ratio_haldane_corrected": round(odds_ratio_haldane, 4),
        "chi2_edwards_corrected": round(chi2_cc, 4),
        "p_value_asymptotic": round(asymp_p, 6),
        "p_value_exact_binomial": round(exact_p, 6),
    }


def _exact_wilcoxon_two_sided_p(n: int, w_stat: float) -> float:
    """Exact Wilcoxon signed-rank two-sided p-value when there are no ties and n <= 18."""
    max_sum = n * (n + 1) // 2
    dp = [0] * (max_sum + 1)
    dp[0] = 1
    for rank in range(1, n + 1):
        for s in range(max_sum, rank - 1, -1):
            dp[s] += dp[s - rank]
    target = int(round(w_stat))
    lower_tail = sum(dp[: target + 1])
    total = 1 << n
    return min(1.0, 2.0 * (lower_tail / total))


def wilcoxon_signed_rank_test(
    on_values: list[float], off_values: list[float], metric_name: str
) -> dict[str, Any]:
    diffs = [a - b for a, b in zip(on_values, off_values)]
    non_zero = [(abs(d), 1 if d > 0 else -1) for d in diffs if d != 0.0]
    n_pairs = len(diffs)
    n_non_zero = len(non_zero)

    on_summary = summarize_numeric(on_values)
    off_summary = summarize_numeric(off_values)
    diff_summary = summarize_numeric(diffs)
    mean_ci = bootstrap_ci_95(diffs, stat_fn="mean")
    median_ci = bootstrap_ci_95(diffs, stat_fn="median")

    if n_non_zero == 0:
        return {
            "metric": metric_name,
            "n_pairs": n_pairs,
            "n_non_zero_diffs": 0,
            "chatbot_on": on_summary,
            "chatbot_off": off_summary,
            "paired_diff_on_minus_off": diff_summary,
            "mean_diff_95_ci_bootstrap": list(mean_ci),
            "median_diff_95_ci_bootstrap": list(median_ci),
            "w_plus": 0.0,
            "w_minus": 0.0,
            "w_statistic": 0.0,
            "z_statistic": 0.0,
            "p_value": 1.0,
            "p_value_method": "degenerate_all_zero",
            "effect_size_r": 0.0,
            "rank_biserial_correlation": 0.0,
        }

    non_zero.sort(key=lambda item: item[0])

    # Assign average ranks for ties
    w_plus = 0.0
    w_minus = 0.0
    tie_correction_sum = 0
    has_ties = False

    idx = 0
    while idx < n_non_zero:
        end = idx + 1
        while end < n_non_zero and non_zero[end][0] == non_zero[idx][0]:
            end += 1
        tie_count = end - idx
        if tie_count > 1:
            has_ties = True
            tie_correction_sum += tie_count**3 - tie_count
        avg_rank = (idx + 1 + end) / 2.0
        for j in range(idx, end):
            if non_zero[j][1] > 0:
                w_plus += avg_rank
            else:
                w_minus += avg_rank
        idx = end

    w_stat = min(w_plus, w_minus)
    total_rank_sum = w_plus + w_minus
    rank_biserial = (w_plus - w_minus) / total_rank_sum if total_rank_sum > 0 else 0.0

    mean_w = n_non_zero * (n_non_zero + 1) / 4.0
    var_w = (
        n_non_zero * (n_non_zero + 1) * (2 * n_non_zero + 1) / 24.0
        - tie_correction_sum / 48.0
    )
    sigma_w = math.sqrt(max(0.0, var_w))

    if sigma_w > 0:
        z_signed = (w_plus - mean_w) / sigma_w
        z_cc = max(0.0, abs(w_stat - mean_w) - 0.5) / sigma_w
        asymp_p = math.erfc(z_cc / math.sqrt(2.0))
    else:
        z_signed = 0.0
        asymp_p = 1.0

    if not has_ties and n_non_zero <= 18:
        p_value = _exact_wilcoxon_two_sided_p(n_non_zero, w_stat)
        p_method = "exact_permutation"
    else:
        p_value = asymp_p
        p_method = "normal_approx_tie_and_continuity_corrected"

    effect_size_r = abs(z_signed) / math.sqrt(n_non_zero)

    return {
        "metric": metric_name,
        "n_pairs": n_pairs,
        "n_non_zero_diffs": n_non_zero,
        "chatbot_on": on_summary,
        "chatbot_off": off_summary,
        "paired_diff_on_minus_off": diff_summary,
        "mean_diff_95_ci_bootstrap": list(mean_ci),
        "median_diff_95_ci_bootstrap": list(median_ci),
        "w_plus": round(w_plus, 4),
        "w_minus": round(w_minus, 4),
        "w_statistic": round(w_stat, 4),
        "z_statistic": round(z_signed, 4),
        "p_value": round(p_value, 6),
        "p_value_method": p_method,
        "effect_size_r": round(effect_size_r, 4),
        "rank_biserial_correlation": round(rank_biserial, 4),
    }


def load_scenario_runs(
    csv_path: Path, allow_simulated: bool, min_duration_seconds: float
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    stats = {
        "raw_rows": 0,
        "filtered_simulated": 0,
        "filtered_incomplete": 0,
        "filtered_below_min_duration": 0,
        "retained_rows": 0,
    }
    rows: list[dict[str, Any]] = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            stats["raw_rows"] += 1
            is_sim = parse_bool(row.get("is_simulated")) is True
            if is_sim and not allow_simulated:
                stats["filtered_simulated"] += 1
                continue

            completed_at = (row.get("completed_at") or "").strip()
            duration = parse_float(row.get("duration_seconds"))
            confidence = parse_int(row.get("confidence_score"))
            is_correct = parse_bool(row.get("is_correct"))
            variant = (row.get("active_variant") or "").strip()

            if (
                not completed_at
                or duration is None
                or confidence is None
                or is_correct is None
                or variant not in {"chatbot_on", "chatbot_off"}
            ):
                stats["filtered_incomplete"] += 1
                continue

            if duration < min_duration_seconds:
                stats["filtered_below_min_duration"] += 1
                continue

            rows.append(
                {
                    "scenario_run_id": (row.get("scenario_run_id") or "").strip(),
                    "assignment_id": (row.get("assignment_id") or "").strip(),
                    "participant_code": (row.get("participant_code") or "").strip(),
                    "assignment_variant": (row.get("assignment_variant") or "").strip(),
                    "scenario_code": (row.get("scenario_code") or "").strip(),
                    "step_order": parse_int(row.get("step_order")) or 0,
                    "active_variant": variant,
                    "is_correct": is_correct,
                    "confidence_score": float(confidence),
                    "duration_seconds": duration,
                    "is_simulated": is_sim,
                }
            )
            stats["retained_rows"] += 1
    return rows, stats


def analyze_rag_economics(
    rag_path: Path | None,
    allow_simulated: bool,
    n_chatbot_on_decisions: int,
    n_chatbot_on_correct: int,
) -> dict[str, Any]:
    if rag_path is None or not rag_path.exists():
        return {
            "available": False,
            "reason": "Không cung cấp file rag_logs CSV.",
        }

    raw_rows = 0
    filtered_simulated = 0
    latencies: list[float] = []
    tokens_list: list[int] = []
    costs: list[float] = []
    model_counts: dict[str, int] = defaultdict(int)

    with rag_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            raw_rows += 1
            is_sim = parse_bool(row.get("is_simulated")) is True
            if is_sim and not allow_simulated:
                filtered_simulated += 1
                continue

            lat = parse_float(row.get("latency_ms"))
            tok = parse_int(row.get("tokens_used"))
            cost = parse_float(row.get("cost_usd"))
            model = (row.get("model_name") or "unknown").strip() or "unknown"

            if lat is not None and lat >= 0:
                latencies.append(lat)
            if tok is not None and tok >= 0:
                tokens_list.append(tok)
            if cost is not None and cost >= 0:
                costs.append(cost)
            model_counts[model] += 1

    retained = len(costs) if costs else len(latencies)
    lat_sorted = sorted(latencies)
    total_tokens = sum(tokens_list)
    total_cost = sum(costs)
    avg_cost = (total_cost / len(costs)) if costs else 0.0
    avg_latency = statistics.fmean(latencies) if latencies else 0.0
    p95_latency = quantile_sorted(lat_sorted, 0.95) if lat_sorted else 0.0

    cost_per_assisted_decision = (
        total_cost / n_chatbot_on_decisions if n_chatbot_on_decisions > 0 else 0.0
    )
    cost_per_correct_decision = (
        total_cost / n_chatbot_on_correct if n_chatbot_on_correct > 0 else 0.0
    )

    return {
        "available": True,
        "raw_rows": raw_rows,
        "filtered_simulated": filtered_simulated,
        "retained_assistant_messages": retained,
        "models_breakdown": dict(model_counts),
        "total_tokens": total_tokens,
        "avg_tokens_per_query": round(total_tokens / len(tokens_list), 2) if tokens_list else 0.0,
        "total_cost_usd": round(total_cost, 6),
        "avg_cost_usd": round(avg_cost, 6),
        "avg_latency_ms": round(avg_latency, 2),
        "p95_latency_ms": round(p95_latency, 2),
        "chatbot_on_completed_decisions": n_chatbot_on_decisions,
        "chatbot_on_correct_decisions": n_chatbot_on_correct,
        "cost_per_assisted_decision_usd": round(cost_per_assisted_decision, 6),
        "cost_per_correct_assisted_decision_usd": round(cost_per_correct_decision, 6),
    }


def render_markdown_report(report: dict[str, Any]) -> str:
    meta = report["meta"]
    pairing = report["pairing_summary"]
    mcnemar = report["mcnemar_accuracy"]
    wil_dur = report["wilcoxon_duration_seconds"]
    wil_conf = report["wilcoxon_confidence_score"]
    econ = report["unit_economics"]

    lines: list[str] = [
        "# Báo cáo Phân tích Thống kê Thí nghiệm Within-Subject AB/BA",
        "",
    ]

    if meta["allow_simulated"]:
        lines.append(
            "> **CẢNH BÁO (`is_simulated = true`):** Báo cáo này được chạy với cờ `--allow-simulated` trên dữ liệu mô phỏng để kiểm tra pipeline. **Không dùng số liệu này để rút ra kết luận nghiên cứu chính thức.**"
        )
        lines.append("")

    lines.extend(
        [
            f"- **Thời gian phân tích:** `{meta['generated_at']}`",
            f"- **Nguồn `scenario_runs`:** `{meta['runs_csv']}`",
            f"- **Lọc dữ liệu:** {meta['filtering']['raw_rows']} dòng thô → giữ **{meta['filtering']['retained_rows']}** lượt hợp lệ (loại {meta['filtering']['filtered_simulated']} simulated, {meta['filtering']['filtered_incomplete']} chưa hoàn tất, {meta['filtering']['filtered_below_min_duration']} dưới ngưỡng `{meta['min_duration_seconds']}s`).",
            f"- **Số cặp đối chứng AB/BA hoàn chỉnh:** **{pairing['complete_pairs']}** cặp ({pairing['abba_on_first_pairs']} cặp `abba_on_first`, {pairing['abba_off_first_pairs']} cặp `abba_off_first`).",
            "",
            "## 1. Tỷ lệ chọn đúng gói — McNemar's Test",
            "",
            "| Chỉ số | Giá trị |",
            "|---|---:|",
            f"| Độ chính xác khi **có Trợ lý (`chatbot_on`)** | **{(mcnemar['accuracy_chatbot_on'] * 100):.2f}%** |",
            f"| Độ chính xác khi **tự duyệt (`chatbot_off`)** | **{(mcnemar['accuracy_chatbot_off'] * 100):.2f}%** |",
            f"| Chênh lệch (`on - off`) & 95% CI | **{(mcnemar['accuracy_diff_on_minus_off'] * 100):+.2f}%** ([{(mcnemar['accuracy_diff_95_ci'][0] * 100):+.2f}%, {(mcnemar['accuracy_diff_95_ci'][1] * 100):+.2f}%]) |",
            f"| Cặp bất đồng (`on đúng/off sai` vs `on sai/off đúng`) | `b = {mcnemar['contingency_2x2']['on_only_correct_b_n10']}` vs `c = {mcnemar['contingency_2x2']['off_only_correct_c_n01']}` |",
            f"| Odds Ratio (Haldane corrected) | `{mcnemar['odds_ratio_haldane_corrected']}` (exact: `{mcnemar['odds_ratio_exact']}`) |",
            f"| **McNemar Exact Binomial p-value** | **`{mcnemar['p_value_exact_binomial']}`** (Chi2={mcnemar['chi2_edwards_corrected']}, asymp p={mcnemar['p_value_asymptotic']}) |",
            "",
            "## 2. Thời gian quyết định & Độ tự tin — Wilcoxon Signed-Rank Test",
            "",
            "| Biến đo | `chatbot_on` Mean ± SD (Median [IQR]) | `chatbot_off` Mean ± SD (Median [IQR]) | Paired Diff 95% CI (Bootstrap) | W / z | p-value | Effect Size (`r` / `r_rb`) |",
            "|---|---|---|---|---:|---:|---:|",
            (
                f"| **Thời gian (giây)** | "
                f"{wil_dur['chatbot_on']['mean']:.2f} ± {wil_dur['chatbot_on']['sd']:.2f} ({wil_dur['chatbot_on']['median']:.2f} [{wil_dur['chatbot_on']['iqr']:.2f}]) | "
                f"{wil_dur['chatbot_off']['mean']:.2f} ± {wil_dur['chatbot_off']['sd']:.2f} ({wil_dur['chatbot_off']['median']:.2f} [{wil_dur['chatbot_off']['iqr']:.2f}]) | "
                f"{wil_dur['paired_diff_on_minus_off']['mean']:+.2f} [{wil_dur['mean_diff_95_ci_bootstrap'][0]:+.2f}, {wil_dur['mean_diff_95_ci_bootstrap'][1]:+.2f}] | "
                f"W={wil_dur['w_statistic']:.1f} / z={wil_dur['z_statistic']:.2f} | "
                f"**{wil_dur['p_value']}** | "
                f"`r={wil_dur['effect_size_r']}` / `r_rb={wil_dur['rank_biserial_correlation']}` |"
            ),
            (
                f"| **Độ tự tin (1–5)** | "
                f"{wil_conf['chatbot_on']['mean']:.2f} ± {wil_conf['chatbot_on']['sd']:.2f} ({wil_conf['chatbot_on']['median']:.2f} [{wil_conf['chatbot_on']['iqr']:.2f}]) | "
                f"{wil_conf['chatbot_off']['mean']:.2f} ± {wil_conf['chatbot_off']['sd']:.2f} ({wil_conf['chatbot_off']['median']:.2f} [{wil_conf['chatbot_off']['iqr']:.2f}]) | "
                f"{wil_conf['paired_diff_on_minus_off']['mean']:+.2f} [{wil_conf['mean_diff_95_ci_bootstrap'][0]:+.2f}, {wil_conf['mean_diff_95_ci_bootstrap'][1]:+.2f}] | "
                f"W={wil_conf['w_statistic']:.1f} / z={wil_conf['z_statistic']:.2f} | "
                f"**{wil_conf['p_value']}** | "
                f"`r={wil_conf['effect_size_r']}` / `r_rb={wil_conf['rank_biserial_correlation']}` |"
            ),
            "",
            "## 3. Kinh tế Đơn vị Trợ lý Ảo (Unit Economics)",
            "",
        ]
    )

    if not econ.get("available"):
        lines.append(f"- {econ.get('reason')}")
    else:
        lines.extend(
            [
                "| Chỉ số RAG | Giá trị |",
                "|---|---:|",
                f"| Tổng lượt trả lời hợp lệ | **{econ['retained_assistant_messages']}** (loại {econ['filtered_simulated']} simulated) |",
                f"| Tổng tokens | **{econ['total_tokens']}** (TB {econ['avg_tokens_per_query']} tokens/lượt) |",
                f"| Tổng chi phí LLM | **${econ['total_cost_usd']:.6f}** |",
                f"| **Avg Cost / Query (`avg_cost_usd`)** | **${econ['avg_cost_usd']:.6f}** |",
                f"| **Chi phí / Quyết định có trợ lý (`cost_per_assisted_decision`)** | **${econ['cost_per_assisted_decision_usd']:.6f}** |",
                f"| Chi phí / Quyết định ĐÚNG có trợ lý | ${econ['cost_per_correct_assisted_decision_usd']:.6f} |",
                f"| Độ trễ TB / P95 | {econ['avg_latency_ms']} ms / **{econ['p95_latency_ms']} ms** |",
            ]
        )

    lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze within-subject AB/BA experiment data (stdlib only)."
    )
    parser.add_argument(
        "--runs",
        required=True,
        type=Path,
        help="Path to scenario_runs CSV exported from /api/admin/export",
    )
    parser.add_argument(
        "--rag-logs",
        type=Path,
        default=None,
        help="Optional path to rag_logs CSV exported from /api/admin/export",
    )
    parser.add_argument(
        "--allow-simulated",
        action="store_true",
        help="Include is_simulated=true rows (for testing sample-demo only).",
    )
    parser.add_argument(
        "--min-duration-seconds",
        type=float,
        default=5.0,
        help="Exclude runs shorter than this threshold (default: 5.0s).",
    )
    parser.add_argument(
        "--out-json",
        type=Path,
        default=Path("analysis/output/experiment_report.json"),
        help="Output JSON report path.",
    )
    parser.add_argument(
        "--out-md",
        type=Path,
        default=Path("analysis/output/experiment_report.md"),
        help="Output Markdown report path.",
    )
    args = parser.parse_args()

    rows, filter_stats = load_scenario_runs(
        args.runs, args.allow_simulated, args.min_duration_seconds
    )

    by_participant: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for row in rows:
        key = row["assignment_id"] or row["participant_code"]
        if not key:
            continue
        by_participant[key][row["active_variant"]] = row

    paired: list[tuple[dict[str, Any], dict[str, Any]]] = []
    for variant_map in by_participant.values():
        if "chatbot_on" in variant_map and "chatbot_off" in variant_map:
            paired.append((variant_map["chatbot_on"], variant_map["chatbot_off"]))

    on_correct = [on["is_correct"] for on, _ in paired]
    off_correct = [off["is_correct"] for _, off in paired]
    on_durations = [on["duration_seconds"] for on, _ in paired]
    off_durations = [off["duration_seconds"] for _, off in paired]
    on_conf = [on["confidence_score"] for on, _ in paired]
    off_conf = [off["confidence_score"] for _, off in paired]

    abba_on_first = [
        pair for pair in paired if pair[0]["assignment_variant"] == "abba_on_first"
    ]
    abba_off_first = [
        pair for pair in paired if pair[0]["assignment_variant"] == "abba_off_first"
    ]

    all_on_rows = [r for r in rows if r["active_variant"] == "chatbot_on"]
    n_on_decisions = len(all_on_rows)
    n_on_correct = sum(1 for r in all_on_rows if r["is_correct"])

    report: dict[str, Any] = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "runs_csv": str(args.runs),
            "rag_logs_csv": str(args.rag_logs) if args.rag_logs else None,
            "allow_simulated": args.allow_simulated,
            "min_duration_seconds": args.min_duration_seconds,
            "filtering": filter_stats,
        },
        "pairing_summary": {
            "unique_participants_with_any_run": len(by_participant),
            "complete_pairs": len(paired),
            "abba_on_first_pairs": len(abba_on_first),
            "abba_off_first_pairs": len(abba_off_first),
        },
        "mcnemar_accuracy": mcnemar_test(on_correct, off_correct),
        "wilcoxon_duration_seconds": wilcoxon_signed_rank_test(
            on_durations, off_durations, "duration_seconds"
        ),
        "wilcoxon_confidence_score": wilcoxon_signed_rank_test(
            on_conf, off_conf, "confidence_score"
        ),
        "order_effect_check": {
            "abba_on_first": {
                "n_pairs": len(abba_on_first),
                "mean_duration_on": round(
                    statistics.fmean([on["duration_seconds"] for on, _ in abba_on_first]), 2
                )
                if abba_on_first
                else 0.0,
                "mean_duration_off": round(
                    statistics.fmean([off["duration_seconds"] for _, off in abba_on_first]), 2
                )
                if abba_on_first
                else 0.0,
            },
            "abba_off_first": {
                "n_pairs": len(abba_off_first),
                "mean_duration_on": round(
                    statistics.fmean([on["duration_seconds"] for on, _ in abba_off_first]), 2
                )
                if abba_off_first
                else 0.0,
                "mean_duration_off": round(
                    statistics.fmean([off["duration_seconds"] for _, off in abba_off_first]), 2
                )
                if abba_off_first
                else 0.0,
            },
        },
        "unit_economics": analyze_rag_economics(
            args.rag_logs,
            args.allow_simulated,
            n_on_decisions,
            n_on_correct,
        ),
    }

    args.out_json.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.parent.mkdir(parents=True, exist_ok=True)

    args.out_json.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    args.out_md.write_text(render_markdown_report(report), encoding="utf-8")

    print(
        f"Analyzed {len(paired)} AB/BA pairs "
        f"(McNemar p={report['mcnemar_accuracy']['p_value_exact_binomial']}, "
        f"Wilcoxon duration p={report['wilcoxon_duration_seconds']['p_value']}, "
        f"Wilcoxon confidence p={report['wilcoxon_confidence_score']['p_value']})."
    )
    print(f"Reports saved to {args.out_json} and {args.out_md}")


if __name__ == "__main__":
    main()
