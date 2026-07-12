(function () {
  const reader = document.querySelector("[data-reader]");
  if (!reader) return;

  const storageKey = "huoshanjie-reader-settings";
  const fontInputs = [...reader.querySelectorAll("[data-reader-font]")];
  const lineHeightInputs = [...reader.querySelectorAll("[data-reader-line-height]")];
  const sidebarToggle = reader.querySelector("[data-reader-sidebar-toggle]");
  const defaults = { font: "20", lineHeight: "2.1", sidebarCollapsed: false };

  function loadSettings() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return defaults;
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }

  function applySettings(settings) {
    reader.style.setProperty("--reader-font-size", `${settings.font}px`);
    reader.style.setProperty("--reader-line-height", settings.lineHeight);
    reader.classList.toggle("sidebar-collapsed", Boolean(settings.sidebarCollapsed));
    fontInputs.forEach((input) => {
      input.checked = input.value === settings.font;
    });
    lineHeightInputs.forEach((input) => {
      input.checked = input.value === settings.lineHeight;
    });
    if (sidebarToggle) {
      const isExpanded = !settings.sidebarCollapsed;
      sidebarToggle.setAttribute("aria-expanded", String(isExpanded));
      sidebarToggle.setAttribute("aria-label", isExpanded ? "收起目录" : "展开目录");
    }
  }

  let settings = loadSettings();
  applySettings(settings);

  fontInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      settings = { ...settings, font: input.value };
      applySettings(settings);
      saveSettings(settings);
    });
  });

  lineHeightInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      settings = { ...settings, lineHeight: input.value };
      applySettings(settings);
      saveSettings(settings);
    });
  });

  sidebarToggle?.addEventListener("click", () => {
    settings = { ...settings, sidebarCollapsed: !settings.sidebarCollapsed };
    applySettings(settings);
    saveSettings(settings);
  });
})();
