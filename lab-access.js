(() => {
  'use strict';
  const key = 'conversation-agent.private-lab-url';
  const launch = document.getElementById('lab-launch');
  const form = document.getElementById('remote-lab-form');
  const input = document.getElementById('remote-lab-url');
  const status = document.getElementById('lab-connection-status');
  const connection = document.getElementById('lab-connection');
  const local = document.getElementById('lab-use-local');
  if (!launch || !form || !input || !status || !connection || !local) return;
  let selected = null;

  function address(value) {
    if (!value || value !== value.trim() || /[\s\\]/.test(value)) return null;
    try {
      const url = new URL(value);
      const label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
      if (url.protocol !== 'https:' || !new RegExp(`^${label}\\.${label}\\.ts\\.net$`).test(url.hostname)
          || url.username || url.password || (url.pathname !== '/' && url.pathname !== '')
          || url.search || url.hash || (url.port && url.port !== '8443')) return null;
      return url.origin;
    } catch (_) { return null; }
  }

  function select(url) {
    selected = url;
    launch.href = url || '#lab-connection';
    launch.target = url ? '_blank' : '_self';
    launch.textContent = url ? 'Open private Harness Lab ↗' : 'Open Harness Lab';
    input.value = url || '';
  }

  try { select(address(localStorage.getItem(key))); }
  catch (_) { select(null); }

  launch.addEventListener('click', event => {
    if (selected) return;
    event.preventDefault();
    connection.open = true;
    input.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const url = address(input.value.trim());
    if (!url) {
      status.textContent = 'Enter the HTTPS .ts.net address printed by the Windows launcher.';
      input.focus();
      return;
    }
    select(url);
    try {
      localStorage.setItem(key, url);
      status.textContent = 'Saved in this browser. Use the Lab button to reconnect.';
    } catch (_) {
      status.textContent = 'Selected for this visit. Your browser could not save the address.';
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  local.addEventListener('click', () => {
    select(null);
    try { localStorage.removeItem(key); }
    catch (_) { /* Local navigation still works when browser storage is unavailable. */ }
    status.textContent = 'Opening the Lab on this computer.';
  });
})();
