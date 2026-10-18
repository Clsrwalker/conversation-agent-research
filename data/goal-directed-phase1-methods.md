# Goal-directed baseline: method notes

This phase-one baseline study uses 24 English development cases, six task families and two repetitions: 48 assigned trajectories. One local Qwen2.5 14B model uses the adapted native DeepAgent baseline: a single investigator with new business tools, a 24-call limit and a 120,000-token limit per run. A branching scripted user provides multi-turn interaction. No persistent-state, completion-review or asynchronous treatment is introduced.

Preflight diagnostics check the interactive adapter and are recorded separately. They are not included in the 48-run baseline denominator.

## What the denominators mean

- **Task completed:** all required current work, valid business state and truthful delivery, among the 42 runs assigned to complete business work. Failed runs remain in this denominator.
- **Correct ending:** compliance with the intended outcome across all 48 runs. Six runs are assigned to knowledge-only, refusal or pause outcomes.
- **False completion:** a reviewed user-visible claim that exceeds the business state at that time. Pattern matches alone are not findings.
- **Execution errors:** rejected or invalid tool actions plus reviewed execution errors, including wrong persisted answers or ratings. **Rejected tool actions** are the narrower subset, excluding injected service failures.
- **Business persistence recovered:** an encountered injected failure is followed by a correct persisted business state. This does not establish full task success or correct delivery.

A partially correct trainee answer can be accurately recorded and rated partial: that is successful bot execution, not independent trainee mastery. A saved answer does not imply a saved assessment. A quoted telecom offer does not imply an applied change. Receipts and their delivery are checked separately.

**Strict delivery boundary:** `receipt_delivered` requires the literal receipt ID in a user-visible reply. A correctly applied plan or saved assessment with truthful confirmation but no receipt ID fails this strict endpoint. It is not a false completion claim merely because the ID is absent. The user-facing task did not always explicitly require displaying that identifier, so report this as an audit convention and retain the separate business-state result.

## Source material and limits

Six human role-play dialogues were selected: three from Taskmaster automotive appointment conversations and three from MetaLWOz phone-plan conversations. Sources retain IDs, versions and acquisition hashes. ASE C1 and AURACA101 inform the automotive task scope. All questionnaires, tariffs, perturbations and live user replies are newly authored adaptations. No raw source corpus is redistributed.

Automotive rubrics remain provisional; no independent domain-expert review has occurred. Deterministic database checks are supplemented by AI-assisted transcript adjudication, with recorded overrides. Scripted-user matching failures remain in the assigned results.

The conditions mix task variants, and the six authored families are a small development sample. Their rates describe this baseline; they do not identify the causal effect of memory, prompts, verification or scheduling. Repeated trajectories are not independent human tasks. No claim is made about new-vehicle repair, real customers, formal technician competence or user satisfaction.

The detailed JSON downloads retain the frozen cases, per-run checks, evidence-linked findings and source provenance. Earlier studies remain available separately and keep their original scores.
