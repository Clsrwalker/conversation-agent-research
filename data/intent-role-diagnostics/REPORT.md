# Where the intention-role errors occur

2026-10-23 · America/Halifax · Engineering diagnosis of the existing pilot

The tests locate four gaps: **missing tracker error feedback and bounded recovery; missing explicit work-to-chat handoff; correct private answers that never reach the display; and answer coverage or scope errors that publication guards do not check.** No repair or new model-quality comparison was performed.

We inspected all **48 original trajectories and 864 captured calls**, preserving their original semantic labels. Ten trajectories failed the final complete-and-correct endpoint: unified 4, split 2, tracked 4. In every failed trajectory, all six final-stage inputs contained the latest raw user request and the complete source document. This establishes availability, not model attention or understanding. The original study contains eight authored families with correlated repeats, not 48 independent users. [Trace audit](delivery/delivery-audit.json)

## What was tested

Four tracker scenarios, four handoff scenarios and six direct-tool scenarios used the current session, state store or publication tools. They produced **82 scripted callback invocations: 72 in the tracker scenarios plus 10 in the handoff scenarios; zero real model calls**. The direct-tool scenarios invoked no model. Network connections were blocked during these scripted tests; callback token values are synthetic, not inference costs.

| Component | Scenarios | Checks and result |
| --- | ---: | --- |
| Tracker | 4 | Five trace, safety or control properties passed; two desired recovery properties failed. Diagnostic exit 1. |
| Handoff | 4 | Seven controls or invariants passed; one desired interface property failed. Diagnostic exit 1. |
| Publication boundary | 6 | Six observed-behavior assertions matched the current implementation. These include acceptance of incorrect drafts, so they are not six quality successes. |

The three failed desired properties remain failures. They identify capabilities needed for the proposed architecture; they do not imply the current implementation promised automatic recovery or transport of private prose. Scenario counts, property checks and original-model endpoints have different denominators and must not be merged into one pass rate. [Tracker results](tracker/run-01/diagnosis.json), [handoff results](handoff/results.json), [publication results](delivery/publish-guard-diagnostic.json)

## 1. Rejection works; feedback and recovery do not

Reconstructing 16 tracked trajectories reproduced all 288 pre-call snapshots and **69 tracker proposals: 44 accepted and 25 rejected**, with zero mismatches. The rejection classes were nine updates of withdrawn intentions, three invalid proposed statuses, twelve duplicate targets within one patch, and one reference to an arrived document event instead of conversation. The latter was not future-information leakage. All rejected patches rolled back completely. The 25 attempts occurred in five stages across five trajectories and three families; they are not independent errors. [Exact proposals and first failing operations](tracker/run-01/recorded-errors.json)

The invalid scripted scenario consumed all six final-stage calls as tracker retries, leaving zero work/chat opportunities. Restarting after the third rejection preserved this behavior. Valid-update and explicit-reopen controls each committed once and left five actor calls. Every next retry omitted the previous rejection message; consecutive packets were identical apart from time.

At `experiments/deep_conversation/intent_roles.py:173`, unprocessed conversation selects tracker again. The packet at `:256` excludes prior tracker errors; `:311` only records the exception in the audit log. The global budget at `:246` eventually stops the loop, but there is no tracker retry limit or fallback in this path. Atomic validation at `experiments/deep_conversation/intention_state.py:192`, including guards at `:263`, `:272` and `:297`, behaved correctly. Weakening those guards is not an established remedy.

## 2. The same model does not imply shared role memory

Each role call reconstructs System + Human messages at `experiments/deep_conversation/intent_roles.py:261`. Responses are logged at `:279` and `:314`; tool receipts are retained at `:299`. Ordinary work prose is not inserted into the next role's input. The existing `save_notes` route does preserve a conclusion through `experiments/deep_conversation/agent.py:246` and `experiments/deep_conversation/world.py:229`.

The paired scripted test held the conclusion and raw document constant. Private prose disappeared at the boundary; the same conclusion sent through actual `save_notes` reached chat and was published. The scripted chat deliberately depended on that conclusion, so this proves transport behavior, not that a real chat model could not independently solve the task.

The original `irs-room-withdrawal--tracked--r2` demonstrates the practical gap: work step 8 correctly selected **Shaft, $12, sixteen seats**, but made no tool call. Chat step 9 received empty notes and repeated **Gauge, $18, twelve seats**. Both had the full guide. Later work also repeated Gauge, so handoff is one localized gap, not a proven single cause. [Original trace evidence](handoff/trace-evidence.json)

## 3. Computed content can remain undelivered

In `irs-multiple-request-owners--unified--r2`, all six final private answers correctly included **08:40–08:55**, yet none called `publish_card`. The final cards omitted the arrival window. Repeat 1 published that answer in step 12 and succeeded. This is a delivery omission, rather than missing source information or an inability to produce the fact.

Zero final-stage publications alone is not a failure: both successful unified room runs retained already-correct cards. The check must relate current requests to the actual display, not simply count tool calls. [Full failure/control traces](delivery/delivery-audit.json)

The project already has optional native **AnswerDelivery**, wired in `experiments/deep_conversation/agent_led.py:240–252` and enabled by the relevant preset in `experiments/deep_conversation/config.py:35–36`. This experiment uses `preset='agent-led'` at `experiments/deep_conversation/run_intent_roles.py:42` and a separate `IntentRoleSession` path. It did not exercise that node; these diagnostics do not establish whether enabling or adapting it would fix these cases.

## 4. Successful publication does not establish a complete answer

All six workshop trajectories omitted the explicitly requested **$23** price. Both unified runs also omitted it from their final private prose and made no final-stage publication. Both split runs actually published incomplete drafts. Both tracked runs spent the entire final stage on rejected updates, whose proposed text also omitted the new price requirement. Fixing tracker retries alone therefore cannot be assumed to resolve every price omission.

Two tracked room runs retained the wrong selection after Wi-Fi was removed, even though their tracker text correctly preserved the changed criteria. Another unified run added recording information despite the user's “only” restriction; one workshop run retained withdrawn parking information. These are content or scope failures, not missing delivery receipts.

Six isolated direct-tool checks published a price-omitting draft, a wrong room selection, an unrequested recording fact, and a correct control. Empty text was rejected as `not_published`; an intervening user change was rejected as `new_observations`. `experiments/deep_conversation/agent_led_tools.py:222–261` and `experiments/deep_conversation/world.py:413–454` guard empty text, freshness, card conflicts and duplicate delivery. They do not validate semantic completeness, scope or truth. [Actual receipts and displays](delivery/publish-guard-diagnostic.json)

Similarly, the handoff diagnostic rejected a false proposal when evidence arrived during inference but displayed the same false text once observations were stable. Proposed, accepted and delivered content must be distinguished. Timing protection is not factual review.

## Implications and limits

The next candidate design remains **one model serving three functional roles**, with an independently persisted intention tracker. Proposed work: feed precise rejection feedback into bounded tracker recovery; exchange an explicit work result tied to the current intent version and sources; record “computed” separately from “delivered”; and evaluate answer coverage against current requests. These are proposals, not implemented repairs. Domain experts or LoRA are not required to test these boundaries.

The workshop gold mentions price in earlier stages, while the raw user explicitly requests it only in stage 3. The omission diagnosis above uses that final explicit request and does not convert the earlier gold wording into a user requirement. Original scores were reused, not silently revised. String presence is a trace diagnostic, not a semantic grader. No causal benefit, live-user benefit, ASR benefit or improvement in long conversations has been measured.

All 40 frozen source/input files matched the current files and frozen copies; original scoring and study records remain preserved. Tested source hashes and exact locations are in the [source integrity record](source-integrity.json) and component JSON. See [validation.json](validation.json) and [SUMMARY.json](SUMMARY.json) for separate counts and findings. Reproducible scripts, full logs and component reports are included in [evidence.zip](evidence.zip).
