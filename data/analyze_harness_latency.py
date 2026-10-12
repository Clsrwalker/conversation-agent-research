"""Read-only latency diagnosis of the three historical website harness runs.

No model invocation or benchmark execution. Checkpoint extensions are decoded as
inert data; constructors, pickle and saver setup are never used. Only numeric
timings, identifiers and tool outcome labels leave the private source records.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import datetime
import hashlib
import json
from pathlib import Path
import sqlite3

import ormsgpack
from deepagents.middleware.summarization import DEEPAGENTS_DEFAULT_SUMMARY_PROMPT


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RUNS = [
    "experiments/deep_conversation/runs/monitor-local14-validation-v1",
    "experiments/deep_conversation/benchmarks/results/local14-tool-recovery-paired-v1/agent-led-recovery__orch-route-checkin-evidence-join__r1",
    "experiments/deep_conversation/benchmarks/results/local14-tool-recovery-paired-v1/agent-led-recovery__orch-browser-recording-constraint__r1",
]
TIMINGS = ("total_duration", "load_duration", "prompt_eval_duration", "eval_duration")
SUMMARY_BEFORE, SUMMARY_AFTER = DEEPAGENTS_DEFAULT_SUMMARY_PROMPT.format(
    messages="__LATENCY_HISTORY__").split("__LATENCY_HISTORY__")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def fingerprint(path):
    return {"path": str(path.resolve()), "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def stamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp() * 1000


def union_ms(intervals):
    merged = []
    for start, end in sorted(intervals):
        if end < start:
            raise ValueError("Negative event interval")
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(end, merged[-1][1])
        else:
            merged.append([start, end])
    return sum(end - start for start, end in merged)


def is_summary_call(call):
    messages = [message for batch in call.get("request") or [] for message in batch]
    return bool("summar" in call.get("role", "").lower() or (
        len(messages) == 1 and messages[0].get("type") == "human"
        and isinstance(messages[0].get("content"), str)
        and messages[0]["content"].startswith(SUMMARY_BEFORE)
        and messages[0]["content"].endswith(SUMMARY_AFTER.rstrip())))


def analyse(path):
    inputs = [path / x for x in ("summary.json", "manifest.json", "model_calls.json",
                               "tool_calls.json", "environment_log.json",
                               "runtime_status.json", "monitor_events.jsonl",
                               "checkpoints.sqlite", "checkpoints.sqlite-wal")
              if (path / x).exists()]
    hashes = [fingerprint(p) for p in inputs]
    calls = read_json(path / "model_calls.json")
    receipts = read_json(path / "tool_calls.json")
    summary = read_json(path / "summary.json")
    messages = {}
    origins = defaultdict(set)
    conflicts = []
    decode_errors = []

    def remember(value, origin):
        if isinstance(value, dict):
            if value.get("type") == "ai" and isinstance(value.get("id"), str):
                mid = value["id"]
                metadata = value.get("response_metadata") or {}
                safe = {
                    "id": mid,
                    "timing_ns": {k: metadata[k] for k in TIMINGS
                                  if isinstance(metadata.get(k), (int, float))},
                    "provider_counts": {k: metadata[k] for k in ("prompt_eval_count", "eval_count")
                                        if isinstance(metadata.get(k), (int, float))},
                    "usage": value.get("usage_metadata"),
                    "tools": [{"name": t.get("name"), "id": t.get("id")}
                              for t in value.get("tool_calls", [])],
                }
                if mid in messages and messages[mid] != safe:
                    conflicts.append({"message_id": mid, "source": origin})
                else:
                    messages[mid] = safe
                origins[mid].add(origin)
            for child in value.values():
                if isinstance(child, (dict, list, tuple)):
                    remember(child, origin)
        elif isinstance(value, (list, tuple)):
            for child in value:
                remember(child, origin)

    for call in calls:
        remember(call.get("request"), "model_calls.request")

    def decode_extension(code, payload):
        values = ormsgpack.unpackb(payload, ext_hook=decode_extension,
                                  option=ormsgpack.OPT_NON_STR_KEYS)
        # Preserve inert dictionaries, including AIMessage kwargs. Do not import
        # classes named in serialized extensions or execute constructors.
        return {"extension_code": code, "inert_values": values}

    database = path / "checkpoints.sqlite"
    if database.exists():
        connection = sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True)
        try:
            connection.execute("PRAGMA query_only=ON")
            connection.execute("BEGIN")
            for table, column in (("checkpoints", "checkpoint"), ("writes", "value")):
                for rowid, kind, payload in connection.execute(
                        f"SELECT rowid,type,{column} FROM {table}"):
                    try:
                        if kind == "msgpack":
                            value = ormsgpack.unpackb(payload, ext_hook=decode_extension,
                                                      option=ormsgpack.OPT_NON_STR_KEYS)
                        elif kind == "json":
                            value = json.loads(payload)
                        else:
                            continue
                        remember(value, "checkpoints.sqlite:" + table)
                    except Exception as error:
                        decode_errors.append({"table": table, "rowid": rowid,
                                              "error_type": type(error).__name__})
        finally:
            if connection.in_transaction:
                connection.rollback()
            connection.close()

    receipt_index = {t["call_id"]: t for t in receipts}
    rows = []
    for call in calls:
        mid = "lc_run--" + call["call_id"] + "-0"
        msg = messages.get(mid)
        tools = []
        for tool in msg["tools"] if msg else []:
            receipt = receipt_index.get(tool["id"])
            result = receipt.get("result", {}) if receipt else {}
            if not isinstance(result, dict):
                result = {}
            tools.append({**tool, "receipt_found": receipt is not None,
                          "receipt_seq": receipt.get("seq") if receipt else None,
                          "simulated_at_ms": receipt.get("at_ms") if receipt else None,
                          "status": result.get("status"), "error_code": result.get("error_code"),
                          "job_started": result.get("job_started")})
        row = {k: call.get(k) for k in ("ordinal", "call_id", "role", "wall_ms",
                                      "input_tokens", "output_tokens", "total_tokens")}
        row.update(simulated_started_at_ms=call.get("started_at_ms"),
                   simulated_finished_at_ms=call.get("finished_at_ms"),
                   response_metadata_found=msg is not None,
                   metadata_sources=sorted(origins[mid]), tools=tools,
                   no_tool_calls=(len(tools) == 0) if msg else None,
                   default_summarization_call=is_summary_call(call))
        if msg:
            row["provider_ms"] = {k: v / 1e6 for k, v in msg["timing_ns"].items()}
            row["provider_counts"] = msg["provider_counts"]
            timing = row["provider_ms"]
            if all(k in timing for k in TIMINGS):
                row["provider_other_ms"] = timing["total_duration"] - sum(
                    timing[k] for k in TIMINGS[1:])
                row["client_minus_provider_ms"] = call["wall_ms"] - timing["total_duration"]
        rows.append(row)

    events_path = path / "monitor_events.jsonl"
    events = [json.loads(line) for line in events_path.read_text(encoding="utf-8").splitlines()
              if line.strip()] if events_path.exists() else []
    spans = {"model": [], "tool": []}
    callback_totals = {"model": 0.0, "tool": 0.0}
    callback_counts = Counter()
    starts = {}
    for event in events:
        name = event["event"]
        if name in ("model_start", "tool_start"):
            starts[event["run_id"]] = event
        if name in ("model_end", "tool_end"):
            kind = name.split("_")[0]
            callback_counts[kind] += 1
            callback_totals[kind] += event.get("data", {}).get("duration_ms", 0)
            begin = starts.get(event["run_id"])
            if begin:
                spans[kind].append((stamp(begin["timestamp"]), stamp(event["timestamp"])))

    status_path = path / "runtime_status.json"
    status = read_json(status_path) if status_path.exists() else {}
    total_ms = (stamp(status["finished_at"]) - stamp(status["started_at"])) if (
        status.get("finished_at") and status.get("started_at") and status.get("resume_count", 0) == 0) else None
    all_metadata = len(rows) == sum(all(k in row.get("provider_ms", {}) for k in TIMINGS)
                                    for row in rows)
    timing_totals = ({k: sum(row["provider_ms"][k] for row in rows) for k in TIMINGS}
                     if all_metadata else None)
    available_totals = {k: sum(row.get("provider_ms", {}).get(k, 0) for row in rows)
                        for k in TIMINGS}
    wall_ms = sum(row["wall_ms"] or 0 for row in rows)
    tool_union = union_ms(spans["tool"])
    model_union = union_ms(spans["model"])
    groups = defaultdict(lambda: {"calls": 0, "wall_ms": 0.0, "output_tokens": 0})
    for row in rows:
        name = ("default_summarization" if row["default_summarization_call"] else
                "response_metadata_unavailable" if not row["response_metadata_found"] else
                "+".join(t["name"] for t in row["tools"]) if row["tools"] else "no_tool_call")
        groups[name]["calls"] += 1
        groups[name]["wall_ms"] += row["wall_ms"] or 0
        groups[name]["output_tokens"] += row["output_tokens"] or 0
    return {
        "run_path": str(path.resolve()), "case_id": status.get("case_id") or read_json(path / "manifest.json").get("case_id"),
        "preset": summary.get("preset"), "model": status.get("model"),
        "status": summary.get("status"), "stop_reason": summary.get("stop_reason"),
        "total_runtime_wall_ms": total_ms, "model_wall_ms": wall_ms,
        "non_model_wall_remainder_ms": total_ms - wall_ms if total_ms is not None else None,
        "provider_timing_complete": all_metadata, "provider_totals_ms": timing_totals,
        "provider_totals_available_only_ms": available_totals,
        "provider_timing_missing_ordinals": [r["ordinal"] for r in rows
                                             if not all(k in r.get("provider_ms", {}) for k in TIMINGS)],
        "provider_other_ms": sum(r.get("provider_other_ms", 0) for r in rows) if all_metadata else None,
        "client_minus_provider_ms": sum(r.get("client_minus_provider_ms", 0) for r in rows) if all_metadata else None,
        "monitor": {"present": bool(events), "callback_end_counts": dict(callback_counts) if events else None,
                    "duration_field_sums_ms": callback_totals if events else None,
                    "timestamp_interval_union_ms": {"model": model_union, "tool": tool_union,
                                                     "combined": union_ms(spans["model"] + spans["tool"])} if events else None,
                    "outside_model_and_tool_intervals_ms": total_ms - union_ms(spans["model"] + spans["tool"]) if total_ms is not None else None},
        "model_calls": len(rows), "tool_receipts": len(receipts), "checkpoints": summary.get("checkpoints"),
        "tokens": summary.get("token_usage"), "simulated_close_at_ms": summary.get("close_at_ms"),
        "final_card_count": len(summary.get("cards", {})),
        "publish_card_receipt_count": sum(t["name"] == "publish_card" for t in receipts),
        "model_time_by_emitted_tool_names": dict(groups), "calls": rows,
        "metadata_conflicts": conflicts, "checkpoint_decode_errors": decode_errors,
        "source_fingerprints": hashes,
        "sources_unchanged_during_analysis": hashes == [fingerprint(p) for p in inputs],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "work/harness-latency-audit.json")
    args = parser.parse_args()
    data = {
        "schema_version": 1, "analysis_date": "2026-10-10", "user_timezone": "America/Halifax",
        "kind": "read_only_historical_latency_diagnostic", "new_model_calls": 0,
        "definitions": {
            "model_wall_ms": "Sum of recorded model accounting perf_counter durations; includes provider inference and client overhead. Serial model calls in these runs.",
            "total_runtime_wall_ms": "runtime_status finished_at minus started_at, only for sessions with no resume. Does not include Python startup/preflight before telemetry or browser rendering/network delivery.",
            "provider_ms": "Ollama response_metadata *_duration nanoseconds divided by 1e6. Exact AIMessage IDs matched to model call IDs, deduplicated across requests/checkpoints/writes.",
            "provider_other_ms": "Provider total minus load, prompt evaluation and generation; unclassified provider overhead, not a directly measured separate phase.",
            "client_minus_provider_ms": "Accounting model wall minus provider-reported total. Unclassified client/provider boundary residual, not proof of network latency.",
            "tool_intervals": "Union of wall timestamp tool callback intervals, avoiding double-counting parallel tools. Callback duration sums are also retained but are not additive critical-path cost.",
            "simulated_time": "started_at_ms/finished_at_ms/at_ms/close_at_ms are the benchmark logical clock. Search/read/wait calls schedule or advance replay events; no real external source latency is measured.",
            "action_groups": "Model wall time grouped by tools actually emitted in that response. It is not evidence that all time in a group was wasted or recoverable.",
            "summary_detection": "Role label or exact prefix/suffix match to the installed pinned Deep Agents default summarization prompt. No inference from private generated text.",
            "partial_provider_totals": "Available-only totals exclude calls lacking saved provider metadata; provider_totals_ms is null unless every call has all four timings. Accounting model_wall_ms still includes all calls.",
            "delivery": "No publish_card receipts means no attempted user-visible delivery. Runtime completion is not successful assistance; private completion content is neither exported nor treated as delivery.",
        },
        "limitations": [
            "Three archived website examples, not fresh timing benchmarks or evidence about real ASR, web search or mobile end-to-end latency.",
            "A large load_duration establishes loading time; it does not identify why the model was unloaded or GPU/cache state.",
            "Checkpoint save time, ASR, UI and first-token latency were not separately instrumented in these artifacts.",
            "No fine-grained attribution of observed latency savings to proposed orchestration changes is possible without controlled reruns.",
            "Missing runtime telemetry on older runs leaves their full real wall duration unknown; provider timing remains available.",
        ],
        "runs": [analyse(ROOT / value) for value in DEFAULT_RUNS],
    }
    data["analyzer_fingerprint"] = fingerprint(Path(__file__))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for run in data["runs"]:
        print(json.dumps({k: run[k] for k in ("case_id", "model_calls", "model_wall_ms", "total_runtime_wall_ms", "provider_totals_ms", "final_card_count", "provider_timing_complete", "sources_unchanged_during_analysis")}, ensure_ascii=True))
    print("Wrote", args.output)


if __name__ == "__main__":
    main()
