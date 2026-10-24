# Intention tracker LoRA: data and evaluation plan

24 October 2026 · America/Halifax · **Prospective protocol, not a trained-model result**

## Research question and scope

Can a dedicated intention-tracker LoRA on a shared base model reduce omitted current requirements without inventing requirements, deleting valid constraints, or reviving withdrawn requests? Does better tracking also reduce omissions in the answer the user actually receives?

The target architecture shares base weights and loads a different trained adapter for each functional role. Phase one trains **only the tracker adapter**. Work and chat use the same unchanged base in both experimental arms. This is a staged test of one specialist, not yet a test of three trained role experts or learned expert routing. The 23 October role experiment used no LoRA and cannot answer this question.

The tracker proposes state operations; the Harness validates and persists them. It does not retrieve documents, produce the task answer, or declare delivery complete. A runtime role selects the adapter deterministically. Adapter identity, exact base revision, tokenizer, prompt, input projection and quantization must be recorded for every call.

## What one training example contains

**Input:** arrived raw conversation with authenticated speaker/role/sequence metadata; current intention state; and, for recovery cases only, the previous rejected proposal and actual validation error. Raw evidence must remain available to correct a mistaken prior state. No future messages, final answer, scoring rubric or expected state may enter the model input.

**Target:** only `{"operations":[...]}` in the existing `IntentStore` contract: `add`, `update`, `withdraw`, `reopen`, or an empty list. Each change cites supporting arrived conversation sequences. Keep existing IDs stable. Empty operations is a semantic no-change decision even though the runtime increments a processed version. Quoted material and an unaccepted assistant suggestion do not become user requests. Ambiguity can be marked uncertain without inventing a settled preference.

**Annotation-only fields:** family ID, language, provenance, supporting text spans, atomic current requirements and owner, changes versus retained requirements, expected post-state, prohibited changes, uncertainty, acceptable alternatives, and whether clarification is needed. These support review/scoring, not training inputs. A new ID can differ in spelling while representing the same new requirement; scoring must map semantics rather than require arbitrary exact IDs. Existing-ID continuity remains a separate check.

Example: current request is “free, desktop, offline”; latest message is “switch to mobile.” The target changes desktop to mobile while retaining free and offline. A paired negative says “my colleague uses mobile” without changing the user's request. Both members belong to the same split group.

The seed pack in `data/` is an illustrative development artifact, including Chinese/English siblings. It is not an unseen benchmark or an approved training corpus. Its state replay checks establish executable annotations, not semantic truth. The recovery field is a **candidate interface**: the current role session logs rejection errors but does not feed them to the next tracker input.

## Data collection and annotation

Start with a planned **800 training / 200 development / 400 held-out update examples**, grouped as 200 / 50 / 100 scenario families with four decisions per family. These are collection targets, not collected counts or a sufficient-data guarantee. Translations, paraphrases, counterfactual siblings and all prefixes of one dialogue stay together. The illustrative pack and previously inspected project cases stay in development/regression only and are excluded from these fresh held-out counts.

Proposed training mixture (800 rows):

| Primary stratum | Rows | What it must teach |
| --- | ---: | --- |
| Explicit additions | 120 | Add every requested item, including a second request late in a turn |
| Local revisions | 160 | Replace one condition and retain unrelated constraints |
| Withdrawal and reopening | 120 | Preserve history and distinguish cancel from explicit reopen |
| Combined changes | 120 | Several independent operations, including cross-owner changes |
| No change / unaccepted suggestion / quoted request | 200 | Avoid false updates and redundant semantic changes |
| Ambiguity and owner attribution | 80 | Preserve uncertainty and assign needs to the right person |

Across these strata, aim for 50% Chinese / 50% English and 20% erroneous-prior-state or rejection-recovery examples; those are overlapping tags, not extra rows. Include delayed revisions, distractors, indirect restrictions, negative wording, explicit acceptance after an earlier proposal, repeated acknowledgments, and changes that make an old plan obsolete. Train a later plan-invalidation interface separately: the current patch schema does not encode a plan dependency graph.

Author intent-first scenarios and supporting source messages; derive candidate patches, then independently check every active requirement and every retained constraint against the raw prefix. A second annotator reviews all held-out labels and difficult training cases; preserve disagreements and acceptable alternatives. Agent-generated examples are labeled as such. Human adjudication is still needed before describing this as human-validated data. Pilot collection should measure disagreement and annotation time before scaling. Never turn a structurally accepted model patch into gold automatically.

Use existing project failures to define error categories and regression tests. They are already exposed. Public dialogue-state datasets can supply additional wording and state-change cases, but their slots must be remapped and reviewed. SGD includes active intent, requested slots and slot values; MultiWOZ includes belief states and documented annotation issues. Neither directly supplies this project's stable-ID, provenance, withdrawal/reopen and delivered-answer contract. Keep imported versions, licenses and split ancestry. No external dataset is downloaded or admitted by this plan. [SGD](https://github.com/google-research-datasets/dstc8-schema-guided-dialogue), [MultiWOZ](https://github.com/budzianowski/multiwoz).

Group splits before generating variants. Deduplicate source dialogues and templates, not just exact strings. Reserve unseen domains and change combinations within the 100 test families; tag language and length slices before the freeze. Do not mine test failures into training and then reuse that test as unseen. Public benchmarks may have been in base-model pretraining, so results there are supplementary.

## Training recipe and feasibility gate

Retain the Qwen2.5-14B-Instruct lineage first. The existing Ollama artifact is GGUF Q4_K_M; the proposed PEFT path loads the matching Hugging Face checkpoint and trains adapter parameters, potentially with 4-bit NF4 base weights. These are distinct representations. Both A and B must use the **same pinned checkpoint, quantization, backend and chat template** at evaluation; do not compare an old Ollama run directly against a new Transformers adapter run and attribute the difference to LoRA. [Qwen model](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct), [PEFT quantization](https://huggingface.co/docs/peft/developer_guides/quantization).

Candidate SFT starting point: rank 16, alpha 32, dropout 0.05, attention and MLP linear layers, learning rate 1e-4, microbatch 1, gradient accumulation 16, two epochs with development checkpoint selection, gradient checkpointing and packing off. Start a feasibility check with short sequences, then target 2,048 tokens; do not silently truncate the latest message, evidence or target. Choose longer-context handling before freezing the evaluation. These are proposed settings, not tuned or memory-tested values.

Use conversational prompt/completion records and compute loss only on the operations completion. Before training, inspect actual token masks and ensure prompt, padding and annotation metadata are excluded while the JSON target and end token are supervised. Assistant-only masking depends on the chat template; do not assume Qwen2.5 has the necessary generation mask. TRL documents completion-only training and this template requirement. [TRL SFT](https://huggingface.co/docs/trl/sft_trainer).

The local machine has a 16 GB RTX 4080 SUPER. No compatible training run has established that the 14B recipe fits. Inspect the exact CUDA/PyTorch/PEFT/TRL environment, pin versions, load the exact base, and run a forward/backward/optimizer/save/reload smoke check with peak memory logging before full training. The project environment and system Python have different packages; package presence is not compatibility. Do not silently switch to a 7B tracker while calling the result the same-base experiment. If necessary, choose a smaller **shared** base for every role and label it a separate experiment, or use more memory.

After the feasibility gate and semantic data review, use nested 200- and 800-row training subsets to assess the learning curve. Train three adapter seeds at 800 rows if feasible. Select checkpoints and the primary adapter only on development data; preserve all seed results. More data (for example 2,000 rows) is a later decision, not the first response to a failed pilot. No training, installation or weight download is performed in this planning task.

## Experiment 1: tracker behavior in isolation

Primary arms: **A: shared base, adapter disabled**; **B: the same base, tracker LoRA enabled**. Give A the identical role prompt, input, schema, decoding, output cap and one-call decision budget. This controls for the tracker interface and prompt. If a stronger few-shot/prompt baseline is tuned, use development data only and freeze it before testing; report its extra prompt tokens.

Run both modes on the same held-out conversations:

1. One-step mode receives an independently annotated correct prior state. It isolates the next update.
2. Rollout mode receives each arm's own previously committed state, starting from the same initial state. It measures omissions and errors accumulating over turns. Rejected proposals preserve state and count as failures; they do not receive gold replacement.

Primary tracker endpoint: omitted active atomic requirements divided by all gold active atomic requirements after each update, macro-averaged within family and then across families. Turns with zero gold active requirements have an undefined omission rate: exclude them from that rate, report their count, and score unsupported active additions separately. A family with no eligible turns is excluded from the omission macro-average and stays in the no-request negative analysis. Report precision as well, so inventing requirements cannot improve the conclusion. Secondary: unintended loss of unchanged constraints, wrong withdrawal/reopen, false updates on true no-change turns, owner/source correctness, uncertainty handling, structural rejection rate, recovery success, latency and tokens. A wrong value is a wrong-state error even when the field is present. Full-state exact correctness is supplementary; exact paraphrase matching is not semantic evaluation.

Freeze a semantic rubric with accepted alternatives and supporting spans. Use two condition-blind reviewers and adjudication for disputed outputs; identify whether reviewers are models or humans. Mechanical schema/source checks cannot replace this scoring. Report per-stratum counts and uncertainty rather than average away a failure slice. The 400 update test is a pilot: sample-size adequacy must be assessed from development variance, before inspecting test results.

## Experiment 2: does the user receive fewer omissions?

Choose **40 of the held-out families before any model output is read**, stratified across the planned changes. Give each family three user stages and two inference repeats per arm: 40 × 2 arms × 2 repeats = 160 planned trajectories. With six shared role calls per stage, the ceiling is 2,880 model calls. This is a budget ceiling, not an executed count; tool costs, input tokens and wall time are reported separately.

Use the same work/chat model, tools, source arrival, prompts, handoff path and total call/token budget in A and B; only the tracker adapter differs. A common bounded recovery path should be implemented and engineering-tested before freezing this experiment: deliver the exact rejection, allow at most one corrective retry, then expose raw conversation with an explicit unconfirmed-state flag so the tracker cannot consume all actor opportunities. This is proposed behavior and must be the same in both arms. Any explicit result-handoff or delivery recovery change must also be common and frozen, or tested separately. Never combine a LoRA-only change in one arm with a repaired Harness in the other.

Primary endpoint: the fraction of final **visible** answers that omit at least one current requested item. Score omissions separately from incorrect choices, invented facts, wrong cancellation, stale content and unnecessary clarification; also report complete-and-correct final answers. Follow user revisions through actual committed cards and receipts. Count unresolved/provider failures in the assigned-run denominator and report causes. Tracker recall alone cannot establish this benefit.

An optional annotated-state diagnostic can feed the correct current state to the same actors to estimate whether downstream behavior remains a bottleneck. It is an oracle intervention, with disclosed call allocation, not a deployable system or a fair cost-matched competitor.

## Decision rule and reporting

Before the test freeze, set practical margins from development results. A proposed advancement criterion is at least 20% relative reduction in tracker omissions with a paired 95% interval excluding no improvement, while the upper bound for increased false updates, unintended deletion and wrong cancellation stays below +2 percentage points. These margins are design choices, not literature guarantees. If the baseline omission rate is zero, relative reduction is undefined; use the absolute difference and call the benefit unestablished.

Use paired family-level resampling, retaining sibling turns and inference repeats together. Report training-seed variability separately; seeds do not multiply the number of independent families. Small safety slices or wide intervals mean **inconclusive**, not safe. The end-to-end conclusion additionally requires lower delivered omission with no material loss of complete-and-correct answers; report its paired interval. A tracker-only improvement is a component result, not proof of better assistance.

Freeze raw data, grouped split, annotations, prompt, input projection, base/tokenizer revisions, adapter/config hashes, recovery/handoff policy, scoring rubric and budgets before test execution. Log proposed patches, errors, post-state, actual adapter loaded, candidate outputs, committed delivery, usage and incomplete runs. Preserve negative findings. Keep the prior no-LoRA study and diagnostic evidence unchanged.

## Current deliverables versus unfinished work

This task supplies a data inventory, illustrative bilingual seed examples, an executable state/data validator, a training recipe and this experimental protocol. The grouped validation record reports actual engineering checks separately. The full training/dev/test corpus, independent human labels, compatible training environment, trained adapter, rollout evaluator and end-to-end LoRA integration are **not complete**. No reduction in omission has been measured. The first concrete next milestone is reviewed data plus an adapter train/save/reload feasibility check, followed by the isolated tracker comparison.
