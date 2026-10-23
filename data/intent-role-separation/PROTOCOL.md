# Intent role separation: controlled executed-tool pilot

Status: prospective protocol and authored fixtures, before evaluation model runs.
User-facing date: 2026-10-23, America/Halifax.

## Question and scope

Does separating conversation, work and explicit intent tracking improve the coverage of current requests in the answer actually displayed to the user? The three roles use the same base model. This study trains no model and uses no LoRA. Its result cannot establish that LoRA experts are useful.

The intervention is evaluated in a small fictional document environment with genuine calls to the existing Replay/WorldStore simulated tools. A request to publish is not success until the tool applies it. Only active, successfully displayed cards count as delivered answers; private model prose, work drafts, pending jobs and tracker state do not count.

This is an exploratory, authored scenario pilot, not a user study, production trial, hidden benchmark, native long-history compaction test or ASR evaluation. The asr_final event name is only the existing finalized-text transport format. No audio or ASR system is run.

## Minimum matrix and fixed budgets

The evaluation set contains eight new scenario families, each with three successive conversation stages. Run all three arms twice per family:

- A, unified: one general actor chooses conversation or work actions on each opportunity.
- B, split: independent chat and work roles on the same base model; no separate tracker. Alternate work and chat opportunities continuously across stages, beginning with work.
- C, tracked: the same chat/work split plus an independent tracker call when newly arrived conversation has not been processed; invalid updates retry within the same budget. Its state is available to the later chat/work calls.

There are 8 families × 3 arms × 2 repetitions = 48 complete trajectories, 144 stage observations. The two repetitions are repeated measurements of the same eight families, not 48 independent cases. Report family-level paired outcomes and repetition disagreement; no claim of population significance is planned.

Each arm has a total upper limit of six model calls per stage, eighteen per trajectory. Tracker calls consume this allowance. With one valid tracker update, C has five remaining actor opportunities: three work/two chat or two work/three chat, according to the continuing alternation. Additional tracker retries reduce these opportunities. B can have three work and three chat opportunities; A has six general opportunities. Failed calls, malformed output and attempted repairs consume the same allowance. Unused calls do not carry into later stages. The complete evaluation maximum is 864 model calls, not a claim about how many will actually be made.

Stages are [0, 6000), [6000, 12000), and [12000, 18000) in diagnostic virtual milliseconds. A model call advances virtual time by 100 ms. A bounded wait may advance to the next pending result within the current stage; it must not expose a future-stage utterance early. At a stage boundary, record the displayed-card snapshot, then advance causally to the next stage. Every arm receives the same maximum number of opportunities, including when earlier answers were already correct.

The independent development case is in dev_cases. It may be used to repair execution, schemas and handoffs before freezing evaluation code and prompts. Its outputs and model calls must be recorded separately and never enter the eight-family results. If an evaluation case exposes a defect after the freeze, preserve that run, report the defect, and version any subsequent repair; do not silently replace a failed first run.

An oracle-state arm is omitted from this first matrix. Without it, a C failure cannot by itself distinguish tracking failure from failure to use correct state. A later oracle diagnosis requires a separately declared experiment.

## Fairness and what the contrasts mean

Use the same model identifier and verified runtime, weights/quantization, sampling settings, maximum context, output-token cap, document corpus, tool implementations, source facts and chronological raw events in every arm. Persist those actual settings in the run records rather than assuming equal model names mean equal runtime. Randomize the evaluation execution order using a recorded seed.

All roles receive the available raw conversation and causal tool results; the tracker must not receive only an already extracted intent list. Future events, undelivered document bodies, scoring annotations, case titles and diagnostic tags are excluded from model input. The same chronology and source-authority rules apply in all arms. Do not replace the original transcript with the tracked state. No role is given longer history simply because its input is assembled separately.

The allowed capabilities at the system level remain retrieval, reading, waiting, cancellation, private notes and card delivery. Role permissions and the number of chat versus work opportunities differ as the intervention requires. The exact role prompts, schemas, role schedule, state-validation behavior and tool permissions must be archived before evaluation.

A and B compare complete orchestration policies, including prompting, tool allocation and handoffs. They do not isolate a pure effect of giving roles different names. C and B compare the net system effect of state tracking under the same call ceiling: the tracker replaces actor opportunities and adds state content. This is not a compute-free ablation of tracking.

Equal call ceilings do not guarantee equal input tokens, output tokens, actual calls, wall time, or tool actions. Report each, by role and arm. The tracker state increases input content and consumes the shared context limit. Do not silently drop more raw history in C, grant free tracker retries, add hidden routing calls, or claim budget parity from call count alone. If any prompt would exceed the fixed context, record and resolve that problem before evaluation rather than truncating different evidence by arm.

A clean answer in this small corpus does not establish general conversational assistance quality. Two repetitions can reveal some disagreement; they do not characterize the full stochastic distribution.

## Fixture interface and causal boundary

fixtures/cases.json has schema_version, cases and dev_cases. Each item contains:

- replay: the existing Replay case fields case_id, corpus_ids, close_at_ms, tool_latency_ms and events.
- corpus: id, title, kind, text and available_at_ms for each fictional source.
- stages: stage_id, at_ms, end_at_ms and event_ids.
- scoring: private stage_gold annotations.
- setup_actions: optional common environment initialization for the late-result case.

Pass only explicitly whitelisted replay and corpus values to WorldStore construction. Session/model-input construction must use only causal observation/history, verified tool receipts and the arm's own state. Never serialize the entire fixture item into a prompt. WorldStore snapshot/export are privileged diagnostic views, not model input.

All gold annotations live under scoring. Every stage_gold contains effective_intents with owner, request, expected_answer, source_ids and evidence_event_ids; it also lists inactive_intents, forbidden_outcomes and any allowed_unresolved exception. These annotations support scoring and are never controller state. An answer can use equivalent wording; literal string matching is not the primary criterion.

The eight evaluation families are:

| Family | Required distinction |
| --- | --- |
| Shuttle replacement | Replace Saturday with Sunday while retaining free and step-free constraints |
| Room withdrawal | Withdraw Wi-Fi and recompute the cheapest eligible answer while retaining capacity and budget |
| Key restoration | Withdraw and then explicitly restore one question while keeping another |
| Practice no change | Preserve the request despite an unrelated place/day mention |
| Unaccepted assistant proposal | Do not promote the assistant's suggestion into an authorized user requirement |
| Combined workshop change | Modify day, withdraw parking, add access and retain budget in one message |
| Multiple request owners | One person's cancellation does not cancel another person's question |
| Late obsolete evidence | An old tool result does not change the version currently requested |

There is one newly authored case per family. None is imported from the previous summary-placement families. These fixtures are visible to the authors and engineers, so they must not be described as a hidden or uncontaminated generalization test. Separate later authoring, family-level holdouts and larger variation are needed for that claim.

## Late-result initialization

The late-result family includes a controlled common pending task. Before the first model call, execute setup_actions through real WorldStore operations: search DESKREF, advance to the search result, then read the returned desktop source ID. The search delay is 50 ms and the read delay is 6500 ms, so that seeded desktop read should arrive around 6550 ms, after the user has switched to Mobile at 6000 ms.

Verify the seeded read was actually pending and subsequently arrived after the revision; record actual times. The fixed setup source ID is usable only after the preceding search has delivered it. Do not inject a fabricated success receipt or add hidden full document text directly to model context.

These setup operations are researcher-selected environment initialization, shared across arms and repetitions. Record them separately from actor-selected actions and costs. They test how actors respond to an inherited pending job; they do not test whether actors would independently choose that job. Actor requests for the mobile source still execute normally and incur the same 6500 ms read latency.

Because evidence may legitimately be pending in stages 1 and 2, early noncompletion for this family is not automatically an intent error. A false completion claim or applying Desktop facts to Mobile remains an error. The main delivery endpoint is the end of stage 3; there is enough virtual time for a mobile read requested during stage 2, and bounded waits must leave later model opportunities to consume the result. If an arm delays starting that read until too late, record that as its execution outcome rather than grant extra calls.

If initialization or bounded-wait behavior cannot meet this causal contract, stop the evaluation preparation and revise/version the fixture before freezing. Do not call a late-result condition tested when no old result actually arrived late.

## Outcomes and scoring

The primary endpoint for each trajectory is complete, correct coverage of all effective intents in the active delivered answer at the end of stage 3, without an incompatible active answer from an earlier state. Score the full active-card set, including stale cards left visible. A correct new card does not erase an incorrect old card unless the old one was updated or withdrawn.

Report separately:

1. Per-intent correct coverage and all-effective-intents success in delivered answers.
2. Omitted active intents, lost unchanged constraints, wrongly withdrawn intents, failure to restore an intent and unauthorized additions.
3. Incorrect completion, including unsupported source facts or stale-version answers.
4. Unnecessary clarification or reconfirmation of settled requests, versus justified requests for missing information.
5. No-change false updates for the explicit negative families.
6. Executed tool actions and outcomes: search/read requests, arrival/consumption, cancellations, display/update/withdraw actions, malformed arguments, unknown tools and tool failures.
7. Model attempts, accepted calls, provider failures, tokens, wall time and per-role resource use.
8. Tracker validity and state accuracy as mechanism diagnostics, not substitutes for delivered-answer outcomes.
9. Repetition disagreement in semantic labels, distinguished from verbatim response differences.

Use the stage 1 and stage 2 delivered-card snapshots as secondary diagnostic endpoints. Record justified evidence-blocked pending work separately from an avoidable omission. Do not require gratuitous re-publication of an unchanged correct active card. A narrow disclaimer that a document is pending cannot satisfy a question that was later answerable at the final deadline.

Unrequested extra true facts are not automatically an intent-scope failure. They become a scope error when presented as an accepted requirement, when they defer or displace requested answers, or when they conflict with an explicit only/leave-out boundary. A brief cancellation acknowledgment or an explanation of why the old answer no longer applies is not reactivation of the canceled task.

Wrong or absent delivered answers remain failures even if the tracker state is perfect. Conversely, a tracker mistake that the acting roles repair should be visible in the diagnostic scores without turning a correct final answer into a failed delivery.

Scoring hides arm and repetition identities from two independent model reviewers where possible, followed by model adjudication of disagreements. These are model judgments, not human evaluations or participant ratings. Preserve actual displayed text, tool outcome evidence and raw conversation needed for judgment. Keep initial independent judgments and record disagreements/adjudication rather than overwrite them. Reviewers may sometimes infer roles from the text; report this limit. Mechanical tool execution and cost statistics come directly from logs and must be reconciled with the displayed-card snapshots.

## Freeze, reporting and decision boundary

Before evaluation, freeze this protocol, cases, model/runtime configuration, role prompts/schemas, runner/session code and scoring rubric with hashes. Keep development trials separate. Record each request, response, role, causal observation, state update, tool receipt, stage snapshot and termination reason. Provider failure and incomplete runs remain visible; do not present planned ceilings as measured completed calls.

Report paired family-level differences, all negative results, uncertainty and the compute tradeoff. No aggregate score may hide an increase in wrong cancellation, false scope changes or incorrect completion. A favorable C result supports further study of explicit tracking in this environment; it does not prove independent LoRA experts, automatic expert routing, long-history mechanisms or production reliability.

After experiments or engineering tests are actually completed, the parent task must update the existing research website with measured results, validation limitations and linked records, following the project publication workflow. This prospective protocol contains no measured result and no publication claim.

