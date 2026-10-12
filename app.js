'use strict';

const record = window.RESEARCH_DATA;
const titles = {
  overview: 'Harness overview', baseline: 'Baseline v1', harness: 'Case explorer', methods: 'Studies & tests',
  'experiment-01': 'Tool feedback & recovery',
  'experiment-02': 'Less investigation, no more useful help',
  'experiment-03': 'Conversation state from ASR'
};
const shortNames = ['Native reference', 'Agent-led', 'Baseline v1'];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let selectedMetric = 'help';

function showPage({initial = false} = {}) {
  const requested = location.hash.slice(1);
  if (requested === 'main') return;
  const id = Object.hasOwn(titles, requested) ? requested : 'overview';
  document.body.dataset.page = id;
  document.querySelectorAll('.page').forEach(page => { page.hidden = page.id !== id; });
  document.querySelectorAll('[data-page]').forEach(link => {
    const primary = ['baseline','experiment-01','experiment-02','experiment-03'].includes(id) ? 'methods' : id;
    if (link.dataset.page === primary) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = `${titles[id]} · Conversation Agent Research`;
  if (!initial) {
    const main = document.getElementById('main');
    main.focus({preventScroll: true});
    main.scrollIntoView({block: 'start', behavior: 'instant'});
  }
}

function drawChart() {
  const config = {
    help: {key: 'useful_help', max: 5, ticks: [0,1,2,3,4,5], label: 'Successful required-help scenarios', value: row => row.useful_help.success, format: n => `${n} / 5`, tick: n => n, note: 'Required-help scenarios only. Appropriate silence is reported separately: all three configurations passed the one silence scenario. Higher is better; five cases are too few for a general performance estimate.'},
    errors: {max: 6, ticks: [0,1,2,3,4,5,6], label: 'Scenarios with a material error', value: row => row.material_error_scenarios, format: n => `${n} / 6`, tick: n => n, note: 'A material error is a false or unsupported claim that could change a decision. Lower is better. The route case accounts for the error in each agent-led configuration.'},
    calls: {max: 80, ticks: [0,20,40,60,80], label: 'Total model calls across six scenarios', value: row => row.model_calls, format: n => String(n), tick: n => n, note: 'Totals across six runs per configuration, including unsuccessful runs. Call counts alone do not establish better quality or faster help.'},
    tokens: {max: 400000, ticks: [0,100000,200000,300000,400000], label: 'Total model tokens across six scenarios', value: row => row.tokens, format: n => n.toLocaleString('en-US'), tick: n => n === 0 ? '0' : `${n/1000}k`, note: 'Input + output tokens across six runs. The recovery prompt fired zero times, so the lower total in Baseline v1 cannot be attributed to recovery feedback.'}
  }[selectedMetric];
  const colors = ['--native', '--agent', '--current'];
  const compact = window.matchMedia('(max-width: 600px)').matches;
  const plot = {left: compact ? 88 : 146, width: compact ? 160 : 565, row: 52, top: 37};
  const labels = compact ? ['Native', 'Agent-led', 'Baseline v1'] : shortNames;
  const grid = config.ticks.map(n => {
    const x = plot.left + n / config.max * plot.width;
    return `<line x1="${x}" y1="24" x2="${x}" y2="194" stroke="var(--line)"/><text x="${x}" y="217" text-anchor="middle" fill="var(--muted)" font-size="11">${config.tick(n)}</text>`;
  }).join('');
  const bars = record.metrics.map((row, i) => {
    const value = config.value(row), y = plot.top + i * plot.row;
    const width = value / config.max * plot.width;
    return `<text x="${plot.left-10}" y="${y+21}" text-anchor="end" fill="var(--ink)" font-size="${compact?11:12}">${labels[i]}</text><rect x="${plot.left}" y="${y}" width="${width}" height="33" rx="4" fill="var(${colors[i]})"/><text x="${plot.left+width+8}" y="${y+21}" fill="var(--ink)" font-size="${compact?11:12}" font-weight="600">${config.format(value)}</text>`;
  }).join('');
  document.getElementById('comparison-chart').innerHTML = `<svg viewBox="0 0 ${compact?320:820} 246" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">${config.label}</title><desc id="chart-desc">${record.metrics.map((row,i) => `${shortNames[i]}: ${config.format(config.value(row))}`).join('; ')}. One run per configuration in each of six development scenarios.</desc>${grid}${bars}<text x="${compact?0:plot.left}" y="241" fill="var(--muted)" font-size="10">${config.label}</text></svg>`;
  document.getElementById('chart-explanation').textContent = config.note;
}

function resultsTable() {
  const roles = ['Native reference', 'Recovery disabled', 'Current research baseline'];
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="Results table, scroll horizontally on small screens"><table><caption>18 development runs · same local model and resource limits · one run per case and configuration</caption><thead><tr><th scope="col">Configuration</th><th scope="col">Useful help</th><th scope="col">Silence</th><th scope="col">Material errors</th><th scope="col">Model calls</th><th scope="col">Tokens</th></tr></thead><tbody>${record.metrics.map((row,i) => `<tr${i===2?' class="baseline-row"':''}><th scope="row">${escapeHtml(row.id)}<span class="table-sub">${roles[i]}</span></th><td>${row.useful_help.success} / ${row.useful_help.total}</td><td>${row.appropriate_silence.success} / ${row.appropriate_silence.total}</td><td>${row.material_error_scenarios}</td><td>${row.model_calls}</td><td>${row.tokens.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table></div>`;
}

function showCase(index) {
  const item = record.cases[index];
  const card = item.visible_cards_verbatim[0];
  document.getElementById('case-detail').innerHTML = `
    <div class="card-top"><span class="case-number">RECORDED BASELINE FAILURE</span><span class="badge ${item.material_error?'error':'warning'}">${escapeHtml(item.outcome_label)}</span></div>
    <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.short_input)}</p>
    <span class="quote-label">Actual conversation input · synthetic scenario</span>
    ${item.input_verbatim.map(turn => `<blockquote><strong>${escapeHtml(turn.speaker)}:</strong> ${escapeHtml(turn.text)}</blockquote>`).join('')}
    <span class="quote-label">${card?'Actual agent output · incorrect':'Actual agent output'}</span>
    <div class="output-box">${card?escapeHtml(card.text):'<strong>No card was displayed.</strong> The run ended with <code>budget_exhausted</code>.'}</div>
    <span class="quote-label">Reference conclusion</span><div class="reference-box">${escapeHtml(item.reference_conclusion)}</div>
    <div class="case-stats"><span><strong>${item.model_calls}</strong> model calls</span><span><strong>${item.tool_counts.search||0}</strong> searches</span><span><strong>0</strong> full reads</span><span><strong>${item.tokens.toLocaleString('en-US')}</strong> tokens</span></div>
    <p>${escapeHtml(item.finding)}</p>
    <details class="disclosure"><summary>Read the source documents used for the reference</summary>${item.reference_evidence_verbatim.map(doc => `<div class="evidence-item"><h4>${escapeHtml(doc.title)}</h4><p>${escapeHtml(doc.text)}</p></div>`).join('')}</details>
    <details class="disclosure"><summary>What happened in the native reference?</summary><p>${item.native_reference.visible_cards_verbatim.length?escapeHtml(item.native_reference.visible_cards_verbatim[0].text):'The native reference also exhausted its budget without publishing a card.'}</p><p>${item.native_reference.model_calls} model calls · ${item.native_reference.tokens.toLocaleString('en-US')} tokens. One recorded run, not a general comparison.</p></details>
    <p class="small">Archived Study 01 observation, not a live demonstration. This failure motivated <a href="#experiment-02">Study 02 and its new-scenario comparison</a>.</p>`;
  document.querySelectorAll('[data-case]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.case)===index)));
}

let studyMetric = 'help';
function drawStudyChart() {
  const arms = record.investigation_progress.analysis.arms;
  const ordered = ['agent-led-recovery', 'agent-led-progress'].map(preset => arms.find(row => row.preset === preset));
  const spec = {
    help: {title:'Useful help at the deadline', max:14, value:r=>r.help.primary_successes, format:n=>`${n} / 14`, note:'Higher is better. Each arm has seven help scenarios with two repetitions; both delivered useful help in five runs.'},
    'no-card': {title:'Help runs without an active card', max:14, value:r=>r.help.no_card_help_runs, format:n=>`${n} / 14`, note:'Lower is better. These are help opportunities only; silence controls are excluded. Missing cards increased from six to eight.'},
    tokens: {title:'Total tokens across all 20 runs per arm', max:800000, value:r=>r.total_tokens, format:n=>n.toLocaleString('en-US'), note:'Input + output tokens, including unsuccessful runs and the progress-message cost. The 16.7% reduction did not increase useful help.'}
  }[studyMetric];
  const compact = window.matchMedia('(max-width:600px)').matches;
  const left = compact ? 88 : 118, width = compact ? 145 : 385, canvas = compact ? 330 : 660;
  const labels = ['Baseline', 'With progress'];
  const bars = ordered.map((row,i)=>{
    const value=spec.value(row), y=25+i*63, size=value/spec.max*width;
    return `<text x="${left-10}" y="${y+21}" text-anchor="end" font-size="12" fill="var(--muted)">${labels[i]}</text><rect x="${left}" y="${y}" width="${width}" height="34" rx="3" fill="var(--bg)"/><rect x="${left}" y="${y}" width="${size}" height="34" rx="3" fill="${i?'var(--accent)':'var(--native)'}"/><text x="${left+size+9}" y="${y+21}" font-size="12" font-weight="600" fill="var(--ink)">${spec.format(value)}</text>`;
  }).join('');
  document.getElementById('study-result-chart').innerHTML=`<svg viewBox="0 0 ${canvas} 150" role="img" aria-labelledby="study-chart-title study-chart-description"><title id="study-chart-title">${spec.title}</title><desc id="study-chart-description">${ordered.map((r,i)=>`${labels[i]}: ${spec.format(spec.value(r))}`).join('; ')}.</desc>${bars}<text x="${left}" y="145" font-size="10" fill="var(--muted)">0</text><text x="${left+width}" y="145" text-anchor="end" font-size="10" fill="var(--muted)">${spec.max.toLocaleString('en-US')}</text></svg>`;
  document.getElementById('study-result-note').textContent=spec.note;
}

let savedTheme;
try { savedTheme = localStorage.getItem('conversation-research-theme'); } catch {}
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
const themeButton = document.getElementById('theme-toggle');
function labelTheme() { themeButton.setAttribute('aria-label', `Switch to ${document.documentElement.dataset.theme==='dark'?'light':'dark'} theme`); }
labelTheme();
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  try { localStorage.setItem('conversation-research-theme', dark ? 'dark' : 'light'); } catch {}
  labelTheme();
});
document.querySelectorAll('[data-metric]').forEach(button => button.addEventListener('click', () => {
  selectedMetric = button.dataset.metric;
  document.querySelectorAll('[data-metric]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  drawChart();
}));
document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => showCase(Number(button.dataset.case))));
document.querySelectorAll('[data-results-table]').forEach(node => { node.innerHTML = resultsTable(); });
window.addEventListener('hashchange', () => showPage());
document.querySelectorAll('[data-study-metric]').forEach(button => button.addEventListener('click', () => {
  studyMetric=button.dataset.studyMetric;
  document.querySelectorAll('[data-study-metric]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  drawStudyChart();
}));
window.addEventListener('resize', drawChart);
window.addEventListener('resize', drawStudyChart);
drawStudyChart();
drawChart();
showCase(0);
showPage({initial:true});
