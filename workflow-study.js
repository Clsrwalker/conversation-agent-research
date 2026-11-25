'use strict';
(() => {
  const data = window.WORKFLOW_STUDY;
  const target = document.getElementById('case-content');
  if (!data || !Array.isArray(data.evidence?.cases)) {
    if (target) target.textContent = 'The case data could not be loaded. The study results above remain available.';
    return;
  }
  const cases = data.evidence.cases;
  const rows = data.rows.rows;
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const labels = {
    required_answers_recorded: 'Required answers not fully recorded',
    assessment_saved: 'No completed assessment save',
    assessment_snapshot_current: 'No current saved snapshot',
    rating_revision_current: 'No current saved rating revision',
    current_receipt_id_in_final_confirmation: 'No current receipt in final confirmation',
    source_turn_exists_precedes_record_and_identifies_question: 'Invalid answer-source reference',
    correction_propagated_to_current_record_and_save: 'Correction not carried through to a current save',
    save_failure_recovered: 'Required save recovery not completed',
    specific_intervention_delivered: 'Required scenario event not reached',
    one_retry_limit_respected: 'Save-retry limit exceeded'
  };
  const proposals = {
    W04__A__r1: 'Possible harness check: grade the evidence-bound answer against an explicit rubric. An additional model judge can still be wrong; test its accuracy and extra cost.',
    W03__C__r1: 'Possible harness check: bind the assistance flag to the cited answer and earlier relevant teaching events. Detecting relevant teaching still requires a semantic judgment.',
    W06__C__r2: 'Possible harness check: reject non-answer sources and keep the user quotation separate from model suggestions. Valid source IDs alone cannot prove paraphrase fidelity.',
    W04__B__r1: 'Possible harness check: retain the deferred explanation as pending until its content is actually delivered. Saving an assessment should not clear that obligation.',
    W03__C__r2: 'Possible harness check: detect repeated confirmation without progress and allow a partial answer to be recorded. A forced stop alone is not a successful repair.'
  };
  function eventText(event) {
    if (event.text_excerpt !== undefined) return event.text_excerpt;
    const a = event.arguments;
    if (a?.question_id && a.answer !== undefined) return `${event.tool}: ${a.question_id.toUpperCase()}\nAnswer: ${a.answer}\nSource: ${a.source_turn_id ?? 'not recorded'} · Assisted: ${a.assisted ?? 'not recorded'}`;
    if (a?.ratings) return `${event.tool}\n${a.ratings.map(x => `${x.question_id.toUpperCase()}: ${x.rating} — ${x.reason ?? ''}`).join('\n')}\n${a.summary ?? ''}`.trim();
    if (event.receipt) return `Saved assessment receipt: ${event.receipt.id}\n${(event.receipt.ratings ?? []).map(x => `${x.question_id.toUpperCase()}: ${x.rating}`).join('\n')}`;
    if (event.tool) return `${event.tool}\n${JSON.stringify(a ?? event, null, 2)}`;
    return JSON.stringify(event, null, 2);
  }
  function showCase(runId, updateHash = false) {
    const item = cases.find(x => x.run_id === runId) ?? cases[0];
    target.replaceChildren();
    for (const button of document.querySelectorAll('[data-case]')) button.setAttribute('aria-pressed', String(button.dataset.case === item.run_id));
    target.append(create('p', 'wf-case-meta', `RECORDED E1 v4 CASE · ${item.run_id.replaceAll('__', ' / ')} · existing model-assisted review`));
    target.append(create('h4', 'wf-case-title', item.title));
    const columns = create('div', 'wf-case-analysis');
    const narrative = create('div');
    narrative.append(create('h4', '', 'What happened'), create('p', '', item.summary), create('h4', '', 'What should have happened'), create('p', '', item.expected_behavior), create('h4', '', 'What the evidence supports'), create('p', '', item.attribution));
    const snippets = create('div', 'wf-snippets');
    snippets.append(create('h4', '', 'Evidence from the run'));
    for (const event of item.evidence) {
      const figure = create('figure', 'wf-snippet');
      const kind = event.speaker ? (event.speaker === 'user' ? 'Learner' : 'Assistant') : (event.tool ?? event.kind.replaceAll('_', ' '));
      figure.append(create('figcaption', '', `Event ${event.seq} · ${kind}${event.excerpt_is_complete_message === false ? ' · excerpt' : ''}`));
      figure.append(create('blockquote', '', eventText(event)));
      snippets.append(figure);
    }
    columns.append(narrative, snippets); target.append(columns);
    target.append(create('p', 'wf-case-verdict', `${proposals[item.run_id]} Proposed, not tested in these runs.`));
    const caveats = create('details', 'wf-details');
    caveats.append(create('summary', '', 'Case-specific limits and attribution'));
    const list = create('ul'); for (const text of item.limits) list.append(create('li', '', text));
    caveats.append(list); target.append(caveats);
    const full = create('details', 'wf-details');
    full.append(create('summary', '', `Full visible conversation · ${item.visible_conversation.length} messages`));
    full.append(create('p', '', 'Complete user and assistant messages from this recorded run, in event order. Tool actions are shown separately below. Wording is preserved; review explanations above are separate.'));
    const turns = create('div', 'wf-transcript');
    for (const turn of item.visible_conversation) {
      const article = create('article', `wf-turn ${turn.role}`);
      article.append(create('div', 'wf-turn-label', `${turn.role === 'user' ? 'Learner' : 'Assistant'} · event ${turn.seq} · ${turn.turn_id}`), create('p', '', turn.text));
      turns.append(article);
    }
    full.append(turns); target.append(full);
    const actions = create('details', 'wf-details');
    actions.append(create('summary', '', `Selected action and receipt evidence · ${item.relevant_action_events.length} events`));
    for (const event of item.relevant_action_events) {
      const article = create('article', 'wf-turn tool');
      article.append(create('div', 'wf-turn-label', `Event ${event.seq} · ${event.tool ?? event.kind.replaceAll('_', ' ')}`), create('pre', '', JSON.stringify(event, null, 2)));
      actions.append(article);
    }
    target.append(actions);
    if (updateHash) history.replaceState(null, '', `#case-${item.run_id}`);
  }
  for (const button of document.querySelectorAll('[data-case]')) button.addEventListener('click', () => showCase(button.dataset.case, true));
  function renderRows() {
    const filter = document.getElementById('run-filter').value;
    const selected = rows.filter(r => filter === 'all' || (filter === 'completed' && r.expected_terminal === 'completed') || (filter === 'paused' && r.expected_terminal !== 'completed') || (filter === 'semantic_only' && r.mechanical_pass && !r.semantic_pass) || (filter === 'mechanical_only' && !r.mechanical_pass && r.semantic_pass) || (filter === 'both' && !r.mechanical_pass && !r.semantic_pass));
    const body = document.getElementById('run-rows'); body.replaceChildren();
    for (const r of selected) {
      const tr = create('tr'); const cell = create('td');
      if (cases.some(c => c.run_id === r.run_id)) {
        const a = create('a', '', r.run_id.replaceAll('__', ' / ')); a.href = `#case-${r.run_id}`;
        a.addEventListener('click', e => { e.preventDefault(); showCase(r.run_id, true); document.getElementById('case-reader').scrollIntoView({behavior: 'auto'}); }); cell.append(a);
      } else cell.textContent = r.run_id.replaceAll('__', ' / ');
      tr.append(cell, create('td', '', r.expected_terminal === 'completed' ? 'Complete' : 'Pause'), create('td', '', r.real_save === null ? 'Not required' : r.real_save ? 'Yes' : 'No'), create('td', '', r.mechanical_pass ? 'Pass' : 'Fail'), create('td', '', r.semantic_pass ? 'No flagged error' : 'Fail'));
      const failures = create('td'); const ul = create('ul');
      for (const f of r.mechanical_failed_checks) ul.append(create('li', '', labels[f] ?? f.replaceAll('_', ' ')));
      for (const f of r.semantic_failure_labels) ul.append(create('li', '', f));
      failures.append(ul); if (!ul.children.length) failures.textContent = 'None recorded'; tr.append(failures); body.append(tr);
    }
    document.getElementById('run-count').textContent = `${selected.length} of 36 recorded runs shown.`;
  }
  document.getElementById('run-filter').addEventListener('change', renderRows);
  const hashCase = location.hash.startsWith('#case-') ? location.hash.slice(6) : '';
  showCase(hashCase || 'W04__A__r1'); renderRows();
  document.getElementById('evidence-provenance').textContent = `This page is bound to a sanitized evidence snapshot (${data.evidence_sha256.slice(0, 12)}…) and all 36 scored rows (${data.rows_sha256.slice(0, 12)}…). Source records and detailed checks are retained; hidden inputs, model reasoning and local file paths are excluded from this reader.`;
})();
