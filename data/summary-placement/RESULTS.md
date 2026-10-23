# Summary placement and the next decision

23 October 2026 · America/Halifax · Completed model component diagnostic

In this batch, summary-first had two fewer paired ordinary-actor errors in the previously authored challenges, but more needless re-approval in earlier regressions. Results differ by placement in this run; repeated-input variability means a reproducible placement effect is not established.

## Problem, reference and isolated change

The previous component diagnostic put the synthetic saved summary after the entire raw conversation. A captured native post-compaction request instead put a condensed summary before retained replies and newly arriving events. This batch asks whether the component result depends on that layout. It does not reproduce native compaction or modify the production default.

The comparison swaps only two existing user-role messages. Summary text, raw dialogue, roles, wrappers, system guidance, continuation instruction, tools and decoding are unchanged within each pair. Moving the summary first also moves the dialogue later, so summary primacy and dialogue recency are not separately identified.

All 24 states in 12 paired families were already exposed. We retain the earlier-regression and previously-authored-challenge provenance strata, each with 12 states. Each state receives two actors × two summaries × two positions plus one shared ordinary no-summary reference: 216 new calls, one per cell, shuffled with seed 2026102302. Prior responses are not reused or pooled.

The model is local Qwen2.5 14B Instruct Q4_K_M with the frozen runtime/model metadata, temperature 0, context 16,384, output cap 1,000, reasoning false and 16 captured tool schemas. Every call stops after one decision. No requested tool executes.

## Outcomes by provenance and condition

Every cell below has n=12. Values are definite errors plus separate uncertain counts. The main scope metric includes renewed approval of already settled scope. The sensitivity metric removes only a pure re-approval error; coexisting errors remain. A zero is absence of that observed error, not proof of comprehension, task completion or delivery.

### earlier_regression

| Actor | Summary | Position | Scope | Excluding pure re-approval | Re-approval | Factual | Omission |
|---|---|---|---|---|---|---|---|
| baseline | correct | summary_first | 0/12 + 1 uncertain | 0/12 | 0/12 + 1 uncertain | 0/12 | 0/12 + 1 uncertain |
| baseline | correct | summary_last | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| baseline | incorrect | summary_first | 3/12 | 0/12 | 3/12 | 0/12 | 0/12 |
| baseline | incorrect | summary_last | 2/12 | 0/12 | 2/12 | 0/12 | 0/12 |
| baseline | none | none | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| source_authority | correct | summary_first | 1/12 | 0/12 | 1/12 | 0/12 | 0/12 |
| source_authority | correct | summary_last | 0/12 | 0/12 | 0/12 | 0/12 | 1/12 |
| source_authority | incorrect | summary_first | 4/12 | 0/12 | 4/12 | 0/12 | 0/12 |
| source_authority | incorrect | summary_last | 2/12 | 0/12 + 1 uncertain | 2/12 | 1/12 | 1/12 |

### previously_authored_challenge

| Actor | Summary | Position | Scope | Excluding pure re-approval | Re-approval | Factual | Omission |
|---|---|---|---|---|---|---|---|
| baseline | correct | summary_first | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| baseline | correct | summary_last | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| baseline | incorrect | summary_first | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| baseline | incorrect | summary_last | 2/12 | 2/12 | 0/12 | 0/12 | 1/12 |
| baseline | none | none | 1/12 | 1/12 | 0/12 | 0/12 | 0/12 |
| source_authority | correct | summary_first | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| source_authority | correct | summary_last | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| source_authority | incorrect | summary_first | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| source_authority | incorrect | summary_last | 0/12 + 1 uncertain | 0/12 + 1 uncertain | 0/12 | 0/12 | 0/12 |

An uncertainty bound is the definite count through definite plus uncertain, with the same denominator; it is not a confidence interval. Thus guided incorrect-summary/summary-last challenge scope is 0–1/12; ordinary correct-summary/summary-first regression scope is 0–1/12; guided incorrect-summary/summary-last regression sensitivity is 0–1/12. No significance or general population error rate is estimated.

## Paired changes

Summary first is the candidate for placement comparisons; guidance is the candidate for guidance comparisons. Each row compares the same 12 states. “Uncertain” means at least one endpoint is uncertain; it is not counted as a fix. Full case lists and the separate sensitivity comparisons are in [results.json](analysis/results.json).

| Stratum | Comparison | Reference → candidate | Fixed | Regressed | Both error | Both no error | Uncertain |
|---|---|---|---:|---:|---:|---:|---:|
| earlier_regression | placement | baseline/correct/summary_last → baseline/correct/summary_first | 0 | 0 | 0 | 11 | 1 |
| earlier_regression | placement | source_authority/correct/summary_last → source_authority/correct/summary_first | 0 | 1 | 0 | 11 | 0 |
| earlier_regression | guidance | baseline/correct/summary_first → source_authority/correct/summary_first | 0 | 1 | 0 | 10 | 1 |
| earlier_regression | guidance | baseline/correct/summary_last → source_authority/correct/summary_last | 0 | 0 | 0 | 12 | 0 |
| earlier_regression | placement | baseline/incorrect/summary_last → baseline/incorrect/summary_first | 0 | 1 | 2 | 9 | 0 |
| earlier_regression | placement | source_authority/incorrect/summary_last → source_authority/incorrect/summary_first | 0 | 2 | 2 | 8 | 0 |
| earlier_regression | guidance | baseline/incorrect/summary_first → source_authority/incorrect/summary_first | 0 | 1 | 3 | 8 | 0 |
| earlier_regression | guidance | baseline/incorrect/summary_last → source_authority/incorrect/summary_last | 1 | 1 | 1 | 9 | 0 |
| previously_authored_challenge | placement | baseline/correct/summary_last → baseline/correct/summary_first | 0 | 0 | 0 | 12 | 0 |
| previously_authored_challenge | placement | source_authority/correct/summary_last → source_authority/correct/summary_first | 0 | 0 | 0 | 12 | 0 |
| previously_authored_challenge | guidance | baseline/correct/summary_first → source_authority/correct/summary_first | 0 | 0 | 0 | 12 | 0 |
| previously_authored_challenge | guidance | baseline/correct/summary_last → source_authority/correct/summary_last | 0 | 0 | 0 | 12 | 0 |
| previously_authored_challenge | placement | baseline/incorrect/summary_last → baseline/incorrect/summary_first | 2 | 0 | 0 | 10 | 0 |
| previously_authored_challenge | placement | source_authority/incorrect/summary_last → source_authority/incorrect/summary_first | 0 | 0 | 0 | 11 | 1 |
| previously_authored_challenge | guidance | baseline/incorrect/summary_first → source_authority/incorrect/summary_first | 0 | 0 | 0 | 12 | 0 |
| previously_authored_challenge | guidance | baseline/incorrect/summary_last → source_authority/incorrect/summary_last | 2 | 0 | 0 | 9 | 1 |

The no-summary references remain separate: earlier regressions 0/12; previously authored challenges 1/12. The latter error newly requested COPIER-MEADOW after explicit cancellation. No-summary is not an infallible gold response. The 32 shared-reference comparisons in the machine record reuse the same 24 reference calls; they do not add observations.

## Findings and failure analysis

### Two fewer challenge errors in this run

With incorrect summaries, ordinary-actor scope errors were 2/12 with summary last and 0/12 with summary first. The paired changes concerned requesting the Birch record before its condition was met and rejecting Owen’s current Pine request. The guided actor moved from 0/12 + 1 uncertain to 0/12; no definite error was fixed in that comparison.

### Earlier regressions became more hesitant

With incorrect summaries, earlier-regression scope errors rose from 2/12 to 3/12 for the ordinary actor and from 2/12 to 4/12 with guidance. All seven summary-first errors were pure re-approval questions. Excluding only pure re-approval leaves 0/12 in each summary-first arm; guided summary-last retains one uncertain non-question scope claim.

### Correct summaries did not prevent harm

In earlier regressions with correct summaries, summary-first introduced one definite guided re-approval error and one uncertain ordinary response. Both summary-last groups had 0/12 scope errors. Guided oral-history outputs with summary last also claimed a permission draft was complete without supplying an actual draft: one omission under each summary condition.

### Guidance depends on the comparison

Within challenge summary-last inputs, guidance fixed the two definite ordinary errors but added one uncertain condition interpretation. Within summary-first inputs, both challenge actors had 0/12 errors; in earlier regressions guidance instead added a definite error. This small exposed set does not establish a stable benefit or a statistical interaction.

### Other failures remain separate

The guided incorrect-summary, summary-last panel response invented a ready aluminium estimate: 1/12 factual errors in that group. Three outputs had definite omissions across the batch, plus one uncertain omission. The no-summary challenge reference also requested a cancelled Meadow check (1/12 scope errors), so absence of a summary did not guarantee correct scope.

### Repeated inputs were not identical outputs

Only 63/120 freshly repeated prior inputs produced the same complete response and stop after ignoring tool-call IDs. Temperature zero did not yield identical responses throughout these two batches. The runtime cause was not isolated; prior scores remain frozen, and the new comparison uses only this batch.

### An appropriate scope can still produce an invalid call

One of 243 native requests violated its supplied schema: a guided correct-summary, summary-first oral-history response called ls with card_id and text but no required path. Three requests, including that one, contained undeclared keys; extra keys were not forbidden by their schemas, so they are not three additional schema failures. No request was executed.

### Concrete action and content boundaries

- Ordinary incorrect-summary Birch: summary-last requests CRATE-BIRCH while its receiving-window condition is pending. Summary-first instead requests publication of Alder’s fit result and explicitly keeps Birch on hold.
- Ordinary incorrect-summary Owen: summary-last denies the current Pine request and closes it without a result or pending check. Summary-first explicitly recognizes Owen’s current display need and requests SIGN-PINE-FINISH. Neither request was executed.
- Guided incorrect-summary Owen with summary last contains awkward historical wording followed by an explicit current need and a matching Pine read request. The reviewers rate the final current conclusion as no observed scope error; this does not certify coherent reasoning or obtained evidence.
- Correct-summary guidance with summary first asks again about Bay Hall and Foundry Loft after they were deferred. This is a definite re-approval regression; excluding pure re-approval removes it from the sensitivity outcome.
- Guided panel output with incorrect summary last claims an aluminium estimate is ready although the arrived record says no comparable quote exists, then offers to obtain one later. Adjudication retains definite factual error and uncertain non-question expansion, in addition to a definite settled-scope re-approval question.
- Guided incorrect-summary Pebble with summary last calls 400 g the weight limit and says the recorder would pass at 450 g, although Eva already accepted 450 g. This remains uncertain scope/condition evidence, not a definite rejection or an independently false product measurement.
- Guided oral-history responses with summary last claim an unsent permission draft is complete without an actual draft, under both correct and incorrect summaries. These are omissions, not automatic scope errors. The ordinary correct-summary/summary-first response ambiguously offers to show a supposedly completed draft, retaining uncertain omission and reconfirmation.

## Actions and cost

| Stratum | Actor | Summary | Position | Outputs requesting tools | Native requests | Outputs requesting publication | Private prose only | Median request seconds |
|---|---|---|---|---:|---:|---:|---:|---:|
| earlier_regression | baseline | correct | summary_first | 10 | 13 | 4 | 2 | 2.553 |
| earlier_regression | baseline | correct | summary_last | 10 | 15 | 3 | 2 | 1.514 |
| earlier_regression | baseline | incorrect | summary_first | 8 | 12 | 2 | 4 | 2.310 |
| earlier_regression | baseline | incorrect | summary_last | 9 | 12 | 3 | 3 | 2.177 |
| earlier_regression | baseline | none | none | 8 | 12 | 2 | 4 | 1.918 |
| earlier_regression | source_authority | correct | summary_first | 8 | 12 | 2 | 4 | 2.033 |
| earlier_regression | source_authority | correct | summary_last | 8 | 12 | 2 | 4 | 1.477 |
| earlier_regression | source_authority | incorrect | summary_first | 7 | 11 | 1 | 5 | 2.148 |
| earlier_regression | source_authority | incorrect | summary_last | 7 | 9 | 1 | 5 | 2.385 |
| previously_authored_challenge | baseline | correct | summary_first | 11 | 13 | 5 | 1 | 2.604 |
| previously_authored_challenge | baseline | correct | summary_last | 10 | 14 | 6 | 2 | 1.299 |
| previously_authored_challenge | baseline | incorrect | summary_first | 12 | 14 | 7 | 0 | 2.806 |
| previously_authored_challenge | baseline | incorrect | summary_last | 8 | 11 | 3 | 4 | 1.819 |
| previously_authored_challenge | baseline | none | none | 10 | 17 | 2 | 2 | 1.278 |
| previously_authored_challenge | source_authority | correct | summary_first | 12 | 15 | 6 | 0 | 2.654 |
| previously_authored_challenge | source_authority | correct | summary_last | 10 | 20 | 6 | 2 | 1.646 |
| previously_authored_challenge | source_authority | incorrect | summary_first | 11 | 14 | 5 | 1 | 2.727 |
| previously_authored_challenge | source_authority | incorrect | summary_last | 11 | 17 | 8 | 1 | 2.027 |

All 216 API calls stopped normally, with 0 empty outputs, 0 truncated outputs and 0 provider failures. The batch used 809,590 input plus 25,190 output tokens = 834,780. Summed measured request wall time was 486.85 seconds. The 243 native requests included 68 publish_card requests; none executed. No delivered-success rate is defined.

Challenge ordinary incorrect-summary outputs requesting tools increased from 8/12 to 12/12 with summary first, so that local scope reduction was not achieved through empty responses or universal silence. Conversely, earlier-regression ordinary incorrect-summary tool-request outputs fell from 9/12 to 8/12 while re-approval rose; guided outputs stayed 7/12. This does not establish productive completion or a general action-quality improvement. Wall times include runtime/cache effects and are not end-to-end assistance latency.

The independent interface audit used explicit limited checks for the validation keywords actually present in the 16 supplied schemas; it is not a full JSON Schema implementation or an executed parser test. Of 243 requests across 170 outputs, one ls request in oral_history_permissions--accepted--source_authority--correct--summary_first lacks required path. Its card_id/text and two wait_for_event calls’ job_id/source_id are undeclared fields: 3 calls with 4 extra keys, overlapping the one hard schema failure. The schemas do not forbid additional properties. There were no unknown tool names or observed type/enum violations under these checks. See [interface audit](analysis/interface-audit.json).

## Review, integrity and engineering validation

Two fresh independent AI reviewers scored 180 anonymized packets, deduplicated only within a case when complete output and stop matched after valid transport tool-call IDs were removed. Raw messages, argument order/content and mappings remain available. Each reviewer completed all 180; two packets differed in the six classification fields. A third fresh reviewer scored them before seeing A/B labels, then recorded final rationale. Human review was not performed.

For output-111, final adjudication retains factual_error=yes and sensitivity scope=uncertain; the latter was no in both initial A/B records. For output-171, scope stays uncertain and the specific possible failure type is condition. The original independent scores and initial third review remain unchanged. See [adjudication](scoring/ADJUDICATION.md).

Reviewer A initially left quotes empty on 161 all-no records. The inherited validator requires evidence for every nonempty response, stricter than the prose rubric’s minimum for positive/uncertain errors. The initial validation failed; exact observed-output spans were then added mechanically. All semantic fields and reasons were unchanged, and the initial file is preserved. Both final 180-record files passed the unchanged validator. This was an evidence-completeness repair, not 161 semantic corrections.

Thirteen unique offline contract tests passed after a preflight exposed and repaired a prior-freeze digest overwrite. Initial failures remain available. Independent execution auditing checked all 216 request/response wire records, 120 unchanged original inputs, 96 order-only swaps, 228 frozen inputs and 5,261 protected entries. Separate independent score accounting reconstructs all 18 groups and 64 paired comparisons. These checks do not establish assistance quality.

The preflight first returned 11/13 passed: one real validation-order problem and one Windows separator fixture problem. After the fixture correction, an isolated repeat exposed digest overwrite. The final 13/13 passed after the runner fix; repeated attempts are not additional unique tests. The independent wire audit verified all frozen/protected entries and actual requests. The separate event-contract audit identifies an unintegrated research-component adapter gap, not a demonstrated current Lab failure.

The current workspace cannot fully verify the older source-recovery whole-harness fingerprint: later config/run/agent changes differ from that historical version. Matching two recovery files does not prove end-to-end historical replay. Frozen historical records remain unchanged.

## Decision, limitations and next work

Do not promote placement or guidance as a general intention repair. Proceed to realistic boundary diagnosis and controlled full-workflow evidence.

This is a small exposed synthetic sample, one local model and one greedy call per cell. Greedy outputs differed on 57/120 repeated prior inputs despite identical request JSON; the cause has not been isolated. This is not repeated-seed reliability, new held-out generalization, a human study, ASR evaluation, executed tool safety or full-workflow success. A response rated no scope error may still be incomplete, redundant or factually wrong. Position swaps change two relative positions jointly and do not establish an attention or memory mechanism.

- Keep source-authority guidance optional and leave the default harness unchanged. Do not add a redundant ordering fix to a native path that already places later events after its summary.
- Test actual summary coverage and event delivery on new dialogue structures, with accepted or withdrawn work followed by irrelevant speech, quotation and multiple live participants. Record real boundaries rather than inventing a summary timestamp.
- For a full-harness comparison, execute simulated tools and inject changes before dispatch, during pending work and before publication. Separate obsolete in-flight results from newly requested out-of-scope actions, and score effective delivered cards under matched budgets.
- Investigate repeated-input variability with preserved runtime and request evidence before treating single-cell changes as reproducible effects; do not replace the current runs with favorable retries.

## Supporting records

- [Protocol](PROTOCOL.md), [scoring rules](SCORING.md), [freeze](FREEZE.json) and [preflight](PREFLIGHT.json).
- [Per-call scores and all 64 paired comparisons](analysis/results.json), [CSV](analysis/rows.csv), [reviewed interpretation](analysis/interpretation.json).
- [Execution audit](analysis/execution-audit.json), [independent score audit](analysis/INDEPENDENT-AUDIT.json), [interface audit](analysis/interface-audit.json), [review-process audit](scoring/REVIEW-PROCESS-AUDIT.json).
- [Engineering validation](engineering/validation.json), [request-layout audit](MECHANISM-AUDIT.md), [event-contract audit](EVENT-CONTRACT-AUDIT.md).
- All prepared requests, original request/response wire bytes, original reviews and copied frozen source remain in the local evidence directory. Public exports retain JSON records and source/export hashes, excluding wire binaries and making workspace paths relative.
