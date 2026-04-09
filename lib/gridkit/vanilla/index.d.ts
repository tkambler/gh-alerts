import { GridEngine } from '@repo/gridkit-core';
import { ChartEngine } from '@repo/gridkit-charts';
import { ThemeConfig, ThemeParams } from '@repo/types';

interface GridViewConfig {
    /** Inject default CSS styles. Set false to provide your own. */
    injectCss?: boolean;
    /** Theme configuration. Controls colors, fonts, and color scheme. */
    theme?: ThemeConfig;
}
/**
 * Vanilla DOM renderer for GridKit. Takes a GridEngine and a container
 * element, renders the grid, and keeps it in sync with state changes.
 */
declare class GridView<TData = unknown> {
    private container;
    private store;
    private themeConfig;
    private root;
    private headerEl;
    private bodyEl;
    private pinnedTopEl;
    private pinnedBottomEl;
    private paginationEl;
    private statusBarEl;
    private statusPanelEls;
    private quickFilterInput;
    private quickFilterClearBtn;
    private groupPanelEl;
    private unsubscribers;
    private editingCell;
    private activeFilterMenu;
    private activeContextMenu;
    private activeFieldMenu;
    private escapeHandler;
    private quickFilterTimer;
    private chartEngine;
    private chartsContainerEl;
    private chartCreationDialog;
    private sideBarWrapperEl;
    private sideBarButtonsEl;
    private sideBarPanelEl;
    private sideBarResizeHandleEl;
    private sideBarUserWidth;
    private gridContentEl;
    private resizingCol;
    private resizeMoveHandler;
    private resizeUpHandler;
    private scrollHandler;
    private virtualSpacer;
    private lastScrollTop;
    /** Returns true if pivot mode is active with at least one pivot and group field. */
    private isPivotRendering;
    /**
     * Build the list of pivot result column descriptors for header/cell rendering.
     * Each descriptor has { fieldId, title, dataKey } matching the keys in aggData.
     */
    private getPivotResultColumns;
    /** Get the group field (first field in groupFields) resolved to a ResolvedField. */
    private getPivotGroupField;
    constructor(container: HTMLElement, store: GridEngine<TData>, opts?: GridViewConfig);
    private buildShell;
    private buildSideBar;
    private sideBarResizeMoveHandler;
    private sideBarResizeUpHandler;
    private startSideBarResize;
    private renderSideBar;
    private renderSideBarButtons;
    private getSideBarIcon;
    private renderSideBarPanel;
    private renderFieldsPanelContent;
    private renderFiltersPanelContent;
    private renderTextFilterControls;
    private renderSetFilterControls;
    private syncQuickFilter;
    private renderGroupPanel;
    private renderHeader;
    private handleHeaderClick;
    private renderPivotHeader;
    private renderPivotGroupRow;
    private openFilterMenu;
    private buildSetFilterMenu;
    private buildTextFilterMenu;
    private closeFilterMenu;
    /**
     * Resolve a built-in action name to a MenuEntry, given the current context.
     */
    private resolveBuiltInAction;
    /**
     * Build a menu DOM element from an array of MenuEntry or built-in action strings.
     */
    private buildMenuElement;
    /**
     * Get default context menu items for header right-click.
     */
    private getDefaultHeaderContextMenuItems;
    /**
     * Get default context menu items for cell right-click.
     */
    private getDefaultCellContextMenuItems;
    /**
     * Open context menu at a specific position (used by both header and cell right-click,
     * and by the programmatic showContextMenu API).
     */
    private openContextMenuAt;
    private openHeaderContextMenu;
    private openCellContextMenu;
    private closeContextMenu;
    private openFieldMenu;
    private closeFieldMenu;
    private renderBody;
    private renderVirtualizedBody;
    private createRowElement;
    private renderGroupRow;
    private createCellElement;
    private startCellEdit;
    private commitEdit;
    private cancelEdit;
    private renderPinnedRows;
    private renderPinnedSection;
    private renderPagination;
    private buildStatusBar;
    private renderStatusBar;
    private getStatusPanelText;
    private startFieldResize;
    private autoSizeFieldToFit;
    private applyFocusedCellHighlight;
    private handleKeyDown;
    private scrollFocusedCellIntoView;
    private handleCellFlash;
    private exportCsv;
    private refresh;
    private syncHeaderScrollbarPadding;
    /** Force a full re-render. */
    forceRefresh(): void;
    /** Export visible data as CSV download. */
    exportDataAsCsv(): void;
    /** Save grid state to localStorage. */
    saveState(key?: string): void;
    /** Restore grid state from localStorage. */
    restoreState(key?: string): void;
    /** Update the grid's theme at runtime. */
    setTheme(config: ThemeConfig): void;
    /** Mount a chart into the charts container with a toolbar. */
    private mountChart;
    /** Build a toolbar for a chart. */
    private buildChartToolbar;
    /** Remove a chart's DOM container. */
    private removeChartContainer;
    /** Open the chart creation dialog. */
    private openChartCreationDialog;
    /** Close the chart creation dialog. */
    private closeChartCreationDialog;
    /** Heuristic: check if a field is likely numeric based on current data. */
    private isLikelyNumericField;
    /** Render the Charts panel tab content listing active charts. */
    private renderChartsPanelContent;
    /** Get the ChartEngine instance (for external use). */
    getChartEngine(): ChartEngine<TData> | null;
    /** Clean up event listeners and remove DOM. */
    destroy(): void;
}

/** Convert resolved theme params to a CSS variable declaration string (no selector). */
declare function themeParamsToCssVars(params: ThemeParams): string;
/**
 * Apply resolved theme params as inline CSS custom properties on an element.
 * This scopes the theme to a single grid instance.
 */
declare function applyThemeToElement(element: HTMLElement, config?: ThemeConfig): void;
/** Inject the base GridKit stylesheet into the document head (idempotent). */
declare function injectStyles(): void;

interface ThemePreset {
    light: Required<ThemeParams>;
    dark: Required<ThemeParams>;
}
/** Origin — the default theme. High contrast, generous padding, modern sans-serif. */
declare const THEME_ORIGIN: ThemePreset;
/** Ember — compact, traditional spreadsheet style with warm-toned borders. */
declare const THEME_EMBER: ThemePreset;
/** Material — Google Material Design v2, Roboto font, blue-grey palette. */
declare const THEME_MATERIAL: ThemePreset;
/** Glacier — cool-toned softer colors, medium density. */
declare const THEME_GLACIER: ThemePreset;
declare const THEME_MIDNIGHT: ThemePreset;
/**
 * Resolve a `ThemeConfig` into a complete set of `ThemeParams`.
 *
 * Resolution order:
 * 1. Origin light as the base defaults
 * 2. Base theme preset (if specified)
 * 3. Color scheme variant (light or dark)
 * 4. User `params` overrides
 */
declare function resolveThemeParams(config?: ThemeConfig): Required<ThemeParams>;

/** Minimal DOM helpers for creating grid elements. */
declare function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Record<string, string>, children?: (Node | string)[]): HTMLElementTagNameMap[K];
declare function clearChildren(element: HTMLElement): void;

export { GridView, type GridViewConfig, THEME_EMBER, THEME_GLACIER, THEME_MATERIAL, THEME_MIDNIGHT, THEME_ORIGIN, applyThemeToElement, clearChildren, el, injectStyles, resolveThemeParams, themeParamsToCssVars };
