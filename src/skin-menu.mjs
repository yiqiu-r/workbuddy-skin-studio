const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;
const DEFAULT_ACCENT = "#006CB5";

export const CSS_SENTINELS = {
  id: "workbuddy-custom-sentinel-id",
  hero: "data:image/png;base64,WORKBUDDYHEROSENTINEL",
  accent: "#010203",
  secondary: "#040506",
  surface: "#070809",
  text: "#0a0b0c",
};

export function buildSkinMenuScript({ entries, activeId, styleId, menuId, cssTemplateLight = "", cssTemplateDark = "" }) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("皮肤菜单至少需要一个主题");
  }
  const themes = entries.map((entry) => {
    if (!entry?.id || typeof entry.css !== "string") throw new Error("主题条目缺少 id 或 css");
    return {
      id: String(entry.id),
      name: typeof entry.name === "string" && entry.name.trim() ? entry.name : String(entry.id),
      accent: HEX_COLOR.test(entry.accent ?? "") ? entry.accent : DEFAULT_ACCENT,
      surface: typeof entry.surface === "string" ? entry.surface : "#ffffff",
      colorScheme: entry.colorScheme ?? (entry.surface?.toLowerCase().includes("f") ? "light" : "dark"),
      css: entry.css,
    };
  });

  const payload = JSON.stringify({
    styleId,
    menuId,
    activeId,
    themes,
    cssTemplateLight,
    cssTemplateDark,
    sentinels: CSS_SENTINELS,
    customId: "custom-upload",
    storageKey: "workbuddyCustomTheme",
    modeKey: "workbuddyThemeMode",
    opacityKey: "workbuddyWallpaperOpacity",
    posKey: "workbuddyMenuPos",
  });

  return `(() => {
  const data = ${payload};

  let style = document.getElementById(data.styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = data.styleId;
    document.head.appendChild(style);
  }

  document.getElementById(data.menuId)?.remove();
  const root = document.createElement("div");
  root.id = data.menuId;
  root.style.cssText = "position:fixed;z-index:2147483000;width:38px;height:38px;font:500 13px/1.4 system-ui;user-select:none;";

  // --- 悬浮按钮位置：可拖拽，位置持久化 ---
  const BTN = 38;
  const clampNum = (value, min, max) => Math.min(Math.max(value, min), max);
  const setPos = (x, y) => {
    const maxX = Math.max(4, window.innerWidth - BTN - 4);
    const maxY = Math.max(4, window.innerHeight - BTN - 4);
    root.style.left = clampNum(x, 4, maxX) + "px";
    root.style.top = clampNum(y, 4, maxY) + "px";
  };

  let savedPos = null;
  try {
    const rawPos = localStorage.getItem(data.posKey);
    if (rawPos) {
      const parsedPos = JSON.parse(rawPos);
      if (Number.isFinite(parsedPos?.x) && Number.isFinite(parsedPos?.y)) savedPos = parsedPos;
    }
  } catch {}
  setPos(savedPos ? savedPos.x : window.innerWidth - BTN - 16, savedPos ? savedPos.y : 48);

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "\\u{1F3A8}";
  button.title = "WorkBuddy Dream Skin 调色板（拖动可移动位置）";
  button.style.cssText = "display:block;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.85);backdrop-filter:blur(16px);box-shadow:0 4px 16px rgba(0,0,0,.15);cursor:grab;touch-action:none;font-size:19px;padding:0;transition:transform .15s ease;";
  button.onmouseenter = () => button.style.transform = "scale(1.08)";
  button.onmouseleave = () => button.style.transform = "scale(1)";

  const panel = document.createElement("div");
  panel.style.cssText = "display:none;position:absolute;top:46px;right:0;width:240px;max-height:85vh;overflow-y:auto;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.88);backdrop-filter:blur(24px) saturate(140%);box-shadow:0 12px 36px rgba(0,0,0,.2);color:#1e293b;";

  // 依据按钮所在位置决定面板朝哪一侧展开，避免贴边被裁掉
  const alignPanel = () => {
    if (panel.style.display === "none") return;
    const rect = root.getBoundingClientRect();
    const width = panel.offsetWidth || 240;
    const height = panel.offsetHeight || 0;
    const flipX = rect.left - (width - BTN) < 8;
    panel.style.left = flipX ? "0" : "auto";
    panel.style.right = flipX ? "auto" : "0";
    const flipY = rect.top + 46 + height > window.innerHeight - 8;
    panel.style.top = flipY ? "auto" : "46px";
    panel.style.bottom = flipY ? "46px" : "auto";
  };

  // --- 模式切换栏 (☀️ 白天浅色 / 🌙 黑夜深色) ---
  const modeHeader = document.createElement("div");
  modeHeader.style.cssText = "display:flex;background:rgba(0,0,0,.06);border-radius:10px;padding:3px;margin-bottom:10px;gap:4px;";

  let currentMode = "light";
  try {
    currentMode = localStorage.getItem(data.modeKey) || "light";
  } catch {}

  const btnLight = document.createElement("button");
  btnLight.textContent = "☀️ 浅色 (白)";
  btnLight.style.cssText = "flex:1;border:none;background:transparent;padding:6px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:#334155;transition:all .15s ease;";

  const btnDark = document.createElement("button");
  btnDark.textContent = "🌙 深色 (黑)";
  btnDark.style.cssText = "flex:1;border:none;background:transparent;padding:6px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:#334155;transition:all .15s ease;";

  const updateModeButtons = () => {
    const isL = currentMode === "light";
    btnLight.style.background = isL ? "#ffffff" : "transparent";
    btnLight.style.boxShadow = isL ? "0 2px 6px rgba(0,0,0,.12)" : "none";
    btnDark.style.background = !isL ? "#1e293b" : "transparent";
    btnDark.style.color = !isL ? "#ffffff" : "#334155";
    btnDark.style.boxShadow = !isL ? "0 2px 6px rgba(0,0,0,.2)" : "none";
  };
  updateModeButtons();

  modeHeader.append(btnLight, btnDark);
  panel.appendChild(modeHeader);

  const applyMode = (darkExplicit) => {
    const dark = Boolean(darkExplicit);
    const body = document.body;
    const html = document.documentElement;
    body.dataset.vscodeThemeKind = dark ? "vscode-dark" : "vscode-light";
    body.dataset.vscodeThemeName = dark ? "IDE Dark" : "IDE Light";
    html.style.colorScheme = dark ? "dark" : "light";
    html.dataset.themeMode = dark ? "dark" : "light";
    ["light", "vscode-light", "cb-light", "dark", "vscode-dark", "cb-dark"].forEach((cls) => {
      const isDarkCls = cls === "dark" || cls === "vscode-dark" || cls === "cb-dark";
      body.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
      html.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
    });
  };

  const rows = new Map();
  const paint = (id) => {
    for (const [rowId, rowEl] of rows) {
      const isSel = rowId === id;
      rowEl.style.background = isSel ? "rgba(0,108,181,.14)" : "transparent";
      rowEl.style.fontWeight = isSel ? "700" : "500";
    }
  };

  const row = (label, dotColor, onPick, before) => {
    const item = document.createElement("div");
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:2px;font-size:12.5px;";
    const dot = document.createElement("span");
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";box-shadow:0 0 4px " + dotColor + ";";
    const text = document.createElement("span");
    text.textContent = label;
    text.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    item.append(dot, text);
    item.addEventListener("mouseenter", () => { if (item.style.fontWeight !== "700") item.style.background = "rgba(0,0,0,.04)"; });
    item.addEventListener("mouseleave", () => paint(document.documentElement.dataset.workbuddySkin ?? null));
    item.addEventListener("click", () => onPick(item));
    if (before) panel.insertBefore(item, before); else panel.appendChild(item);
    return item;
  };

  const sectionLabel = (title) => {
    const sec = document.createElement("div");
    sec.textContent = title;
    sec.style.cssText = "font-size:11px;font-weight:700;color:rgba(0,0,0,.45);margin:8px 0 4px 6px;text-transform:uppercase;letter-spacing:0.5px;";
    panel.appendChild(sec);
    return sec;
  };

  // 分组展示 DSH 经典与角色预设
  sectionLabel("DSH 幻梦系列 (8 套)");
  const dshThemes = data.themes.filter(t => t.id.startsWith("dsh-"));
  for (const theme of dshThemes) {
    rows.set(theme.id, row(theme.name, theme.accent, () => {
      currentMode = theme.colorScheme;
      try { localStorage.setItem(data.modeKey, currentMode); } catch {}
      updateModeButtons();
      setTheme(theme.id);
      panel.style.display = "none";
    }));
  }


  // --- 自定义壁纸生成与模式适配 ---
  const buildCustomCss = (dataUrl, colors, mode) => {
    const tpl = mode === "dark" ? data.cssTemplateDark : data.cssTemplateLight;
    return tpl
      .split(data.sentinels.hero).join(dataUrl)
      .split(data.sentinels.accent).join(colors.accent)
      .split(data.sentinels.secondary).join(colors.secondary)
      .split(data.sentinels.surface).join(colors.surface)
      .split(data.sentinels.text).join(colors.text)
      .split(data.sentinels.id).join(data.customId);
  };

  const loadCustom = () => {
    try {
      const raw = localStorage.getItem(data.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const applyCustomTheme = (theme, forcedMode) => {
    const mode = forcedMode || currentMode;
    style.textContent = buildCustomCss(theme.dataUrl, theme.colors, mode);
    document.documentElement.dataset.workbuddySkin = data.customId;
    applyMode(mode === "dark");
    ensureCustomRow(theme);
    paint(data.customId);
  };

  const setTheme = (id) => {
    if (id === data.customId) {
      const saved = loadCustom();
      if (saved) applyCustomTheme(saved, currentMode);
      return;
    }
    const theme = data.themes.find((candidate) => candidate.id === id);
    if (!theme) return;
    style.textContent = theme.css;
    document.documentElement.dataset.workbuddySkin = theme.id;
    applyMode(currentMode === "dark");
    paint(theme.id);
  };

  const clearTheme = () => {
    style.textContent = "";
    delete document.documentElement.dataset.workbuddySkin;
    applyMode(false);
    paint(null);
  };

  // 模式切换监听
  btnLight.onclick = () => {
    currentMode = "light";
    try { localStorage.setItem(data.modeKey, "light"); } catch {}
    updateModeButtons();
    const active = document.documentElement.dataset.workbuddySkin;
    if (active === data.customId) {
      const saved = loadCustom();
      if (saved) applyCustomTheme(saved, "light");
    } else {
      applyMode(false);
    }
  };

  btnDark.onclick = () => {
    currentMode = "dark";
    try { localStorage.setItem(data.modeKey, "dark"); } catch {}
    updateModeButtons();
    const active = document.documentElement.dataset.workbuddySkin;
    if (active === data.customId) {
      const saved = loadCustom();
      if (saved) applyCustomTheme(saved, "dark");
    } else {
      applyMode(true);
    }
  };

  sectionLabel("自定义壁纸与透明度");

  let savedOpacity = 85;
  try {
    const rawOp = localStorage.getItem(data.opacityKey);
    if (rawOp) savedOpacity = Math.max(10, Math.min(100, parseInt(rawOp, 10)));
  } catch {}

  const opacityBox = document.createElement("div");
  opacityBox.style.cssText = "margin:6px 4px 10px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.06);";

  const opacityLabelRow = document.createElement("div");
  opacityLabelRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11.5px;color:#475569;font-weight:600;";

  const opacityTitle = document.createElement("span");
  opacityTitle.textContent = "壁纸不透明度";

  const opacityValue = document.createElement("span");
  opacityValue.textContent = savedOpacity + "%";
  opacityValue.style.cssText = "color:#006CB5;font-weight:700;";

  opacityLabelRow.append(opacityTitle, opacityValue);

  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.min = "10";
  opacitySlider.max = "100";
  opacitySlider.step = "5";
  opacitySlider.value = String(savedOpacity);
  opacitySlider.style.cssText = "width:100%;height:5px;border-radius:3px;appearance:none;-webkit-appearance:none;background:rgba(0,108,181,.25);outline:none;cursor:pointer;";

  const applyOpacity = (val) => {
    opacityValue.textContent = val + "%";
    document.documentElement.style.setProperty("--wb-wallpaper-opacity", (val / 100).toFixed(2));
    try { localStorage.setItem(data.opacityKey, String(val)); } catch {}
  };

  opacitySlider.oninput = (e) => {
    applyOpacity(parseInt(e.target.value, 10));
  };

  applyOpacity(savedOpacity);

  opacityBox.append(opacityLabelRow, opacitySlider);
  panel.appendChild(opacityBox);
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp";
  fileInput.style.display = "none";
  panel.appendChild(fileInput);

  let customRow = null;
  const deleteCustom = () => {
    try { localStorage.removeItem(data.storageKey); } catch {}
    if (document.documentElement.dataset.workbuddySkin === data.customId) clearTheme();
    customRow?.remove();
    rows.delete(data.customId);
    customRow = null;
  };

  const ensureCustomRow = (theme) => {
    if (customRow) {
      customRow.querySelector("span + span").textContent = theme.name;
      customRow.firstChild.style.background = theme.colors.accent;
      return;
    }
    customRow = row(theme.name, theme.colors.accent, () => {
      applyCustomTheme(loadCustom() ?? theme);
      panel.style.display = "none";
    }, uploadRow);
    const text = customRow.querySelector("span + span");
    text.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    const del = document.createElement("span");
    del.textContent = "\\u00d7";
    del.title = "删除自定义壁纸";
    del.style.cssText = "flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;cursor:pointer;";
    del.addEventListener("mouseenter", () => { del.style.background = "rgba(220,60,60,.15)"; del.style.color = "#c03030"; });
    del.addEventListener("mouseleave", () => { del.style.background = "transparent"; del.style.color = "rgba(0,0,0,.45)"; });
    del.addEventListener("click", (e) => { e.stopPropagation(); deleteCustom(); });
    customRow.appendChild(del);
    rows.set(data.customId, customRow);
  };

  const uploadRow = row("＋ 上传自定义图片壁纸", "#006CB5", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    fileInput.value = "";
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1920;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/webp", 0.9);
      const customTheme = {
        name: file.name.replace(/\\.[^.]+$/, ""),
        dataUrl,
        colors: {
          accent: "#006CB5",
          secondary: "#7FB3FF",
          surface: currentMode === "light" ? "#F0F8FF" : "#111317",
          text: currentMode === "light" ? "#1E293B" : "#F8FAFC",
        }
      };
      try { localStorage.setItem(data.storageKey, JSON.stringify(customTheme)); } catch {}
      applyCustomTheme(customTheme);
      panel.style.display = "none";
    };
    img.src = url;
  });

  const sep = document.createElement("div");
  sep.style.cssText = "height:1px;background:rgba(0,0,0,.08);margin:8px 0;";
  panel.appendChild(sep);

  row("恢复官方原生界面", "#888888", () => { clearTheme(); panel.style.display = "none"; });

  // --- 拖拽移动（位移超过 4px 视为拖动，否则视为点击展开） ---
  let drag = null;
  let suppressClick = false;

  button.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      moved: false,
    };
    try { button.setPointerCapture(event.pointerId); } catch {}
    button.style.cursor = "grabbing";
  });

  button.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      panel.style.display = "none";
      button.style.transform = "none";
    }
    setPos(event.clientX - drag.offsetX, event.clientY - drag.offsetY);
    event.preventDefault();
  });

  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    button.style.cursor = "grab";
    try { button.releasePointerCapture(event.pointerId); } catch {}
    if (moved) {
      suppressClick = true;
      const rect = root.getBoundingClientRect();
      try {
        localStorage.setItem(data.posKey, JSON.stringify({ x: Math.round(rect.left), y: Math.round(rect.top) }));
      } catch {}
      alignPanel();
    }
  };
  button.addEventListener("pointerup", endDrag);
  button.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    const rect = root.getBoundingClientRect();
    setPos(rect.left, rect.top);
    alignPanel();
  });

  // 展开 / 收起面板
  button.onclick = (e) => {
    e.stopPropagation();
    if (suppressClick) { suppressClick = false; return; }
    const willOpen = panel.style.display === "none";
    panel.style.display = willOpen ? "block" : "none";
    if (willOpen) alignPanel();
  };
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) panel.style.display = "none";
  });

  root.append(button, panel);
  document.body.appendChild(root);

  // 初始化已有自定义壁纸
  const existingCustom = loadCustom();
  if (existingCustom) ensureCustomRow(existingCustom);

  // 恢复上次激活的主题
  const activeSkin = document.documentElement.dataset.workbuddySkin || data.activeId;
  if (activeSkin) setTheme(activeSkin);
})();`;
}
