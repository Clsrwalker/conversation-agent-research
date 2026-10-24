# Tracker annotation specification v2

Date: 2026-10-24 (America/Halifax). Status: model-authored annotation convention for a synthetic pilot; not human adjudication, naturally occurring user data, or evidence of reduced omissions.

This specification freezes the target semantics before the 500-example training corpus is finalized. It uses the existing `IntentStore` operation interface. The two earlier ambiguous examples remain unchanged in their original pack; `adjudication.json` records the source hashes, old labels, and complete v2 replacements.

## 1. What the tracker represents

Track an arrived participant's unresolved requests, goals, constraints, and concrete possible needs, with their ownership and current status. An information request is a request, even when it leaves an existing project constraint unchanged. Do not infer task completion from a tool receipt or assistant prose; execution progress is separate from intent.

Use one stable record per independently revisable atomic requirement. A requirement has an owner, a concise meaning-preserving text, and a status. Preserve exact quantities, units, negation, scope, alternatives, and conditions. A conditional requirement such as “if the venue is outside, provide shade” is a settled conditional requirement, not automatically `uncertain`. A vague future possibility whose adoption is unresolved is uncertain. Do not turn preferences into mandatory requirements.

Keep a main task and its independent constraints separately where they can change independently. Do not split a coupled condition into unconditional fragments. Do not duplicate the same requirement merely because it was rephrased. Repeated acknowledgement of an existing record needs no operation.

## 2. Frozen input and output boundary

Model input contains only arrived raw conversation, current fallible intention state, actual tool receipts if present, and an identical frozen system prompt in the base and LoRA arms. Conversation events use authenticated `seq`, `speaker`, `role`, and raw `text`; preserve available runtime metadata. The training input must contain enough evidence to justify its target. Never infer an unseen earlier utterance, later correction, or hidden annotation.

The target is exactly one JSON object:

```json
{"operations": []}
```

Each nonempty operation has `op`, `intent_id`, and nonempty `source_seqs`. Only `add`, `update`, `withdraw`, and `reopen` are allowed. Do not emit explanation, a chat response, work execution, patch identity, version, or processed cursor. Runtime supplies commit bookkeeping. `[]` advances runtime bookkeeping but does not change semantic records.

The existing `IntentRoleSession` does not supply a `previous_error` input. Samples requiring that candidate interface must be quarantined from this pilot's main training/evaluation interface unless a common adapter is actually implemented and verified for both arms. Raw dialogue plus a fallible pre-state can support repair examples without this extra field.

## 3. Owner and uncertainty convention

**OWNER-1 — Evidence before ownership.** Owner is the participant or explicitly identified group whose requirement is being tracked. It is not automatically the person who reports a requirement, the assistant, the person executing work, or every participant. User role by itself does not confer authority to change another participant's requirements.

**OWNER-2 — Explicit reference.** A direct “I need…” belongs to that authenticated speaker. “Only change my budget” changes that speaker's budget. “Owen asked me to record his requirement…” may be attributed to Owen when the transcript explicitly establishes this reported request; record that attribution basis in metadata. A mere suggestion about what Owen might like does not establish Owen's active requirement. Ambiguous pronouns need an uncertain representation, not a guessed name. Clearly named collective requirements may use the exact established group name.

**OWNER-3 — Unresolved ownership.** Reserve the literal owner string `__unresolved__` exclusively as a machine convention meaning “the evidence does not establish an owner.” It is not a participant or a group. Use `status: "uncertain"` for such records and explain the unresolved owner or scope in `text`. Do not invent `team`, attribute to the reporting speaker, or treat the sentinel as permission to execute work. The full uncertainty must be accessible in the record, not only in hidden metadata.

The current schema has one status field and cannot independently represent confidence in requirement adoption, owner, and scope. Therefore an otherwise definite need with an unresolved owner is conservatively represented as `uncertain` in this pilot. Annotation metadata distinguishes which dimensions are unresolved. A future richer schema would require a separately versioned experiment; no runtime schema change is made here.

**UNCERTAIN-1 — Candidate versus no change.** An arrived user expressing a concrete, relevant possible need that is not yet adopted supplies evidence for an `uncertain` candidate. For example, “We may need captions; I don't know who needs them or whether they are required” is a candidate with unresolved owner. It is not empty operations and not an active caption requirement. Mere mention of a topic, an unaccepted assistant suggestion, or quoted third-party content does not by itself create a candidate on the user's behalf.

**UNCERTAIN-2 — Resolution.** Later evidence can `update` an uncertain record to active and resolve its owner/text under the same ID. Explicit rejection uses `withdraw`. Never automatically activate candidates because time passed or an assistant made a plan. Unrelated uncertainty must not downgrade a settled requirement.

The frozen pilot system prompt must explain `__unresolved__` and these distinctions. Both comparison arms receive it. Otherwise a gain could be due to an undocumented format convention rather than training. This is a prompt contract addition, not an `IntentStore` change.

## 4. Operations and preservation

| Operation | Use | Required preservation and restrictions |
| --- | --- | --- |
| `add` | A genuinely new atomic request or candidate absent from the state | New stable ID, owner, text, supporting seqs, active or uncertain status; no duplicate of an existing meaning. |
| `update` | Revise text, owner, or status of an existing non-withdrawn record; repair an erroneous value from raw evidence | Include only changed fields. Omitted fields persist. Do not alter independent constraints, attribution, or strength. |
| `withdraw` | Explicit cancellation, supersession of the whole record, or correction of an unsupported active/candidate record | Keep stable ID and historical record. Cannot target an already withdrawn record. Do not silently delete it or interpret a tool result as cancellation. |
| `reopen` | Explicit restoration of a withdrawn requirement | Use the same ID, keep text/owner/history, optionally set active/uncertain status. Only withdrawn records can be reopened. |
| `[]` | No new, revised, withdrawn, restored, or repairable intent | Keep every semantic record exactly unchanged. It is a real supervised decision, not missing annotation. |

Touch each ID at most once per patch. Apply all independent supported changes in a combined utterance. Every untouched record is a preservation obligation, including withdrawn records and another participant's requirements.

**REOPEN-BOUNDARY.** Current `reopen` cannot also change `text` or `owner`, and a patch cannot reopen and update the same ID. A one-turn “restore this withdrawn item with a changed value” is not fully expressible by this API. Keep these cases in an explicitly unsupported diagnostic pool until a common runtime capability is designed. Do not fabricate a new ID, silently ignore the changed value, or call a two-step label a single-step target. Genuine separate conversational restoration and modification turns can be represented separately. This limitation must be disclosed in corpus coverage.

## 5. Evidence rules

**EVIDENCE-1.** `source_seqs` must be unique integer IDs of arrived events present in the supplied conversation, no greater than its observed cursor. Use a minimal sufficient evidence set. A current standalone instruction often needs one seq; an elliptical “yes, use that one” needs both the proposal and its acceptance. A repair may need the original requirement plus the correction. Canonical training labels sort seqs ascending; evaluation compares evidence semantics and set membership, not arbitrary order.

**EVIDENCE-2.** The existence of a seq is not enough. Annotators must record an exact evidence quote and explain its support for the operation. An assistant proposal can help resolve a reference but cannot independently establish user adoption. Quoted words stay attributed to their source. Document text and execution receipts do not authorize preference changes.

**EVIDENCE-3.** New information may invalidate work results without changing what the user wants. Do not turn a failed search, unavailable product, completed download, or assistant's unsupported assertion into withdrawal or completion of the request.

**EVIDENCE-4.** If supplied history is insufficient to choose a unique target, repair the sample by adding the genuinely needed earlier context, encode the uncertainty that is supported, or quarantine it. Do not label a guessed history as truth. Do not use future conversation while authoring an earlier decision.

## 6. Real no-change examples and hard negatives

No-change examples include thanks, acknowledgement, rephrasing an existing requirement with no semantic difference, an assistant-only unaccepted proposal, explicitly disclaimed quotations, and irrelevant side discussion with no requested action. They must be checked for hidden secondary requests.

**NEGATIVE-1 — Rejection versus a new boundary.** Merely declining one unaccepted proposal can be `[]`. A user who also states a continuing prohibition or scope restriction supplies a new requirement when it is not already represented. For example, “I have not chosen your music suggestion” may be no change, whereas “This job is captions only; do not add background music” adds that persistent scope boundary. If the prohibition already exists, reaffirming it is no change. Do not label every negative sentence either as a new constraint or as empty operations without checking its meaning and the current state.

“What are the drawbacks of mobile apps?” does **not** automatically change a desktop requirement. However, if it is a new unanswered question, it **does** add an information request. “The platform did not change” is not sufficient to label the whole turn `[]`. A user accepting a prior proposal is a change even if the latest utterance is only “yes, do that.”

Use close contrasts to test intent reasoning: accepted versus merely mentioned proposals; own versus another person's budget; a requirement versus an optional preference; a settled conditional requirement versus unresolved adoption; explicit cancellation versus a temporary execution failure. Siblings belong to one split family.

## 7. Erroneous pre-state and repair

Raw evidence can override the advisory pre-state. Include naturally plausible omitted constraints, digit/unit mistakes, mistaken owners, stale active requirements after cancellation, and mistaken withdrawal. Mark the corruption type only in annotation metadata, never in model-visible IDs or input fields. Repair only errors supported by supplied raw evidence; preserve unrelated correct state.

Repair examples must distinguish a user changing their mind from the tracker correcting its own earlier mistake. An existing erroneous value is updated under its current ID. An omitted still-valid requirement is added. An unsupported active record can be withdrawn, with evidence and explanation in the annotation. A mistakenly withdrawn requirement can be reopened when original evidence and lack of a supported withdrawal establish the repair; retain the erroneous history for audit. The API limitations above still apply.

Record whether each setup patch is faithful or intentionally fallible and why. Replay is an engineering check, not a semantic oracle: a wrong prior state can be perfectly valid JSON and pass `IntentStore` validation.

## 8. Annotation record separate from training text

Keep these fields outside the SFT prompt/completion:

- Neutral example ID, source-family ID, language, synthetic/public/authorized provenance, source hash, authorship, annotation-version and split.
- Complete current input and canonical target; reproducible setup patches and expected committed post-state.
- Every expected atomic requirement with owner, status, strength/condition, exact supporting quotes, and uncertainty dimensions.
- Changed IDs, untouched/preserved IDs, forbidden alterations, and operation rationale.
- Whether the pre-state is deliberately wrong; ambiguity disposition and supported semantic alternatives.
- First author, independent model-review result, review disagreements and revisions, adjudication result, and any actual human review (explicitly false when none occurred).

Use neutral input bookkeeping such as `setup-0`; do not embed `withdraw`, `no-change`, case IDs, split names, label difficulty, family names, gold counts, or expected operation names into patch IDs, tool receipts, directory names serialized into prompts, or other model-visible scaffolding. Semantic stable intent IDs may describe an existing need; new IDs must follow a fixed contract and cannot expose future labels in the input. Keep score hints, target post-state, annotation notes, and future utterances out of input. Validate the exact serialized training text, including state history.

## 9. Diversity and split requirements for the 500-example pilot

500 unique rows do not by themselves establish 500 different situations. Record independently authored scenario families and count them. A change in names, numbers, language, or wording alone is not a new semantic scenario. Cover different task domains, participants, requirement types, dialogue lengths, indirect references, discourse distractions, operation combinations, current-state errors, uncertainty, and no-change decisions. Use ordinary fictional content rather than real private conversation unless explicit authorization and appropriate provenance are available.

The pilot collection target is **100 independent training scenario families × 5 update decisions = 500 training examples**, plus **10 development families × 5 = 50 development examples** and **20 test families × 5 = 100 test examples**. These are targets until manifests prove completion. Report 500 updates and 100 training scenarios separately; five related decisions are not five independent scenarios. All five prefixes of a scenario remain in the same split. Newly authored close contrasts or translations share the originating family and cannot cross these boundaries.

Translations, paraphrases, contrast variants, and every prefix of one scenario stay together in a single split. All 24 original examples and their v2 adjudications are already exposed development material and must not enter a claimed unseen evaluation set. If the requested 500 are training examples, prepare additional family-disjoint development and test examples; do not relabel a 500-total train/dev/test collection as 500 training examples. Inspect normalized duplicate text and near-duplicate templates, then review semantics; hash uniqueness alone is insufficient.

No fixed percentage establishes quality. Publish actual coverage and explicitly missing capabilities. Synthetic source and model review must remain visible, even if every engineering check passes. The label “high quality” means the documented gates passed within this limited source domain; it does not establish real-user distribution coverage.

## 10. Review and release gates

1. Author reads the whole arrived dialogue and writes the full expected state before deriving the minimal operations.
2. Independently review every row against raw evidence, current state, operation semantics, owner, preserved requirements, and negative labels. Use a separate reviewer with no requirement to agree. The reviewer must record per-example disposition, not only aggregate approval.
3. Resolve every correction and ambiguity under this versioned convention. Keep original and revised labels and the reason. Unresolved cases are excluded from training rather than quietly counted as approved.
4. Replay setup and target with the actual store; check full pre-state/post-state equality, preservation of untouched records, arrived evidence, valid transitions, and no duplicated IDs. Confirm runtime sources were unchanged during checking.
5. Audit exact SFT input for label/future/split leakage and verify completion-only labels and token masks when training is implemented. Do not silently truncate needed evidence or target operations to meet context limits.
6. Check scenario-family separation, provenance, duplicates, length coverage, and the actual number of accepted training rows. Save row hashes and the manifest used by the training run.

Model semantic review and model rule adjudication are not human review. A subsequent training result should report these limits explicitly. Passing this release gate authorizes only a bounded synthetic pilot, not claims of deployment quality.

## 11. Evaluation interpretation

Compare adapter disabled versus enabled on the same base checkpoint, tokenizer, quantization/backend, prompt contract, arrived context, decoding and budget. Measure missed active atomic requirements along with wrong values, unsupported additions, wrong owners, lost unchanged constraints, wrong withdrawals, false updates on true negatives, uncertain-to-active promotion, structural rejection, and cost. Score uncertain candidates separately from confirmed active requirements. A system that reduces omissions by adding every mentioned possibility fails the precision/uncertainty checks.

Run one-step correct-pre-state checks and then own-state rollout separately; do not replace a model's failed rollout state with gold. These tests do not by themselves prove that final user-visible answers improve. An end-to-end claim requires the actual chat/work integration, equally configured in both arms, and scoring the delivered answers. Report failures and inconclusive results as such.
