import { readFile } from "node:fs/promises";
import { extname } from "node:path";

import { CdpSession, fetchRendererTargets, waitForRendererTargets } from "./cdp-client.mjs";
import { DSH_THEMES } from "./dsh-themes.mjs";
import { buildSkinCss } from "./skin-css.mjs";
import { buildSkinMenuScript, CSS_SENTINELS } from "./skin-menu.mjs";

const STYLE_ID = "workbuddy-skin-style";
const MENU_ID = "workbuddy-skin-menu";
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function evaluateTargets(targets, expression, Session) {
  const values = [];
  for (const target of targets) {
    const session = new Session(target.webSocketDebuggerUrl);
    try {
      await session.open();
      values.push(await session.evaluate(expression));
    } finally {
      session.close();
    }
  }
  return values;
}

export async function applySkin({ loadedTheme, themes, port, activeThemeId, deps = {} }) {
  const wait = deps.waitForRendererTargets ?? waitForRendererTargets;
  const Session = deps.Session ?? CdpSession;

  const entries = [];

  // 1. 加入 DSH Dream Skin 8 套经典高质感主题 (3 白 + 5 黑)
  for (const dsh of DSH_THEMES) {
    entries.push({
      id: dsh.id,
      name: dsh.name,
      accent: dsh.accent,
      surface: dsh.surface,
      colorScheme: dsh.colorScheme,
      css: buildSkinCss({ theme: dsh, heroDataUrl: null, mode: dsh.colorScheme }),
    });
  }

  const defaultThemeId = activeThemeId ?? "dsh-mist"; // 默认采用 DSH 经典白透液态玻璃

  // 生成两套自定义模板：一套用于白天/白模式，一套用于夜晚/黑模式
  const placeholderTheme = {
    id: CSS_SENTINELS.id,
    name: "custom",
    colors: {
      accent: CSS_SENTINELS.accent,
      secondary: CSS_SENTINELS.secondary,
      surface: CSS_SENTINELS.surface,
      text: CSS_SENTINELS.text,
    },
    copy: null,
  };

  const cssTemplateLight = buildSkinCss({
    theme: placeholderTheme,
    heroDataUrl: CSS_SENTINELS.hero,
    mode: "light",
  });

  const cssTemplateDark = buildSkinCss({
    theme: placeholderTheme,
    heroDataUrl: CSS_SENTINELS.hero,
    mode: "dark",
  });

  const expression = buildSkinMenuScript({
    entries,
    activeId: defaultThemeId,
    styleId: STYLE_ID,
    menuId: MENU_ID,
    cssTemplateLight,
    cssTemplateDark,
  });

  const targets = await wait(port, {
    timeoutMs: deps.waitTimeoutMs ?? 20_000,
    pollMs: deps.pollMs ?? 500,
  });

  const values = await evaluateTargets(targets, expression, Session);
  return {
    applied: values.length,
    themeId: defaultThemeId,
    menuThemes: entries.map(({ id }) => id),
    targets: targets.map(({ id }) => id)
  };
}

export async function removeSkin({ port, deps = {} }) {
  const fetchTargets = deps.fetchRendererTargets ?? fetchRendererTargets;
  const Session = deps.Session ?? CdpSession;
  const expression = `(() => {
    document.getElementById(${JSON.stringify(STYLE_ID)})?.remove();
    document.getElementById(${JSON.stringify(MENU_ID)})?.remove();
    delete document.documentElement.dataset.workbuddySkin;
    return true;
  })()`;
  const targets = await fetchTargets(port);
  const values = await evaluateTargets(targets, expression, Session);
  return { removed: values.length };
}

export async function skinStatus({ port, deps = {} }) {
  const fetchTargets = deps.fetchRendererTargets ?? fetchRendererTargets;
  const Session = deps.Session ?? CdpSession;
  const expression = `(() => ({
    installed: Boolean(document.getElementById(${JSON.stringify(STYLE_ID)})),
    menu: Boolean(document.getElementById(${JSON.stringify(MENU_ID)})),
    themeId: document.documentElement.dataset.workbuddySkin ?? null
  }))()`;
  const targets = await fetchTargets(port);
  return evaluateTargets(targets, expression, Session);
}
