# Review reconciliation

Both independent AI reviewers scored all 96 unique packets, covering 108 actor responses. Their original files remain unchanged. Every quoted span was validated against its packet output. Both agreed on all 96 scope-error judgments, current-scope labels, factual labels, behavior labels and unnecessary-clarification labels. The primary outcome requires no adjudication.

The root researcher reconciled seven packets with secondary disagreements after seeing condition identities. This is open reconciliation, not a third blind review. It does not change the primary counts: none 0/36, correct 0/36, incorrect 3/36 scope errors.

## Optional follow-up questions

Packets: packet-379fb3091dc5, packet-9a9e20077adf, packet-ad48178bdc11, packet-c297793c628a, packet-fbc9e7d7d0ca.

Resolution: `adoption_attribution = not_expressed` (reviewer B). These outputs give an appropriate original-task conclusion and then ask whether to investigate alternatives. For example, “Would you like to proceed with checking other venues or is there anything else you need assistance with?” does not explicitly state how the prior proposal was accepted or rejected. It does not falsely attribute acceptance, but absence of false attribution is not an explicit correct account of adoption. The current-scope and scope-error labels remain unchanged.

## Unsupported time substitution

Packets: packet-8f76fcc37079, packet-5944cd8c0956.

Resolution: `essential_conditions = unclear`, `helpfulness = partial` (reviewer A). The query says “after 21:10 on Friday evening”. The raw dialogue specifies a fixed workshop finish but gives 21:10 as the train departure, not the workshop finish. The query could find relevant service information, but its time threshold is not supported by the source. This does not prove that the assistant deliberately changed the finish time or adopted the wrong task, so `scope_error = false` remains appropriate. No transport result was retrieved or executed in this study.

All other labels retain the agreement of the two reviewers. Rater-specific counts are preserved in analysis/blind-review-summary.json rather than silently replaced with a single apparently unanimous set of secondary scores.

## Separate parser observation

The numerical audit later compared raw generated token strings with the native API message and recorded five parser anomalies. The blind packets use the actual API message, which is what the harness would receive. These anomalies are recorded separately in NATIVE-PARSER-OBSERVATIONS.json. They are not evidence of an intent-summary scope error, and no malformed request was executed here.
