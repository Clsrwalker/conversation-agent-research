'use strict';
(() => {
  const detail = document.getElementById('home-logic-detail');
  if (!detail) return;
  const descriptions = {
    receive: ['Receive.', 'Timestamped conversation events and completed tool results become available at the next event boundary. A job receipt is not yet evidence.'],
    decide: ['Decide.', 'One agent chooses its next model/tool action from delivered context. New events enter before the next model inference, after the current tool batch completes. There is no mandatory investigation sequence.'],
    deliver: ['Act.', 'The agent may publish, update or withdraw a help card, wait for another event, or stop. Publication checks for unread events. A completed model call or private response does not itself deliver help.'],
    tools: ['Investigate.', 'Search and document reads start delayed jobs; completed results return to the loop. Calculation and evidence advice are available tools. The model decides which tools to use and whether further evidence is needed.'],
    state: ['Preserve state.', 'SQLite checkpoints save agent execution state. A separate durable ledger records the environment, tool jobs and budgets. Recovery supports continuity; it does not establish answer correctness.']
  };
  document.querySelectorAll('[data-logic-stage]').forEach(button => button.addEventListener('click', () => {
    const [title, text] = descriptions[button.dataset.logicStage];
    detail.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = title + ' ';
    detail.append(strong, text);
    document.querySelectorAll('[data-logic-stage]').forEach(other => other.setAttribute('aria-pressed', String(button === other)));
  }));
})();
