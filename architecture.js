'use strict';
(() => {
  const $ = id => document.getElementById(id);
  if (!$('architecture-canvas')) return;
  const source = (...labels) => labels.map(label => ({label}));
  const nodes = {
    'arch-input': {title:'Timestamped replay events',description:'Authored conversation events enter at their scheduled replay times. These can represent transcript updates, but the current replay path is not a live microphone or real-ASR evaluation.',sources:source('world.py:190–205','agent_led.py · observation payload')},
    'arch-scheduler': {title:'Replay clock and pending jobs',description:'The world store schedules conversation events and delayed search/read results. A completed model call advances virtual time; idle observation and wait can advance to the next event or deadline. A tool acknowledgement and the later evidence arrival are separate events.',sources:source('conversation_harness/runner.py:180–204','world.py:392–399')},
    'arch-observe': {title:'Outer observe router',description:'The outer LangGraph alternates observe and investigate. Observe checks the window and known resource usage, delivers arrived events, and advances the replay when idle. A finished investigator turn returns here; it does not end the whole run.',sources:source('agent_led.py:78–125')},
    'arch-boundary': {title:'EventBoundary before inference',description:'Before inference, the boundary checks the deadline and resource limits, verifies completed tool-request/result pairing, and inserts newly arrived observations when boundary input is enabled. It does not insert a human message into an unfinished tool batch.',sources:source('agent.py:124–139','agent.py:188–201')},
    'arch-context': {title:'Native context preparation',description:'Deep Agents prepares its native context and can summarize history under its configured policy. This is a conceptual internal component, not a separate stage in the exported outer graph. Actual summarization model calls are included in accounting when they occur.',sources:source('agent_led.py:57–76','Deep Agents · create_deep_agent middleware')},
    'arch-progress': {title:'Temporary investigation progress',status:'optional',description:'When enabled, a bounded factual progress projection is added to the model request after native context preparation. It is temporary request context, not another saved history turn or a second model call. Its text counts toward the same token budget. This mechanism remains experimental.',sources:source('investigation_progress.py:175–181','agent_led.py:74–78')},
    'arch-model': {title:'Single native investigator',description:'The Deep Agent chooses whether to retrieve evidence, use an optional aid, publish or revise a card, or remain silent. The current profile disables the general-purpose subagent. A final response without tool calls finishes the investigator turn; ordinary prose remains private.',sources:source('agent_led.py:50–53','agent_led.py:57–78')},
    'arch-dispatch': {title:'Native tool dispatcher',description:'The native tool loop executes model-selected calls and pairs them with results. An ordinary completed batch continues toward the next model boundary. The inner loop exits when every executed tool in the batch is return_direct; a mixed batch containing one wait does not necessarily exit.',sources:source('agent.py:124–139','langchain/agents/factory.py:1991–2042','langchain/agents/factory.py:2072–2111')},
    'arch-wait': {title:'Wait or cancel a pending job',description:'Wait first checks whether an unread event already exists; otherwise it advances to a next event. Wait is return_direct, so a wait-only batch yields the investigator turn to observe. Cancel marks an unnecessary job as cancelled while retaining its record. These remain agent choices.',sources:source('agent.py:228–244','world.py · wait/cancel operations')},
    'arch-retrieval': {title:'Asynchronous search and read',description:'Search and a valid document read return an immediate acknowledgement with a pending job. That completes the tool call, not the retrieval. Results arrive later through the world event queue. Invalid source IDs return an error and start no read job.',sources:source('agent.py:212–226','conversation_harness/runner.py:244–282')},
    'arch-aids': {title:'Optional aids and private actions',description:'The agent may calculate, request evidence advice or save private notes. Calculation checks arithmetic on supplied values, not source applicability. Evidence advice is optional, shares the model budget and grants no publication permission. Normal receipts return to the tool loop.',sources:source('agent_led_tools.py:137–218','agent.py · save_notes')},
    'arch-publish': {title:'Guarded card actions',description:'Publish, update and withdraw act on observed card state. Code checks unread events, changed cards, blank publication text and duplicate delivery. A conflict is returned for the agent to reconsider. Unknown citation IDs are omitted and reported; they are not a separate publication veto. There is no mandatory review gate.',sources:source('agent_led_tools.py:220–263','world.py:297–365')},
    'arch-cards': {title:'Active help cards',description:'Only a successful card action changes user-visible assistance. Reusing a card ID updates it; withdrawal removes an observed card when guards permit. A card being present does not establish factual correctness. Ordinary final model prose is never automatically converted into a card.',sources:source('agent_led.py:50–53','agent_led_tools.py:220–263')},
    'arch-recovery': {title:'Optional bounded recovery',status:'optional',description:'After a final response with no new events, the outer observer may offer bounded feedback from recorded retrieval failures if recovery is enabled and the agent did not explicitly wait. This is a conditional side branch, not a fixed review stage or an automatic repair guarantee.',sources:source('agent_led.py:92–107','world.py · recovery_feedback')},
    'arch-checkpoint': {title:'LangGraph checkpoints',description:'The parent graph checkpointer persists the outer state and native investigator execution state. Checkpoints support resume and inspection; they are not semantic milestones or quality approvals. Their database is separate from the world ledger.',sources:source('agent_led.py:77–78','agent_led.py:118–124','run.py:173–189')},
    'arch-world': {title:'World ledger and transactions',description:'The world database stores events, pending jobs, tool receipts, card state and call accounting. Tool IDs support cached receipts and guarded card effects inside the world transaction. World writes and graph checkpoints are separate transactions; there is no global exactly-once guarantee for model execution.',sources:source('world.py:190–399','run.py:114–127')},
    'arch-accounting': {title:'Shared model accounting',description:'Callbacks reserve a call before inference and record its outcome, usage and measured wall time afterward. Investigator, optional evidence advice and actual summary calls share the limits. Token stopping uses known prior usage, so a completed call can overshoot the soft token budget.',sources:source('agent.py:150–182','world.py:346–365','world.py:367–399')},
    'arch-monitor': {title:'Read-only monitor and exports',description:'The monitor reads persisted runs, callback metadata and world events to show execution and resource use. Public charts use allowlisted historical exports. A completed run or successful telemetry check does not establish assistance quality.',sources:source('run.py:173–218','monitor_runtime.py / monitor_store.py','build_harness.py')}
  };
  const views = {
    architecture:{src:'assets/harness-architecture.svg',nodes,defaultNode:'arch-observe'},
    execution:{src:'assets/harness-execution.svg',nodes:{},defaultNode:null}
  };
  let active='architecture', svg=null, zoom=1, fitted=true, request=0;
  const viewport=$('architecture-viewport'), canvas=$('architecture-canvas');
  const cache=new Map();
  function currentView() {
    if(active==='execution')return {...views.execution,...window.HARNESS_EXECUTION_VIEW,nodes:window.HARNESS_EXECUTION_VIEW?.nodes||window.HARNESS_EXECUTION_NODES||{}};
    return views.architecture;
  }
  function inspect(id, focus=false) {
    const node=currentView().nodes[id];
    if(!node)return;
    canvas.querySelectorAll('[data-node]').forEach(item=>{const chosen=item.dataset.node===id;item.classList.toggle('is-selected',chosen);item.setAttribute('aria-pressed',String(chosen));});
    $('architecture-node-title').textContent=node.title;
    $('architecture-node-description').textContent=node.description;
    $('architecture-node-status').textContent=node.status==='optional'?'Optional mechanism':'Implemented component';
    const sources=$('architecture-node-sources');sources.replaceChildren();
    const label=document.createElement('span');label.textContent='Source references';sources.append(label);
    for(const item of node.sources||[]){const value=typeof item==='string'?{label:item}:item;const safeHref=value.href&&!/^\s*(?:javascript|data|vbscript):/i.test(value.href);const el=document.createElement(safeHref?'a':'span');el.textContent=value.label;if(safeHref)el.href=value.href;sources.append(el);}
    if(focus)canvas.querySelector(`[data-node="${CSS.escape(id)}"]`)?.focus();
  }
  function size() {
    if(!svg)return;
    const natural=svg.viewBox.baseVal.width||Number(svg.getAttribute('width'))||1300;
    if(fitted)zoom=Math.min(1,Math.max(0.1,(viewport.clientWidth-2)/natural));
    svg.style.width=`${Math.round(natural*zoom)}px`;
    $('architecture-zoom-level').textContent=`${Math.round(zoom*100)}%`;
  }
  async function show(view) {
    active=view;const spec=currentView(), seq=++request;
    document.querySelectorAll('[data-architecture-view]').forEach(tab=>{const chosen=tab.dataset.architectureView===view;tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1;});
    $('architecture-diagram-panel').setAttribute('aria-labelledby',view==='architecture'?'architecture-tab-components':'architecture-tab-execution');
    $('architecture-open').href=spec.src;
    try {
      let markup=cache.get(spec.src);
      if(!markup){const response=await fetch(spec.src);if(!response.ok)throw new Error('Diagram unavailable');markup=await response.text();cache.set(spec.src,markup);}
      if(seq!==request)return;
      const parsed=new DOMParser().parseFromString(markup,'image/svg+xml');
      const root=parsed.documentElement;if(root.tagName.toLowerCase()!=='svg')throw new Error('Invalid diagram');
      svg=document.importNode(root,true);svg.setAttribute('role','group');canvas.replaceChildren(svg);
      svg.querySelectorAll('[data-node]').forEach(item=>{const id=item.dataset.node;item.tabIndex=0;item.setAttribute('role','button');item.setAttribute('aria-label',spec.nodes[id]?.title||id);item.addEventListener('click',()=>inspect(id));item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();inspect(id,true);}});});
      fitted=true;size();viewport.scrollTop=0;viewport.scrollLeft=0;
      inspect(spec.defaultNode||svg.querySelector('[data-node]')?.dataset.node);
    } catch(error) {if(seq!==request)return;svg=null;const message=document.createElement('p');message.textContent='The diagram could not load. Use the full-size SVG link or reload the page.';canvas.replaceChildren(message);}
  }
  const tabs=[...document.querySelectorAll('[data-architecture-view]')];
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>show(tab.dataset.architectureView));tab.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=tabs[(i+1)%tabs.length];next.focus();show(next.dataset.architectureView);}});});
  $('architecture-fit').addEventListener('click',()=>{fitted=true;size();viewport.scrollLeft=0;viewport.scrollTop=0;});
  $('architecture-zoom-level').addEventListener('click',()=>{fitted=false;zoom=1;size();});
  function zoomBy(multiplier){fitted=false;zoom=Math.max(.2,Math.min(2.5,zoom*multiplier));size();}
  $('architecture-zoom-in').addEventListener('click',()=>zoomBy(1.25));
  $('architecture-zoom-out').addEventListener('click',()=>zoomBy(.8));
  new ResizeObserver(()=>{if(fitted)size();}).observe(viewport);
  window.addEventListener('hashchange',()=>{if(fitted)size();});
  show('architecture');
})();
