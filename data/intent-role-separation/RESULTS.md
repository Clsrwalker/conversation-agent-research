# One model, separate intentions and work

Date: 2026-10-23, America/Halifax. Completed executed synthetic replay; interpretation remains subject to the separate audit record. No LoRA, training or default Lab change.

Separate chat and work roles delivered complete, correct final answers in 14/16 trajectories; adding an independent intention tracker did so in 12/16, the same count as the unified actor. All 48 runs finished. This small pilot does not establish a tracker benefit.

## Problem and intervention

Changing, withdrawing or restoring a request can leave an answer based on an obsolete intention. This pilot implements the user's functional-role proposal: the same base model acts as tracker, chat role or work role on different calls. Roles are not separate topic specialists or separately trained models.

The optional `IntentRoleSession` uses the existing causal WorldStore tool functions. The unified actor has both tool sets. Work can search, read, wait, cancel and save notes; chat can publish or withdraw cards. The tracker has no work/delivery tools and proposes patches to its own durable SQLite intention ledger. Harness validation checks identity, source references, version/cursor consistency and allowed transitions atomically. Receipts remain separate from intentions. Every role retains the arrived raw conversation; tracked state is additional advice, not a replacement for the original evidence or semantic truth.

All three arms use this new stepping session. They are **not** a native DeepAgents baseline comparison. The experiment bundles role prompts, tool restrictions, alternation and state context. It cannot isolate a pure effect of role names or a compute-free tracker effect.

## Frozen comparison

Eight newly authored fictional families × three conditions × two repeats produced 48 complete trajectories and 144 stage snapshots. Each trajectory had three stages and six calls per stage, including tracker repairs. Work/chat alternation continued across stages. All arms actually used all 18 calls. Evaluation order was frozen with seed 20261023. Repeats are nested in eight families and are not independent users.

All calls used local `qwen2.5:14b-instruct`, Q4_K_M, temperature 0, context 16,384, output cap 1,200 and the same source corpus/tool rules. The model digest and runtime are recorded in the evaluation manifest. Maximum reported prompt size was 8,279 tokens. Provider metadata showed no truncation signal; client capture cannot independently verify server tokenization. Each trajectory had the same 180,000-token ceiling, but actual token use differed. Virtual model time was fixed at 100 ms per call; virtual stage times are not user latency.

Only arrived raw events and causal tool observations reached the model. Scoring gold and future events were excluded. Forty source/protocol/fixture files and their copies matched the freeze manifest. A separate development case ran three trajectories and 54 calls (158,171 tokens); it is archived and excluded from all primary scores. No evaluation failure was replaced by a repaired rerun.

## Primary endpoint: final active delivered cards

Only actual visible, committed cards at the end of stage three were scored. Private drafts and requested-but-rejected publications are not delivery. All simultaneously active cards were considered. A completed run does not mean a correct answer.

| Condition | Complete and correct | Omission | Scope error | Needless clarification | Factual error | Families complete in both repeats |
| --- | --- | --- | --- | --- | --- | --- |
| Unified actor | 12/16 | 3/16 | 2/16 | 0/16 | 0/16 | 5/8 |
| Chat + work | 14/16 | 2/16 | 0/16 | 0/16 | 0/16 | 7/8 |
| Tracker + chat + work | 12/16 | 2/16 | 2/16 | 0/16 | 1/16 | 6/8 |

All primary labels were resolved without nulls. Error categories overlap. Omission means missing content, not every wrong answer: the tracked room selections supplied a name, price and capacity but chose the wrong room under the revised constraints. One explicitly claimed the old choice was cheapest (factual + scope error); the other simply named it (scope error). Correct coverage below requires a correct answer and can be false when omission is false.

| Condition | Correct intent coverage | Missing or incorrect | Uncertain | Families with any repeated-label disagreement |
| --- | --- | --- | --- | --- |
| Unified actor | 25/28 | 3 | 0 | 3/8 |
| Chat + work | 26/28 | 2 | 0 | 0/8 |
| Tracker + chat + work | 24/28 | 4 | 0 | 1/8 |

| Family | Unified | Chat + work | Tracker + chat + work |
| --- | --- | --- | --- |
| combined-workshop-change | 0/2 | 0/2 | 0/2 |
| key-restoration | 2/2 | 2/2 | 2/2 |
| late-obsolete-evidence | 2/2 | 2/2 | 2/2 |
| multiple-request-owners | 1/2 | 2/2 | 2/2 |
| practice-no-change | 2/2 | 2/2 | 2/2 |
| room-withdrawal | 2/2 | 2/2 | 0/2 |
| shuttle-replacement | 2/2 | 2/2 | 2/2 |
| unaccepted-assistant-proposal | 1/2 | 2/2 | 2/2 |

| Paired comparison | Left only complete | Right only complete | Tie | Uncertain |
| --- | --- | --- | --- | --- |
| Unified actor vs Chat + work | 0 | 2 | 14 | 0 |
| Unified actor vs Tracker + chat + work | 2 | 2 | 12 | 0 |
| Chat + work vs Tracker + chat + work | 2 | 0 | 14 | 0 |

These are sixteen paired repeated observations per comparison, clustered within eight families. No population significance, production improvement or broad generalization is claimed.

## Costs and observed mechanisms

| Condition | Model calls | Input tokens | Output tokens | Tracker calls | Rejected steps | Executed tool calls | Summed model wall seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unified actor | 288 | 818,956 | 14,032 | 0 | 0 | 198 | 426.349 |
| Chat + work | 288 | 798,990 | 17,699 | 0 | 0 | 245 | 524.740 |
| Tracker + chat + work | 288 | 1,043,258 | 19,897 | 69 | 25 | 153 | 658.294 |

Each condition used 288 calls. Tracked runs consumed 1,063,155 tokens, 30.2% more than split runs (816,689). Of 69 tracker calls, 44 committed structurally valid patches and 25 were rejected. Four stages spent all six calls on rejected patches, leaving no work/chat opportunity. Validation errors were absent from the next tracker input, so repeated attempts could receive no corrective information. These are completed model calls with rejected state operations, not provider failures.

Executed tools include four researcher-selected initialization tool calls per arm across the two late-result repeats; actor-executed totals are 194, 241 and 149. The full evaluation used 596 executed tool calls, of which 584 were actor-selected. Summed model-call wall time is serial inference telemetry, not end-to-end or time-to-correct-help latency. Reviewer/author/audit reasoning costs are not included in this local experimental model accounting.

All six workshop outputs omit the explicitly requested actual price. Both tracked workshop runs exhausted the final stage on invalid updates of a withdrawn ID; however, unified and split runs also missed the price, so the tracker loop is not established as the sole cause of that omission. Four stages across two workshop and two multiple-owner tracked trajectories had no actor opportunity. Both multiple-owner trajectories still delivered correct final help. Structural validity, semantic state quality and answer quality must therefore remain separate.

The tracked room repeat 2 supplies another boundary failure: its work role's step 8 privately identified Shaft as the correct cheaper option, but did not save this conclusion to shared notes; chat at step 9 continued with Gauge. The final tracker state retains the instruction to recheck the cheapest room, yet this does not force a correct final choice. This is a trace-level handoff diagnosis, not a separately controlled causal ablation.

The secondary model review records unnecessary provenance-only state updates on no-change dialogue. Those are redundant updates, not automatically false changes in effective user intent. Stage-by-stage state accuracy, unchanged-request diagnostics and intermediate cards are retained in additional-metrics.json. This nonblind single-session review is weaker evidence than the independently scored final endpoint.

## Important failed coverage of the intended test

All six late-result trajectories actually seeded an inherited desktop read, then cancelled it before its scheduled 6550 ms arrival. Unified/split cancelled at 6100 ms and tracked at 6300 ms. **Zero obsolete desktop results actually arrived late.** Final Mobile answers can be scored, and cancellation is an observed behavior, but resistance to consuming late obsolete evidence remains untested. A future case must allow an already unavoidable result to arrive while preserving a realistic cancellation contract.

Early workshop gold includes price before the raw conversation explicitly asks for it at stage three. The secondary review retains uncertainty and raw-request/frozen-gold sensitivity for affected early cards; frozen fixtures were not retrospectively edited. The final-stage request explicitly requires price, so the primary omission finding does not rely on that ambiguity. The key-collection reference answer also adds refund timing beyond the user's deposit-amount question; reviewers prioritize the user's request and do not require that extra detail.

## Review and engineering evidence

Two separate model review sessions received shuffled packet IDs, raw dialogue, documents, final gold and active cards, with arm/repetition mapping withheld. They agreed on all five semantic fields and intent coverage for 47/48 packets; a fresh condition-blind model session adjudicated the remaining factual-error distinction. Initial batch-1 omission instructions were ambiguous; both reviewers independently changed only packet-001 omission true→false to apply the frozen missing-content definition. Initial reviews and clarification records remain available. These are model judgments, not human annotations; shared model bias and inference of roles from answer style remain possible. High agreement does not prove correctness.

All 40 offline state, role-session and runner checks passed. The execution audit reconciled 48 trajectories, 864 model calls, 2,712,832 reported tokens and 40 frozen source files with no audit discrepancies or provider/accounting failures. A separate three-run development case used 54 calls and is excluded from evaluation. Captures cover client messages and returned provider metadata, not raw HTTP traffic or independent inspection of model-server internals.

No offline test is counted as assistance-quality evidence. The separate agent audit is a trace/code consistency review, not an independent external reproduction. Local SQLite safety does not imply semantic correctness, external exactly-once execution, ASR quality, live Lab behavior, long-history compaction or cross-model transfer.

## Decision and next version

Keep the independent tracker as an experimental component. The next version should test explicit work-to-chat handoff and a bounded tracker recovery path with precise validation feedback and raw-conversation fallback. Preserve atomic state checks, current-input cursors and shared budgets. Compare on fresh variants plus exposed regressions before considering LoRA or changing the Lab default. These repairs have not yet been implemented or evaluated.

Keep this frozen v1 evidence. In a later declared comparison, test handoff persistence, validation feedback, bounded retries and stale-state fallback with their full token/call costs; do not relax cancelled-state protections merely to increase patch acceptance. A later oracle-state control can separate failures to track from failures to use correct state. Include fresh held-out variants, no-change negatives and actual late arrivals. The current dataset is authored and exposed, so it cannot serve as an uncontaminated generalization test.

## Supporting records

- [Frozen prospective protocol](PROTOCOL.md) and [fixtures](fixtures/cases.json)
- [Evaluation manifest](evaluation/manifest.json)
- [Primary results](analysis/results.json), [per-run CSV](analysis/rows.csv), [additional metrics](analysis/additional-metrics.json)
- [Execution audit](analysis/EXECUTION-AUDIT.json), [failure aggregation](analysis/TRACKER-FAILURE-AGGREGATE.json); the one-run diagnosis and its linked call traces are in the evidence bundle at `analysis/TRACKER-FAILURE-DIAGNOSIS.md`.
- [Review process](scoring/REVIEW-PROCESS-AUDIT.json), [final labels](scoring/final-scores.json), [adjudication](scoring/adjudication.json)
- [Engineering validation](engineering/validation.json), [40-test output](engineering/offline-tests.txt), [development audit](engineering/DEVELOPMENT-AUDIT.json)
- [Separate final review](analysis/INDEPENDENT-AUDIT.json)

The evidence ZIP preserves all run inputs/responses, tool receipts, snapshots, frozen source, initial reviews and secondary diagnostics. SQLite files are not exported; their actual events/state/receipts are retained in the JSON artifacts. The website export index records original and exported hashes; workspace prefixes are made relative. Build and publication receipts are recorded separately from model-evaluation outcomes.
