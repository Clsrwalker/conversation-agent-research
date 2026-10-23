# Actor-side source authority: frozen component comparison

23 October 2026 (America/Halifax). Candidate mechanism, not a default promotion.

## Problem and hypothesis

In the 19 October summary-causal replay, an incorrect saved intent summary
produced an out-of-scope shuttle search in all three repetitions of one transport
case despite the full original refusal being visible. Source recovery elsewhere
restored all selected quotations but did not consistently prevent invented goals.
Summary-side attribution guidance also failed to improve the tested attribution
count. Therefore the present candidate places a source-authority instruction in
the actor's system message at action time. It leaves summary generation unchanged.

The hypothesis is fewer observable scope errors when an interpretation conflicts
with participant evidence, without treating a true acceptance or renewed request
as unauthorised. This is a prompt intervention; it does not implement a verified
semantic tracker, prove a cognitive mechanism, or prevent bad actions by code.

## Conditions frozen before inference

24 cases: the 12 previously exposed causal-replay cases (six paired families),
plus 12 newly authored challenge cases (six paired families). New cases share
the study design and are synthetic; they are not natural conversations or an
independent real-world held-out benchmark. Actor inputs exclude evaluator fields.

For each case: ordinary actor with no summary; ordinary actor with a correct
summary; ordinary actor with an incorrect summary; source-authority actor with
a correct summary; source-authority actor with an incorrect summary. Total 120
calls, one greedy call per cell. The no-summary condition is run once, shared
across paired comparisons, never counted twice. Seed 20261023 shuffles call order.

The local Qwen2.5 14B Instruct Q4_K_M digest is recorded in FREEZE.json. Same
weights, Ollama runtime, full original conversation, tool facts, 16 captured
historical harness tools, temperature 0, context 16,384, output cap 1,000, and
reasoning disabled. The candidate only appends SOURCE_AUTHORITY_GUIDANCE to the
system message. It adds no model call or mandatory output format. Actual wire
bytes, responses, stop reason, token counts and wall time are retained.

Requests are single actor decisions. Tools are exposed but never executed.
Private text is not delivered assistance. No choice probes are used. The live
LangGraph integration is checked separately with scripted engineering tests.

## Outcomes and analysis

Two fresh AI reviewers independently judge arm-anonymous outputs against raw
conversation and frozen gold. They cannot see the condition, selected summary,
system guidance, or one another's labels. All 120 outputs are reviewed; exactly
identical complete responses for the same case and stop reason may share one
semantic packet, with every call retained in the private mapping. A third
review resolves disagreements; uncertain semantics stay uncertain. AI agreement
does not establish human validity. Scope, unnecessary reconfirmation or refusal,
factual errors, and action availability are distinct. One relevant next step
need not explicitly cover every agreed subtask. See SCORING.md.

Primary comparison: observable scope error, candidate vs ordinary actor under
the same incorrect summary. Safety comparison: regressions under correct
summary, including genuine acceptance/renewal. Also compare to simply omitting
the summary. Report seen regression and new challenge splits separately, counts
by family, paired fixes/regressions, no-tool replies, and provider failures.
No end-to-end success score, significance claim, or latent-intent score is made.

All input files, runner, prompt, integration sources, protocol and scoring rule
are hashed before the batch. Existing study evidence is hash-protected. No
quality-based retries, case exclusions, prompt tuning or reclassification of
gold after inspecting outputs. Provider errors stop the batch and remain
recorded. Any follow-up is a separately named experiment with its own protocol.

## Limits and decision

The contrast combines explicit guidance and additional context length; no
length-matched placebo separates those effects. The artificial incorrect
summaries are not an estimate of natural summarizer error frequency. One greedy
call per cell cannot estimate decoding variance. No long-history compaction,
retrieval omissions, live ASR, real user, multi-step persistence or delivered
quality benefit is demonstrated. Even a positive component result requires a
subsequent full-workflow comparison before changing the default harness.
