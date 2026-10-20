# October research: methods and evidence

Updated 19 October 2026.

These are completed local experiments on synthetic text. AI review does not replace human user evaluation. Repeated runs do not add independent scenarios. Recognition and final delivered help are different outcomes.

Original report downloads preserve the source language and bytes. Their internal links belong to the full research archive; the links below identify the files included in this website export.

## Missing needs and invented needs

24 short dialogues, 2 models, 2 prompts, 2 repeats; 192 calls.

Coverage reminders reduced missed needs for 9B, but added invented needs. For 14B, misses stayed at zero while invented needs rose from 2 to 8.

Both prompts used the same dialogue, local model settings and free-form output. Each condition has 48 outputs and 56 reference-need appearances: 28 annotated needs, repeated twice. Two blinded AI reviews and a third adjudication covered the outputs. No human gold labels.

Limits: Recognition only; no retrieval, answer delivery or full agent run. 12 synthetic contrast pairs; repeated outputs are not independent samples. Ranges preserve semantic ambiguity, not statistical confidence intervals.

[Original report download](intent-coverage-report.md) · [Selected results](intent-coverage-results.json)

[Additional evidence download](intent-coverage-recognition-counts.json)

## Budget and answer updates

4 meetings, 2 models, 3 harnesses, 2 repeats; 48 run attempts.

Complete help rose from 0 to 4 of 6 runs for 14B, and from 0 to 3 of 6 for 9B. All 16 repair runs received the full dialogue; some updates still failed.

All three harnesses were rerun in the same batch for each unchanged local model. Quality uses six help runs per condition; two silence-control runs are scored separately. Each run shares 24 model calls and a soft limit of 120,000 known tokens. Missing provider usage remains unknown.

Limits: Regression on four previously examined synthetic meetings. Budget scheduling, context selection and editing changed together. The repair remains experimental; it has not replaced the project baseline.

[Original report download](budget-state-repair-report.md) · [Selected results](budget-state-repair-results.json)

[Additional evidence download](budget-state-repair-aster-trace.md)

## Model and harness cross-check

4 then-new meetings, 2 models, 2 harnesses, 2 repeats; 32 run attempts, plus 16 recognition calls.

Answer delivery exposed more correct conclusions, but complete help remained rare: 1 of 6 for 14B and 0 of 6 for 9B. All six 9B delivery help runs ended early on budget.

Scenes and scoring were frozen before this batch; tools searched controlled fictional sources. Two blinded AI reviewers agreed on all 32 primary run labels; secondary disagreements were adjudicated. Complete help is measured at the final visible cards, not in private model replies.

Limits: Three help scenarios and one silence control; repeats do not add independent scenarios. Recognition probes are separate from the running agent. Model family, training, size and tokenizer differ; this is not a parameter-size comparison.

[Original report download](model-harness-factorial-report.md) · [Selected results](model-harness-factorial-results.json)


## Delivery reminders

3 meetings, 2 harnesses, 2 repeats; 12 runs with Qwen2.5 14B.

Explicit delivery feedback left complete help at 0 of 6 in both groups, while model calls rose from 76 to 113.

Feedback told the investigator what was actually visible after private replies or incomplete delivery. Private prose did not earn delivery credit. Both groups used the same local model and meeting fixtures.

Limits: Small development comparison with AI scoring. This batch does not validate recovery after failed card operations.

[Original report download](delivery-recovery-report.md) · [Selected results](delivery-recovery-results.json)


## Reviewing private answers for delivery

3 meetings, 2 harnesses, 2 repeats; 12 runs with Qwen2.5 14B.

A separate delivery decision produced 1 confirmed complete result out of 6, with 1 more uncertain. The baseline had none; errors and repeated updates remained.

The same model reviewed real private answers and chose whether to publish, update, withdraw or show nothing. Six help runs per arm shared the same model, sources and budget. AI reviewers scored only visible assistance.

Limits: One uncertain complete-help result is kept separate from confirmed success. Delivery review adds context and a model decision; it is not simple text forwarding.

[Original report download](answer-delivery-report.md) · [Selected results](answer-delivery-results.json)


## Understanding versus delivery

8 meeting prefixes, 2 models and 2 contexts; 32 recognition calls. Two meetings also had 3 paired continuation branches each.

Saved history reduced diagnostic passes for both models. A correct need summary improved one meeting from 1 to 2 of 3 delivered conclusions; the other stayed at zero.

Recognition compared human-only input with the same human dialogue plus saved assistant and tool history. Continuation branches shared one checkpoint per meeting: unchanged, repeated human words, or a correct current-need summary. The summary contained no factual answers or future dialogue, and inherited the remaining budget.

Limits: Diagnostic context comparison is not a full-harness benchmark. The correct summaries were supplied for diagnosis, not generated by an implemented memory method. Six continuation branches did not achieve complete help; only two independent meetings were tested.

[Original report download](intention-attribution-report.md) · [Selected results](intention-attribution-results.json)


## People, status and cancellation scope

8 prefixes from 3 meetings; 16 recognition calls with Qwen2.5 14B.

People-and-status reminders increased passes from 2 to 5 of 8 prefixes, but still missed needs and misread what was cancelled.

Both prompt groups saw the same human dialogue up to each cut point, with no future speech or earlier predictions. Two blinded AI reviewers checked need coverage, ownership, change scope and unsupported additions.

Limits: Single-call recognition only, without retrieval or cards. The eight prefixes come from three development meetings; two baseline outcomes remain uncertain.

[Original report download](meeting-intent-probe-report.md) · [Selected results](meeting-intent-probe-results.json)


## Meeting baseline failures

3 scripted meetings, 2 repeats each; 6 full baseline runs with Qwen2.5 14B.

None of the six runs retained complete applicable help. Five ended without cards; one retained an outdated general explanation.

Each meeting had three speakers and nine turns, including new questions, revisions and cancellation. All 54 human turns reached model requests. Final visible cards were scored at 120 simulated seconds.

Limits: All three synthetic meetings required help, so this batch cannot estimate unwanted interruption. Text replay and fictional sources, not recorded meetings or real ASR.

[Original report download](meeting-intention-report.md) · [Selected results](meeting-intention-results.json)


## Short intention scenarios

6 short scenarios, 2 repeats each; 12 baseline runs with Qwen2.5 14B.

Required help succeeded in 6 of 8 runs, or 5 under the stricter evidence reading. Both multi-question runs found answers but never published them.

The frozen project baseline ran unchanged against controlled documents for 45 simulated seconds per scenario. Two independent AI reviews and trace adjudication preserved the evidence-boundary disagreement.

Limits: Cancellation and silence controls are separate from required-help success. One evidence-boundary judgement changes 6 of 8 to 5 of 8; this is not a confidence interval. Synthetic short replay; no real ASR, long-term memory or user-benefit claim.

[Original report download](intention-diagnostic-report.md) · [Selected results](intention-diagnostic-results.json)

