'use strict';
(() => {
  const data = window.HARNESS_DASHBOARD;
  const $ = id => document.getElementById(id);
  if (!$('home-dashboard-content')) return;
  if (!data?.runs?.length) {
    $('home-dashboard-content').innerHTML = '<p class="home-chart-note">The recorded snapshot could not be loaded. <a href="data/harness-dashboard.json">Open the saved run data</a>.</p>';
    return;
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const format = value => Number.isFinite(value) ? value.toLocaleString('en-US', {maximumFractionDigits: 1}) : 'Not recorded';
  const compact = value => value >= 1000 ? `${+(value / 1000).toFixed(1)}k` : format(value);
  const date = value => value ? new Date(value).toLocaleDateString('en-GB', {timeZone: 'America/Halifax', day:'2-digit', month:'short', year:'numeric'}) : 'Date not recorded';
  const hasError = tool => Boolean(tool.error || tool.result?.error || tool.result?.error_code);
  const toolLabel = name => ({search:'Search',read_document:'Read document',wait:'Wait for event',publish_card:'Publish card',update_card:'Update card',withdraw_card:'Withdraw card'}[name] || String(name).replaceAll('_', ' '));
  const runs = [...data.runs].sort((a, b) => Number(!a.id.includes('monitor-')) - Number(!b.id.includes('monitor-')));
  let run = runs[0], callIndex = Math.max(0, (run.model_calls || []).length - 1), mode = 'cumulative';
  $('home-run-select').innerHTML = runs.map(item => `<option value="${esc(item.id)}">${esc(item.title)}</option>`).join('');
  $('home-snapshot-date').textContent = `Snapshot exported ${date(data.exported_at)}`;

  function chart() {
    const calls = run.model_calls || [];
    let total = 0, complete = true;
    const values = calls.map(call => {
      if (mode === 'per-call') return Number.isFinite(call.total_tokens) ? call.total_tokens : null;
      if (!Number.isFinite(call.total_tokens)) complete = false;
      else total += call.total_tokens;
      return complete ? total : null;
    });
    if (!values.some(Number.isFinite)) return '<p class="home-chart-empty">No token measurements were recorded.</p>';
    const W = window.matchMedia('(max-width:600px)').matches ? 340 : 560;
    const H = 194, left = 47, right = 18, top = 13, bottom = 30;
    const width = W - left - right, height = H - top - bottom;
    const peak = Math.max(1, ...values.filter(Number.isFinite));
    const step = 10 ** Math.floor(Math.log10(peak)) / 2;
    const ceiling = Math.ceil(peak * 1.06 / step) * step;
    const x = i => left + (i + .5) * width / calls.length;
    const y = value => top + height * (1 - value / ceiling);
    const grid = [0, .5, 1].map(f => `<line x1="${left}" y1="${y(f*ceiling)}" x2="${W-right}" y2="${y(f*ceiling)}" class="home-chart-gridline"/><text x="${left-8}" y="${y(f*ceiling)+4}" text-anchor="end">${compact(f*ceiling)}</text>`).join('');
    const labels = calls.map((call, i) => (i===0 || i===calls.length-1 || calls.length<9 || i%3===0) ? `<text x="${x(i)}" y="${H-10}" text-anchor="middle">${esc(call.ordinal)}</text>` : '').join('');
    let paths = '', segment = [];
    for (const [i, value] of [...values, null].entries()) {
      if (Number.isFinite(value)) segment.push(`${x(i)},${y(value)}`);
      else if (segment.length) { paths += `<polyline points="${segment.join(' ')}" class="home-token-line"/>`; segment = []; }
    }
    const points = values.map((value, i) => Number.isFinite(value) ? `<g class="home-chart-point${i===callIndex?' is-selected':''}" tabindex="0" role="button" aria-label="Call ${esc(calls[i].ordinal)}: ${format(value)} ${mode==='cumulative'?'cumulative ':''}tokens." data-home-call="${i}"><title>Call ${esc(calls[i].ordinal)} · ${format(value)} ${mode==='cumulative'?'cumulative ':''}tokens</title><circle cx="${x(i)}" cy="${y(value)}" r="${i===callIndex?5.5:3.5}"/><circle cx="${x(i)}" cy="${y(value)}" r="13" class="home-chart-hit"/></g>` : '').join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${mode==='cumulative'?'Cumulative tokens':'Tokens per model call'}.">${grid}${paths}${points}${labels}</svg>`;
  }

  function calls() {
    const rows = run.model_calls || [], current = rows[callIndex];
    $('home-token-chart').innerHTML = chart();
    $('home-call-select').innerHTML = rows.map((call, i) => `<option value="${i}"${i===callIndex?' selected':''}>Call ${esc(call.ordinal)}</option>`).join('');
    $('home-call-select').disabled = !rows.length;
    $('home-call-detail').innerHTML = current ? `<span><strong>${format(current.input_tokens)}</strong> input</span><span><strong>${format(current.output_tokens)}</strong> output</span><span><strong>${Number.isFinite(current.wall_ms)?(current.wall_ms/1000).toFixed(2)+' s':'Not recorded'}</strong> call duration</span>` : 'No call record available.';
    $('home-token-note').textContent = `${mode==='cumulative'?'Running total of input + output tokens.':'Input + output tokens per call.'} Horizontal axis: model call.`;
  }

  function tools() {
    const rows = run.tools || [], counts = new Map();
    rows.forEach(tool => {const item = counts.get(tool.name) || {count:0,errors:0};item.count++;if(hasError(tool))item.errors++;counts.set(tool.name,item);});
    const max = Math.max(1, ...[...counts.values()].map(item => item.count));
    $('home-tool-total').textContent = `${format(rows.length)} calls · ${format(rows.filter(hasError).length)} errors`;
    $('home-tool-chart').innerHTML = [...counts].map(([name,item]) => `<div class="home-tool-row"><span>${esc(toolLabel(name))}</span><svg viewBox="0 0 200 18" role="img" aria-label="${esc(toolLabel(name))}: ${item.count} calls, ${item.errors} error returns"><rect x="0" y="1" width="${(item.count-item.errors)/max*200}" height="16" rx="3" class="home-tool-other"/><rect x="${(item.count-item.errors)/max*200}" y="1" width="${item.errors/max*200}" height="16" rx="3" class="home-tool-error"/></svg><strong>${item.count}</strong></div>`).join('') || '<p class="home-chart-empty">No tool receipts recorded.</p>';
  }

  function latency() {
    const target = $('home-latency-content');
    const item = window.HARNESS_LATENCY_DATA?.runs?.find(row => row.id === run.id);
    if (!target) return;
    if (!item) {target.innerHTML = '<p class="home-latency-note">No detailed timing audit is available for this run.</p>';return;}
    const colors = ['#ae8044','#6689ab','#25867d','#99a2ae'];
    const labels = ['Model loading','Reading input','Generating output','Other / unclassified'];
    const keys = ['loading','input_processing','output_generation','unclassified'];
    const parts = keys.map((key,index) => ({ms:item.display_components_ms[key],label:labels[index],color:colors[index]}));
    const seconds = ms => (ms/1000).toFixed(2);
    const percent = ms => (ms/item.model_wall_ms*100).toFixed(1);
    const bar = parts.map(p=>`<span style="width:${percent(p.ms)}%;background:${p.color}" title="${p.label}: ${seconds(p.ms)} s"></span>`).join('');
    const legend = parts.map(p=>`<div style="--latency-color:${p.color}"><dt>${p.label}</dt><dd>${seconds(p.ms)} s<small>${percent(p.ms)}%</small></dd></div>`).join('');
    const coverage = item.timing_coverage;
    let note = `Saved provider timings cover ${coverage.available}/${coverage.total} calls. `;
    if (coverage.available < coverage.total) note += 'Unclassified time includes calls with missing provider metadata. ';
    if (Number.isFinite(item.total_runtime_wall_ms)) note += `The monitored session took ${seconds(item.total_runtime_wall_ms)} s; ${seconds(item.non_model_wall_remainder_ms)} s fell outside the measured model calls. This remainder is not a checkpoint-only measurement. `;
    else note += 'Full session wall time was not recorded for this historical run. ';
    note += `${item.final_card_count} active card${item.final_card_count===1?'':'s'} at completion; these timings do not measure time to correct help.`;
    let detail = '';
    if (item.id === 'monitor-local14-validation-v1') {
      const wait = item.model_time_by_emitted_tool_names.wait_for_event;
      const final = item.calls[item.calls.length-1];
      detail = `<p class="home-latency-note"><strong>Inside these calls:</strong> ${wait.calls} model responses selecting “wait” used ${seconds(wait.wall_ms)} s. The final response used ${seconds(final.wall_ms)} s and made no tool call. No publish call was recorded. These durations are already included above.</p>`;
    }
    target.innerHTML = `<div class="home-latency-bar" aria-hidden="true">${bar}</div><dl class="home-latency-items">${legend}</dl><p class="home-latency-note">${esc(note)}</p>${detail}`;
  }

  function render() {
    const s = run.summary, engineering = run.id.includes('monitor-');
    $('home-run-classification').textContent = engineering ? 'Engineering integration check · assistance unscored' : run.classification;
    $('home-run-date').textContent = `Recorded ${date(run.recorded_at)} · America/Halifax`;
    const metrics = [
      ['Model calls', format(s.model_calls), ''],
      ['Total tokens', format(s.total_tokens), 'Input + output'],
      ['Model duration', Number.isFinite(s.wall_ms)?`${(s.wall_ms/1000).toFixed(2)} s`:'Not recorded', 'Sum of measured call durations'],
      ['Active cards', format(s.active_cards), '']
    ];
    $('home-kpis').innerHTML = metrics.map(([label,value,note]) => `<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
    let outcome = run.conclusion;
    if (engineering) outcome = 'No active help card; two reads returned unavailable-source errors. This run checks instrumentation; assistance quality was not scored.';
    else if (run.id.includes('orch-route-checkin')) outcome = 'Material error: one published card claimed an on-time arrival after one search and no full-document read. The evidence shows arrival two minutes late.';
    else if (run.id.includes('orch-browser-recording')) outcome = 'Required help missing: 15 searches, no full-document read and no published card. The run stopped after exceeding its soft token budget.';
    $('home-run-outcome').textContent = outcome;
    calls();tools();latency();
  }

  $('home-run-select').addEventListener('change', event => {run=runs.find(item=>item.id===event.target.value);callIndex=Math.max(0,(run.model_calls||[]).length-1);render();});
  $('home-call-select').addEventListener('change', event => {callIndex=Number(event.target.value);calls();});
  document.querySelectorAll('[data-home-token-mode]').forEach(button => button.addEventListener('click', () => {mode=button.dataset.homeTokenMode;document.querySelectorAll('[data-home-token-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));calls();}));
  function inspect(event) {const point=event.target.closest('[data-home-call]');if(point){callIndex=Number(point.dataset.homeCall);calls();return true;}return false;}
  $('home-token-chart').addEventListener('click', inspect);
  $('home-token-chart').addEventListener('keydown', event => {if(event.key==='Enter'||event.key===' '){if(inspect(event)){event.preventDefault();$('home-token-chart').querySelector(`[data-home-call="${callIndex}"]`)?.focus();}}});
  $('home-case-link').addEventListener('click', () => {window.dispatchEvent(new CustomEvent('harness:select-run',{detail:{runId:run.id}}));});
  window.addEventListener('resize', calls);
  render();
})();
