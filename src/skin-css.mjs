// WorkBuddy 皮肤 CSS 生成器 — 融合 DSH Dream Skin 架构
// 支持 白(浅色) / 黑(深色) 双色材质自适应 + Liquid Glass 液态毛玻璃 + 全景壁纸透光

export const DEFAULT_COLORS = {
  accent: "#006CB5",
  secondary: "#7FB3FF",
  surface: "#F0F8FF",
  text: "#1E293B",
};

export function isLight(colorHex) {
  const m = /^#([0-9a-f]{6})$/i.exec(colorHex || "");
  if (!m) return true;
  const v = parseInt(m[1], 16);
  return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) > 135;
}

export function buildSkinCss({ theme, heroDataUrl, mode }) {
  const surface = theme.colors?.surface ?? theme.surface ?? DEFAULT_COLORS.surface;
  const isLightMode = mode ? mode === "light" : (theme.colorScheme ? theme.colorScheme === "light" : isLight(surface));

  const accent = theme.colors?.accent ?? theme.accent ?? DEFAULT_COLORS.accent;
  const secondary = theme.colors?.secondary ?? theme.secondary ?? DEFAULT_COLORS.secondary;
  const rawText = theme.colors?.text ?? theme.text;
  const textConflict = rawText && (isLightMode ? isLight(rawText) : !isLight(rawText));
  const textColor = (!rawText || textConflict)
    ? (isLightMode ? "#1E293B" : "#F8FAFC")
    : rawText;
  const id = String(theme.id ?? "custom").replace(/[^a-z0-9_-]/gi, "");

  // 背景源：优先使用传入的 heroDataUrl (壁纸)，次选主题自带的弥散光 glow
  let bgValue = "";
  if (heroDataUrl && typeof heroDataUrl === "string" && heroDataUrl.startsWith("data:image")) {
    bgValue = `url(${JSON.stringify(heroDataUrl)}) center center / cover no-repeat fixed !important`;
  } else if (theme.glow) {
    bgValue = `${theme.glow} center center / cover no-repeat fixed !important`;
  } else {
    bgValue = `url(${JSON.stringify(heroDataUrl || "")}) center center / cover no-repeat fixed !important`;
  }

  // Liquid-Glass 质感参数 (源自 DSH Dream Skin 调优规范)
  const glass = isLightMode
    ? {
        sidebarBg: "rgba(255, 255, 255, 0.55)",
        sidebarBorder: "rgba(255, 255, 255, 0.65)",
        sidebarText: "#334155",
        activeItemBg: "rgba(255, 255, 255, 0.75)",
        activeItemShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        composerBg: "rgba(255, 255, 255, 0.82)",
        composerBorder: "rgba(255, 255, 255, 0.85)",
        composerShadow: "inset 0 1px 0 rgba(255, 255, 255, 1), 0 10px 30px rgba(0, 0, 0, 0.08)",
        bubbleBg: "rgba(255, 255, 255, 0.62)",
        bubbleBorder: "rgba(255, 255, 255, 0.75)",
        bubbleShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
        codeBg: "rgba(255, 255, 255, 0.72)",
        codeHeaderBg: "rgba(255, 255, 255, 0.85)",
        codeBorder: "rgba(255, 255, 255, 0.8)",
        textShadow: "0 1px 2px rgba(255, 255, 255, 0.8), 0 0 1px rgba(255, 255, 255, 0.5)",
      }
    : {
        sidebarBg: "rgba(15, 23, 42, 0.60)",
        sidebarBorder: "rgba(255, 255, 255, 0.12)",
        sidebarText: "#CBD5E1",
        activeItemBg: "rgba(255, 255, 255, 0.12)",
        activeItemShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        composerBg: "rgba(15, 23, 42, 0.75)",
        composerBorder: "rgba(255, 255, 255, 0.16)",
        composerShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 10px 30px rgba(0, 0, 0, 0.35)",
        bubbleBg: "rgba(30, 41, 59, 0.62)",
        bubbleBorder: "rgba(255, 255, 255, 0.14)",
        bubbleShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
        codeBg: "rgba(15, 23, 42, 0.70)",
        codeHeaderBg: "rgba(30, 41, 59, 0.85)",
        codeBorder: "rgba(255, 255, 255, 0.14)",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.85)",
      };

  return `/* WORKBUDDY_DREAM_SKIN:${id}:${isLightMode ? "light" : "dark"} */
body[data-application-name=workbuddy] {
  --wb-accent: ${accent};
  --wb-secondary: ${secondary};
  --wb-surface: ${surface};
  --wb-text: ${textColor};

  /* 全局底层图层全部透明，确保底层壁纸完全贯穿 */
  --cb-bg-primary: transparent !important;
  --cb-bg-secondary: transparent !important;
  --cb-panel-bg-primary: transparent !important;
  --cb-team-member-card-background: ${glass.bubbleBg} !important;
  --conversation-shell-bg: transparent !important;

  /* 文字颜色与排版 */
  --cb-text-primary: var(--wb-text) !important;
  --cb-text-secondary: color-mix(in srgb, var(--wb-text) 75%, transparent) !important;
  --cb-text-disabled: color-mix(in srgb, var(--wb-text) 45%, transparent) !important;
  --cb-text-link: var(--wb-accent) !important;
  --cb-text-error-active: var(--wb-accent) !important;

  /* VS Code 框架包裹变量 */
  --cb-vscode-editor-background: transparent !important;
  --cb-vscode-sideBar-background: transparent !important;
  --cb-vscode-foreground: var(--wb-text) !important;
  --cb-vscode-editor-foreground: var(--wb-text) !important;
  --cb-vscode-descriptionForeground: color-mix(in srgb, var(--wb-text) 75%, transparent) !important;
  --cb-vscode-titleBar-activeBackground: ${isLightMode ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)"} !important;
  --cb-vscode-titleBar-activeForeground: var(--wb-text) !important;
  --cb-vscode-titleBar-inactiveBackground: ${isLightMode ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.5)"} !important;
  --cb-vscode-titleBar-inactiveForeground: color-mix(in srgb, var(--wb-text) 60%, transparent) !important;
  --cb-titlebar-control-hover-background: color-mix(in srgb, var(--wb-accent) 20%, transparent) !important;
  --cb-vscode-input-background: ${glass.composerBg} !important;
  --cb-vscode-dropdown-background: ${isLightMode ? "rgba(255, 255, 255, 0.95)" : "rgba(30, 41, 59, 0.95)"} !important;
  --cb-vscode-list-hoverBackground: color-mix(in srgb, var(--wb-accent) 18%, transparent) !important;
  --cb-vscode-toolbar-hoverBackground: color-mix(in srgb, var(--wb-accent) 18%, transparent) !important;
  --cb-vscode-scrollbarSlider-background: color-mix(in srgb, var(--wb-accent) 25%, transparent) !important;
  --cb-vscode-scrollbarSlider-hoverBackground: color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  --cb-vscode-textLink-foreground: var(--wb-accent) !important;
  --cb-vscode-widget-border: color-mix(in srgb, var(--wb-accent) 40%, transparent) !important;
  --cb-vscode-panel-border: color-mix(in srgb, var(--wb-accent) 25%, transparent) !important;

  /* 品牌按钮与强调元素 */
  --cb-button-dark-background: var(--wb-accent) !important;
  --cb-button-dark-foreground: #ffffff !important;
  --cb-button-dark-hover-background: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;
  --cb-vscode-button-background: var(--wb-accent) !important;
  --cb-vscode-button-foreground: #ffffff !important;
  --cb-vscode-button-hoverBackground: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;

  /* 描边 */
  --cb-stroke-secondary: color-mix(in srgb, var(--wb-accent) 40%, transparent) !important;
  --cb-markdown-hr-border-color: color-mix(in srgb, var(--wb-accent) 25%, transparent) !important;
}

/* 底层壁纸与纯净背景衬底：壁纸独立置于 body::before 伪元素，支持动态无损调节透明度 */
body[data-application-name=workbuddy],
body {
  background-color: ${isLightMode ? "#f8fafc" : "#0b0f17"} !important;
  position: relative !important;
}

body[data-application-name=workbuddy]::before,
body::before {
  content: "" !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: ${bgValue};
  opacity: var(--wb-wallpaper-opacity, 0.85) !important;
  transition: opacity 0.15s ease !important;
}

#root {
  position: relative !important;
  z-index: 1 !important;
  color: var(--wb-text) !important;
  background: transparent !important;
}

/* 核心布局与容器 100% 全透明 */
.conversation-shell,
.teams-grid-scroll-content,
.teams-container,
.teams-container.is-mac,
.layout-window-frame,
.layout-window-frame__body,
.layout-window-frame__content,
.layout-window-frame__main,
.layout-window-frame__outlet,
.layout-window-frame__row,
main.wb-home-route,
.wb-home-route,
.wb-home-page,
.wb-home-page__main-content,
.wb-home-route__body,
.conversation-list,
.main-content,
.main-content--welcome,
.sidebar-next,
[data-view-id],
.cr-input-toolbar__right {
  background: transparent !important;
}

/* 侧边栏：DSH Liquid Glass 通透毛玻璃 */
.layout-window-frame__nav,
[data-view-id=sidebar] {
  background: ${glass.sidebarBg} !important;
  border-right: 1px solid ${glass.sidebarBorder} !important;
  backdrop-filter: blur(20px) saturate(140%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
  color: ${glass.sidebarText} !important;
}

/* 侧边栏选中的项目高亮胶囊 */
.layout-window-frame__nav [class*="active"],
.layout-window-frame__nav [class*="selected"],
.layout-window-frame__nav .is-active {
  background: ${glass.activeItemBg} !important;
  box-shadow: ${glass.activeItemShadow} !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
}

/* 对话气泡 (用户提问) 半透明透光卡片 */
.cr-self-bubble {
  background: ${glass.bubbleBg} !important;
  backdrop-filter: blur(14px) saturate(130%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(130%) !important;
  border: 1px solid ${glass.bubbleBorder} !important;
  border-radius: 14px !important;
  box-shadow: ${glass.bubbleShadow} !important;
  color: var(--wb-text) !important;
}

/* 代码块与表格：DSH 经典液态玻璃面板 */
.cr-code-like-box,
.cr-table-block__scroller {
  background: ${glass.codeBg} !important;
  backdrop-filter: blur(14px) saturate(130%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(130%) !important;
  border: 1px solid ${glass.codeBorder} !important;
  border-radius: 12px !important;
}

.cr-code-like-box__header {
  background: ${glass.codeHeaderBg} !important;
  border-bottom: 1px solid ${glass.codeBorder} !important;
}

/* 底部输入框：圆角悬浮液态玻璃胶囊 (参考图经典形态) */
.cr-input-container {
  background: ${glass.composerBg} !important;
  backdrop-filter: blur(24px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
  border: 1px solid ${glass.composerBorder} !important;
  border-radius: 16px !important;
  box-shadow: ${glass.composerShadow} !important;
}

/* 对话正文排版保障极高清晰度 */
.conversation-shell,
.markdown-body,
.cr-conversation-message {
  color: var(--wb-text) !important;
}
`;
}
