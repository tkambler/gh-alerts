// src/GridRenderer.ts
import { readCellValue } from "@repo/gridkit-core";
import { ChartEngine } from "@repo/gridkit-charts";
import {
  TOTAL_COUNT_WIDGET,
  FILTERED_TOTAL_WIDGET,
  FILTERED_COUNT_WIDGET,
  SELECTED_COUNT_WIDGET,
  AGGREGATION_WIDGET
} from "@repo/types";

// src/dom.ts
function el(tag, attrs, children) {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      element.append(
        typeof child === "string" ? document.createTextNode(child) : child
      );
    }
  }
  return element;
}
function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// src/themes.ts
var THEME_ORIGIN = {
  light: {
    bg: "#fff",
    borderColor: "#ddd",
    textColor: "#222",
    textMuted: "#888",
    focusColor: "#1976d2",
    flashColor: "#ffeb3b",
    headerBg: "#f8f9fa",
    headerTextColor: "inherit",
    headerHoverBg: "#e9ecef",
    rowHoverBg: "#f5f5f5",
    rowSelectedBg: "#e3f2fd",
    groupRowBg: "#f0f0f0",
    grandTotalBg: "#e8eaf6",
    subtotalBg: "#f3f4f6",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "14px",
    sidebarWidth: "250px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#1976d2"
  },
  dark: {
    bg: "#1e1e1e",
    borderColor: "#3a3a3a",
    textColor: "#e0e0e0",
    textMuted: "#888",
    focusColor: "#64b5f6",
    flashColor: "#f9a825",
    headerBg: "#2a2a2a",
    headerTextColor: "inherit",
    headerHoverBg: "#333",
    rowHoverBg: "#2c2c2c",
    rowSelectedBg: "#1a3a5c",
    groupRowBg: "#262626",
    grandTotalBg: "#2a2d3a",
    subtotalBg: "#252528",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "14px",
    sidebarWidth: "250px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#64b5f6"
  }
};
var THEME_EMBER = {
  light: {
    bg: "#fff",
    borderColor: "#d4c5a9",
    textColor: "#333",
    textMuted: "#8c7a5e",
    focusColor: "#c0550a",
    flashColor: "#fdd835",
    headerBg: "#f5f0e6",
    headerTextColor: "inherit",
    headerHoverBg: "#ebe3d3",
    rowHoverBg: "#faf7f0",
    rowSelectedBg: "#fce4cc",
    groupRowBg: "#f0ebe0",
    grandTotalBg: "#ede4d4",
    subtotalBg: "#f5f1ea",
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    fontSize: "13px",
    sidebarWidth: "230px",
    sidebarMinWidth: "180px",
    sidebarMaxWidth: "360px",
    linkColor: "#c0550a"
  },
  dark: {
    bg: "#1c1a17",
    borderColor: "#4a3f30",
    textColor: "#ddd4c4",
    textMuted: "#8c7a5e",
    focusColor: "#e88035",
    flashColor: "#f9a825",
    headerBg: "#272318",
    headerTextColor: "inherit",
    headerHoverBg: "#332d21",
    rowHoverBg: "#24201a",
    rowSelectedBg: "#3d2a14",
    groupRowBg: "#232019",
    grandTotalBg: "#2a2518",
    subtotalBg: "#21201b",
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    fontSize: "13px",
    sidebarWidth: "230px",
    sidebarMinWidth: "180px",
    sidebarMaxWidth: "360px",
    linkColor: "#e88035"
  }
};
var THEME_MATERIAL = {
  light: {
    bg: "#fafafa",
    borderColor: "#e0e0e0",
    textColor: "#212121",
    textMuted: "#757575",
    focusColor: "#3f51b5",
    flashColor: "#ffeb3b",
    headerBg: "#fff",
    headerTextColor: "inherit",
    headerHoverBg: "#f5f5f5",
    rowHoverBg: "#eeeeee",
    rowSelectedBg: "#e8eaf6",
    groupRowBg: "#f5f5f5",
    grandTotalBg: "#e8eaf6",
    subtotalBg: "#f0f0f0",
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "14px",
    sidebarWidth: "256px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#3f51b5"
  },
  dark: {
    bg: "#121212",
    borderColor: "#333",
    textColor: "#e0e0e0",
    textMuted: "#9e9e9e",
    focusColor: "#7986cb",
    flashColor: "#f9a825",
    headerBg: "#1e1e1e",
    headerTextColor: "inherit",
    headerHoverBg: "#2a2a2a",
    rowHoverBg: "#1a1a1a",
    rowSelectedBg: "#283593",
    groupRowBg: "#1a1a1a",
    grandTotalBg: "#1a237e",
    subtotalBg: "#1c1c1c",
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "14px",
    sidebarWidth: "256px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#7986cb"
  }
};
var THEME_GLACIER = {
  light: {
    bg: "#f8fafc",
    borderColor: "#cbd5e1",
    textColor: "#1e293b",
    textMuted: "#94a3b8",
    focusColor: "#0284c7",
    flashColor: "#fbbf24",
    headerBg: "#f1f5f9",
    headerTextColor: "inherit",
    headerHoverBg: "#e2e8f0",
    rowHoverBg: "#f1f5f9",
    rowSelectedBg: "#dbeafe",
    groupRowBg: "#e2e8f0",
    grandTotalBg: "#dbeafe",
    subtotalBg: "#eff6ff",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: "14px",
    sidebarWidth: "250px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#0284c7"
  },
  dark: {
    bg: "#0f172a",
    borderColor: "#334155",
    textColor: "#e2e8f0",
    textMuted: "#64748b",
    focusColor: "#38bdf8",
    flashColor: "#f59e0b",
    headerBg: "#1e293b",
    headerTextColor: "inherit",
    headerHoverBg: "#273548",
    rowHoverBg: "#162032",
    rowSelectedBg: "#1e3a5f",
    groupRowBg: "#1e293b",
    grandTotalBg: "#1e3a5f",
    subtotalBg: "#172033",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: "14px",
    sidebarWidth: "250px",
    sidebarMinWidth: "200px",
    sidebarMaxWidth: "400px",
    linkColor: "#38bdf8"
  }
};
var MIDNIGHT_DARK = {
  bg: "#1a1f2e",
  borderColor: "#1e293b",
  textColor: "#e2e8f0",
  textMuted: "#94a3b8",
  focusColor: "#3b82f6",
  flashColor: "#f59e0b",
  headerBg: "#111827",
  headerTextColor: "#94a3b8",
  headerHoverBg: "#1f2639",
  rowHoverBg: "rgba(59, 130, 246, 0.05)",
  rowSelectedBg: "rgba(59, 130, 246, 0.1)",
  groupRowBg: "#111827",
  grandTotalBg: "#151b2b",
  subtotalBg: "#161c2a",
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: "13px",
  sidebarWidth: "250px",
  sidebarMinWidth: "200px",
  sidebarMaxWidth: "400px",
  linkColor: "#60a5fa"
};
var THEME_MIDNIGHT = {
  light: MIDNIGHT_DARK,
  dark: MIDNIGHT_DARK
};
var PRESETS = {
  origin: THEME_ORIGIN,
  ember: THEME_EMBER,
  material: THEME_MATERIAL,
  glacier: THEME_GLACIER,
  midnight: THEME_MIDNIGHT
};
function resolveThemeParams(config) {
  const base = config?.base ?? "origin";
  const scheme = config?.colorScheme ?? "light";
  const preset = PRESETS[base] ?? THEME_ORIGIN;
  const resolved = { ...preset[scheme] };
  if (config?.params) {
    for (const [key, value] of Object.entries(config.params)) {
      if (value !== void 0) {
        resolved[key] = value;
      }
    }
  }
  return resolved;
}

// src/styles.ts
var PARAM_TO_VAR = {
  bg: "--gk-bg",
  borderColor: "--gk-border-color",
  textColor: "--gk-text-color",
  textMuted: "--gk-text-muted",
  focusColor: "--gk-focus-color",
  flashColor: "--gk-flash-color",
  headerBg: "--gk-header-bg",
  headerTextColor: "--gk-header-text-color",
  headerHoverBg: "--gk-header-hover-bg",
  rowHoverBg: "--gk-row-hover-bg",
  rowSelectedBg: "--gk-row-selected-bg",
  groupRowBg: "--gk-group-row-bg",
  grandTotalBg: "--gk-grand-total-bg",
  subtotalBg: "--gk-subtotal-bg",
  fontFamily: "--gk-font-family",
  fontSize: "--gk-font-size",
  sidebarWidth: "--gk-sidebar-width",
  sidebarMinWidth: "--gk-sidebar-min-width",
  sidebarMaxWidth: "--gk-sidebar-max-width",
  linkColor: "--gk-link-color"
};
function themeParamsToCssVars(params) {
  const lines = [];
  for (const [key, varName] of Object.entries(PARAM_TO_VAR)) {
    const value = params[key];
    if (value !== void 0) {
      lines.push(`${varName}: ${value};`);
    }
  }
  return lines.join("\n  ");
}
function applyThemeToElement(element, config) {
  const params = resolveThemeParams(config);
  for (const [key, varName] of Object.entries(PARAM_TO_VAR)) {
    const value = params[key];
    if (value !== void 0) {
      element.style.setProperty(varName, value);
    }
  }
}
var CSS = `
.gk-grid {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: var(--gk-border-radius, 0);
  font-family: var(--gk-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: var(--gk-font-size, 14px);
  color: var(--gk-text-color, #222);
  background: var(--gk-bg, #fff);
  box-sizing: border-box;
  text-align: left;
}

.gk-grid a {
  color: var(--gk-link-color, #1976d2);
}

.gk-header {
  display: flex;
  border-bottom: 2px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  color: var(--gk-header-text-color, inherit);
  font-weight: 600;
  flex-shrink: 0;
}

.gk-header-cell {
  padding: 8px 12px;
  border-right: 1px solid var(--gk-border-color, #ddd);
  cursor: default;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gk-header-cell[data-align="right"] {
  flex-direction: row-reverse;
}
.gk-header-cell[data-align="right"] .gk-filter-btn {
  margin-left: 0;
  margin-right: auto;
}
.gk-header-cell[data-align="right"] .gk-group-btn {
  margin-left: 0;
  margin-right: 4px;
}

.gk-header-cell[data-sortable="true"] {
  cursor: pointer;
}

.gk-header-cell[data-sortable="true"]:hover {
  background: var(--gk-header-hover-bg, #e9ecef);
}

.gk-header-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1 1 auto;
}

.gk-sort-indicator {
  opacity: 0.6;
  font-size: 12px;
}

.gk-body {
  overflow: auto;
  flex: 1 1 auto;
}

.gk-row {
  display: flex;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
}

.gk-row:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}

.gk-row[data-selected="true"] {
  background: var(--gk-row-selected-bg, #e3f2fd);
}

.gk-row[data-group="true"] {
  background: var(--gk-group-row-bg, #f0f0f0);
  font-weight: 600;
}

.gk-cell {
  padding: 8px 12px;
  border-right: 1px solid var(--gk-border-color, #ddd);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gk-cell[data-editable="true"] {
  cursor: text;
}

.gk-cell-editing {
  padding: 0;
}

.gk-cell-editing input {
  width: 100%;
  height: 100%;
  padding: 8px 12px;
  border: 2px solid var(--gk-focus-color, #1976d2);
  outline: none;
  font: inherit;
  box-sizing: border-box;
}

.gk-group-expand {
  cursor: pointer;
  margin-right: 4px;
  user-select: none;
}

.gk-pinned-top,
.gk-pinned-bottom {
  flex-shrink: 0;
}

.gk-pinned-top {
  border-bottom: 2px solid var(--gk-border-color, #ddd);
}
.gk-pinned-top:empty {
  border-bottom: none;
}

.gk-pinned-bottom {
  border-top: 2px solid var(--gk-border-color, #ddd);
}
.gk-pinned-bottom:empty {
  border-top: none;
}

.gk-status-bar {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  font-size: 13px;
  flex-shrink: 0;
  gap: 12px;
}
.gk-status-bar-left { display: flex; gap: 12px; }
.gk-status-bar-center { display: flex; gap: 12px; flex: 1; justify-content: center; }
.gk-status-bar-right { display: flex; gap: 12px; margin-left: auto; }
.gk-status-panel { white-space: nowrap; }

.gk-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  font-size: 13px;
  flex-shrink: 0;
}

.gk-pagination button {
  padding: 4px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
  cursor: pointer;
  border-radius: 3px;
  font: inherit;
}

.gk-pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.gk-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--gk-text-muted, #888);
}

/* Quick filter bar */
.gk-quick-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  flex-shrink: 0;
}
.gk-quick-filter input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font: inherit;
  outline: none;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
}
.gk-quick-filter input:focus {
  border-color: var(--gk-focus-color, #1976d2);
}
.gk-quick-filter-clear {
  cursor: pointer;
  padding: 2px 6px;
  border: none;
  background: none;
  color: var(--gk-text-muted, #888);
  font-size: 16px;
  line-height: 1;
}

/* Field filter button & indicator */
.gk-filter-btn {
  cursor: pointer;
  opacity: 0;
  font-size: 11px;
  margin-left: auto;
  padding: 0 2px;
  transition: opacity 0.1s;
}
.gk-header-cell:hover .gk-filter-btn,
.gk-filter-btn[data-active="true"] {
  opacity: 0.6;
}

/* Detail row table (master-detail) */
.gk-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}
.gk-detail-table th,
.gk-detail-table td {
  padding: 4px 8px;
  text-align: left;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
}
.gk-detail-table th {
  font-weight: 600;
  color: var(--gk-text-muted, #666);
}

/* Filter menu popup */
.gk-filter-menu {
  position: fixed;
  z-index: 9999;
  background: var(--gk-bg, #fff);
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}
.gk-filter-menu select,
.gk-filter-menu input {
  padding: 4px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font: inherit;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
}
.gk-filter-menu-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.gk-filter-menu-actions button {
  padding: 4px 12px;
  border: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
  cursor: pointer;
  border-radius: 3px;
  font: inherit;
}
.gk-filter-menu-set-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  padding: 4px;
}
.gk-filter-menu-set-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  font-size: 12px;
  cursor: pointer;
}
.gk-filter-menu-set-item:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-filter-menu-set-actions {
  display: flex;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;
}
.gk-filter-menu-set-actions a {
  cursor: pointer;
  color: var(--gk-focus-color, #1976d2);
  text-decoration: none;
}
.gk-filter-menu-set-actions a:hover {
  text-decoration: underline;
}

/* Grand total & subtotal rows */
.gk-row[data-grand-total="true"] {
  background: var(--gk-grand-total-bg, #e8eaf6);
  font-weight: 700;
  border-top: 2px solid var(--gk-border-color, #ddd);
}
.gk-row[data-subtotal="true"] {
  background: var(--gk-subtotal-bg, #f3f4f6);
  font-weight: 600;
  font-style: italic;
}

/* Group panel toolbar */
.gk-group-panel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  flex-wrap: wrap;
  font-size: 13px;
  flex-shrink: 0;
}
.gk-group-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 12px;
  background: var(--gk-bg, #fff);
}
.gk-group-chip-remove {
  cursor: pointer;
  font-size: 11px;
  opacity: 0.6;
}
.gk-group-chip-remove:hover {
  opacity: 1;
}
.gk-group-panel-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
.gk-group-panel-actions button {
  padding: 2px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
  cursor: pointer;
  border-radius: 3px;
  font: inherit;
  font-size: 12px;
}
.gk-group-panel-hint {
  color: var(--gk-text-muted, #888);
  font-style: italic;
}
.gk-group-panel-dragover {
  background: var(--gk-row-selected-bg, #e3f2fd);
  outline: 2px dashed var(--gk-focus-color, #1976d2);
  outline-offset: -2px;
}

/* Group toggle button in header */
.gk-group-btn {
  cursor: pointer;
  opacity: 0;
  font-size: 11px;
  margin-left: 4px;
  padding: 0 2px;
  transition: opacity 0.1s;
}
.gk-header-cell:hover .gk-group-btn,
.gk-group-btn[data-active="true"] {
  opacity: 0.6;
}
.gk-group-btn[data-active="true"] {
  color: var(--gk-focus-color, #1976d2);
}

/* Context menu */
.gk-context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--gk-bg, #fff);
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 180px;
  padding: 4px 0;
}
.gk-context-menu-item {
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}
.gk-context-menu-item:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-context-menu-item[data-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
}
.gk-context-menu-item[data-has-submenu="true"]::after {
  content: '\u25B6';
  margin-left: auto;
  font-size: 0.7em;
  opacity: 0.6;
}
.gk-menu-separator {
  height: 1px;
  background: var(--gk-border-color, #ddd);
  margin: 4px 0;
}
.gk-menu-shortcut {
  margin-left: auto;
  padding-left: 24px;
  color: var(--gk-text-muted, #999);
  font-size: 0.85em;
}

/* Field menu (header dropdown) */
.gk-field-menu {
  position: fixed;
  z-index: 9999;
  background: var(--gk-bg, #fff);
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 220px;
  padding: 4px 0;
}
.gk-field-menu-section {
  padding: 4px 12px;
  font-size: 0.8em;
  font-weight: 600;
  color: var(--gk-text-muted, #999);
  text-transform: uppercase;
  user-select: none;
}

/* Field menu button in header */
.gk-menu-btn {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 2px;
  font-size: 14px;
}
.gk-header-cell:hover .gk-menu-btn {
  opacity: 0.6;
}
.gk-menu-btn:hover {
  opacity: 1 !important;
}

/* Submenu positioning */
.gk-submenu {
  position: absolute;
  left: 100%;
  top: 0;
}

/* Draggable header cells */
.gk-header-cell[draggable="true"] {
  cursor: grab;
}
.gk-header-cell[draggable="true"]:active {
  cursor: grabbing;
}

/* Field resize handle */
.gk-header-cell {
  position: relative;
}
.gk-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 1;
}
.gk-resize-handle:hover {
  background: var(--gk-focus-color, #1976d2);
  opacity: 0.4;
}

/* Focused cell */
.gk-cell-focused {
  outline: 2px solid var(--gk-focus-color, #1976d2);
  outline-offset: -2px;
}

/* Grid focus outline suppression (focus ring is on cells, not the grid itself) */
.gk-grid:focus {
  outline: none;
}

/* Cell flash animation */
@keyframes gk-flash {
  0% { background: var(--gk-flash-color, #ffeb3b); }
  100% { background: var(--gk-flash-color, #ffeb3b); }
}
@keyframes gk-flash-fade {
  0% { background: var(--gk-flash-color, #ffeb3b); }
  100% { background: transparent; }
}
.gk-cell-flash {
  animation: gk-flash 0.3s ease-in;
}
.gk-cell-flash-fade {
  animation: gk-flash-fade 0.5s ease-out;
}

/* Virtual spacer for row virtualization */
.gk-virtual-spacer {
  position: relative;
  overflow: hidden;
}

/* Row alignment for virtualized rows */
.gk-row {
  align-items: center;
}

/* Grid body wrapper (sidebar + content) */
.gk-grid-body {
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
  min-height: 0;
}

.gk-grid-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: hidden;
  min-width: 0;
}

/* Side Bar */
.gk-sidebar {
  display: flex;
  flex-direction: row;
  border-left: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-bg, #fff);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}
.gk-sidebar-expanded {
  width: var(--gk-sidebar-width, 250px);
  min-width: var(--gk-sidebar-min-width, 200px);
  max-width: var(--gk-sidebar-max-width, 400px);
}

/* When sidebar is on the left */
.gk-grid-body > .gk-sidebar:first-child {
  border-left: none;
  border-right: 1px solid var(--gk-border-color, #ddd);
}

.gk-sidebar-buttons {
  display: flex;
  flex-direction: column;
  background: var(--gk-header-bg, #f8f9fa);
  border-left: 1px solid var(--gk-border-color, #ddd);
  flex-shrink: 0;
  order: 1;
}

.gk-grid-body > .gk-sidebar:first-child .gk-sidebar-buttons {
  border-left: none;
  border-right: 1px solid var(--gk-border-color, #ddd);
  order: -1;
}

.gk-sidebar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 32px;
  padding: 8px 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--gk-text-muted, #888);
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  writing-mode: vertical-rl;
  white-space: nowrap;
}
.gk-sidebar-btn-icon {
  font-size: 18px;
}
.gk-sidebar-btn-label {
  font-size: 15px;
}
.gk-sidebar-btn:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
  color: var(--gk-text-color, #222);
}
.gk-sidebar-btn-active {
  background: var(--gk-bg, #fff);
  color: var(--gk-focus-color, #1976d2);
  font-weight: 700;
}

.gk-sidebar-resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 2;
}
.gk-sidebar-resize-handle:hover {
  background: var(--gk-focus-color, #1976d2);
  opacity: 0.4;
}

/* When sidebar is on the left, resize handle goes on the right edge */
.gk-grid-body > .gk-sidebar:first-child .gk-sidebar-resize-handle {
  left: auto;
  right: 0;
}

.gk-sidebar-panel {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.gk-sidebar-panel-header {
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f9fa);
  flex-shrink: 0;
}

.gk-sidebar-panel-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px;
}

.gk-sidebar-panel-empty {
  padding: 20px 12px;
  color: var(--gk-text-muted, #888);
  text-align: center;
  font-style: italic;
}

/* Fields panel */
.gk-sidebar-search {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font: inherit;
  font-size: 12px;
  box-sizing: border-box;
  margin-bottom: 6px;
  outline: none;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
}
.gk-sidebar-search:focus {
  border-color: var(--gk-focus-color, #1976d2);
}

.gk-sidebar-field-list {
  display: flex;
  flex-direction: column;
}

.gk-sidebar-field-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  font-size: 12px;
  border-radius: 3px;
  cursor: grab;
}
.gk-sidebar-field-item:active {
  cursor: grabbing;
}
.gk-sidebar-field-item:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-sidebar-field-dragging {
  opacity: 0.4;
}
.gk-sidebar-field-dragover {
  border-top: 2px solid var(--gk-focus-color, #1976d2);
}

.gk-sidebar-field-handle {
  color: var(--gk-text-muted, #888);
  font-size: 10px;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
}

.gk-sidebar-field-item input[type="checkbox"] {
  margin: 0;
  flex-shrink: 0;
}

.gk-sidebar-field-label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gk-sidebar-field-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  height: 18px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  background: none;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--gk-text-muted, #888);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}
.gk-sidebar-field-item:hover .gk-sidebar-field-action {
  opacity: 1;
}
.gk-sidebar-field-action-active {
  opacity: 1;
  color: var(--gk-focus-color, #1976d2);
  border-color: var(--gk-focus-color, #1976d2);
  background: var(--gk-row-selected-bg, #e3f2fd);
}
.gk-sidebar-field-action:hover {
  opacity: 1;
  background: var(--gk-row-hover-bg, #f5f5f5);
}

/* Filters panel */
.gk-sidebar-filter-section {
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.gk-sidebar-filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.gk-sidebar-filter-header {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 0 6px;
  color: var(--gk-text-color, #222);
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  margin-bottom: 6px;
}
.gk-sidebar-filter-header-active {
  color: var(--gk-focus-color, #1976d2);
}

.gk-sidebar-filter-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gk-sidebar-filter-select,
.gk-sidebar-filter-input {
  width: 100%;
  padding: 3px 6px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font: inherit;
  font-size: 12px;
  box-sizing: border-box;
  outline: none;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
}
.gk-sidebar-filter-select:focus,
.gk-sidebar-filter-input:focus {
  border-color: var(--gk-focus-color, #1976d2);
}

.gk-sidebar-filter-actions {
  display: flex;
  gap: 4px;
}
.gk-sidebar-filter-actions button {
  padding: 2px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #222);
  cursor: pointer;
  border-radius: 3px;
  font: inherit;
  font-size: 11px;
}
.gk-sidebar-filter-actions button:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-sidebar-set-filter-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  padding: 4px;
}
.gk-sidebar-set-filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  font-size: 12px;
  cursor: pointer;
}
.gk-sidebar-set-filter-item:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-sidebar-set-filter-actions {
  display: flex;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;
}
.gk-sidebar-set-filter-actions a {
  cursor: pointer;
  color: var(--gk-focus-color, #1976d2);
  text-decoration: none;
}
.gk-sidebar-set-filter-actions a:hover {
  text-decoration: underline;
}

/* Charts */
.gk-charts-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}
.gk-charts-container:empty {
  display: none;
}
.gk-chart-wrapper {
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 4px;
  overflow: hidden;
  background: var(--gk-bg, #fff);
}
.gk-chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--gk-border-color, #ddd);
  background: var(--gk-header-bg, #f8f8f8);
  font-size: 13px;
}
.gk-chart-toolbar-title {
  font-weight: 600;
  color: var(--gk-text-color, #333);
}
.gk-chart-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.gk-chart-type-btn,
.gk-chart-action-btn {
  padding: 3px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #333);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
}
.gk-chart-type-btn:hover,
.gk-chart-action-btn:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-chart-type-btn-active {
  background: var(--gk-focus-color, #1976d2);
  color: #fff;
  border-color: var(--gk-focus-color, #1976d2);
}
.gk-chart-close-btn {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  padding: 2px 6px;
}
.gk-chart-area {
  min-height: 300px;
}

/* Chart creation dialog */
.gk-chart-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 30;
}
.gk-chart-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 31;
  background: var(--gk-bg, #fff);
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 6px;
  padding: 20px;
  min-width: 320px;
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: var(--gk-text-color, #333);
  font-family: inherit;
}
.gk-chart-dialog-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.gk-chart-dialog-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gk-chart-dialog-form label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gk-text-muted, #666);
}
.gk-chart-dialog-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #333);
}
.gk-chart-dialog-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 150px;
  overflow-y: auto;
}
.gk-chart-dialog-cb-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: normal;
  cursor: pointer;
  color: var(--gk-text-color, #333);
}
.gk-chart-dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.gk-chart-dialog-btn {
  padding: 6px 16px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 4px;
  background: var(--gk-bg, #fff);
  color: var(--gk-text-color, #333);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}
.gk-chart-dialog-btn:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-chart-dialog-btn-primary {
  background: var(--gk-focus-color, #1976d2);
  color: #fff;
  border-color: var(--gk-focus-color, #1976d2);
}
.gk-chart-dialog-btn-primary:hover {
  opacity: 0.9;
}

/* Charts panel tab */
.gk-chart-panel-create-btn {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px dashed var(--gk-border-color, #ddd);
  border-radius: 4px;
  background: transparent;
  color: var(--gk-focus-color, #1976d2);
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
}
.gk-chart-panel-create-btn:hover {
  background: var(--gk-row-hover-bg, #f5f5f5);
}
.gk-chart-panel-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gk-chart-panel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border: 1px solid var(--gk-border-color, #ddd);
  border-radius: 3px;
  font-size: 13px;
}
.gk-chart-panel-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gk-chart-panel-item-title {
  font-weight: 600;
  color: var(--gk-text-color, #333);
}
.gk-chart-panel-item-type {
  font-size: 11px;
  color: var(--gk-text-muted, #666);
}
.gk-chart-panel-delete-btn {
  border: none;
  background: transparent;
  color: var(--gk-text-muted, #666);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
}
.gk-chart-panel-delete-btn:hover {
  color: #d32f2f;
}
`;
var injected = false;
function injectStyles() {
  if (injected) {
    return;
  }
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}

// src/GridRenderer.ts
var FILTER_TYPES = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Not contains" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "greaterThan", label: "Greater than" },
  { value: "greaterThanOrEqual", label: "Greater than or equal" },
  { value: "lessThan", label: "Less than" },
  { value: "lessThanOrEqual", label: "Less than or equal" },
  { value: "between", label: "Between" },
  { value: "inSet", label: "In set" },
  { value: "blank", label: "Blank" },
  { value: "notBlank", label: "Not blank" }
];
var NO_VALUE_FILTERS = /* @__PURE__ */ new Set(["blank", "notBlank"]);
var TWO_VALUE_FILTERS = /* @__PURE__ */ new Set(["between"]);
var GridView = class {
  container;
  store;
  themeConfig;
  root;
  headerEl;
  bodyEl;
  pinnedTopEl;
  pinnedBottomEl;
  paginationEl;
  statusBarEl = null;
  statusPanelEls = /* @__PURE__ */ new Map();
  quickFilterInput;
  quickFilterClearBtn;
  groupPanelEl;
  unsubscribers = [];
  editingCell = null;
  activeFilterMenu = null;
  activeContextMenu = null;
  activeFieldMenu = null;
  escapeHandler = null;
  quickFilterTimer = null;
  // Chart state
  chartEngine = null;
  chartsContainerEl = null;
  chartCreationDialog = null;
  // Sidebar state
  sideBarWrapperEl = null;
  sideBarButtonsEl = null;
  sideBarPanelEl = null;
  sideBarResizeHandleEl = null;
  sideBarUserWidth = null;
  gridContentEl;
  // Field resize state
  resizingCol = null;
  resizeMoveHandler = null;
  resizeUpHandler = null;
  // Virtualization state
  scrollHandler = null;
  virtualSpacer = null;
  lastScrollTop = 0;
  // Pivot rendering helpers
  /** Returns true if pivot mode is active with at least one pivot and group field. */
  isPivotRendering() {
    const snap = this.store.snapshot();
    return snap.pivoting && snap.pivotFields.length > 0 && snap.groupFields.length > 0;
  }
  /**
   * Build the list of pivot result column descriptors for header/cell rendering.
   * Each descriptor has { fieldId, title, dataKey } matching the keys in aggData.
   */
  getPivotResultColumns() {
    return this.store.getPivotResultFields();
  }
  /** Get the group field (first field in groupFields) resolved to a ResolvedField. */
  getPivotGroupField() {
    const groupFieldId = this.store.snapshot().groupFields[0];
    return groupFieldId ? this.store.getField(groupFieldId) : void 0;
  }
  constructor(container, store, opts = {}) {
    this.container = container;
    this.store = store;
    if (opts.injectCss !== false) {
      injectStyles();
    }
    this.themeConfig = opts.theme;
    this.buildShell();
    if (this.themeConfig) {
      applyThemeToElement(this.root, this.themeConfig);
    }
    this.renderGroupPanel();
    this.renderHeader();
    this.renderPinnedRows();
    this.renderBody();
    this.renderPagination();
    this.renderSideBar();
    this.unsubscribers.push(
      this.store.events.on("snapshotChanged", () => this.refresh())
    );
    this.unsubscribers.push(
      this.store.events.on("cellHighlighted", (e) => this.handleCellFlash(e))
    );
    this.unsubscribers.push(
      this.store.events.on("contextMenuShown", (e) => {
        this.openContextMenuAt(e.rowKey, e.fieldId, e.clientX, e.clientY);
      })
    );
    this.unsubscribers.push(
      this.store.events.on("contextMenuDismissed", () => {
        this.closeContextMenu();
        this.closeFieldMenu();
      })
    );
    if (this.store.isChartsEnabled()) {
      this.chartEngine = new ChartEngine(this.store, {
        themeParams: opts.theme?.params
      });
      this.unsubscribers.push(
        this.store.events.on("chartCreated", ({ chartId }) => {
          this.mountChart(chartId);
        })
      );
      this.unsubscribers.push(
        this.store.events.on("chartDestroyed", ({ chartId }) => {
          this.removeChartContainer(chartId);
        })
      );
    }
  }
  // -------------------------------------------------------------------------
  // Shell
  // -------------------------------------------------------------------------
  buildShell() {
    this.root = el("div", { class: "gk-grid", tabindex: "0" });
    this.root.style.width = "100%";
    this.root.style.height = "100%";
    this.root.style.position = "relative";
    this.root.addEventListener("keydown", (e) => this.handleKeyDown(e));
    const quickFilterEl = el("div", { class: "gk-quick-filter" });
    if (!this.store.isSearchEnabled()) {
      quickFilterEl.style.display = "none";
    }
    this.quickFilterInput = document.createElement("input");
    this.quickFilterInput.type = "text";
    this.quickFilterInput.placeholder = "Filter...";
    this.quickFilterInput.addEventListener("input", () => {
      if (this.quickFilterTimer) {
        clearTimeout(this.quickFilterTimer);
      }
      this.quickFilterTimer = setTimeout(() => {
        this.store.setSearch(this.quickFilterInput.value);
      }, 150);
    });
    this.quickFilterClearBtn = el(
      "button",
      { class: "gk-quick-filter-clear" },
      ["\xD7"]
    );
    this.quickFilterClearBtn.style.display = "none";
    this.quickFilterClearBtn.addEventListener("click", () => {
      this.quickFilterInput.value = "";
      this.store.resetSearch();
    });
    quickFilterEl.append(this.quickFilterInput, this.quickFilterClearBtn);
    this.groupPanelEl = el("div", { class: "gk-group-panel" });
    this.groupPanelEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.groupPanelEl.classList.add("gk-group-panel-dragover");
    });
    this.groupPanelEl.addEventListener("dragleave", () => {
      this.groupPanelEl.classList.remove("gk-group-panel-dragover");
    });
    this.groupPanelEl.addEventListener("drop", (e) => {
      e.preventDefault();
      this.groupPanelEl.classList.remove("gk-group-panel-dragover");
      const colId = e.dataTransfer?.getData("text/plain");
      if (colId) {
        this.store.addGroupFields([colId]);
      }
    });
    this.headerEl = el("div", { class: "gk-header" });
    this.pinnedTopEl = el("div", { class: "gk-pinned-top" });
    this.bodyEl = el("div", { class: "gk-body" });
    this.pinnedBottomEl = el("div", { class: "gk-pinned-bottom" });
    this.gridContentEl = el("div", { class: "gk-grid-content" });
    this.buildStatusBar();
    if (this.store.isChartsEnabled()) {
      this.chartsContainerEl = el("div", { class: "gk-charts-container" });
    }
    this.gridContentEl.append(
      quickFilterEl,
      this.groupPanelEl,
      this.headerEl,
      this.pinnedTopEl,
      this.bodyEl,
      this.pinnedBottomEl
    );
    if (this.chartsContainerEl) {
      this.gridContentEl.append(this.chartsContainerEl);
    }
    if (this.statusBarEl) {
      this.gridContentEl.append(this.statusBarEl);
    }
    const sideBar = this.store.snapshot().panel;
    if (sideBar) {
      this.buildSideBar(sideBar);
    }
    const outerEl = el("div", { class: "gk-grid-body" });
    if (sideBar?.def.position === "left" && this.sideBarWrapperEl) {
      outerEl.append(this.sideBarWrapperEl, this.gridContentEl);
    } else if (this.sideBarWrapperEl) {
      outerEl.append(this.gridContentEl, this.sideBarWrapperEl);
    } else {
      outerEl.append(this.gridContentEl);
    }
    this.root.appendChild(outerEl);
    clearChildren(this.container);
    this.container.appendChild(this.root);
  }
  // -------------------------------------------------------------------------
  // Side Bar
  // -------------------------------------------------------------------------
  buildSideBar(sideBar) {
    const hasOpenPanel = sideBar.openTabId !== null;
    this.sideBarWrapperEl = el("div", {
      class: "gk-sidebar" + (hasOpenPanel ? " gk-sidebar-expanded" : "")
    });
    if (!sideBar.visible) {
      this.sideBarWrapperEl.style.display = "none";
    }
    const def = sideBar.def;
    if (def.width) {
      this.sideBarWrapperEl.style.setProperty(
        "--gk-sidebar-width",
        `${def.width}px`
      );
    }
    if (def.minWidth) {
      this.sideBarWrapperEl.style.setProperty(
        "--gk-sidebar-min-width",
        `${def.minWidth}px`
      );
    }
    if (def.maxWidth) {
      this.sideBarWrapperEl.style.setProperty(
        "--gk-sidebar-max-width",
        `${def.maxWidth}px`
      );
    }
    if (sideBar.def.showButtons) {
      this.sideBarButtonsEl = el("div", { class: "gk-sidebar-buttons" });
      this.sideBarWrapperEl.appendChild(this.sideBarButtonsEl);
    }
    this.sideBarResizeHandleEl = el("div", {
      class: "gk-sidebar-resize-handle"
    });
    this.sideBarResizeHandleEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.startSideBarResize(e.clientX);
    });
    this.sideBarWrapperEl.appendChild(this.sideBarResizeHandleEl);
    this.sideBarPanelEl = el("div", { class: "gk-sidebar-panel" });
    this.sideBarWrapperEl.appendChild(this.sideBarPanelEl);
  }
  sideBarResizeMoveHandler = null;
  sideBarResizeUpHandler = null;
  startSideBarResize(startX) {
    if (!this.sideBarWrapperEl) {
      return;
    }
    const startWidth = this.sideBarWrapperEl.getBoundingClientRect().width;
    const def = this.store.snapshot().panel?.def;
    const position = def?.position ?? "right";
    const minWidth = def?.minWidth ?? 200;
    const maxWidth = def?.maxWidth ?? 400;
    this.sideBarResizeMoveHandler = (e) => {
      const delta = position === "right" ? startX - e.clientX : e.clientX - startX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + delta)
      );
      this.sideBarWrapperEl.style.width = `${newWidth}px`;
    };
    this.sideBarResizeUpHandler = () => {
      if (this.sideBarResizeMoveHandler) {
        document.removeEventListener(
          "mousemove",
          this.sideBarResizeMoveHandler
        );
      }
      if (this.sideBarResizeUpHandler) {
        document.removeEventListener("mouseup", this.sideBarResizeUpHandler);
      }
      this.sideBarResizeMoveHandler = null;
      this.sideBarResizeUpHandler = null;
      if (this.sideBarWrapperEl) {
        const width = this.sideBarWrapperEl.getBoundingClientRect().width;
        this.sideBarUserWidth = width;
        this.store.events.emit("panelResized", { width });
      }
    };
    document.addEventListener("mousemove", this.sideBarResizeMoveHandler);
    document.addEventListener("mouseup", this.sideBarResizeUpHandler);
  }
  renderSideBar() {
    const sideBar = this.store.snapshot().panel;
    if (!sideBar || !this.sideBarWrapperEl) {
      return;
    }
    this.sideBarWrapperEl.style.display = sideBar.visible ? "" : "none";
    const hasOpenPanel = sideBar.openTabId !== null;
    this.sideBarWrapperEl.classList.toggle("gk-sidebar-expanded", hasOpenPanel);
    if (hasOpenPanel && this.sideBarUserWidth !== null) {
      this.sideBarWrapperEl.style.width = `${this.sideBarUserWidth}px`;
    } else if (!hasOpenPanel) {
      this.sideBarWrapperEl.style.width = "";
    }
    if (this.sideBarResizeHandleEl) {
      this.sideBarResizeHandleEl.style.display = hasOpenPanel ? "" : "none";
    }
    if (this.sideBarButtonsEl && sideBar.def.showButtons) {
      this.renderSideBarButtons(sideBar);
    }
    if (this.sideBarPanelEl) {
      this.renderSideBarPanel(sideBar);
    }
  }
  renderSideBarButtons(sideBar) {
    if (!this.sideBarButtonsEl) {
      return;
    }
    clearChildren(this.sideBarButtonsEl);
    for (const panel of sideBar.def.tabs) {
      const isActive = sideBar.openTabId === panel.id;
      const icon = el("span", { class: "gk-sidebar-btn-icon" }, [
        this.getSideBarIcon(panel)
      ]);
      const label = el("span", { class: "gk-sidebar-btn-label" }, [
        panel.labelDefault
      ]);
      const btn = el("button", {
        class: "gk-sidebar-btn" + (isActive ? " gk-sidebar-btn-active" : ""),
        title: panel.labelDefault,
        "data-panel-id": panel.id
      });
      btn.append(icon, label);
      btn.addEventListener("click", () => {
        if (isActive) {
          this.store.closePanelTab();
        } else {
          this.store.openPanelTab(panel.id);
        }
      });
      this.sideBarButtonsEl.appendChild(btn);
    }
  }
  getSideBarIcon(panel) {
    if (panel.id === "columns") {
      return "\u2630";
    }
    if (panel.id === "filters") {
      return "\u29A9";
    }
    if (panel.id === "charts") {
      return "\u2637";
    }
    return panel.labelDefault.charAt(0).toUpperCase();
  }
  renderSideBarPanel(sideBar) {
    if (!this.sideBarPanelEl) {
      return;
    }
    const scrollPositions = /* @__PURE__ */ new Map();
    for (const listEl of this.sideBarPanelEl.querySelectorAll(".gk-sidebar-set-filter-list")) {
      const colId = listEl.dataset.colId;
      if (colId && listEl.scrollTop > 0) {
        scrollPositions.set(colId, listEl.scrollTop);
      }
    }
    clearChildren(this.sideBarPanelEl);
    if (!sideBar.openTabId) {
      this.sideBarPanelEl.style.display = "none";
      return;
    }
    this.sideBarPanelEl.style.display = "";
    const panel = sideBar.def.tabs.find((p) => p.id === sideBar.openTabId);
    if (!panel) {
      return;
    }
    const header = el("div", { class: "gk-sidebar-panel-header" }, [
      panel.labelDefault
    ]);
    this.sideBarPanelEl.appendChild(header);
    const body = el("div", { class: "gk-sidebar-panel-body" });
    if (panel.id === "columns") {
      this.renderFieldsPanelContent(body);
    } else if (panel.id === "filters") {
      this.renderFiltersPanelContent(body);
    } else if (panel.id === "charts") {
      this.renderChartsPanelContent(body);
    } else {
      body.appendChild(
        el("div", { class: "gk-sidebar-panel-empty" }, [
          `${panel.labelDefault} panel`
        ])
      );
    }
    this.sideBarPanelEl.appendChild(body);
    for (const listEl of this.sideBarPanelEl.querySelectorAll(".gk-sidebar-set-filter-list")) {
      const colId = listEl.dataset.colId;
      if (colId && scrollPositions.has(colId)) {
        listEl.scrollTop = scrollPositions.get(colId);
      }
    }
  }
  renderFieldsPanelContent(body) {
    const state = this.store.snapshot();
    const columns = state.fields;
    const groupCols = state.groupFields;
    const pivotCols = state.pivotFields;
    const search = document.createElement("input");
    search.type = "text";
    search.placeholder = "Search fields...";
    search.className = "gk-sidebar-search";
    body.appendChild(search);
    const list = el("div", { class: "gk-sidebar-field-list" });
    const renderList = (filter) => {
      clearChildren(list);
      const lowerFilter = filter.toLowerCase();
      for (const col of columns) {
        if (lowerFilter && !col.title.toLowerCase().includes(lowerFilter)) {
          continue;
        }
        const item = el("div", {
          class: "gk-sidebar-field-item",
          draggable: "true"
        });
        item.dataset.colId = col.id;
        item.addEventListener("dragstart", (e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/x-gk-field-reorder", col.id);
          item.classList.add("gk-sidebar-field-dragging");
        });
        item.addEventListener("dragend", () => {
          item.classList.remove("gk-sidebar-field-dragging");
          for (const el2 of list.querySelectorAll(".gk-sidebar-field-dragover")) {
            el2.classList.remove("gk-sidebar-field-dragover");
          }
        });
        item.addEventListener("dragover", (e) => {
          if (!e.dataTransfer?.types.includes("text/x-gk-field-reorder")) {
            return;
          }
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          for (const el2 of list.querySelectorAll(".gk-sidebar-field-dragover")) {
            el2.classList.remove("gk-sidebar-field-dragover");
          }
          item.classList.add("gk-sidebar-field-dragover");
        });
        item.addEventListener("dragleave", () => {
          item.classList.remove("gk-sidebar-field-dragover");
        });
        item.addEventListener("drop", (e) => {
          e.preventDefault();
          item.classList.remove("gk-sidebar-field-dragover");
          const draggedColId = e.dataTransfer?.getData("text/x-gk-field-reorder");
          if (draggedColId && draggedColId !== col.id) {
            const targetIndex = columns.findIndex((c) => c.id === col.id);
            if (targetIndex !== -1) {
              this.store.reorderField(draggedColId, targetIndex);
            }
          }
        });
        const handle = el("span", { class: "gk-sidebar-field-handle" }, [
          "\u2847"
        ]);
        item.appendChild(handle);
        if (!col.fixedVisibility) {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = col.visible !== false;
          checkbox.addEventListener("change", () => {
            this.store.toggleFields([col.id], checkbox.checked);
          });
          item.appendChild(checkbox);
        }
        const label = el("span", { class: "gk-sidebar-field-label" }, [
          col.title
        ]);
        item.appendChild(label);
        const isGrouped = groupCols.includes(col.id);
        const groupBtn = el(
          "button",
          {
            class: "gk-sidebar-field-action" + (isGrouped ? " gk-sidebar-field-action-active" : ""),
            title: isGrouped ? "Remove grouping" : "Group by this field"
          },
          ["Group"]
        );
        groupBtn.addEventListener("click", () => {
          if (isGrouped) {
            this.store.removeGroupFields([col.id]);
          } else {
            this.store.addGroupFields([col.id]);
          }
        });
        item.appendChild(groupBtn);
        if (state.pivoting) {
          const isPivoted = pivotCols.includes(col.id);
          const pivotBtn = el(
            "button",
            {
              class: "gk-sidebar-field-action" + (isPivoted ? " gk-sidebar-field-action-active" : ""),
              title: isPivoted ? "Remove from pivot" : "Add to pivot"
            },
            ["P"]
          );
          pivotBtn.addEventListener("click", () => {
            if (isPivoted) {
              this.store.dispatch({
                type: "SET_PIVOT_FIELDS",
                fields: pivotCols.filter((c) => c !== col.id)
              });
            } else {
              this.store.dispatch({
                type: "SET_PIVOT_FIELDS",
                fields: [...pivotCols, col.id]
              });
            }
          });
          item.appendChild(pivotBtn);
        }
        list.appendChild(item);
      }
    };
    renderList("");
    search.addEventListener("input", () => renderList(search.value));
    body.appendChild(list);
  }
  renderFiltersPanelContent(body) {
    const columns = this.store.getVisibleFields();
    const filterModel = this.store.snapshot().filters;
    for (const col of columns) {
      const existing = filterModel[col.id];
      const section = el("div", { class: "gk-sidebar-filter-section" });
      const header = el("div", { class: "gk-sidebar-filter-header" }, [
        col.title
      ]);
      if (existing) {
        header.classList.add("gk-sidebar-filter-header-active");
      }
      section.appendChild(header);
      if (col.filter === "set") {
        this.renderSetFilterControls(section, col, existing);
      } else {
        this.renderTextFilterControls(section, col, existing);
      }
      body.appendChild(section);
    }
  }
  renderTextFilterControls(section, col, existing) {
    const controls = el("div", { class: "gk-sidebar-filter-controls" });
    const typeSelect = document.createElement("select");
    typeSelect.className = "gk-sidebar-filter-select";
    let currentType = "contains";
    let currentValue = "";
    if (existing && !("filterType" in existing)) {
      currentType = existing.type;
      if (existing.filter != null) {
        currentValue = String(existing.filter);
      }
    }
    for (const ft of FILTER_TYPES) {
      const opt = document.createElement("option");
      opt.value = ft.value;
      opt.textContent = ft.label;
      if (ft.value === currentType) {
        opt.selected = true;
      }
      typeSelect.appendChild(opt);
    }
    controls.appendChild(typeSelect);
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Filter value...";
    valueInput.value = currentValue;
    valueInput.className = "gk-sidebar-filter-input";
    const updateVisibility = () => {
      const type = typeSelect.value;
      valueInput.style.display = NO_VALUE_FILTERS.has(type) ? "none" : "";
    };
    updateVisibility();
    typeSelect.addEventListener("change", updateVisibility);
    controls.appendChild(valueInput);
    const actions = el("div", { class: "gk-sidebar-filter-actions" });
    const applyBtn = el("button", {}, ["Apply"]);
    applyBtn.addEventListener("click", () => {
      const type = typeSelect.value;
      let filter = valueInput.value;
      if ([
        "greaterThan",
        "lessThan",
        "greaterThanOrEqual",
        "lessThanOrEqual",
        "equals",
        "notEquals"
      ].includes(type)) {
        const num = Number(filter);
        if (!isNaN(num) && filter !== "") {
          filter = num;
        }
      }
      if (type === "inSet") {
        filter = valueInput.value.split(",").map((s) => s.trim()).filter(Boolean);
      }
      this.store.setFieldFilter(col.id, { type, filter });
    });
    const clearBtn = el("button", {}, ["Clear"]);
    clearBtn.addEventListener("click", () => {
      this.store.destroyFilter(col.id);
    });
    actions.append(applyBtn, clearBtn);
    controls.appendChild(actions);
    section.appendChild(controls);
  }
  renderSetFilterControls(section, col, existing) {
    const controls = el("div", { class: "gk-sidebar-filter-controls" });
    const distinctValues = /* @__PURE__ */ new Set();
    for (const node of this.store.getEntries()) {
      const val = readCellValue(node.data, col);
      if (Array.isArray(val)) {
        for (const v of val) {
          if (v != null && v !== "") distinctValues.add(String(v));
        }
      } else if (val != null && val !== "") {
        distinctValues.add(String(val));
      }
    }
    const allValues = [...distinctValues].sort();
    const hasExistingFilter = existing && !("filterType" in existing) && existing.type === "inSet" && Array.isArray(existing.filter);
    const selectedSet = new Set(
      hasExistingFilter ? existing.filter.map((v) => String(v)) : allValues
    );
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    searchInput.className = "gk-sidebar-filter-input";
    controls.appendChild(searchInput);
    const bulkActions = el("div", { class: "gk-sidebar-set-filter-actions" });
    const selectAllLink = document.createElement("a");
    selectAllLink.textContent = "Select All";
    const deselectAllLink = document.createElement("a");
    deselectAllLink.textContent = "Deselect All";
    bulkActions.append(selectAllLink, deselectAllLink);
    controls.appendChild(bulkActions);
    const list = el("div", { class: "gk-sidebar-set-filter-list", "data-col-id": col.id });
    const checkboxes = [];
    for (const value of allValues) {
      const label = document.createElement("label");
      label.className = "gk-sidebar-set-filter-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedSet.has(value);
      const span = document.createElement("span");
      span.textContent = value;
      label.append(checkbox, span);
      list.appendChild(label);
      checkboxes.push({ value, checkbox, label });
    }
    controls.appendChild(list);
    const applySetFilter = () => {
      const checked = checkboxes.filter((c) => c.checkbox.checked).map((c) => c.value);
      if (checked.length === allValues.length) {
        this.store.destroyFilter(col.id);
      } else {
        this.store.setFieldFilter(col.id, {
          type: "inSet",
          filter: checked
        });
      }
    };
    for (const { checkbox } of checkboxes) {
      checkbox.addEventListener("change", applySetFilter);
    }
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      for (const { value, label } of checkboxes) {
        label.style.display = value.toLowerCase().includes(query) ? "" : "none";
      }
    });
    selectAllLink.addEventListener("click", (e) => {
      e.preventDefault();
      for (const { checkbox, label } of checkboxes) {
        if (label.style.display !== "none") {
          checkbox.checked = true;
        }
      }
      applySetFilter();
    });
    deselectAllLink.addEventListener("click", (e) => {
      e.preventDefault();
      for (const { checkbox, label } of checkboxes) {
        if (label.style.display !== "none") {
          checkbox.checked = false;
        }
      }
      applySetFilter();
    });
    const actions = el("div", { class: "gk-sidebar-filter-actions" });
    const clearBtn = el("button", {}, ["Clear"]);
    clearBtn.addEventListener("click", () => {
      for (const { checkbox } of checkboxes) {
        checkbox.checked = true;
      }
      this.store.destroyFilter(col.id);
    });
    actions.appendChild(clearBtn);
    controls.appendChild(actions);
    section.appendChild(controls);
  }
  // -------------------------------------------------------------------------
  // Quick filter sync
  // -------------------------------------------------------------------------
  syncQuickFilter() {
    if (document.activeElement !== this.quickFilterInput) {
      this.quickFilterInput.value = this.store.getSearchText();
    }
    this.quickFilterClearBtn.style.display = this.store.isSearchPresent() ? "" : "none";
  }
  // -------------------------------------------------------------------------
  // Group panel
  // -------------------------------------------------------------------------
  renderGroupPanel() {
    clearChildren(this.groupPanelEl);
    if (!this.store.getConfig("enableRowGroupPanel")) {
      this.groupPanelEl.style.display = "none";
      return;
    }
    this.groupPanelEl.style.display = "";
    const state = this.store.snapshot();
    const groupCols = state.groupFields;
    if (groupCols.length === 0) {
      const hint = el("span", { class: "gk-group-panel-hint" }, [
        "Drag a field header here to group"
      ]);
      this.groupPanelEl.appendChild(hint);
      return;
    }
    for (const colId of groupCols) {
      const col = state.fields.find((c) => c.id === colId);
      const name = col?.title ?? colId;
      const removeBtn = el("span", { class: "gk-group-chip-remove" }, [
        "\xD7"
      ]);
      removeBtn.addEventListener("click", () => {
        this.store.removeGroupFields([colId]);
      });
      const chip = el("span", { class: "gk-group-chip" }, [name]);
      chip.appendChild(removeBtn);
      this.groupPanelEl.appendChild(chip);
    }
    const actions = el("span", { class: "gk-group-panel-actions" });
    const expandBtn = el("button", {}, ["Expand All"]);
    expandBtn.addEventListener("click", () => this.store.expandAll());
    const collapseBtn = el("button", {}, ["Collapse All"]);
    collapseBtn.addEventListener("click", () => this.store.collapseAll());
    actions.append(expandBtn, collapseBtn);
    this.groupPanelEl.appendChild(actions);
  }
  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  renderHeader() {
    clearChildren(this.headerEl);
    if (this.isPivotRendering()) {
      this.renderPivotHeader();
      return;
    }
    const columns = this.store.getVisibleFields();
    const sortModel = this.store.getSortRules();
    const groupCols = this.store.snapshot().groupFields;
    for (const col of columns) {
      const sortItem = sortModel.find((s) => s.id === col.id);
      const sortIndex = sortModel.findIndex((s) => s.id === col.id);
      const sortIndicator = sortItem ? (sortItem.sort === "asc" ? " \u25B2" : " \u25BC") + (sortModel.length > 1 ? `${sortIndex + 1}` : "") : "";
      const hasFilter = this.store.getFieldFilter(col.id) !== void 0;
      const isGrouped = groupCols.includes(col.id);
      const cell = el("div", {
        class: "gk-header-cell" + (col.titleClass ? ` ${col.titleClass}` : ""),
        "data-col-id": col.id,
        "data-sortable": String(col.sortable),
        draggable: "true"
      });
      applyCellSizing(cell, col);
      if (col.titleStyle) {
        for (const [prop, val] of Object.entries(col.titleStyle)) {
          cell.style[prop] = val;
        }
        if (col.titleStyle.textAlign === "right") {
          cell.dataset.align = "right";
        }
      }
      if (col.titleTooltip) {
        cell.title = col.titleTooltip;
      }
      cell.addEventListener("dragstart", (e) => {
        e.dataTransfer?.setData("text/plain", col.id);
      });
      const label = el("span", { class: "gk-header-label" }, [col.title]);
      if (sortIndicator) {
        const indicator = el("span", { class: "gk-sort-indicator" }, [
          sortIndicator
        ]);
        label.appendChild(indicator);
      }
      cell.appendChild(label);
      if (!this.store.getConfig("suppressColumnMenu") || this.store.getConfig("enableRowGroupPanel")) {
        const groupBtn = el(
          "span",
          {
            class: "gk-group-btn",
            "data-active": String(isGrouped),
            title: isGrouped ? "Ungroup" : "Group by this field"
          },
          ["\u2630"]
        );
        groupBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isGrouped) {
            this.store.removeGroupFields([col.id]);
          } else {
            this.store.addGroupFields([col.id]);
          }
        });
        cell.appendChild(groupBtn);
      }
      const filterBtn = el(
        "span",
        {
          class: "gk-filter-btn",
          "data-active": String(hasFilter)
        },
        ["\u29A9"]
      );
      filterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openFilterMenu(col, cell);
      });
      cell.appendChild(filterBtn);
      if (!this.store.getConfig("suppressColumnMenu")) {
        const menuBtn = el(
          "span",
          {
            class: "gk-menu-btn",
            title: "Field menu"
          },
          ["\u22EE"]
        );
        menuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.openFieldMenu(col, cell);
        });
        cell.appendChild(menuBtn);
      }
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openHeaderContextMenu(col, e.clientX, e.clientY);
      });
      if (col.sortable) {
        cell.addEventListener("click", (e) => this.handleHeaderClick(col, e));
      }
      if (col.resizable) {
        const resizeHandle = el("div", { class: "gk-resize-handle" });
        resizeHandle.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const actualWidth = cell.getBoundingClientRect().width;
          this.startFieldResize(col.id, actualWidth, e.clientX);
        });
        resizeHandle.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        resizeHandle.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          this.autoSizeFieldToFit(col);
        });
        cell.appendChild(resizeHandle);
      }
      this.headerEl.appendChild(cell);
    }
  }
  handleHeaderClick(col, event) {
    const currentSort = this.store.getSortRules();
    const existing = currentSort.find((s) => s.id === col.id);
    const multiSort = event.shiftKey;
    if (!existing) {
      if (multiSort) {
        this.store.setSortRules([
          ...currentSort,
          { id: col.id, sort: "asc" }
        ]);
      } else {
        this.store.setSortRules([{ id: col.id, sort: "asc" }]);
      }
    } else if (existing.sort === "asc") {
      const updated = multiSort ? currentSort.map(
        (s) => s.id === col.id ? { ...s, sort: "desc" } : s
      ) : [{ id: col.id, sort: "desc" }];
      this.store.setSortRules(updated);
    } else {
      const updated = multiSort ? currentSort.filter((s) => s.id !== col.id) : [];
      this.store.setSortRules(updated);
    }
  }
  // -------------------------------------------------------------------------
  // Pivot header & group row rendering
  // -------------------------------------------------------------------------
  renderPivotHeader() {
    const groupField = this.getPivotGroupField();
    const pivotCols = this.getPivotResultColumns();
    if (groupField) {
      const cell = el("div", {
        class: "gk-header-cell",
        "data-col-id": groupField.id
      });
      cell.style.flex = "1";
      const label = el("span", { class: "gk-header-label" }, [groupField.title]);
      cell.appendChild(label);
      this.headerEl.appendChild(cell);
    }
    for (const pc of pivotCols) {
      const cell = el("div", {
        class: "gk-header-cell",
        "data-col-id": pc.fieldId
      });
      cell.style.flex = "1";
      cell.style.textAlign = "right";
      const label = el("span", { class: "gk-header-label" }, [pc.title]);
      label.style.textAlign = "right";
      cell.appendChild(label);
      this.headerEl.appendChild(cell);
    }
  }
  renderPivotGroupRow(rowEl, node) {
    const groupField = this.getPivotGroupField();
    const pivotCols = this.getPivotResultColumns();
    const labelCell = el("div", { class: "gk-cell" });
    labelCell.style.flex = "1";
    const level = node.level ?? 0;
    labelCell.style.paddingLeft = `${12 + Math.max(0, level) * 20}px`;
    const expandIcon = node.expanded ? "\u25BC" : "\u25B6";
    const toggle = el("span", { class: "gk-group-expand" }, [expandIcon]);
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.store.setEntryExpanded(node.id, !node.expanded);
    });
    labelCell.appendChild(toggle);
    const labelText = `${String(node.groupValue)} (${node.childCount})`;
    labelCell.appendChild(el("span", {}, [labelText]));
    rowEl.appendChild(labelCell);
    for (const pc of pivotCols) {
      const valueCell = el("div", { class: "gk-cell" });
      valueCell.style.flex = "1";
      valueCell.style.textAlign = "right";
      const val = node.aggData?.[pc.dataKey];
      valueCell.textContent = val != null ? String(val) : "";
      rowEl.appendChild(valueCell);
    }
  }
  // -------------------------------------------------------------------------
  // Field filter menu
  // -------------------------------------------------------------------------
  openFilterMenu(col, anchorEl) {
    this.closeFilterMenu();
    const menuEl = el("div", { class: "gk-filter-menu" });
    const anchorRect = anchorEl.getBoundingClientRect();
    menuEl.style.top = `${anchorRect.bottom}px`;
    menuEl.style.left = `${anchorRect.left}px`;
    const existing = this.store.getFieldFilter(col.id);
    if (col.filter === "set") {
      this.buildSetFilterMenu(menuEl, col, existing);
    } else {
      this.buildTextFilterMenu(menuEl, col, existing);
    }
    document.body.appendChild(menuEl);
    const outsideHandler = (e) => {
      if (!menuEl.contains(e.target)) {
        this.closeFilterMenu();
      }
    };
    setTimeout(() => document.addEventListener("click", outsideHandler), 0);
    this.activeFilterMenu = { colId: col.id, menuEl, outsideHandler };
  }
  buildSetFilterMenu(menuEl, col, existing) {
    const distinctValues = /* @__PURE__ */ new Set();
    for (const node of this.store.getEntries()) {
      const val = readCellValue(node.data, col);
      if (Array.isArray(val)) {
        for (const v of val) {
          if (v != null && v !== "") distinctValues.add(String(v));
        }
      } else if (val != null && val !== "") {
        distinctValues.add(String(val));
      }
    }
    const allValues = [...distinctValues].sort();
    const hasExistingFilter = existing && !("filterType" in existing) && existing.type === "inSet" && Array.isArray(existing.filter);
    const selectedSet = new Set(
      hasExistingFilter ? existing.filter.map((v) => String(v)) : allValues
    );
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    searchInput.className = "gk-filter-menu-input";
    menuEl.appendChild(searchInput);
    const bulkActions = el("div", { class: "gk-filter-menu-set-actions" });
    const selectAllLink = document.createElement("a");
    selectAllLink.textContent = "Select All";
    const deselectAllLink = document.createElement("a");
    deselectAllLink.textContent = "Deselect All";
    bulkActions.append(selectAllLink, deselectAllLink);
    menuEl.appendChild(bulkActions);
    const list = el("div", { class: "gk-filter-menu-set-list" });
    const checkboxes = [];
    for (const value of allValues) {
      const label = document.createElement("label");
      label.className = "gk-filter-menu-set-item";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedSet.has(value);
      const span = document.createElement("span");
      span.textContent = value;
      label.append(checkbox, span);
      list.appendChild(label);
      checkboxes.push({ value, checkbox, label });
    }
    menuEl.appendChild(list);
    const applySetFilter = () => {
      const checked = checkboxes.filter((c) => c.checkbox.checked).map((c) => c.value);
      if (checked.length === allValues.length) {
        this.store.destroyFilter(col.id);
      } else {
        this.store.setFieldFilter(col.id, {
          type: "inSet",
          filter: checked
        });
      }
    };
    for (const { checkbox } of checkboxes) {
      checkbox.addEventListener("change", applySetFilter);
    }
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      for (const { value, label } of checkboxes) {
        label.style.display = value.toLowerCase().includes(query) ? "" : "none";
      }
    });
    selectAllLink.addEventListener("click", (e) => {
      e.preventDefault();
      for (const { checkbox, label } of checkboxes) {
        if (label.style.display !== "none") checkbox.checked = true;
      }
      applySetFilter();
    });
    deselectAllLink.addEventListener("click", (e) => {
      e.preventDefault();
      for (const { checkbox, label } of checkboxes) {
        if (label.style.display !== "none") checkbox.checked = false;
      }
      applySetFilter();
    });
    const actions = el("div", { class: "gk-filter-menu-actions" });
    const clearBtn = el("button", {}, ["Clear"]);
    clearBtn.addEventListener("click", () => {
      for (const { checkbox } of checkboxes) {
        checkbox.checked = true;
      }
      this.store.destroyFilter(col.id);
      this.closeFilterMenu();
    });
    actions.appendChild(clearBtn);
    menuEl.appendChild(actions);
  }
  buildTextFilterMenu(menuEl, col, existing) {
    let currentType = "contains";
    let currentValue = "";
    let currentValue2 = "";
    if (existing && !("filterType" in existing)) {
      currentType = existing.type;
      if (currentType === "between" && Array.isArray(existing.filter)) {
        currentValue = String(existing.filter[0] ?? "");
        currentValue2 = String(existing.filter[1] ?? "");
      } else if (currentType === "inSet" && Array.isArray(existing.filter)) {
        currentValue = existing.filter.join(", ");
      } else {
        currentValue = existing.filter != null ? String(existing.filter) : "";
      }
    }
    const typeSelect = document.createElement("select");
    for (const ft of FILTER_TYPES) {
      const opt = document.createElement("option");
      opt.value = ft.value;
      opt.textContent = ft.label;
      if (ft.value === currentType) {
        opt.selected = true;
      }
      typeSelect.appendChild(opt);
    }
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Filter value...";
    valueInput.value = currentValue;
    const valueInput2 = document.createElement("input");
    valueInput2.type = "text";
    valueInput2.placeholder = "To value...";
    valueInput2.value = currentValue2;
    const updateInputVisibility = () => {
      const type = typeSelect.value;
      valueInput.style.display = NO_VALUE_FILTERS.has(type) ? "none" : "";
      valueInput2.style.display = TWO_VALUE_FILTERS.has(type) ? "" : "none";
      if (type === "inSet") {
        valueInput.placeholder = "Comma-separated values...";
      } else {
        valueInput.placeholder = "Filter value...";
      }
    };
    updateInputVisibility();
    typeSelect.addEventListener("change", updateInputVisibility);
    const actions = el("div", { class: "gk-filter-menu-actions" });
    const applyBtn = el("button", {}, ["Apply"]);
    applyBtn.addEventListener("click", () => {
      const type = typeSelect.value;
      let filter = valueInput.value;
      if ([
        "greaterThan",
        "lessThan",
        "greaterThanOrEqual",
        "lessThanOrEqual",
        "equals",
        "notEquals"
      ].includes(type)) {
        const num = Number(filter);
        if (!isNaN(num) && filter !== "") {
          filter = num;
        }
      }
      if (type === "between") {
        const from = Number(valueInput.value);
        const to = Number(valueInput2.value);
        filter = [
          isNaN(from) ? valueInput.value : from,
          isNaN(to) ? valueInput2.value : to
        ];
      }
      if (type === "inSet") {
        filter = valueInput.value.split(",").map((s) => s.trim()).filter(Boolean);
      }
      this.store.setFieldFilter(col.id, { type, filter });
      this.closeFilterMenu();
    });
    const clearBtn = el("button", {}, ["Clear"]);
    clearBtn.addEventListener("click", () => {
      this.store.destroyFilter(col.id);
      this.closeFilterMenu();
    });
    actions.append(applyBtn, clearBtn);
    menuEl.append(typeSelect, valueInput, valueInput2, actions);
  }
  closeFilterMenu() {
    if (!this.activeFilterMenu) {
      return;
    }
    this.activeFilterMenu.menuEl.remove();
    document.removeEventListener("click", this.activeFilterMenu.outsideHandler);
    this.activeFilterMenu = null;
  }
  // -------------------------------------------------------------------------
  // Menu system (context menu + field menu)
  // -------------------------------------------------------------------------
  /**
   * Resolve a built-in action name to a MenuEntry, given the current context.
   */
  resolveBuiltInAction(action, context) {
    const { col, node } = context;
    const isGrouped = col ? this.store.snapshot().groupFields.includes(col.id) : false;
    const locked = col ? this.store.getFields().find((c) => c.id === col.id)?.locked : void 0;
    switch (action) {
      case "separator":
        return { name: "__separator__" };
      case "copy":
        return {
          name: "Copy",
          shortcut: "Ctrl+C",
          callback: () => {
            const copyData = this.store.getCopyData();
            if (copyData) {
              navigator.clipboard.writeText(copyData).catch(() => {
              });
            }
          }
        };
      case "cut":
        return {
          name: "Cut",
          shortcut: "Ctrl+X",
          callback: () => {
            const copyData = this.store.getCopyData();
            if (copyData) {
              navigator.clipboard.writeText(copyData).catch(() => {
              });
            }
          }
        };
      case "paste":
        return {
          name: "Paste",
          shortcut: "Ctrl+V",
          disabled: !node || !col?.editable,
          callback: () => {
            if (!node || !col) return;
            navigator.clipboard.readText().then((text) => {
              this.store.pasteData(text, node.id, col.id);
            }).catch(() => {
            });
          }
        };
      case "sortAscending":
        return col?.sortable ? {
          name: "Sort Ascending",
          callback: () => this.store.setSortRules([{ id: col.id, sort: "asc" }])
        } : null;
      case "sortDescending":
        return col?.sortable ? {
          name: "Sort Descending",
          callback: () => this.store.setSortRules([{ id: col.id, sort: "desc" }])
        } : null;
      case "pinLeft":
        return col ? {
          name: "Pin Left",
          disabled: locked === "left",
          callback: () => this.store.lockField(col.id, "left")
        } : null;
      case "pinRight":
        return col ? {
          name: "Pin Right",
          disabled: locked === "right",
          callback: () => this.store.lockField(col.id, "right")
        } : null;
      case "unpinColumn":
        return col && locked ? {
          name: "Unpin Field",
          callback: () => this.store.lockField(col.id, false)
        } : null;
      case "autoSizeColumn":
        return col ? {
          name: "Auto-size Field",
          callback: () => this.store.autoSizeFields([col.id])
        } : null;
      case "autoSizeAllColumns":
        return {
          name: "Auto-size All Fields",
          callback: () => this.store.autoSizeAllFields()
        };
      case "resetColumns":
        return {
          name: "Reset Fields",
          callback: () => this.store.autoSizeAllFields()
        };
      case "groupByColumn":
        return col && !isGrouped ? {
          name: `Group by ${col.title}`,
          callback: () => this.store.addGroupFields([col.id])
        } : null;
      case "ungroupByColumn":
        return col && isGrouped ? {
          name: `Ungroup by ${col.title}`,
          callback: () => this.store.removeGroupFields([col.id])
        } : null;
      case "expandAll":
        return {
          name: "Expand All",
          callback: () => this.store.expandAll()
        };
      case "collapseAll":
        return {
          name: "Collapse All",
          callback: () => this.store.collapseAll()
        };
      case "exportCsv":
        return {
          name: "Export CSV",
          callback: () => this.exportDataAsCsv()
        };
      case "hideColumn":
        return col ? {
          name: "Hide Field",
          callback: () => this.store.toggleFields([col.id], false)
        } : null;
      case "chartRange":
        return this.store.isChartsEnabled() ? {
          name: "Chart Selection\u2026",
          disabled: this.store.getCellSpans().length === 0 && !node,
          callback: () => {
            this.openChartCreationDialog();
          }
        } : null;
      default:
        return null;
    }
  }
  /**
   * Build a menu DOM element from an array of MenuEntry or built-in action strings.
   */
  buildMenuElement(items, context, cssClass = "gk-context-menu") {
    const menuEl = el("div", { class: cssClass });
    for (const item of items) {
      const def = typeof item === "string" ? this.resolveBuiltInAction(item, context) : item;
      if (!def) continue;
      if (def.name === "__separator__" || def.action === "separator") {
        menuEl.appendChild(el("div", { class: "gk-menu-separator" }));
        continue;
      }
      const itemEl = el("div", {
        class: "gk-context-menu-item",
        ...def.disabled ? { "data-disabled": "true" } : {},
        ...def.subMenu?.length ? { "data-has-submenu": "true" } : {}
      });
      const labelEl = el("span", {}, [def.name]);
      itemEl.appendChild(labelEl);
      if (def.shortcut) {
        const shortcutEl = el("span", { class: "gk-menu-shortcut" }, [
          def.shortcut
        ]);
        itemEl.appendChild(shortcutEl);
      }
      if (def.callback && !def.disabled && !def.subMenu?.length) {
        itemEl.addEventListener("click", () => {
          def.callback();
          this.closeContextMenu();
          this.closeFieldMenu();
        });
      }
      if (def.subMenu?.length) {
        let subMenuEl = null;
        itemEl.addEventListener("mouseenter", () => {
          subMenuEl = this.buildMenuElement(
            def.subMenu,
            context,
            "gk-context-menu gk-submenu"
          );
          itemEl.style.position = "relative";
          itemEl.appendChild(subMenuEl);
        });
        itemEl.addEventListener("mouseleave", () => {
          subMenuEl?.remove();
          subMenuEl = null;
        });
      }
      menuEl.appendChild(itemEl);
    }
    return menuEl;
  }
  /**
   * Get default context menu items for header right-click.
   */
  getDefaultHeaderContextMenuItems(col) {
    const items = [];
    if (col.sortable) {
      items.push("sortAscending", "sortDescending", "separator");
    }
    items.push("pinLeft", "pinRight");
    const locked = this.store.getFields().find((c) => c.id === col.id)?.locked;
    if (locked) {
      items.push("unpinColumn");
    }
    items.push("separator");
    const isGrouped = this.store.snapshot().groupFields.includes(col.id);
    items.push(isGrouped ? "ungroupByColumn" : "groupByColumn");
    items.push("separator", "autoSizeColumn", "autoSizeAllColumns");
    items.push("separator", "hideColumn");
    return items;
  }
  /**
   * Get default context menu items for cell right-click.
   */
  getDefaultCellContextMenuItems(_node, _col) {
    const items = [
      "copy",
      "cut",
      "paste",
      "separator",
      "exportCsv"
    ];
    if (this.store.isChartsEnabled()) {
      items.push("separator", "chartRange");
    }
    return items;
  }
  /**
   * Open context menu at a specific position (used by both header and cell right-click,
   * and by the programmatic showContextMenu API).
   */
  openContextMenuAt(rowId, colId, clientX, clientY) {
    if (!this.store.getConfig("contextMenu")) return;
    this.closeContextMenu();
    this.closeFieldMenu();
    const col = colId ? this.store.getFields().find((c) => c.id === colId) ?? null : null;
    const node = rowId ? this.store.getEntry(rowId) ?? null : null;
    const customItemsFn = this.store.getConfig("contextMenuBuilder");
    let items;
    if (customItemsFn) {
      const value = node && col ? readCellValue(node.data, col) : void 0;
      items = customItemsFn({ node, column: col, value });
    } else if (node && col) {
      items = this.getDefaultCellContextMenuItems(node, col);
    } else if (col) {
      items = this.getDefaultHeaderContextMenuItems(col);
    } else {
      items = ["exportCsv"];
    }
    const context = {
      col: col ?? void 0,
      node: node ?? void 0
    };
    const menuEl = this.buildMenuElement(items, context);
    menuEl.style.top = `${clientY}px`;
    menuEl.style.left = `${clientX}px`;
    document.body.appendChild(menuEl);
    const outsideHandler = (e) => {
      if (!menuEl.contains(e.target)) {
        this.closeContextMenu();
      }
    };
    setTimeout(() => document.addEventListener("click", outsideHandler), 0);
    this.activeContextMenu = { menuEl, outsideHandler };
  }
  openHeaderContextMenu(col, clientX, clientY) {
    this.openContextMenuAt(null, col.id, clientX, clientY);
  }
  openCellContextMenu(node, col, clientX, clientY) {
    this.openContextMenuAt(node.id, col.id, clientX, clientY);
  }
  closeContextMenu() {
    if (!this.activeContextMenu) {
      return;
    }
    this.activeContextMenu.menuEl.remove();
    document.removeEventListener(
      "click",
      this.activeContextMenu.outsideHandler
    );
    this.activeContextMenu = null;
  }
  // -------------------------------------------------------------------------
  // Field menu (header dropdown)
  // -------------------------------------------------------------------------
  openFieldMenu(col, anchorEl) {
    if (this.store.getConfig("suppressColumnMenu")) return;
    if (this.activeFieldMenu?.colId === col.id) {
      this.closeFieldMenu();
      return;
    }
    this.closeFieldMenu();
    this.closeContextMenu();
    const customItemsFn = this.store.getConfig("fieldMenuBuilder");
    let items;
    if (customItemsFn) {
      items = customItemsFn({ column: col });
    } else {
      items = this.getDefaultHeaderContextMenuItems(col);
    }
    const menuEl = this.buildMenuElement(items, { col }, "gk-field-menu");
    const anchorRect = anchorEl.getBoundingClientRect();
    menuEl.style.top = `${anchorRect.bottom}px`;
    menuEl.style.left = `${anchorRect.left}px`;
    document.body.appendChild(menuEl);
    this.store.events.emit("fieldMenuShown", { fieldId: col.id });
    const outsideHandler = (e) => {
      if (!menuEl.contains(e.target)) {
        this.closeFieldMenu();
      }
    };
    setTimeout(() => document.addEventListener("click", outsideHandler), 0);
    this.activeFieldMenu = { colId: col.id, menuEl, outsideHandler };
  }
  closeFieldMenu() {
    if (!this.activeFieldMenu) {
      return;
    }
    const colId = this.activeFieldMenu.colId;
    this.activeFieldMenu.menuEl.remove();
    document.removeEventListener(
      "click",
      this.activeFieldMenu.outsideHandler
    );
    this.activeFieldMenu = null;
    this.store.events.emit("fieldMenuDismissed", { fieldId: colId });
  }
  // -------------------------------------------------------------------------
  // Body rows (virtualized)
  // -------------------------------------------------------------------------
  renderBody() {
    if (this.scrollHandler) {
      this.bodyEl.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
    clearChildren(this.bodyEl);
    const rows = this.store.getVisibleRows();
    const columns = this.store.getVisibleFields();
    if (rows.length === 0) {
      this.virtualSpacer = null;
      const overlay = el("div", { class: "gk-overlay" }, [
        "No rows to display"
      ]);
      this.bodyEl.appendChild(overlay);
      return;
    }
    const groupDepth = this.store.snapshot().groupFields.length;
    const rowHeights = rows.map((node) => this.store.getRowHeightForEntry(node));
    const totalHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    if (rows.length > 100) {
      this.renderVirtualizedBody(
        rows,
        columns,
        groupDepth,
        rowHeights,
        totalHeight
      );
    } else {
      this.virtualSpacer = null;
      for (const node of rows) {
        const rowEl = this.createRowElement(node, columns, groupDepth);
        this.bodyEl.appendChild(rowEl);
      }
      this.applyFocusedCellHighlight();
    }
  }
  renderVirtualizedBody(rows, columns, groupDepth, rowHeights, totalHeight) {
    const offsets = new Array(rows.length + 1);
    offsets[0] = 0;
    for (let i = 0; i < rows.length; i++) {
      offsets[i + 1] = offsets[i] + rowHeights[i];
    }
    const spacer = el("div", { class: "gk-virtual-spacer" });
    spacer.style.height = `${totalHeight}px`;
    spacer.style.position = "relative";
    this.virtualSpacer = spacer;
    const renderVisibleRows = () => {
      const scrollTop = this.bodyEl.scrollTop;
      const viewportHeight = this.bodyEl.clientHeight;
      const buffer = this.store.getConfig("rowBuffer") ?? 10;
      let startIdx = binarySearchOffset(offsets, scrollTop);
      startIdx = Math.max(0, startIdx - buffer);
      let endIdx = binarySearchOffset(offsets, scrollTop + viewportHeight);
      endIdx = Math.min(rows.length - 1, endIdx + buffer);
      const children = spacer.children;
      while (children.length > 0) {
        spacer.removeChild(children[0]);
      }
      for (let i = startIdx; i <= endIdx; i++) {
        const node = rows[i];
        const rowEl = this.createRowElement(node, columns, groupDepth);
        rowEl.style.position = "absolute";
        rowEl.style.top = `${offsets[i]}px`;
        rowEl.style.width = "100%";
        spacer.appendChild(rowEl);
      }
      this.applyFocusedCellHighlight();
    };
    this.bodyEl.appendChild(spacer);
    this.bodyEl.scrollTop = this.lastScrollTop;
    renderVisibleRows();
    this.scrollHandler = () => {
      this.lastScrollTop = this.bodyEl.scrollTop;
      renderVisibleRows();
    };
    this.bodyEl.addEventListener("scroll", this.scrollHandler);
  }
  createRowElement(node, columns, groupDepth) {
    const isGrandTotal = !!(node.isGroup && node.groupValue === "__grandTotal");
    const isSubtotal = !!(node.isGroup && typeof node.groupValue === "string" && node.groupValue.startsWith("__total_"));
    const rowEl = el("div", {
      class: "gk-row",
      "data-row-id": node.id,
      "data-selected": String(node.selected),
      "data-group": String(!!node.isGroup),
      ...isGrandTotal ? { "data-grand-total": "true" } : {},
      ...isSubtotal ? { "data-subtotal": "true" } : {}
    });
    const rowHeight = this.store.getRowHeightForEntry(node);
    rowEl.style.height = `${rowHeight}px`;
    rowEl.style.minHeight = `${rowHeight}px`;
    const rowClass = this.store.getRowClassForEntry(node);
    if (rowClass) {
      rowEl.classList.add(rowClass);
    }
    const ruleClasses = this.store.getRowClassRulesForEntry(node);
    for (const cls of ruleClasses) {
      rowEl.classList.add(cls);
    }
    if (node.isGroup && this.isPivotRendering()) {
      this.renderPivotGroupRow(rowEl, node);
    } else if (node.isGroup) {
      this.renderGroupRow(rowEl, node, isGrandTotal, isSubtotal);
    } else if (this.isPivotRendering()) {
      const groupField = this.getPivotGroupField();
      const pivotCols = this.getPivotResultColumns();
      if (groupField) {
        const groupCell = this.createCellElement(node, groupField);
        groupCell.style.flex = "1";
        if (groupDepth > 0) {
          groupCell.style.paddingLeft = `${12 + groupDepth * 20}px`;
        }
        rowEl.appendChild(groupCell);
      }
      for (const pc of pivotCols) {
        const valueCell = el("div", { class: "gk-cell" });
        valueCell.style.flex = "1";
        valueCell.style.textAlign = "right";
        const pivotFieldId = this.store.snapshot().pivotFields[0];
        const pivotCol = pivotFieldId ? this.store.getField(pivotFieldId) : void 0;
        const aggCol = this.store.getVisibleFields().find((c) => c.aggregate);
        if (pivotCol?.dataKey && aggCol?.dataKey) {
          const rowPivotVal = String(readCellValue(node.data, pivotCol));
          if (pc.dataKey === `${aggCol.dataKey}_${rowPivotVal}`) {
            const raw = readCellValue(node.data, aggCol);
            valueCell.textContent = raw != null ? String(raw) : "";
          }
        }
        rowEl.appendChild(valueCell);
      }
    } else if (node.isNestedRow) {
      const detailCell = el("div", { class: "gk-cell gk-detail-cell" });
      detailCell.style.flex = "1";
      detailCell.style.padding = "8px 12px";
      const nestedData = node.nestedData;
      if (nestedData && nestedData.length > 0) {
        const table = document.createElement("table");
        table.className = "gk-detail-table";
        const headerRow = document.createElement("tr");
        const keys = Object.keys(nestedData[0]);
        for (const key of keys) {
          const th = document.createElement("th");
          th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        for (const item of nestedData) {
          const tr = document.createElement("tr");
          for (const key of keys) {
            const td = document.createElement("td");
            td.textContent = String(item[key] ?? "");
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
        detailCell.appendChild(table);
      }
      rowEl.appendChild(detailCell);
      rowEl.style.height = "auto";
      rowEl.style.minHeight = "auto";
    } else {
      const isExpandable = node.isExpandable;
      let first = true;
      for (const col of columns) {
        const cellEl = this.createCellElement(node, col);
        if (first && groupDepth > 0) {
          cellEl.style.paddingLeft = `${12 + groupDepth * 20}px`;
        }
        if (first && isExpandable) {
          const isExpanded = this.store.snapshot().expandedGroups.has(node.id);
          const expandIcon = isExpanded ? "\u25BC" : "\u25B6";
          const toggle = el("span", { class: "gk-group-expand" }, [expandIcon]);
          toggle.style.cursor = "pointer";
          toggle.style.marginRight = "4px";
          toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            this.store.setEntryExpanded(node.id, !isExpanded);
          });
          cellEl.insertBefore(toggle, cellEl.firstChild);
        }
        first = false;
        rowEl.appendChild(cellEl);
      }
    }
    const rowSelection = this.store.getConfig("selectionMode");
    if (rowSelection) {
      rowEl.addEventListener("click", (e) => {
        if (node.isGroup) {
          return;
        }
        if (e.target.tagName === "INPUT") {
          return;
        }
        this.store.pickRow(node.id, !node.selected);
      });
    }
    return rowEl;
  }
  renderGroupRow(rowEl, node, isGrandTotal, isSubtotal) {
    const cell = el("div", { class: "gk-cell" });
    cell.style.flex = "1";
    const level = node.level ?? 0;
    cell.style.paddingLeft = `${12 + Math.max(0, level) * 20}px`;
    if (isGrandTotal) {
      const label = el("span", {}, ["Grand Total"]);
      cell.appendChild(label);
    } else if (isSubtotal) {
      const groupName = String(node.groupValue).replace(/^__total_/, "");
      const label = el("span", {}, [`Total \u2014 ${groupName}`]);
      cell.appendChild(label);
    } else {
      const expandIcon = node.expanded ? "\u25BC" : "\u25B6";
      const toggle = el("span", { class: "gk-group-expand" }, [expandIcon]);
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.store.setEntryExpanded(node.id, !node.expanded);
      });
      cell.appendChild(toggle);
      const label = el("span", {}, [
        `${String(node.groupValue)} (${node.childCount})`
      ]);
      cell.appendChild(label);
    }
    if (node.aggData) {
      const columns = this.store.getVisibleFields();
      for (const col of columns) {
        if (col.aggregate && col.dataKey && node.aggData[col.dataKey] !== void 0) {
          const aggEl = el("span", {}, [
            ` | ${col.title}: ${String(node.aggData[col.dataKey])}`
          ]);
          cell.appendChild(aggEl);
        }
      }
    }
    rowEl.appendChild(cell);
  }
  createCellElement(node, col) {
    const raw = this.store.getCellValueForEntry(node, col);
    const display = col.format ? col.format({ value: raw, data: node.data, fieldDef: col }) : raw != null ? String(raw) : "";
    const cellEl = el("div", {
      class: "gk-cell",
      "data-col-id": col.id,
      "data-row-id": node.id,
      "data-editable": String(col.editable)
    });
    applyCellSizing(cellEl, col);
    if (typeof col.render === "function") {
      const html = col.render({
        value: raw,
        formattedValue: display,
        data: node.data
      });
      cellEl.innerHTML = String(html);
    } else {
      cellEl.textContent = display;
    }
    if (col.style) {
      const style = typeof col.style === "function" ? col.style({ data: node.data, value: raw }) : col.style;
      for (const [prop, val] of Object.entries(style)) {
        cellEl.style[prop] = val;
      }
    }
    if (col.className) {
      const cls = typeof col.className === "function" ? col.className({ data: node.data, value: raw }) : col.className;
      const classes = Array.isArray(cls) ? cls : [cls];
      for (const c of classes) {
        if (c) {
          cellEl.classList.add(c);
        }
      }
    }
    if (col.classRules) {
      for (const [className, fn] of Object.entries(col.classRules)) {
        if (fn({ data: node.data, value: raw })) {
          cellEl.classList.add(className);
        }
      }
    }
    if (col.getTooltip) {
      cellEl.title = col.getTooltip({ data: node.data, value: raw });
    } else if (col.tooltipKey) {
      const tipVal = node.data?.[col.tooltipKey];
      if (tipVal != null) {
        cellEl.title = String(tipVal);
      }
    }
    if (col.editable) {
      cellEl.addEventListener("dblclick", () => {
        this.startCellEdit(cellEl, node, col, raw);
      });
    }
    cellEl.addEventListener("click", () => {
      this.store.setFocusedCell(node.id, col.id);
    });
    cellEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openCellContextMenu(node, col, e.clientX, e.clientY);
    });
    return cellEl;
  }
  // -------------------------------------------------------------------------
  // Cell editing
  // -------------------------------------------------------------------------
  startCellEdit(cellEl, node, col, currentValue) {
    if (this.editingCell) {
      this.commitEdit();
    }
    cellEl.classList.add("gk-cell-editing");
    cellEl.textContent = "";
    const input = document.createElement("input");
    input.value = currentValue != null ? String(currentValue) : "";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.commitEdit();
      } else if (e.key === "Escape") {
        this.cancelEdit();
      }
    });
    input.addEventListener("blur", () => {
      setTimeout(() => this.commitEdit(), 0);
    });
    cellEl.appendChild(input);
    input.focus();
    input.select();
    this.editingCell = { rowId: node.id, colId: col.id, input };
  }
  commitEdit() {
    if (!this.editingCell) {
      return;
    }
    const { rowId, colId, input } = this.editingCell;
    this.editingCell = null;
    this.store.editCell(rowId, colId, input.value);
    this.refresh();
  }
  cancelEdit() {
    this.editingCell = null;
    this.refresh();
  }
  // -------------------------------------------------------------------------
  // Pinned rows
  // -------------------------------------------------------------------------
  renderPinnedRows() {
    this.renderPinnedSection(this.pinnedTopEl, this.store.getStickyTopRows());
    this.renderPinnedSection(
      this.pinnedBottomEl,
      this.store.getStickyBottomRows()
    );
  }
  renderPinnedSection(container, rows) {
    clearChildren(container);
    const columns = this.store.getVisibleFields();
    for (const node of rows) {
      const rowEl = this.createRowElement(node, columns, 0);
      container.appendChild(rowEl);
    }
  }
  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------
  renderPagination() {
    if (this.paginationEl) {
      this.paginationEl.remove();
      this.paginationEl = null;
    }
    const state = this.store.snapshot();
    if (state.filteredRows.length === state.visibleRows.length && state.filteredRows === state.visibleRows) {
      return;
    }
    const currentPage = this.store.paginationGetCurrentPage();
    const totalPages = this.store.paginationGetTotalPages();
    this.paginationEl = el("div", { class: "gk-pagination" });
    const prevBtn = el("button", {}, ["\u2190 Prev"]);
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener(
      "click",
      () => this.store.paginationGoToPreviousPage()
    );
    const pageInfo = el("span", {}, [
      `Page ${currentPage + 1} of ${totalPages}`
    ]);
    const nextBtn = el("button", {}, ["Next \u2192"]);
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener(
      "click",
      () => this.store.paginationGoToNextPage()
    );
    this.paginationEl.append(prevBtn, pageInfo, nextBtn);
    this.root.appendChild(this.paginationEl);
  }
  // -------------------------------------------------------------------------
  // Status bar
  // -------------------------------------------------------------------------
  buildStatusBar() {
    const def = this.store.getFooterDef();
    if (!def) return;
    const leftEl = el("div", { class: "gk-status-bar-left" });
    const centerEl = el("div", { class: "gk-status-bar-center" });
    const rightEl = el("div", { class: "gk-status-bar-right" });
    for (const panel of def.widgets) {
      const panelEl = el("span", {
        class: "gk-status-panel",
        "data-key": panel.key
      });
      this.statusPanelEls.set(panel.key, { el: panelEl, def: panel });
      if (panel.align === "left") leftEl.append(panelEl);
      else if (panel.align === "center") centerEl.append(panelEl);
      else rightEl.append(panelEl);
    }
    this.statusBarEl = el("div", { class: "gk-status-bar" });
    this.statusBarEl.append(leftEl, centerEl, rightEl);
  }
  renderStatusBar() {
    if (!this.statusBarEl) return;
    for (const [, { el: panelEl, def: panel }] of this.statusPanelEls) {
      panelEl.textContent = this.getStatusPanelText(panel);
    }
  }
  getStatusPanelText(panel) {
    switch (panel.widget) {
      case TOTAL_COUNT_WIDGET: {
        const total = this.store.getTotalRowCount();
        const noun = panel.widgetParams?.noun ?? "Row(s)";
        return `${total.toLocaleString()} ${noun}`;
      }
      case FILTERED_TOTAL_WIDGET: {
        const total = this.store.getTotalRowCount();
        const filtered = this.store.getFilteredRowCount();
        const noun = panel.widgetParams?.noun ?? "Row(s)";
        if (filtered === total) return `${total.toLocaleString()} ${noun}`;
        return `${filtered.toLocaleString()} of ${total.toLocaleString()} ${noun}`;
      }
      case FILTERED_COUNT_WIDGET: {
        const filtered = this.store.getFilteredRowCount();
        const noun = panel.widgetParams?.noun ?? "Row(s)";
        return `${filtered.toLocaleString()} ${noun}`;
      }
      case SELECTED_COUNT_WIDGET: {
        if (!this.store.getConfig("selectionMode")) return "";
        const selected = this.store.getSelectedRowCount();
        const noun = panel.widgetParams?.noun ?? "Row(s)";
        return `${selected.toLocaleString()} ${noun} Selected`;
      }
      case AGGREGATION_WIDGET: {
        if (!this.store.getConfig("cellSelect")) return "";
        const agg = this.store.getSpanAggregation();
        if (agg.count === 0) return "";
        const parts = [
          `Count: ${agg.count.toLocaleString()}`,
          `Sum: ${agg.sum.toLocaleString()}`,
          `Avg: ${agg.avg.toLocaleString(void 0, { maximumFractionDigits: 2 })}`,
          `Min: ${agg.min.toLocaleString()}`,
          `Max: ${agg.max.toLocaleString()}`
        ];
        return parts.join("  ");
      }
      default:
        return "";
    }
  }
  // -------------------------------------------------------------------------
  // Field resizing
  // -------------------------------------------------------------------------
  startFieldResize(colId, startWidth, startX) {
    this.resizingCol = { colId, startX, startWidth };
    const columns = this.store.getVisibleFields();
    const headerCells = this.headerEl.querySelectorAll(".gk-header-cell");
    const flexLocks = [];
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col.flex) {
        const cellEl = headerCells[i];
        if (cellEl) {
          flexLocks.push({
            colId: col.id,
            width: cellEl.getBoundingClientRect().width
          });
        }
      }
    }
    if (flexLocks.length > 0) {
      const state = this.store.snapshot();
      for (const { colId: fColId, width } of flexLocks) {
        const col = state.fields.find((c) => c.id === fColId);
        if (col) {
          col.width = width;
          col.flex = void 0;
        }
      }
    }
    this.resizeMoveHandler = (e) => {
      if (!this.resizingCol) {
        return;
      }
      const delta = e.clientX - this.resizingCol.startX;
      const newWidth = Math.max(30, this.resizingCol.startWidth + delta);
      this.store.resizeField(this.resizingCol.colId, newWidth);
    };
    this.resizeUpHandler = () => {
      this.resizingCol = null;
      if (this.resizeMoveHandler) {
        document.removeEventListener("mousemove", this.resizeMoveHandler);
        this.resizeMoveHandler = null;
      }
      if (this.resizeUpHandler) {
        document.removeEventListener("mouseup", this.resizeUpHandler);
        this.resizeUpHandler = null;
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", this.resizeMoveHandler);
    document.addEventListener("mouseup", this.resizeUpHandler);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }
  autoSizeFieldToFit(col) {
    const measurer = document.createElement("div");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "nowrap";
    measurer.style.padding = "8px 12px";
    measurer.style.boxSizing = "border-box";
    measurer.style.font = getComputedStyle(this.root).font;
    this.root.appendChild(measurer);
    measurer.style.fontWeight = "600";
    measurer.textContent = col.title;
    let maxWidth = measurer.getBoundingClientRect().width;
    measurer.style.fontWeight = "";
    const displayedRows = this.store.getVisibleRows();
    for (const node of displayedRows) {
      if (node.isGroup) {
        continue;
      }
      const raw = readCellValue(node.data, col);
      const display = col.format ? col.format({ value: raw, data: node.data, fieldDef: col }) : raw != null ? String(raw) : "";
      measurer.textContent = display;
      const w = measurer.getBoundingClientRect().width;
      if (w > maxWidth) {
        maxWidth = w;
      }
    }
    this.root.removeChild(measurer);
    const finalWidth = Math.ceil(maxWidth) + 2;
    const clamped = Math.max(col.minWidth, Math.min(col.maxWidth, finalWidth));
    this.store.resizeField(col.id, clamped);
  }
  // -------------------------------------------------------------------------
  // Focused cell + keyboard navigation
  // -------------------------------------------------------------------------
  applyFocusedCellHighlight() {
    const existing = this.root.querySelectorAll(".gk-cell-focused");
    for (const el2 of existing) {
      el2.classList.remove("gk-cell-focused");
    }
    const focused = this.store.getFocusedCell();
    if (!focused) {
      return;
    }
    const cellEl = this.root.querySelector(
      `.gk-cell[data-row-id="${focused.rowId}"][data-col-id="${focused.fieldId}"]`
    );
    if (cellEl) {
      cellEl.classList.add("gk-cell-focused");
    }
  }
  handleKeyDown(e) {
    if (e.key === "Escape") {
      if (this.activeContextMenu || this.activeFieldMenu || this.activeFilterMenu) {
        e.preventDefault();
        this.closeContextMenu();
        this.closeFieldMenu();
        this.closeFilterMenu();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      this.store.undoCellEditing();
      this.refresh();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "z" && e.shiftKey)) {
      e.preventDefault();
      this.store.redoCellEditing();
      this.refresh();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      const copyData = this.store.getCopyData();
      if (copyData) {
        e.preventDefault();
        navigator.clipboard.writeText(copyData).catch(() => {
        });
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      const focused = this.store.getFocusedCell();
      if (focused) {
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          this.store.pasteData(text, focused.rowId, focused.fieldId);
        }).catch(() => {
        });
      }
      return;
    }
    if ([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter"
    ].includes(e.key)) {
      if (this.editingCell) {
        return;
      }
      e.preventDefault();
      const focused = this.store.getFocusedCell();
      const rows = this.store.getVisibleRows();
      const columns = this.store.getVisibleFields();
      if (rows.length === 0 || columns.length === 0) {
        return;
      }
      if (!focused) {
        const firstRow = rows[0];
        const firstCol = columns[0];
        this.store.setFocusedCell(firstRow.id, firstCol.id);
        this.applyFocusedCellHighlight();
        this.scrollFocusedCellIntoView();
        return;
      }
      const rowIdx = rows.findIndex((r) => r.id === focused.rowId);
      const colIdx = columns.findIndex((c) => c.id === focused.fieldId);
      if (rowIdx === -1 || colIdx === -1) {
        return;
      }
      let newRowIdx = rowIdx;
      let newColIdx = colIdx;
      if (e.key === "ArrowUp") {
        newRowIdx = Math.max(0, rowIdx - 1);
      } else if (e.key === "ArrowDown") {
        newRowIdx = Math.min(rows.length - 1, rowIdx + 1);
      } else if (e.key === "ArrowLeft") {
        newColIdx = Math.max(0, colIdx - 1);
      } else if (e.key === "ArrowRight") {
        newColIdx = Math.min(columns.length - 1, colIdx + 1);
      } else if (e.key === "Tab") {
        if (e.shiftKey) {
          newColIdx = colIdx - 1;
          if (newColIdx < 0) {
            newColIdx = columns.length - 1;
            newRowIdx = Math.max(0, rowIdx - 1);
          }
        } else {
          newColIdx = colIdx + 1;
          if (newColIdx >= columns.length) {
            newColIdx = 0;
            newRowIdx = Math.min(rows.length - 1, rowIdx + 1);
          }
        }
      } else if (e.key === "Enter") {
        const col = columns[colIdx];
        if (col.editable) {
          const cellEl = this.root.querySelector(
            `.gk-cell[data-row-id="${focused.rowId}"][data-col-id="${focused.fieldId}"]`
          );
          if (cellEl) {
            const raw = readCellValue(rows[rowIdx].data, col);
            this.startCellEdit(cellEl, rows[rowIdx], col, raw);
          }
        }
        return;
      }
      if (newRowIdx !== rowIdx || newColIdx !== colIdx) {
        this.store.setFocusedCell(
          rows[newRowIdx].id,
          columns[newColIdx].id
        );
        this.applyFocusedCellHighlight();
        this.scrollFocusedCellIntoView();
      }
    }
  }
  scrollFocusedCellIntoView() {
    const focused = this.store.getFocusedCell();
    if (!focused) {
      return;
    }
    const cellEl = this.root.querySelector(
      `.gk-cell[data-row-id="${focused.rowId}"][data-col-id="${focused.fieldId}"]`
    );
    if (cellEl) {
      cellEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  // -------------------------------------------------------------------------
  // Cell flash animation
  // -------------------------------------------------------------------------
  handleCellFlash(event) {
    for (const { rowKey, fieldId } of event.cells) {
      const cellEl = this.root.querySelector(
        `.gk-cell[data-row-id="${rowKey}"][data-col-id="${fieldId}"]`
      );
      if (!cellEl) {
        continue;
      }
      cellEl.classList.add("gk-cell-flash");
      setTimeout(() => {
        cellEl.classList.remove("gk-cell-flash");
        cellEl.classList.add("gk-cell-flash-fade");
        setTimeout(() => {
          cellEl.classList.remove("gk-cell-flash-fade");
        }, event.fadeDuration);
      }, event.flashDuration);
    }
  }
  // -------------------------------------------------------------------------
  // CSV Export
  // -------------------------------------------------------------------------
  exportCsv() {
    const csv = this.store.getDataAsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------
  refresh() {
    this.closeContextMenu();
    this.closeFieldMenu();
    this.syncQuickFilter();
    this.renderGroupPanel();
    this.renderHeader();
    this.renderPinnedRows();
    this.renderBody();
    this.renderPagination();
    this.renderStatusBar();
    this.renderSideBar();
    this.syncHeaderScrollbarPadding();
  }
  syncHeaderScrollbarPadding() {
    const scrollbarWidth = this.bodyEl.offsetWidth - this.bodyEl.clientWidth;
    this.headerEl.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  /** Force a full re-render. */
  forceRefresh() {
    this.refresh();
  }
  /** Export visible data as CSV download. */
  exportDataAsCsv() {
    this.exportCsv();
  }
  /** Save grid state to localStorage. */
  saveState(key = "gridkit-state") {
    const state = this.store.getPersistableLayout();
    localStorage.setItem(key, JSON.stringify(state));
  }
  /** Restore grid state from localStorage. */
  restoreState(key = "gridkit-state") {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        this.store.applyPersistableLayout(JSON.parse(raw));
      } catch {
      }
    }
  }
  /** Update the grid's theme at runtime. */
  setTheme(config) {
    this.themeConfig = config;
    applyThemeToElement(this.root, config);
    if (this.chartEngine) {
      this.chartEngine.setThemeParams(config.params ?? {});
    }
  }
  // -------------------------------------------------------------------------
  // Charts
  // -------------------------------------------------------------------------
  /** Mount a chart into the charts container with a toolbar. */
  mountChart(chartId) {
    if (!this.chartsContainerEl || !this.chartEngine) {
      return;
    }
    const model = this.store.getChartModel(chartId);
    if (!model) {
      return;
    }
    const wrapper = el("div", {
      class: "gk-chart-wrapper",
      "data-chart-id": chartId
    });
    const toolbar = this.buildChartToolbar(chartId);
    wrapper.appendChild(toolbar);
    const chartArea = el("div", { class: "gk-chart-area" });
    chartArea.style.width = model.width ? `${model.width}px` : "100%";
    chartArea.style.height = model.height ? `${model.height}px` : "400px";
    wrapper.appendChild(chartArea);
    this.chartsContainerEl.appendChild(wrapper);
    this.chartEngine.mount(chartId, chartArea);
  }
  /** Build a toolbar for a chart. */
  buildChartToolbar(chartId) {
    const toolbar = el("div", { class: "gk-chart-toolbar" });
    const model = this.store.getChartModel(chartId);
    const title = el("span", { class: "gk-chart-toolbar-title" }, [
      model?.title ?? "Chart"
    ]);
    toolbar.appendChild(title);
    const actions = el("div", { class: "gk-chart-toolbar-actions" });
    const typeButtons = [
      { type: "column", label: "Bar" },
      { type: "line", label: "Line" },
      { type: "pie", label: "Pie" },
      { type: "area", label: "Area" }
    ];
    for (const { type, label } of typeButtons) {
      const btn = el("button", { class: "gk-chart-type-btn" }, [label]);
      if (model?.chartType === type) {
        btn.classList.add("gk-chart-type-btn-active");
      }
      btn.addEventListener("click", () => {
        this.store.updateChart(chartId, { chartType: type });
        const wrapper = this.chartsContainerEl?.querySelector(
          `[data-chart-id="${chartId}"]`
        );
        if (wrapper) {
          const oldToolbar = wrapper.querySelector(".gk-chart-toolbar");
          const newToolbar = this.buildChartToolbar(chartId);
          if (oldToolbar) {
            wrapper.replaceChild(newToolbar, oldToolbar);
          }
        }
      });
      actions.appendChild(btn);
    }
    const downloadBtn = el("button", { class: "gk-chart-action-btn" }, [
      "\u2913 Download"
    ]);
    downloadBtn.addEventListener("click", () => {
      this.store.downloadChart(chartId);
    });
    actions.appendChild(downloadBtn);
    const closeBtn = el("button", { class: "gk-chart-action-btn gk-chart-close-btn" }, [
      "\xD7"
    ]);
    closeBtn.addEventListener("click", () => {
      this.store.destroyChart(chartId);
    });
    actions.appendChild(closeBtn);
    toolbar.appendChild(actions);
    return toolbar;
  }
  /** Remove a chart's DOM container. */
  removeChartContainer(chartId) {
    const wrapper = this.chartsContainerEl?.querySelector(
      `[data-chart-id="${chartId}"]`
    );
    if (wrapper) {
      wrapper.remove();
    }
  }
  /** Open the chart creation dialog. */
  openChartCreationDialog() {
    this.closeChartCreationDialog();
    const fields = this.store.getVisibleFields();
    const numericFields = fields.filter(
      (f) => f.dataKey && this.isLikelyNumericField(f)
    );
    const categoryFields = fields.filter((f) => f.dataKey);
    if (categoryFields.length === 0) {
      return;
    }
    const spans = this.store.getCellSpans();
    let preselectedCategory;
    let preselectedValues = [];
    if (spans.length > 0) {
      const span = spans[0];
      const spanFields = span.fields.map((fid) => fields.find((f) => f.id === fid)).filter((f) => f != null);
      const spanNumeric = spanFields.filter((f) => this.isLikelyNumericField(f));
      const spanCategory = spanFields.filter((f) => !this.isLikelyNumericField(f));
      if (spanCategory.length > 0) {
        preselectedCategory = spanCategory[0].id;
      }
      preselectedValues = spanNumeric.map((f) => f.id);
    }
    const dialog = el("div", { class: "gk-chart-dialog" });
    const titleEl = el("div", { class: "gk-chart-dialog-title" }, [
      "Create Chart"
    ]);
    dialog.appendChild(titleEl);
    const form = el("div", { class: "gk-chart-dialog-form" });
    const typeLabel = el("label", {}, ["Chart Type"]);
    const typeSelect = document.createElement("select");
    typeSelect.className = "gk-chart-dialog-select";
    const chartTypes = [
      { value: "column", label: "Column" },
      { value: "bar", label: "Bar" },
      { value: "line", label: "Line" },
      { value: "area", label: "Area" },
      { value: "pie", label: "Pie" },
      { value: "doughnut", label: "Doughnut" },
      { value: "scatter", label: "Scatter" },
      { value: "stackedColumn", label: "Stacked Column" },
      { value: "stackedBar", label: "Stacked Bar" },
      { value: "stackedArea", label: "Stacked Area" }
    ];
    for (const ct of chartTypes) {
      const opt = document.createElement("option");
      opt.value = ct.value;
      opt.textContent = ct.label;
      typeSelect.appendChild(opt);
    }
    form.append(typeLabel, typeSelect);
    const catLabel = el("label", {}, ["Category (X-Axis)"]);
    const catSelect = document.createElement("select");
    catSelect.className = "gk-chart-dialog-select";
    for (const f of categoryFields) {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.title;
      if (f.id === preselectedCategory) {
        opt.selected = true;
      }
      catSelect.appendChild(opt);
    }
    form.append(catLabel, catSelect);
    const valLabel = el("label", {}, ["Values (Y-Axis)"]);
    const valContainer = el("div", { class: "gk-chart-dialog-checkboxes" });
    const checkboxes = [];
    for (const f of numericFields.length > 0 ? numericFields : categoryFields) {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = f.id;
      cb.checked = preselectedValues.includes(f.id);
      if (preselectedValues.length === 0 && checkboxes.length === 0) {
        cb.checked = true;
      }
      const cbLabel = el("label", { class: "gk-chart-dialog-cb-label" });
      cbLabel.appendChild(cb);
      cbLabel.append(` ${f.title}`);
      valContainer.appendChild(cbLabel);
      checkboxes.push({ fieldId: f.id, checkbox: cb });
    }
    form.append(valLabel, valContainer);
    dialog.appendChild(form);
    const btnRow = el("div", { class: "gk-chart-dialog-buttons" });
    const cancelBtn = el("button", { class: "gk-chart-dialog-btn" }, [
      "Cancel"
    ]);
    cancelBtn.addEventListener("click", () => {
      this.closeChartCreationDialog();
    });
    const createBtn = el(
      "button",
      { class: "gk-chart-dialog-btn gk-chart-dialog-btn-primary" },
      ["Create"]
    );
    createBtn.addEventListener("click", () => {
      const chartType = typeSelect.value;
      const categoryFieldId = catSelect.value;
      const valueFieldIds = checkboxes.filter((cb) => cb.checkbox.checked).map((cb) => cb.fieldId);
      if (valueFieldIds.length === 0) {
        return;
      }
      const currentSpans = this.store.getCellSpans();
      let rowRange = "all";
      if (currentSpans.length > 0) {
        const span = currentSpans[0];
        rowRange = {
          startIndex: Math.min(span.startRowIndex, span.endRowIndex),
          endIndex: Math.max(span.startRowIndex, span.endRowIndex)
        };
      }
      this.store.createRangeChart({
        chartType,
        categoryFieldId,
        valueFieldIds,
        rowRange,
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
      });
      this.closeChartCreationDialog();
    });
    btnRow.append(cancelBtn, createBtn);
    dialog.appendChild(btnRow);
    const backdrop = el("div", { class: "gk-chart-dialog-backdrop" });
    backdrop.addEventListener("click", () => {
      this.closeChartCreationDialog();
    });
    this.root.append(backdrop, dialog);
    this.chartCreationDialog = dialog;
  }
  /** Close the chart creation dialog. */
  closeChartCreationDialog() {
    if (this.chartCreationDialog) {
      const backdrop = this.root.querySelector(".gk-chart-dialog-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
      this.chartCreationDialog.remove();
      this.chartCreationDialog = null;
    }
  }
  /** Heuristic: check if a field is likely numeric based on current data. */
  isLikelyNumericField(col) {
    const entries = this.store.getEntries();
    let numCount = 0;
    const sampleSize = Math.min(entries.length, 10);
    for (let i = 0; i < sampleSize; i++) {
      const val = readCellValue(entries[i].data, col);
      if (typeof val === "number") {
        numCount++;
      }
    }
    return numCount > sampleSize / 2;
  }
  /** Render the Charts panel tab content listing active charts. */
  renderChartsPanelContent(body) {
    const charts = this.store.getChartModels();
    if (charts.length === 0) {
      const empty = el("div", { class: "gk-sidebar-panel-empty" }, [
        "No charts created yet."
      ]);
      body.appendChild(empty);
      const createBtn2 = el(
        "button",
        { class: "gk-chart-panel-create-btn" },
        ["+ Create Chart"]
      );
      createBtn2.addEventListener("click", () => {
        this.openChartCreationDialog();
      });
      body.appendChild(createBtn2);
      return;
    }
    const createBtn = el(
      "button",
      { class: "gk-chart-panel-create-btn" },
      ["+ New Chart"]
    );
    createBtn.addEventListener("click", () => {
      this.openChartCreationDialog();
    });
    body.appendChild(createBtn);
    const list = el("div", { class: "gk-chart-panel-list" });
    for (const chart of charts) {
      const item = el("div", { class: "gk-chart-panel-item" });
      const info = el("div", { class: "gk-chart-panel-item-info" });
      const title = el("span", { class: "gk-chart-panel-item-title" }, [
        chart.title ?? `Chart ${chart.chartId}`
      ]);
      const type = el("span", { class: "gk-chart-panel-item-type" }, [
        chart.chartType
      ]);
      info.append(title, type);
      const deleteBtn = el(
        "button",
        { class: "gk-chart-panel-delete-btn" },
        ["\xD7"]
      );
      deleteBtn.addEventListener("click", () => {
        this.store.destroyChart(chart.chartId);
      });
      item.append(info, deleteBtn);
      list.appendChild(item);
    }
    body.appendChild(list);
  }
  /** Get the ChartEngine instance (for external use). */
  getChartEngine() {
    return this.chartEngine;
  }
  /** Clean up event listeners and remove DOM. */
  destroy() {
    this.closeFilterMenu();
    this.closeContextMenu();
    this.closeChartCreationDialog();
    if (this.chartEngine) {
      this.chartEngine.destroy();
      this.chartEngine = null;
    }
    if (this.quickFilterTimer) {
      clearTimeout(this.quickFilterTimer);
    }
    if (this.scrollHandler) {
      this.bodyEl.removeEventListener("scroll", this.scrollHandler);
    }
    if (this.resizeMoveHandler) {
      document.removeEventListener("mousemove", this.resizeMoveHandler);
    }
    if (this.resizeUpHandler) {
      document.removeEventListener("mouseup", this.resizeUpHandler);
    }
    if (this.sideBarResizeMoveHandler) {
      document.removeEventListener("mousemove", this.sideBarResizeMoveHandler);
    }
    if (this.sideBarResizeUpHandler) {
      document.removeEventListener("mouseup", this.sideBarResizeUpHandler);
    }
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    clearChildren(this.container);
  }
};
function applyCellSizing(element, col) {
  if (col.flex) {
    element.style.flex = `${col.flex} 1 0%`;
    element.style.minWidth = `${col.minWidth}px`;
  } else {
    element.style.width = `${col.width}px`;
    element.style.minWidth = `${col.minWidth}px`;
    element.style.flexShrink = "0";
  }
}
function binarySearchOffset(offsets, target) {
  let lo = 0;
  let hi = offsets.length - 2;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    if (offsets[mid + 1] <= target) {
      lo = mid + 1;
    } else if (offsets[mid] > target) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return Math.max(0, lo);
}
export {
  GridView,
  THEME_EMBER,
  THEME_GLACIER,
  THEME_MATERIAL,
  THEME_MIDNIGHT,
  THEME_ORIGIN,
  applyThemeToElement,
  clearChildren,
  el,
  injectStyles,
  resolveThemeParams,
  themeParamsToCssVars
};
