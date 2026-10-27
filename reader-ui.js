'use strict';
(() => {
  const button = document.querySelector('[data-reader-theme]');
  if (!button) return;
  const setTheme = value => {
    const theme = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  try { setTheme(localStorage.getItem('conversation-research-theme')); } catch { setTheme('light'); }
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('conversation-research-theme', theme); } catch { /* Storage may be unavailable. */ }
  });
})();
