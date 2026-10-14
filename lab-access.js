(() => {
  'use strict';
  const key = 'conversation-agent.private-lab-url';
  const localUrl = 'http://127.0.0.1:8769';
  const launch = document.getElementById('lab-launch');
  const form = document.getElementById('remote-lab-form');
  const input = document.getElementById('remote-lab-url');
  const status = document.getElementById('lab-connection-status');
  if (!launch || !form || !input || !status) return;

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
    launch.href = url || localUrl;
    launch.textContent = url ? 'Open private Harness Lab ↗' : 'Open Lab on this computer ↗';
    input.value = url || '';
  }

  try { select(address(localStorage.getItem(key))); }
  catch (_) { select(null); }

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

  document.getElementById('lab-use-local').addEventListener('click', () => {
    select(null);
    try { localStorage.removeItem(key); }
    catch (_) { /* Local navigation still works when browser storage is unavailable. */ }
    status.textContent = 'Lab opens on this computer.';
  });
})();
