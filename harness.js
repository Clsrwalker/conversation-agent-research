'use strict';
(() => {
  const data = window.HARNESS_DASHBOARD;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number.isFinite(n) ? n.toLocaleString('en-US', {maximumFractionDigits: 1}) : 'Not recorded';
  const short = n => n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : fmt(n);
  let selected, tokenMode = 'cumulative', toolFilter = 'all', callIndex = 0;
  if (!$('harness-dashboard')) return;
  if (!data?.runs?.length) { $('harness-dashboard').innerHTML = '<p>Recorded run data could not be loaded. Reload the page.</p>'; return; }
  const toolName = name => ({search:'Search',read_document:'Read document',wait:'Wait for an event',publish_card:'Publish a card',update_card:'Update a card',withdraw_card:'Withdraw a card'}[name] || String(name).replaceAll('_',' '));
  const isError = t => !!(t.error || t.result?.error || t.result?.error_code);
  function sourceNote(id, text) { $(id).textContent = text; }
  const caseRecord = () => window.RESEARCH_DATA?.cases?.find(c => selected.id.includes(c.id));
  function analysis() {
    const c=caseRecord(), s=selected.summary, counts=s.tool_counts||{};
    $('harness-question').textContent=c?.short_input||selected.conversation?.[0]?.text||'Recorded integration check';
    $('harness-outcome').textContent=c?.outcome_label||'Engineering check';
    $('harness-outcome').className=`badge ${c?'error':'neutral'}`;
    $('harness-answer').innerHTML=selected.cards?.length?selected.cards.map(card=>`<blockquote>${esc(card.text)}</blockquote>`).join(''):'<p class="case-no-answer">No help card was published.</p>';
    $('harness-reference-label').textContent=c?'WHAT THE EVIDENCE SAYS':'WHAT THIS RECORD ESTABLISHES';
    $('harness-reference').textContent=c?.reference_conclusion||'The monitor saved model calls, tool returns and checkpoints. This integration check does not include a scored reference answer.';
    $('harness-finding-label').textContent=c?'WHY THIS FAILED':'WHAT THE CHECK SHOWED';
    $('run-conclusion').textContent=c?.finding||selected.conclusion;
    $('harness-trace-summary').innerHTML=[['Searches',counts.search||0],['Full-document requests',counts.read_document||0],['Active help cards',s.active_cards]].map(([label,n])=>`<span><strong>${fmt(n)}</strong> ${esc(label)}</span>`).join('');
    $('harness-evidence-visual').innerHTML=c?.id==='orch-route-checkin-evidence-join'?'<div class="route-proof" aria-label="Shuttle leaves at 17:45 plus a 12 minute journey means 17:57 arrival, two minutes after the 17:55 deadline"><div><strong>17:45</strong><span>Shuttle leaves</span></div><span class="route-join">+ 12 min →</span><div><strong>17:57</strong><span>Actual scheduled arrival</span></div></div><p class="route-verdict">Check-in closes at 17:55 · <strong>2 minutes too late</strong></p>':c?.id==='orch-browser-recording-constraint'?'<div class="recording-proof"><div><strong>Browser + any plan</strong><span>One combined video</span></div><div><strong>Installed desktop recorder</strong><span>Two independent files</span></div></div><p class="route-verdict">The conversation rules out installing the recorder.</p>':'';
    $('harness-reference-documents').innerHTML=c?.reference_evidence_verbatim?.length?c.reference_evidence_verbatim.map(d=>`<article class="case-source"><h5>${esc(d.title)}</h5><p>${esc(d.text)}</p></article>`).join(''):'<p class="small">No scored reference documents are included for this engineering check. The tool trace contains the recorded read attempts and results.</p>';
    $('harness-search-excerpts').innerHTML=c?.first_search_result_verbatim?.length?`<details class="case-disclosure"><summary>Compare the first search excerpts with the full documents</summary>${c.first_search_result_verbatim.map(d=>`<article class="case-source"><h5>${esc(d.title)}</h5><blockquote>${esc(d.excerpt)}</blockquote><p class="small">${d.truncated?'Truncated search excerpt. ':''}${esc(d.read_hint||'')}</p></article>`).join('')}</details>`:'';
    const turns=selected.conversation||[];
    $('harness-conversation').innerHTML=turns.map(t=>`<blockquote><span class="small">${esc(t.speaker||'Speaker')}${Number.isFinite(t.at_ms)?` · ${(t.at_ms/1000).toFixed(2)} s replay time`:''}</span><p>${esc(t.text)}</p></blockquote>`).join('')||'<p class="small">No conversation text included in this export.</p>';
  }
  function metrics() {
    const s = selected.summary;
    const items = [
      ['Model calls', s.model_calls, 'Recorded calls in this run'],
      ['Total tokens', s.total_tokens, `${fmt(s.input_tokens)} input · ${fmt(s.output_tokens)} output`],
      ['Model time', Number.isFinite(s.wall_ms) ? `${(s.wall_ms/1000).toFixed(2)} s` : null, 'Sum of measured model-call wall time'],
      ['Tool errors', s.tool_errors, `${fmt(s.tool_calls)} recorded tool calls`]
    ];
    $('harness-kpis').innerHTML = items.map(([label,value,note],i)=>`<article class="dash-kpi"><span class="metric-label">${label}</span><strong${i===3&&value?' class="error-number"':''}>${typeof value==='string'?esc(value):fmt(value)}</strong><span class="small">${esc(note)}</span></article>`).join('');
    $('run-conclusion').textContent = selected.conclusion;
    $('run-category').textContent = selected.classification;
    $('run-model').textContent = selected.model || 'Model not recorded';
    $('run-output').textContent = `${fmt(s.active_cards)} active cards · ${fmt(s.checkpoints)} saved checkpoints`;
    $('run-date').textContent = selected.recorded_at ? new Date(selected.recorded_at).toLocaleDateString('en-CA',{timeZone:'America/Halifax',year:'numeric',month:'short',day:'numeric'}) : 'Archived run';
  }
  function chart(kind) {
    const calls = selected.model_calls || [], token = kind==='tokens';
    const W=580,H=230,left=58,right=22,top=20,bottom=40,pw=W-left-right,ph=H-top-bottom;
    let total=0, known=true;
    const values = calls.map(c=>{
      const v=token?c.total_tokens:c.wall_ms;
      if(token&&tokenMode==='cumulative'){if(!Number.isFinite(v))known=false;else total+=v;return known?total:null;}
      return Number.isFinite(v)?v:null;
    });
    if(!values.some(Number.isFinite))return '<p class="dash-empty">No measured values were recorded for this chart.</p>';
    const peak=Math.max(1,...values.filter(Number.isFinite)), step=10**Math.floor(Math.log10(peak))/2;
    const max=Math.ceil(peak*1.05/step)*step;
    const x=i=>left+(i+.5)*pw/Math.max(calls.length,1), y=v=>top+ph-v/max*ph;
    const unit=token?'tokens':'ms';
    const grid=[0,.25,.5,.75,1].map(f=>`<line x1="${left}" y1="${y(max*f)}" x2="${W-right}" y2="${y(max*f)}" class="dash-grid"/><text x="${left-9}" y="${y(max*f)+4}" text-anchor="end">${short(Math.round(max*f))}</text>`).join('');
    const axis=calls.map((c,i)=>i===0||i===calls.length-1||calls.length<14||i%3===0?`<text x="${x(i)}" y="${H-19}" text-anchor="middle">${esc(c.ordinal)}</text>`:'').join('');
    const points=values.map((v,i)=>Number.isFinite(v)?`${x(i)},${y(v)}`:null);
    let curve='';
    if(token){let segment=[];for(const p of [...points,null]){if(p)segment.push(p);else if(segment.length){curve+=`<polyline points="${segment.join(' ')}" class="dash-line"/>`;segment=[];}}}
    const bars=values.map((v,i)=>{
      if(!Number.isFinite(v))return '';
      const title=`Call ${calls[i].ordinal}: ${fmt(v)} ${unit}`;
      return `<g class="dash-point${i===callIndex?' selected':''}" data-call="${i}" tabindex="0" role="button" aria-label="${title}; show call details"><title>${title}</title>${token?`<circle cx="${x(i)}" cy="${y(v)}" r="${i===callIndex?6:4}"/><circle cx="${x(i)}" cy="${y(v)}" r="14" class="dash-hit"/>`:`<rect x="${x(i)-Math.max(2,pw/calls.length*.31)}" y="${y(v)}" width="${Math.max(4,pw/calls.length*.62)}" height="${Math.max(1,v/max*ph)}" rx="3"/>`}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${token?(tokenMode==='cumulative'?'Cumulative tokens':'Tokens per call'):'Actual model duration in milliseconds'}"><text x="${left}" y="11">${unit}</text>${grid}${curve}${bars}${axis}<text x="${W-right}" y="${H-2}" text-anchor="end">Model call</text></svg>`;
  }
  function charts() {
    $('harness-token-chart').innerHTML=chart('tokens');
    $('harness-time-chart').innerHTML=chart('time');
    const calls=selected.model_calls||[];
    $('harness-call-select').innerHTML=calls.map((c,i)=>`<option value="${i}"${i===callIndex?' selected':''}>Call ${esc(c.ordinal)}</option>`).join('');
    const c=calls[callIndex];
    $('harness-call-detail').innerHTML=c?`<span><strong>${fmt(c.input_tokens)}</strong> input tokens</span><span><strong>${fmt(c.output_tokens)}</strong> output tokens</span><span><strong>${fmt(c.wall_ms)} ms</strong> measured duration</span><span class="badge neutral">${esc(c.outcome||'Outcome not recorded')}</span>`:'No individual call record available.';
    sourceNote('harness-token-note', tokenMode==='cumulative'?'Running sum of input + output tokens, ordered by recorded model call.':'Input + output tokens for each recorded call.');
  }
  function tools() {
    const rows=selected.tools||[], counts=new Map();
    rows.forEach(t=>{if(!counts.has(t.name))counts.set(t.name,{total:0,errors:0});const n=counts.get(t.name);n.total++;if(isError(t))n.errors++;});
    const max=Math.max(1,...[...counts.values()].map(x=>x.total));
    $('harness-tool-chart').innerHTML=[...counts].map(([name,c])=>`<div class="tool-bar-row"><span>${esc(toolName(name))}</span><div class="tool-bar-track" role="img" aria-label="${esc(toolName(name))}: ${c.total} calls, ${c.errors} error returns"><i class="tool-bar-ok" style="width:${(c.total-c.errors)/max*100}%"></i><i class="tool-bar-error" style="width:${c.errors/max*100}%"></i></div><strong>${c.total}</strong></div>`).join('')||'<p class="dash-empty">No tool calls recorded.</p>';
    const filtered=rows.filter(t=>toolFilter==='all'||(toolFilter==='errors'?isError(t):t.name===toolFilter));
    $('harness-tool-list').innerHTML=filtered.map(t=>{
      const query=t.args?.query, source=t.args?.source_id;
      const detail=t.result?.error || t.result?.message || (query?`Query: ${query}`:source?`Source: ${source}`:t.result?.status?String(t.result.status).replaceAll('_',' '):'Tool return recorded.');
      const status=t.result?.status==='pending'?'Job started':t.result?.status?.replaceAll('_',' ')||'Recorded';
      return `<article class="tool-event${isError(t)?' has-error':''}"><span class="tool-event-time">${Number.isFinite(t.at_ms)?`${(t.at_ms/1000).toFixed(2)} s`:'—'}</span><div><strong>${esc(toolName(t.name))}</strong><p>${esc(detail)}</p>${isError(t)&&(query||source)?`<span class="small">${esc(query||source)}</span>`:''}</div><span class="badge ${isError(t)?'error':'neutral'}">${isError(t)?'Error':esc(status)}</span></article>`;
    }).join('')||'<p class="dash-empty">No tool calls match this filter.</p>';
  }
  function graphSVG(graph,key) {
    const original=graph.nodes||[], edges=graph.edges||[], byId=new Map(original.map(n=>[String(typeof n==='string'?n:n.id),n]));
    const ordered=[],queue=byId.has('__start__')?['__start__']:[],seen=new Set();
    while(queue.length){const id=queue.shift();if(seen.has(id)||!byId.has(id))continue;seen.add(id);ordered.push(id);edges.filter(e=>String(e.source)===id).forEach(e=>queue.push(String(e.target)));}
    original.forEach(n=>{const id=String(typeof n==='string'?n:n.id);if(!seen.has(id))ordered.push(id);});
    const nodes=ordered.filter(id=>id!=='__end__').concat(byId.has('__end__')?['__end__']:[]).map(id=>byId.get(id));
    const h=74, H=nodes.length*h+15, W=Math.max(450,375+edges.length*7);
    const pos=new Map(nodes.map((n,i)=>[String(typeof n==='string'?n:n.id),{x:48,y:14+i*h,index:i}]));
    const lines=edges.filter(e=>pos.has(String(e.source))&&pos.has(String(e.target))).map((e,i)=>{
      const a=pos.get(String(e.source)),b=pos.get(String(e.target));
      const d=b.index===a.index+1?`M188,${a.y+44} V${b.y-3}`:b.index>a.index?`M328,${a.y+22} H${354+i*7} V${b.y+22} H331`:`M48,${a.y+22} H${18+i*2} V${b.y+22} H45`;
      return `<path d="${d}" class="recorded-edge${e.conditional?' conditional':''}" marker-end="url(#arrow-${key})"><title>${esc(e.source)} → ${esc(e.target)}</title></path>`;
    }).join('');
    const boxes=[...pos].map(([id,p])=>{const label=id.replace('__start__','Start').replace('__end__','End');return `<g><title>${esc(id)}</title><rect x="${p.x}" y="${p.y}" width="280" height="44" rx="8" class="recorded-node"/><text x="${p.x+140}" y="${p.y+27}" text-anchor="middle">${esc(label)}</text></g>`;}).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Recorded ${key} execution graph"><defs><marker id="arrow-${key}" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="var(--muted)"/></marker></defs>${lines}${boxes}</svg>`;
  }
  function graphs() {
    const g=selected.graph;
    $('harness-graphs').innerHTML=g?`<div><h4>Conversation event loop</h4>${graphSVG(g.outer,'outer')}</div><div><h4>Inside the investigator</h4>${graphSVG(g.investigator,'investigator')}</div>`:'<div class="dash-empty">This archived run did not save its execution graph.</div>';
  }
  function render() {metrics();analysis();charts();tools();if($('harness-graph-disclosure').open)graphs();}
  const orderedRuns=[...data.runs].sort((a,b)=>{
    const rank=r=>r.id.includes('orch-route-checkin')?0:r.id.includes('orch-browser-recording')?1:2;
    return rank(a)-rank(b);
  });
  $('harness-run-select').innerHTML=orderedRuns.map(r=>`<option value="${esc(r.id)}">${esc(r.id.includes('monitor-')?'Engineering · Monitor integration check':r.title)}</option>`).join('');
  selected=orderedRuns[0];
  window.addEventListener('harness:select-run',event=>{
    const run=data.runs.find(r=>r.id===event.detail?.runId);
    if(!run)return;
    selected=run;callIndex=0;toolFilter='all';
    $('harness-run-select').value=run.id;$('harness-tool-filter').value='all';
    render();switchView($('harness-tab-analysis'));
  });
  $('harness-run-select').addEventListener('change',e=>{selected=data.runs.find(r=>r.id===e.target.value);callIndex=0;toolFilter='all';$('harness-tool-filter').value='all';render();});
  const tabs=[...document.querySelectorAll('[data-harness-view]')];
  function switchView(tab) {tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;$(`harness-panel-${t.dataset.harnessView}`).hidden=!active;});}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>switchView(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')next=tabs[(i+tabs.length-1)%tabs.length];if(e.key==='Home')next=tabs[0];if(e.key==='End')next=tabs[tabs.length-1];if(next){e.preventDefault();switchView(next);next.focus();}});});
  $('harness-graph-disclosure').addEventListener('toggle',e=>{if(e.target.open)graphs();});
  document.querySelectorAll('[data-token-mode]').forEach(b=>b.addEventListener('click',()=>{tokenMode=b.dataset.tokenMode;document.querySelectorAll('[data-token-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));charts();}));
  $('harness-tool-filter').addEventListener('change',e=>{toolFilter=e.target.value;tools();});
  $('harness-call-select').addEventListener('change',e=>{callIndex=Number(e.target.value);charts();});
  for(const id of ['harness-token-chart','harness-time-chart']){
    $(id).addEventListener('click',e=>{const el=e.target.closest('[data-call]');if(el){callIndex=Number(el.dataset.call);charts();}});
    $(id).addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const el=e.target.closest('[data-call]');if(el){e.preventDefault();callIndex=Number(el.dataset.call);charts();$(id).querySelector(`[data-call="${callIndex}"]`)?.focus();}}});
  }
  render();
})();
