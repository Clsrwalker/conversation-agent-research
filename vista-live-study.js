(() => {
  const $ = id => document.getElementById(id);
  const node = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  let data;
  const cases = $('trace-case'), control = $('trace-control'), turns = $('trace-turn');
  function configure() {
    const boundary = cases.value === 'boundary';
    $('compare-label').hidden = boundary;
    turns.replaceChildren();
    const labels = boundary ? ['Accept the refusal', 'Honor explicit exit'] : ['Save an explanation', 'Record two answers', 'Correct the owner’s frequency', 'Explain, recall and exit'];
    labels.forEach((label, i) => { const o = node('option', (i + 1) + ' · ' + label); o.value = i; turns.append(o); });
    render();
  }
  function column(title, record, index, final) {
    const col = node('article', undefined, 'trace-column'); col.append(node('h3', title));
    const t = record.turns[index];
    if (!t || !t.delivered) {
      col.append(node('span', t ? t.status : 'not reached', 'trace-badge'));
      col.append(node('p', t ? 'No reply was delivered.' : 'The earlier evidence failure stopped this trajectory; this turn was not run.', 'trace-reply trace-muted'));
      if (record.errors.length) {
        const err = record.errors[0];
        col.append(node('div', 'Observer rejection: ' + (err.receipt.message || err.receipt.code) + '. The proposal assigned second-turn evidence to u3, which had not been delivered.', 'trace-error'));
      }
    } else {
      col.append(node('span', t.status, 'trace-badge'), node('p', t.message, 'trace-reply'));
    }
    if (t) {
      const details = node('details'); details.append(node('summary', 'Recorded evidence and source turns'));
      const list = node('ul', undefined, 'trace-evidence');
      t.evidence.forEach(e => list.append(node('li', e.id + ': ' + e.status + (e.value !== null ? ' · ' + e.value : '') + (e.source ? ' · source ' + e.source.turn_id : ''))));
      details.append(list); col.append(details);
      if (final) {
        const notes = t.notes;
        const box = node('div', undefined, 'trace-note');
        box.append(node('strong', 'Working notes · not evidence'));
        if (notes && notes.length) notes.forEach(n => box.append(node('p', n.text)));
        else box.append(node('p', notes ? 'Notes cleared / empty.' : 'No note update was produced.'));
        col.append(box);
      }
    }
    return col;
  }
  function render() {
    const boundary = cases.value === 'boundary', i = Number(turns.value || 0);
    const after = boundary ? data.boundary.boundary_final : data.paired.final;
    const before = boundary ? data.boundary.boundary_before : data.paired[control.value];
    const area = $('trace-area'); area.replaceChildren();
    const user = node('div', undefined, 'trace-user'); user.append(node('strong', 'Authored user turn ' + (i + 1)));
    const text = after.turns[i].user;
    if (text.length > 650) {
      user.append(node('p', text.split('\n\n')[0]));
      const details = node('details'); details.append(node('summary', 'Read the complete original, including background'), node('p', text)); user.append(details);
    } else user.append(node('p', text));
    area.append(user);
    const grid = node('div', undefined, 'trace-columns');
    grid.append(column(boundary ? 'Before the refusal reminder' : control.value === 'vista1' ? 'Frozen VISTA v1' : 'Before VISTA additions', before, i, false));
    grid.append(column('Repaired Harness v2', after, i, true)); area.append(grid);
    $('trace-prev').disabled = i === 0; $('trace-next').disabled = i === after.turns.length - 1;
  }
  fetch('data/vista-live-study/aggregate.json').then(r => { if (!r.ok) throw new Error('Trace data unavailable'); return r.json(); }).then(value => {
    data = value; configure(); cases.addEventListener('change', configure); control.addEventListener('change', render); turns.addEventListener('change', render);
    $('trace-prev').addEventListener('click', () => { turns.value = Number(turns.value) - 1; render(); });
    $('trace-next').addEventListener('click', () => { turns.value = Number(turns.value) + 1; render(); });
  }).catch(() => { $('trace-area').append(node('p', 'Interactive data could not load. Use the recorded responses and downloadable evidence below.')); });
})();
