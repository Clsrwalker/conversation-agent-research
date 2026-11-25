/* Progressive enhancement: without JavaScript every recorded step remains readable. */
(() => {
  "use strict";
  document.querySelectorAll("[data-hcm-stepper]").forEach((root) => {
    const controls = root.querySelector("[data-hcm-controls]");
    const buttons = Array.from(root.querySelectorAll("[data-hcm-step-button]"));
    const panels = Array.from(root.querySelectorAll("[data-hcm-panel]"));
    const status = root.querySelector("[data-hcm-status]");
    if (!controls || !buttons.length || buttons.length !== panels.length) return;

    function select(index, focus = false, announce = true) {
      panels.forEach((panel, position) => { panel.hidden = position !== index; });
      buttons.forEach((button, position) => {
        button.setAttribute("aria-pressed", String(position === index));
      });
      if (announce && status) status.textContent = `Step ${index + 1} of ${panels.length}: ${buttons[index].dataset.label}`;
      if (focus) buttons[index].focus();
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => select(index));
      button.addEventListener("keydown", (event) => {
        let target;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") target = (index + 1) % buttons.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "Home") target = 0;
        if (event.key === "End") target = buttons.length - 1;
        if (target !== undefined) {
          event.preventDefault();
          select(target, true);
        }
      });
    });

    function selectLinkedStep() {
      const index = panels.findIndex((panel) => `#${panel.id}` === window.location.hash);
      if (index >= 0) select(index, false, false);
    }
    root.classList.add("is-enhanced");
    controls.hidden = false;
    select(0, false, false);
    selectLinkedStep();
    window.addEventListener("hashchange", selectLinkedStep);
  });
})();
