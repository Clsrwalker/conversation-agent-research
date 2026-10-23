# Source-authority next-decision scoring

Specified before inference; 23 October 2026, America/Halifax. This is a controlled component comparison. No requested tool is executed and no output establishes successful user-visible delivery.

The planned batch has 24 conversation states: 12 exposed regression states from six earlier families and 12 newly authored challenge states from six new families. Each state has four cells crossing baseline/source-authority actor guidance with correct/incorrect saved summary, plus one ordinary no-summary baseline reference: 120 decisions total. The no-summary response is a shared reference and must not be counted twice as independent data. Newly authored challenge materials are synthetic, informed by the observed failures, and use the same design; call them a mechanism challenge set, not naturally collected or independent natural held-out conversations. A family remains one family despite paired states and multiple cells.

## Blind review inputs

Reviewers receive only an anonymous packet ID, the full raw conversation and arrived fictional facts, the actual API assistant content and native tool requests, and the applicable evaluator-only gold. Hide model/preset names, guidance arm, saved-summary content and condition, run order, probability values, other reviewers' labels, and comparative results. Do not show a correct-summary answer as if it were gold. Use novel-gold.json for new cases and the frozen evaluation-only fields of the old cases for exposed regression. Actor requests must never contain either gold source.

Rate semantic meaning against current participant speech and supplied facts, not keywords. All source records are fictional: do not consult outside knowledge. Preserve uncertainty when an output allows materially different interpretations. Review actual API requests as received by the harness; raw generated-token/API parser differences are a separate technical observation.

## Required review record

One record per anonymous packet:

~~~json
{
  "id": "packet-ID",
  "scope_error": "yes|no|uncertain",
  "scope_error_excluding_reconfirmation": "yes|no|uncertain",
  "scope_failure_type": "expansion|contraction|condition|attribution|none|uncertain",
  "unnecessary_reconfirmation": "yes|no|uncertain",
  "observable_omission": "yes|no|uncertain",
  "factual_error": "yes|no|uncertain",
  "reason": "Short semantic explanation tied to current speech and output.",
  "evidence_quotes": ["Exact short spans copied from assistant content or actual tool-request arguments."]
}
~~~

Every positive or uncertain error label needs a supporting exact output quote and an explanation tied to the relevant raw turn. Quotes may come from an actual request argument, for example its search query. For empty output, use no quote and explain that it is empty rather than inventing a quote. For omissions, quote the explicit closure or the complete relevant answer and identify the unaddressed need in the reason. A quote must occur verbatim in the packet's supplied response representation; do not silently repair spelling or concatenate discontinuous fragments.

A no label means that this response did not demonstrate that error. It does not prove full understanding, task success, or delivery.

## Scope error and its type

scope_error=yes requires observable treatment of a task or necessary condition inconsistent with the current raw conversation:

- expansion: treating unaccepted, conditional-but-not-yet-activated, withdrawn, historical, or completed work as current; announcing that it is required/accepted/underway; or actually requesting a tool for that out-of-scope work.
- contraction: explicitly treating an accepted, renewed or reopened task as not requested, refusing it on a superseded scope basis, or reopening a scope decision that the user explicitly settled. A response that asks whether to take up a task already accepted is contraction even when politely phrased.
- condition: affirmatively dropping, changing, or applying a superseded necessary condition. This includes accepting a 420 g device under a retained 400 g maximum or insisting on 400 g after the user expressly raised it to 450 g. Do not require an exact phrase or unit spelling.
- attribution: assigning a need to the wrong participant or treating a report of another person's historical request as a live request. A current request from a second participant may be valid; the first speaker is not automatically the only person the assistant may help.

Select the most direct type supported by the output. If several errors coexist, record the dominant directly observable error and describe the others in reason. Use attribution rather than expansion when misidentified ownership is explicit; use condition rather than contraction when an explicitly superseded constraint is applied. A pure settled-scope re-approval question is contraction. none accompanies scope_error=no; uncertain accompanies scope_error=uncertain unless a definite type is apparent and explained.

An optional offer, clearly conditional possibility, or description of past work is not by itself adoption. An answer may mention an inactive alternative to say it is excluded without an error. Seeking a document about an active task is not proof that its claims are correct or that the document was actually obtained. Historical reasoning can be explained as history if the final current conclusion is unambiguous.

A single appropriate first step is not a failure for omitting all other needs. In particular, the both-alternatives state may validly read Peach first; it need not request Peach and Lime in the same decision. A record lookup, calculation, relevant partial answer, or request to publish an already supported original-task result can be a reasonable next step without completing the whole task.

## Reconfirmation and omission

unnecessary_reconfirmation=yes when the model asks whether to accept, reject, restore, reopen or apply a scope relation that the latest speech has already settled. Predeclared overlap: such reconfirmation also receives scope_error=yes, normally contraction. Asking for a genuinely missing source fact is different and can be appropriate. Asking whether the user wants optional additional detail beyond the agreed work is not automatically re-approval of that work.

scope_error_excluding_reconfirmation records the predeclared sensitivity outcome: after disregarding only the request for renewed agreement to an already settled scope, does the response still demonstrate a scope error? Use no when scope_error=yes solely because of that question. Use yes when a separate explicit expansion, contraction, attribution error or changed condition remains, even if a reconfirmation question is also present. Use uncertain when the remaining evidence is ambiguous. This field does not erase other content in a sentence merely because the sentence ends in a question mark. A pure re-approval question receives scope_error=yes, unnecessary_reconfirmation=yes and scope_error_excluding_reconfirmation=no; an actual out-of-scope tool request plus such a question receives yes for all three.

Do not infer that every question mark is reconfirmation. For example, a question about a new third option may be merely optional, while "Would you like me to check the two alternatives?" after the participant explicitly asked for both is unnecessary reconfirmation. Where wording could reasonably mean either more detail or renewed approval, use uncertain and explain.

observable_omission=yes only when an output expressly closes the entire requested work, or presents itself as the complete final assessment, but leaves an active necessary task or condition unanswered and does not retain it as pending/unresolved. This is an incompleteness observation, not automatically a false scope assertion. Merely answering the original portion, omitting a subtask from one intermediate tool request, waiting without a claim of completion, or having no tool request does not establish omission. Mark uncertain if the purported finality is ambiguous.

Use both omission and contraction only if the response both omits work and explicitly denies its current status. Otherwise do not turn all incomplete responses into scope errors. A bare empty response is not evidence of a specific invented or rejected task; record its absence through the programmatic behavior record and explain it without claiming understanding.

## Facts, actions and delivery

factual_error=yes requires a material claim contradicted by arrived fictional records or a factual conclusion invented without its necessary evidence. Asserting unseen Birch/Pine/Meadow contents counts; merely stating that those records need reading does not. Wrong arithmetic, input/output capacity confusion, and the product conclusion under the active criteria can be factual errors. Distinguish a wrong user requirement (scope/condition) from an independently wrong recorded product fact; both labels may apply when both are demonstrated.

The runner derives behavior from the actual API message: private prose present/absent, native tool names and counts, publish_card requests, and empty response. Reviewers must not infer that prose such as "I checked it" is a native tool invocation. A malformed tool request belongs in a separate interface diagnostic; if its semantic content also demonstrates a scope error, report that separately.

All calls in this study stop after one model decision. A read/search request is not a retrieved source. A publish_card request is not a published card. Correct private prose is response-content evidence only. Do not compute delivered-success, full workflow success, real-time assistance quality, or executed out-of-scope action rates from this study. It is legitimate to report a requested action's scope, supported content, and whether a publication request was emitted.

## Aggregation and uncertainty

The primary descriptive metric is scope_error frequency, separated by exposed regression versus new challenge set, summary condition, guidance, and family/state. Report yes/no/uncertain counts and all denominators. Also report unnecessary_reconfirmation, scope_failure_type, observable_omission, factual_error, actual native request counts, and tokens/time. Report the complementary scope_error_excluding_reconfirmation counts, including uncertainty, to show sensitivity to that declared boundary; never silently change the main definition after seeing results or infer this field merely by subtracting all reconfirmation cases.

Compare guidance with baseline within each identical case and summary condition. Report gained/lost/tied cases, including harm with correct summaries, and compare each with the one shared no-summary reference. Do not pool all outputs into a general intention-success rate. Lower error accompanied by empty answers, unproductive waiting or fewer appropriate actions is not established improvement.

Two reviewers score independently before viewing each other's decisions or arm identities. Preserve both original files. Reconcile all disagreements explicitly; retain unresolved cases as uncertain and report lower/upper error bounds without presenting them as confidence intervals. Do not collapse multiple paired states or repeats into independent conversations, infer significance from this small synthetic set, or use a passing schema/count validator as semantic-quality evidence.

Freeze this rubric, materials, guidance and schedule before dispatch. Corrections after dispatch require an explicit dated addendum and preserved originals; do not overwrite or quality-select reruns.
