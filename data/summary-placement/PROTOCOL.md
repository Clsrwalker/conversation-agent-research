# Summary placement: a control for the source-authority diagnostic

23 October 2026, America/Halifax. Frozen before new inference.

## Why this control is necessary

The preceding 120-call diagnostic placed a saved-summary user message after a
user message containing the entire original conversation. Code and captured
native requests instead show a compaction summary before retained/new input.
That difference limits transport of the earlier component failures to the
running harness. The present test changes only this message order. It does not
introduce another prompt or alter the default harness.

Hypothesis: the conflicting-summary errors and the apparent guidance effect
depend on whether the saved summary or raw conversation comes later. Swapping
them changes both summary primacy and original-dialogue recency; a difference
cannot distinguish those explanations or establish an internal model mechanism.

## Frozen design

Reuse all 24 previously exposed states from the preceding study, retaining two
12-state provenance strata (earlier regression, previously authored challenge).
All are now exposed. They are 12 paired scenario families, not 216 independent
conversations or a new held-out sample. No new material, gold or guidance is tuned.

For every state cross ordinary/source-authority actor, correct/incorrect summary,
and summary-first/summary-last: eight calls. Add one ordinary no-summary reference
per state. Total 216 new calls, one per cell, shuffled with seed 2026102302. Do not
reuse the prior 120 responses as half the comparison or pool old/new rates.

Requests derive byte-for-byte in JSON value from the preceding frozen prepared
requests. Only swap message indices 1 and 2 for summary-first. System, tool
schemas, message roles, wrappers, content, complete raw turns and provenance,
last Continue instruction, decoding options and every other request value stay
unchanged. No-summary has no empty placeholder or added absence notice. Requests
are materialized and hashed before dispatch. Evaluator labels are never added.

The same local Qwen2.5 14B Instruct Q4_K_M digest and runtime must match the
preceding captured metadata. Temperature 0, context 16384, output cap 1000,
reasoning false, the same 16 historical captured tools, no execution. Actual
wire bytes, response, stop, timings and token counters are retained. About
832,000 total tokens is an extrapolated budget, not a measured result or limit.

Summary-first is a layout control, not native long-history compaction: full
dialogue is still present, summary text is synthetic, wrappers differ from
native and no real compaction boundary is crossed. Both sides remain user-role
transport messages; original attribution remains inside their content.

## Outcomes and review

Primary: paired scope errors under incorrect summaries, summary-first relative
to summary-last, separately by actor and provenance stratum. Also compare the
guidance effect within each order; report its changes descriptively rather than
claiming an interaction significance test. Correct-summary regressions and the
shared ordinary no-summary reference are required controls. Preserve yes/no/
uncertain, dominant error type, pure re-approval sensitivity, factual errors,
omissions, tool request behavior and measured cost. Use the same semantic rubric
as the preceding study; changed metadata/aggregation instructions are in SCORING.

Two fresh independent blinded AI reviewers receive only conversation, gold,
actual assistant message and stop. They do not see order, guidance, summary,
old scores or other reviewers. Deduplicate only within the same case when the
complete API message and stop match after removing tool_calls[].id (random
transport IDs). Remove IDs only when every ID in the message is a nonempty
string and unique within that message; retain abnormal IDs for interface audit.
Preserve all original responses and mappings; do not remove
content, argument fields, function indices, order or formatting. Any disagreement
in the six classification fields requires a third fresh independent review.
Keep first judgments, adjudication and uncertainty. No human-validity claim.

All 216 calls, including repeated original input conditions, are newly executed.
Compare those 120 repeat-input responses with the preceding records only for
response identity ignoring call IDs, as a reproducibility observation. Their
labels are freshly blinded; do not merge ratings or retune to force agreement.

## Integrity and limits

Freeze this protocol, rubric, code, schedule and requests before dispatch.
Hash-protect the previous study, its frozen sources and historical evidence.
Never replace existing preparation/output. Provider failure stops the batch and
is recorded; no quality retry, post-output case exclusion or prompt revision.
One greedy call cannot estimate decoding variability; repeats of exposed states
do not establish generalization. A future study with new material is required.

No tool request executes, and private text is not displayed assistance. Neither
a position effect nor absent errors prove full understanding, delivered help,
ASR benefits or a successful optimized harness. Regardless of result, update the
research website and retain the preceding study with its newly clarified scope.
Next complete-workflow work must use actual input/summary assembly, tool receipts,
arriving changes, shared budgets and delivered-answer scoring.
