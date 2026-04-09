import * as _repo_types from '@repo/types';
import { GridEvents, GridConfig, GridCommand, GridSnapshot, ResolvedField, RowEntry, RowKey, SortRule, FieldId, FieldGroup, FieldLayout, FieldDef, FooterDef, FooterWidgetDef, DataPatch, FilterState, CellSpan, PersistableLayout, PanelDef, PanelConfig, ChartType, ChartId, ChartModelDef, ChartPivotDef, FooterConfig } from '@repo/types';

type Listener<T> = (payload: T) => void;
declare class EventHub<TEvents extends Record<string, any>> {
    private listeners;
    on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): () => void;
    emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
    off<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): void;
    removeAllListeners(): void;
}

declare class GridEngine<TData = unknown> {
    private state;
    private config;
    private undoStack;
    private redoStack;
    private dataHasBeenSet;
    private loadingOverride;
    private infiniteBlocks;
    private infiniteRowCount;
    private gridWidth;
    private alignedGrids;
    private propagatingAlignment;
    private chartIdCounter;
    private editingCell;
    private customAggFuncs;
    readonly events: EventHub<GridEvents<TData>>;
    constructor(config: GridConfig<TData>);
    dispatch(command: GridCommand<TData>): void;
    snapshot(): Readonly<GridSnapshot<TData>>;
    getFields(): readonly ResolvedField<TData>[];
    getVisibleFields(): ResolvedField<TData>[];
    getEntries(): readonly RowEntry<TData>[];
    getVisibleRows(): readonly RowEntry<TData>[];
    getEntry(rowKey: RowKey): RowEntry<TData> | undefined;
    getSortRules(): readonly SortRule[];
    getSelectedKeys(): ReadonlySet<RowKey>;
    getSelectedData(): TData[];
    getField(fieldId: FieldId): ResolvedField<TData> | undefined;
    getVisibleRowCount(): number;
    getVisibleRowAt(index: number): RowEntry<TData> | undefined;
    eachEntry(callback: (entry: RowEntry<TData>, index: number) => void): void;
    getConfig<K extends keyof GridConfig<TData>>(key: K): GridConfig<TData>[K];
    getFieldGroups(): FieldGroup[];
    getFieldLayouts(): FieldLayout[];
    applyFieldLayouts(fieldLayouts: FieldLayout[]): void;
    autoFitFields(totalWidth: number): void;
    getFieldSpan(col: ResolvedField<TData>, entry: RowEntry<TData>): number;
    setConfig<K extends keyof GridConfig<TData>>(key: K, value: GridConfig<TData>[K]): void;
    canEditCell(col: ResolvedField<TData>, entry: RowEntry<TData>): boolean;
    formatValue(value: unknown, col: ResolvedField<TData>): string;
    editCell(rowKey: RowKey, fieldId: FieldId, newValue: unknown): boolean;
    loadData(rowData: TData[]): void;
    defineFields(fieldDefs: FieldDef<TData>[]): void;
    setSortRules(sortRules: SortRule[]): void;
    pickRow(rowKey: RowKey, selected: boolean): void;
    pickAll(selected: boolean): void;
    clearSelection(): void;
    getSelectedEntries(): readonly RowEntry<TData>[];
    resizeField(fieldId: FieldId, width: number): void;
    reorderField(fieldId: FieldId, toIndex: number): void;
    lockField(fieldId: FieldId, locked: 'left' | 'right' | false): void;
    toggleField(fieldId: FieldId, visible: boolean): void;
    toggleFields(fieldIds: FieldId[], visible: boolean): void;
    setFieldWidths(widths: {
        fieldId: FieldId;
        width: number;
    }[]): void;
    setFieldsLocked(fieldIds: FieldId[], locked: 'left' | 'right' | false): void;
    refreshCells(): void;
    redrawRows(): void;
    autoSizeFields(fieldIds: FieldId[]): void;
    autoSizeAllFields(): void;
    getCellValueForEntry(entry: RowEntry<TData>, col: ResolvedField<TData>): unknown;
    /** Set the grid container width (in px). Called by framework adapters on resize. */
    setGridWidth(width: number): void;
    /** Get the current grid container width, or null if not set. */
    getGridWidth(): number | null;
    /** Get total width of visible locked fields on a given side. */
    getLockedAreaWidth(side: 'left' | 'right'): number;
    /** Returns fields ordered: locked-left, unlocked, locked-right. */
    getOrderedFields(): ResolvedField<TData>[];
    isSearchEnabled(): boolean;
    isFooterEnabled(): boolean;
    getFooterDef(): FooterDef | null;
    getFooterWidget(key: string): FooterWidgetDef | null;
    isSearchPresent(): boolean;
    getSearchText(): string;
    resetSearch(): void;
    patchData(transaction: DataPatch<TData>): void;
    setFilters(filters: FilterState): void;
    getFilters(): FilterState;
    setSearch(text: string): void;
    getFieldFilter(fieldId: FieldId): _repo_types.FilterRule | undefined;
    setFieldFilter(fieldId: FieldId, condition: _repo_types.FilterRule): void;
    onFilterChanged(): void;
    destroyFilter(fieldId: FieldId): void;
    getStickyTopRows(): readonly RowEntry<TData>[];
    getStickyBottomRows(): readonly RowEntry<TData>[];
    setStickyTopData(rowData: TData[]): void;
    setStickyBottomData(rowData: TData[]): void;
    setGroupFields(fields: FieldId[]): void;
    addGroupFields(fields: FieldId[]): void;
    removeGroupFields(fields: FieldId[]): void;
    expandAll(): void;
    collapseAll(): void;
    setEntryExpanded(rowKey: RowKey, expanded: boolean): void;
    addAggFuncs(funcs: Record<string, (params: {
        values: unknown[];
    }) => unknown>): void;
    setFieldAggFunc(fieldId: FieldId, aggFunc: _repo_types.AggFunc): void;
    setPivotMode(enabled: boolean): void;
    isPivotMode(): boolean;
    setPivotFields(fields: FieldId[]): void;
    getPivotFields(): FieldId[];
    getPivotResultFields(): {
        fieldId: FieldId;
        title: string;
        dataKey: string;
    }[];
    paginationGoToPage(page: number): void;
    paginationGoToNextPage(): void;
    paginationGoToPreviousPage(): void;
    paginationGetCurrentPage(): number;
    paginationGetTotalPages(): number;
    getRowHeightForEntry(entry: RowEntry<TData>): number;
    getRowSpan(col: ResolvedField<TData>, rowIndex: number): number;
    getRowClassForEntry(entry: RowEntry<TData>): string;
    getRowClassRulesForEntry(entry: RowEntry<TData>): string[];
    private asyncTransactionQueue;
    private asyncFlushTimer;
    patchDataAsync(transaction: DataPatch<TData>): void;
    flushAsyncPatches(): Promise<void>;
    moveRowByIndex(fromIndex: number, toIndex: number): void;
    getFocusedCell(): {
        rowId: RowKey;
        fieldId: FieldId;
    } | null;
    setFocusedCell(rowKey: RowKey, fieldId: FieldId): void;
    clearFocusedCell(): void;
    getCopyData(opts?: {
        includeHeaders?: boolean;
    }): string;
    pasteData(text: string, startRowKey: RowKey, startFieldId: FieldId): void;
    addCellSpan(range: CellSpan): void;
    deleteSpanValues(): void;
    copyDownSpan(): void;
    /**
     * Fill down: sourceRowStart is the first source row. All rows from
     * sourceRowStart to the end of the originally selected range are "source".
     * Rows beyond that to endRowIndex are "target". If the selection itself
     * is being extended, the first row is the source, the rest are targets.
     *
     * Simplified: row at startRowIndex is the anchor. Collect contiguous
     * non-empty values from startRowIndex as the source pattern. Apply
     * that pattern to all rows from (start + sourceCount) to endRowIndex.
     */
    fillDown(fieldId: FieldId, sourceStart: number, sourceEnd: number, targetEnd: number): void;
    clearCellSpans(): void;
    getCellSpans(): readonly CellSpan[];
    getDataAsCsv(opts?: CsvExportOptions<TData>): string;
    undoCellEditing(): void;
    redoCellEditing(): void;
    getCurrentUndoSize(): number;
    getCurrentRedoSize(): number;
    loadInfiniteBlock(blockIndex: number): Promise<void>;
    getInfiniteRowCount(): number;
    purgeInfiniteCache(): void;
    private rebuildInfiniteVisibleRows;
    getActiveOverlay(): 'loading' | 'noRows' | null;
    setLoading(loading: boolean): void;
    getTotalRowCount(): number;
    getFilteredRowCount(): number;
    getSelectedRowCount(): number;
    getSpanAggregation(): {
        count: number;
        sum: number;
        min: number;
        max: number;
        avg: number;
    };
    flashCells(params: {
        rowKeys: RowKey[];
        fields: FieldId[];
        flashDuration?: number;
        fadeDuration?: number;
    }): void;
    addAlignedGrid(grid: GridEngine<any>): void;
    removeAlignedGrid(grid: GridEngine<any>): void;
    private propagateToAligned;
    getLocaleText(key: string): string;
    getPersistableLayout(): PersistableLayout;
    applyPersistableLayout(saved: PersistableLayout): void;
    setPanelVisible(visible: boolean): void;
    isPanelVisible(): boolean;
    openPanelTab(panelId: string): void;
    closePanelTab(): void;
    getOpenedPanelTab(): string | null;
    isPanelTabShowing(panelId?: string): boolean;
    refreshPanelTab(panelId?: string): void;
    getPanelDef(): PanelDef | null;
    configurePanelDef(panelConfig: PanelConfig): void;
    private nextChartId;
    createRangeChart(params: {
        chartType: ChartType;
        categoryFieldId: FieldId;
        valueFieldIds: FieldId[];
        rowRange?: {
            startIndex: number;
            endIndex: number;
        } | 'all';
        title?: string;
        subtitle?: string;
        crossFilter?: boolean;
        width?: number;
        height?: number;
    }): ChartId;
    createPivotChart(params: {
        chartType: ChartType;
        categoryFieldIds: FieldId[];
        valueFieldIds: FieldId[];
        title?: string;
        subtitle?: string;
        crossFilter?: boolean;
        width?: number;
        height?: number;
    }): ChartId;
    updateChart(chartId: ChartId, updates: Partial<ChartModelDef>): void;
    destroyChart(chartId: ChartId): void;
    getChartModels(): ReadonlyArray<ChartModelDef | ChartPivotDef>;
    getChartModel(chartId: ChartId): (ChartModelDef | ChartPivotDef) | undefined;
    downloadChart(chartId: ChartId, filename?: string): void;
    isChartsEnabled(): boolean;
    showContextMenu(params: {
        rowKey?: RowKey;
        fieldId?: FieldId;
        clientX: number;
        clientY: number;
    }): void;
    hidePopupMenu(): void;
    isEditing(): boolean;
    startEditingCell(rowKey: RowKey, fieldId: FieldId): void;
    stopEditing(): void;
    getEditingCell(): {
        rowKey: RowKey;
        fieldId: FieldId;
    } | null;
    ensureIndexVisible(rowIndex: number): void;
    ensureFieldVisible(fieldId: FieldId): void;
    getAriaMetadata(): {
        role: string;
        rowCount: number;
        colCount: number;
    };
    paginationGetPageSize(): number;
    setEntryData(rowKey: RowKey, data: TData): void;
    destroy(): void;
}
interface CsvExportOptions<TData = unknown> {
    columnSeparator?: string;
    suppressHeaders?: boolean;
    suppressFormulaInjection?: boolean;
    processCellCallback?: (params: {
        value: unknown;
        data: TData;
        fieldId: FieldId;
        field: ResolvedField<TData>;
    }) => string;
    processHeaderCallback?: (params: {
        title: string;
        fieldId: FieldId;
    }) => string;
    shouldRowBeSkipped?: (params: {
        data: TData;
        entry: RowEntry<TData>;
    }) => boolean;
}
declare function normalizeFooterDef(config: FooterConfig | undefined): FooterDef | null;

declare function resolveFieldDef<TData = unknown>(fieldDef: FieldDef<TData>, index: number, defaultFieldDef?: FieldDef<TData>, fieldPresets?: Record<string, Partial<FieldDef<TData>>>): ResolvedField<TData>;
/**
 * Flatten field defs (including groups with children) into leaf ResolvedFields.
 */
declare function resolveFieldDefs<TData = unknown>(fieldDefs: FieldDef<TData>[], defaultFieldDef?: FieldDef<TData>, fieldPresets?: Record<string, Partial<FieldDef<TData>>>): ResolvedField<TData>[];
/**
 * Extract field group definitions from nested field defs.
 */
declare function extractFieldGroups(fieldDefs: FieldDef<any>[]): FieldGroup[];
declare function clampWidth(width: number, col: ResolvedField<any>): number;

declare function createEntry<TData>(data: TData, index: number, id?: RowKey): RowEntry<TData>;
declare function buildEntries<TData>(rowData: TData[], getRowId?: (data: TData, index: number) => RowKey): RowEntry<TData>[];
/** Reset the internal counter (useful for tests). */
declare function resetRowCounter(): void;

interface ReducerOptions<TData = unknown> {
    getRowId?: (data: TData, index?: number) => RowKey;
    pagination?: boolean;
    paginationPageSize?: number;
    groupDefaultExpanded?: number;
    isGroupOpenByDefault?: (params: {
        groupValue: unknown;
        level: number;
        dataKey: string;
    }) => boolean;
    cascadeSelection?: boolean;
    overallSummary?: 'top' | 'bottom';
    groupSummary?: 'top' | 'bottom';
    aggregators?: Record<string, (params: {
        values: unknown[];
    }) => unknown>;
    groupAggregator?: (params: {
        entries: RowEntry<TData>[];
        fields: ResolvedField<TData>[];
    }) => Record<string, unknown>;
    includeHiddenFieldsInSearch?: boolean;
    searchParser?: (text: string) => string[];
    searchMatcher?: (parts: string[], rowText: string) => boolean;
    filterAggregates?: boolean;
    hierarchical?: boolean;
    pathGetter?: (data: TData) => string[];
    parentKeyField?: string;
    hasCustomFilter?: () => boolean;
    customFilterPass?: (entry: RowEntry<TData>) => boolean;
    expandableRows?: boolean;
    isExpandable?: (data: TData) => boolean;
    getNestedData?: (data: TData) => unknown[];
    isSpanningRow?: (params: {
        data: TData;
        entry: RowEntry<TData>;
    }) => boolean;
    processUnpinnedFields?: (params: {
        fields: ResolvedField<TData>[];
        locked: 'left' | 'right';
    }) => FieldId[];
    gridWidth?: number | null;
    minUnpinnedWidth?: number;
}
/**
 * Apply a command to the grid snapshot. Mutates `state` in place and emits
 * signals for anything that changed. Returns the same state reference.
 */
declare function commandReducer<TData>(state: GridSnapshot<TData>, command: GridCommand<TData>, events: EventHub<GridEvents<TData>>, opts?: ReducerOptions<TData>): GridSnapshot<TData>;
/** Get the value for a cell, using getValue if defined, otherwise dataKey (supports dot notation). */
declare function readCellValue<TData>(data: TData, col: ResolvedField<TData>): unknown;

interface TreeNode<TData> {
    key: string;
    data?: TData;
    children: TreeNode<TData>[];
}
/**
 * Build tree structure from data paths (e.g., ['src', 'index.ts']).
 */
declare function buildTreeFromPaths<TData>(rows: RowEntry<TData>[], getDataPath: (data: TData) => string[]): TreeNode<TData>[];
/**
 * Build tree structure from parent ID references.
 */
declare function buildTreeFromParentIds<TData>(rows: RowEntry<TData>[], parentIdField: string, getRowId: (data: TData) => RowKey): TreeNode<TData>[];
/**
 * Flatten a tree into displayable rows, respecting expansion state.
 */
declare function flattenTree<TData>(tree: TreeNode<TData>[], expandedGroups: Set<RowKey>, groupDefaultExpanded: number, level?: number): RowEntry<TData>[];

declare const testIdFor: {
    cell: (rowKey: RowKey, fieldId: FieldId) => string;
    headerCell: (fieldId: FieldId) => string;
    row: (rowKey: RowKey) => string;
};

/** Convert a column letter (A, B, ..., Z, AA, AB, ...) to a 0-based index. */
declare function colLetterToIndex(letter: string): number;
/** Convert a 0-based column index to a letter (0→A, 1→B, ..., 25→Z, 26→AA). */
declare function indexToColLetter(index: number): string;
/** Parse a cell reference like "A1" into { col: 0, row: 0 }. */
declare function parseCellRef(ref: string): {
    col: number;
    row: number;
};
declare class FormulaError extends Error {
    constructor(message: string);
}
/**
 * CellValueResolver is called to look up a cell's raw value.
 * colIndex is 0-based (A=0, B=1), rowIndex is 0-based.
 * Returns the raw value at that cell, or undefined if out of bounds.
 */
type CellValueResolver = (colIndex: number, rowIndex: number) => unknown;
/**
 * Evaluate a formula expression string and return the result.
 * The expression should NOT include the leading '='.
 */
declare function evaluateFormula(expression: string, resolve: CellValueResolver, depth?: number): unknown;
/** Returns true if the value is a string starting with '='. */
declare function isFormula(value: unknown): value is string;

export { type CellValueResolver, EventHub, FormulaError, GridEngine, buildEntries, buildTreeFromParentIds, buildTreeFromPaths, clampWidth, colLetterToIndex, commandReducer, createEntry, evaluateFormula, extractFieldGroups, flattenTree, indexToColLetter, isFormula, normalizeFooterDef, parseCellRef, readCellValue, resetRowCounter, resolveFieldDef, resolveFieldDefs, testIdFor };
