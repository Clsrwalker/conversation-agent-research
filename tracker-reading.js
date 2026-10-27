// Keep links to archived studies usable when their enclosing details are closed.
function revealResearchTarget() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  for (let element = target; element; element = element.parentElement) {
    if (element.tagName === 'DETAILS') element.open = true;
  }
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}
addEventListener('hashchange', revealResearchTarget);
revealResearchTarget();
