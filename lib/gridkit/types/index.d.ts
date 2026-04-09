import { z } from 'zod';

declare const RowKeySchema: z.ZodBranded<z.ZodString, "RowKey">;
type RowKey = z.infer<typeof RowKeySchema>;
declare const FieldIdSchema: z.ZodBranded<z.ZodString, "FieldId">;
type FieldId = z.infer<typeof FieldIdSchema>;
declare const SortDirectionSchema: z.ZodEnum<["asc", "desc"]>;
type SortDirection = z.infer<typeof SortDirectionSchema>;
declare const SortRuleSchema: z.ZodObject<{
    id: z.ZodBranded<z.ZodString, "FieldId">;
    sort: z.ZodEnum<["asc", "desc"]>;
}, "strip", z.ZodTypeAny, {
    sort: "asc" | "desc";
    id: string & z.BRAND<"FieldId">;
}, {
    sort: "asc" | "desc";
    id: string;
}>;
type SortRule = z.infer<typeof SortRuleSchema>;
interface CellRendererParams<TData = unknown> {
    /** Raw cell value (from getValue or dataKey). */
    value: unknown;
    /** Formatted display string (from format or String(value)). */
    formattedValue: string;
    /** Row data. */
    data: TData;
}
declare const FieldDefSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodBranded<z.ZodString, "FieldId">>;
    dataKey: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    flex: z.ZodOptional<z.ZodNumber>;
    resizable: z.ZodOptional<z.ZodBoolean>;
    sortable: z.ZodOptional<z.ZodBoolean>;
    editable: z.ZodOptional<z.ZodBoolean>;
    visible: z.ZodOptional<z.ZodBoolean>;
    locked: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["left", "right"]>, z.ZodBoolean]>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    id?: (string & z.BRAND<"FieldId">) | undefined;
    dataKey?: string | undefined;
    title?: string | undefined;
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    flex?: number | undefined;
    resizable?: boolean | undefined;
    sortable?: boolean | undefined;
    editable?: boolean | undefined;
    visible?: boolean | undefined;
    locked?: boolean | "left" | "right" | undefined;
}, {
    type?: string | undefined;
    id?: string | undefined;
    dataKey?: string | undefined;
    title?: string | undefined;
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    flex?: number | undefined;
    resizable?: boolean | undefined;
    sortable?: boolean | undefined;
    editable?: boolean | undefined;
    visible?: boolean | undefined;
    locked?: boolean | "left" | "right" | undefined;
}>;
type FieldDef<TData = unknown> = z.infer<typeof FieldDefSchema> & {
    /** Child fields for field groups. */
    children?: FieldDef<TData>[];
    /** Group ID for field groups. */
    groupId?: string;
    /** Field span callback: returns number of fields to span for a row. */
    span?: (params: {
        data: TData;
    }) => number;
    /** Prevent field from being moved. */
    fixedPosition?: boolean;
    /** Prevent field from being shown/hidden. */
    fixedVisibility?: boolean;
    /** Prevent lock state changes. */
    fixedLock?: boolean;
    /** Enable drag reordering. */
    draggable?: boolean;
    /** CSS style object or function for cells. */
    style?: Record<string, string> | ((params: {
        data: TData;
        value: unknown;
    }) => Record<string, string>);
    /** CSS class for cells. */
    className?: string | string[] | ((params: {
        data: TData;
        value: unknown;
    }) => string | string[]);
    /** Conditional CSS class rules. */
    classRules?: Record<string, (params: {
        data: TData;
        value: unknown;
    }) => boolean>;
    /**
     * Cell renderer — framework adapters interpret this value to render custom cell content.
     * When a function, receives cell params and returns an HTML string (vanilla) or
     * framework-specific output. Can also be a string name mapped to a registered component.
     */
    render?: ((params: CellRendererParams<TData>) => unknown) | string;
    /** Static params passed to the cell renderer by framework adapters. */
    renderParams?: Record<string, unknown>;
    /** Enable multi-line text wrapping. */
    wrap?: boolean;
    /** Editable as callback: (params) => boolean. */
    editableFn?: (params: {
        data: TData;
    }) => boolean;
    /** Tooltip data key name. */
    tooltipKey?: string;
    /** Tooltip value getter. */
    getTooltip?: (params: {
        data: TData;
        value: unknown;
    }) => string;
    /** Title tooltip text. */
    titleTooltip?: string;
    /** Title CSS class. */
    titleClass?: string;
    /** Title inline style. */
    titleStyle?: Record<string, string>;
    /** Row spanning: true to merge consecutive equal values, or callback. */
    mergeRows?: boolean | ((params: {
        data: TData;
        previousData: TData;
    }) => boolean);
    /** Enable flash animation when cell value changes. */
    flashOnChange?: boolean;
    /** External edit: fires editRequested instead of modifying data. */
    externalEdit?: boolean;
    /** Enable native DnD from this field. */
    dragSource?: boolean;
    /** Initial sort direction. */
    sort?: SortDirection;
    /** Sort priority index for multi-field initial sort. */
    sortIndex?: number;
    /** Dynamic title callback. */
    getTitle?: (params: {
        fieldDef: FieldDef<TData>;
    }) => string;
    /** Aggregation function for this field when grouping. */
    aggregate?: AggFunc;
    /** Custom sort comparator: (valueA, valueB, entryA, entryB) => number */
    compare?: (a: unknown, b: unknown) => number;
    /** Value getter: retrieve cell value from row data */
    getValue?: (params: {
        data: TData;
        fieldDef: FieldDef<TData>;
    }) => unknown;
    /** Value formatter: format cell value for display */
    format?: (params: {
        value: unknown;
        data: TData;
        fieldDef: FieldDef<TData>;
    }) => string;
    /** Value setter: set cell value on row data, return true if changed */
    setValue?: (params: {
        data: TData;
        newValue: unknown;
        fieldDef: FieldDef<TData>;
    }) => boolean;
    /** Value parser: parse edited value before saving */
    parse?: (params: {
        newValue: unknown;
        oldValue: unknown;
        data: TData;
        fieldDef: FieldDef<TData>;
    }) => unknown;
    /** Custom search text for this field. */
    searchText?: (params: {
        data: TData;
        value: unknown;
    }) => string;
    /** Per-field filter configuration. */
    filterConfig?: {
        caseSensitive?: boolean;
        includeBlanksInEquals?: boolean;
        includeBlanksInLessThan?: boolean;
        includeBlanksInGreaterThan?: boolean;
        /** Include blank values in `between` range comparisons. */
        includeBlanksInRange?: boolean;
        /** Number of decimal places to round to before numeric comparison. */
        allowedDecimalPlaces?: number;
        /** Custom value-to-number conversion for number filters. */
        numberParser?: (value: unknown) => number | null;
        /** Custom value-to-Date conversion for date filters. */
        dateParser?: (value: unknown) => Date | null;
    };
    /** Field filter type: 'text' (default dropdown+input) or 'set' (checkbox list). */
    filter?: FieldFilterType;
    /** Enable row drag from this field. */
    rowDrag?: boolean;
};
type AggFunc = 'sum' | 'min' | 'max' | 'count' | 'avg' | 'first' | 'last' | (string & {});
/** Runtime representation of a single row in the grid. */
interface RowEntry<TData = unknown> {
    readonly id: RowKey;
    data: TData;
    readonly rowIndex: number;
    selected: boolean;
    /** True if this is a group header row. */
    isGroup?: boolean;
    /** True if this row can be expanded to show nested content. */
    isExpandable?: boolean;
    /** True if this is a nested row (expandable rows). */
    isNestedRow?: boolean;
    /** Nested data for expandable rows. */
    nestedData?: unknown[];
    /** True if this is a spanning row. */
    isSpanningRow?: boolean;
    /** The group value (e.g., "London"). */
    groupValue?: unknown;
    /** Number of leaf children in this group. */
    childCount?: number;
    /** Whether the group is expanded. */
    expanded?: boolean;
    /** Aggregation results keyed by data key. */
    aggData?: Record<string, unknown>;
    /** Depth level in group hierarchy (0 = top). */
    level?: number;
}
/** Individual theme parameter values mapping to `--gk-*` CSS custom properties. */
interface ThemeParams {
    bg?: string;
    borderColor?: string;
    textColor?: string;
    textMuted?: string;
    focusColor?: string;
    flashColor?: string;
    headerBg?: string;
    headerTextColor?: string;
    headerHoverBg?: string;
    rowHoverBg?: string;
    rowSelectedBg?: string;
    groupRowBg?: string;
    grandTotalBg?: string;
    subtotalBg?: string;
    fontFamily?: string;
    fontSize?: string;
    sidebarWidth?: string;
    sidebarMinWidth?: string;
    sidebarMaxWidth?: string;
    linkColor?: string;
}
type ColorScheme = 'light' | 'dark';
interface ThemeConfig {
    /** Base built-in theme to start from. Default 'origin'. */
    base?: 'origin' | 'ember' | 'material' | 'glacier' | 'midnight';
    /** Color scheme. Default 'light'. */
    colorScheme?: ColorScheme;
    /** Override individual theme parameters. */
    params?: ThemeParams;
}
declare const GridConfigSchema: z.ZodObject<{
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodBranded<z.ZodString, "FieldId">>;
        dataKey: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        flex: z.ZodOptional<z.ZodNumber>;
        resizable: z.ZodOptional<z.ZodBoolean>;
        sortable: z.ZodOptional<z.ZodBoolean>;
        editable: z.ZodOptional<z.ZodBoolean>;
        visible: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["left", "right"]>, z.ZodBoolean]>>;
    }, "strip", z.ZodTypeAny, {
        type?: string | undefined;
        id?: (string & z.BRAND<"FieldId">) | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }, {
        type?: string | undefined;
        id?: string | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }>, "many">>;
    fieldDefaults: z.ZodOptional<z.ZodObject<{
        id: z.ZodOptional<z.ZodBranded<z.ZodString, "FieldId">>;
        dataKey: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        width: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        flex: z.ZodOptional<z.ZodNumber>;
        resizable: z.ZodOptional<z.ZodBoolean>;
        sortable: z.ZodOptional<z.ZodBoolean>;
        editable: z.ZodOptional<z.ZodBoolean>;
        visible: z.ZodOptional<z.ZodBoolean>;
        locked: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["left", "right"]>, z.ZodBoolean]>>;
    }, "strip", z.ZodTypeAny, {
        type?: string | undefined;
        id?: (string & z.BRAND<"FieldId">) | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }, {
        type?: string | undefined;
        id?: string | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }>>;
    selectionMode: z.ZodOptional<z.ZodEnum<["single", "multiple"]>>;
    sortable: z.ZodOptional<z.ZodBoolean>;
    resizable: z.ZodOptional<z.ZodBoolean>;
    paginate: z.ZodOptional<z.ZodBoolean>;
    pageSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    fields: {
        type?: string | undefined;
        id?: (string & z.BRAND<"FieldId">) | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }[];
    resizable?: boolean | undefined;
    sortable?: boolean | undefined;
    fieldDefaults?: {
        type?: string | undefined;
        id?: (string & z.BRAND<"FieldId">) | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    } | undefined;
    selectionMode?: "single" | "multiple" | undefined;
    paginate?: boolean | undefined;
    pageSize?: number | undefined;
}, {
    resizable?: boolean | undefined;
    sortable?: boolean | undefined;
    fields?: {
        type?: string | undefined;
        id?: string | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    }[] | undefined;
    fieldDefaults?: {
        type?: string | undefined;
        id?: string | undefined;
        dataKey?: string | undefined;
        title?: string | undefined;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        flex?: number | undefined;
        resizable?: boolean | undefined;
        sortable?: boolean | undefined;
        editable?: boolean | undefined;
        visible?: boolean | undefined;
        locked?: boolean | "left" | "right" | undefined;
    } | undefined;
    selectionMode?: "single" | "multiple" | undefined;
    paginate?: boolean | undefined;
    pageSize?: number | undefined;
}>;
/** Field group definition (resolved at runtime). */
interface FieldGroup {
    groupId: string;
    title: string;
    children: FieldId[];
}
/** Saved field layout state for persistence. */
interface FieldLayout {
    id: FieldId;
    width: number;
    visible: boolean;
    locked: 'left' | 'right' | false;
    sort?: SortDirection;
    sortIndex?: number;
}
type GridConfig<TData = unknown> = Omit<z.infer<typeof GridConfigSchema>, 'fields' | 'fieldDefaults'> & {
    /** Field definitions. */
    fields: FieldDef<TData>[];
    /** Default field definition applied to all fields. */
    fieldDefaults?: FieldDef<TData>;
    /** Named field type presets. */
    fieldPresets?: Record<string, Partial<FieldDef<TData>>>;
    /** Return a unique key for a row. Used for data patches and selection persistence. */
    rowKeyGetter?: (data: TData, index?: number) => RowKey;
    /** Default group expansion level. -1 = expand all, 0 = collapse all. */
    groupExpandDepth?: number;
    /** Per-group callback to determine if a group should be expanded by default. Overrides groupExpandDepth. */
    isGroupExpanded?: (params: {
        groupKey: unknown;
        level: number;
        field: string;
    }) => boolean;
    /** Rows pinned to top of grid. */
    stickyTopRows?: TData[];
    /** Rows pinned to bottom of grid. */
    stickyBottomRows?: TData[];
    /** Enable tree data mode. */
    hierarchical?: boolean;
    /** Callback to get data path array for tree data. */
    pathGetter?: (data: TData) => string[];
    /** Field name containing parent ID for self-referential tree data. */
    parentKeyField?: string;
    /** Enable cell range selection. */
    cellSelect?: boolean;
    /** Enable undo/redo for cell edits. */
    editHistory?: boolean;
    /** Max undo steps (default 10). */
    editHistoryLimit?: number;
    /** Fixed row height in pixels. */
    rowHeight?: number;
    /** Dynamic per-row height callback. */
    rowHeightGetter?: (params: {
        data: TData;
        node: RowEntry<TData>;
    }) => number;
    /** Row class callback. */
    rowClassGetter?: (params: {
        data: TData;
        node: RowEntry<TData>;
    }) => string;
    /** Conditional row class rules. */
    rowClassRules?: Record<string, (params: {
        data: TData;
        node: RowEntry<TData>;
    }) => boolean>;
    /** Callback to determine if a row is a spanning row. */
    isSpanningRow?: (params: {
        data: TData;
        node: RowEntry<TData>;
    }) => boolean;
    /** Enable expandable rows mode (master-detail). */
    expandableRows?: boolean;
    /** Callback to determine if a row is expandable. */
    isExpandable?: (data: TData) => boolean;
    /** Callback to get nested row data for an expandable row. */
    getNestedData?: (data: TData) => unknown[];
    /** External filter present callback. */
    hasCustomFilter?: () => boolean;
    /** External filter pass callback. */
    customFilterPass?: (node: RowEntry<TData>) => boolean;
    /** Shared application context object. */
    context?: unknown;
    /** Data mode. Default is 'clientSide'. */
    dataMode?: 'clientSide' | 'infinite';
    /** Fetch size for streaming data mode. */
    fetchSize?: number;
    /** Max cached pages for streaming data mode. */
    maxCachedPages?: number;
    /** Streaming data provider for infinite data mode. */
    streamProvider?: StreamingProvider;
    /** Cascade selection: selecting a group selects all children. */
    cascadeSelection?: boolean;
    /** Add an overall summary row at top or bottom. */
    overallSummary?: 'top' | 'bottom';
    /** Add group summary rows within each group at top or bottom. */
    groupSummary?: 'top' | 'bottom';
    /** Named custom aggregation functions. */
    aggregators?: Record<string, (params: {
        values: unknown[];
    }) => unknown>;
    /** Custom aggregation callback — overrides per-field aggregate when provided. */
    groupAggregator?: (params: {
        nodes: RowEntry<TData>[];
        columns: ResolvedField<TData>[];
    }) => Record<string, unknown>;
    /** Filter group rows by their aggregated values. */
    filterAggregates?: boolean;
    /** Footer configuration. `true` shows a default row-count widget. Pass a `FooterDefInput` for custom widgets. */
    footer?: FooterConfig;
    /** Show the built-in search input. Default false. */
    quickFilter?: boolean;
    /** Include hidden fields in search text. Default false. */
    searchHiddenFields?: boolean;
    /** Custom parser for search text — splits input into parts. */
    searchParser?: (text: string) => string[];
    /** Custom matcher for search — returns true if row matches. */
    searchMatcher?: (parts: string[], rowText: string) => boolean;
    /** Row buffer for virtualization. */
    rowBuffer?: number;
    /** Enable/disable row animation. */
    animateRows?: boolean;
    /** Render all rows (disable row virtualization). */
    renderAllRows?: boolean;
    /** Render all fields (disable field virtualization). */
    renderAllFields?: boolean;
    /** Enable right-to-left text direction. */
    rightToLeft?: boolean;
    /** Restrict sorting to a single field. */
    singleSort?: boolean;
    /** Suppress the 'no rows' overlay. */
    suppressNoRowsOverlay?: boolean;
    /** Show the row group panel (the "Drag a field header here to group" bar). */
    enableRowGroupPanel?: boolean;
    /** Static translation text map. */
    translations?: Record<string, string>;
    /** Callback for translation text resolution. */
    translate?: (key: string) => string;
    /** Panel configuration. */
    panel?: PanelConfig;
    /** Show right-click context menu. */
    contextMenu?: boolean;
    /** Suppress field menu button in headers. */
    suppressColumnMenu?: boolean;
    /** Custom context menu items callback. Return array of MenuEntry or built-in action strings. */
    contextMenuBuilder?: (params: GetContextMenuItemsParams<TData>) => (MenuEntry | BuiltInMenuAction)[];
    /** Custom field menu items callback. */
    fieldMenuBuilder?: (params: GetFieldMenuItemsParams<TData>) => (MenuEntry | BuiltInMenuAction)[];
    /** Theme configuration. */
    theme?: ThemeConfig;
    /** Callback invoked when a field is locked. Receives the already-locked fields on that side.
     *  Return FieldIds of fields that should be unlocked to make room. */
    processUnpinnedColumns?: (params: {
        columns: ResolvedField<TData>[];
        pinned: 'left' | 'right';
    }) => FieldId[];
    /** Minimum width (in px) reserved for the unlocked center field area. Default 50. */
    minUnpinnedWidth?: number;
    /** Enable row pinning. */
    rowPinning?: boolean;
    /** Managed drag for rows. */
    managedDrag?: boolean;
    /** Enable cell expressions. */
    cellExpressions?: boolean;
    /** Enable integrated charting. Default false. */
    enableCharts?: boolean;
    /** Default chart configuration. */
    chartDefaults?: {
        width?: number;
        height?: number;
        liveUpdate?: boolean;
    };
};
interface GridSnapshot<TData = unknown> {
    /** Resolved field definitions (merged with defaults). */
    fields: ResolvedField<TData>[];
    /** All row data currently held by the grid. */
    data: TData[];
    /** Row entries wrapping each data item. */
    entries: RowEntry<TData>[];
    /** Active sort rules (ordered). */
    sortRules: SortRule[];
    /** Field IDs used for row grouping. */
    groupFields: FieldId[];
    /** Expansion state of group rows. */
    expandedGroups: Set<RowKey>;
    /** Field IDs used for pivoting. */
    pivotFields: FieldId[];
    /** Whether pivot mode is active. */
    pivoting: boolean;
    /** Active field filter state. */
    filters: FilterState;
    /** Active search text. */
    searchText: string;
    /** Set of selected row keys. */
    selectedKeys: Set<RowKey>;
    /** Current pagination page (0-indexed). */
    page: number;
    /** Currently focused cell. */
    focus: {
        rowId: RowKey;
        fieldId: FieldId;
    } | null;
    /** Active cell spans. */
    cellSpans: CellSpan[];
    /** Rows pinned to top. */
    stickyTop: RowEntry<TData>[];
    /** Rows pinned to bottom. */
    stickyBottom: RowEntry<TData>[];
    /** Rows after filter → sort (before pagination). */
    filteredRows: RowEntry<TData>[];
    /** Rows after the full pipeline: filter → sort → group → paginate. */
    visibleRows: RowEntry<TData>[];
    /** Panel and tab state. Null if panel is not configured. */
    panel: PanelState | null;
    /** Chart state. Null when enableCharts is false. */
    charts: ChartState | null;
}
interface ResolvedField<TData = unknown> {
    id: FieldId;
    dataKey?: string;
    title: string;
    width: number;
    minWidth: number;
    maxWidth: number;
    flex?: number;
    resizable: boolean;
    sortable: boolean;
    editable: boolean;
    visible: boolean;
    locked: 'left' | 'right' | false;
    fixedPosition?: boolean;
    fixedVisibility?: boolean;
    fixedLock?: boolean;
    draggable?: boolean;
    span?: FieldDef<TData>['span'];
    style?: FieldDef<TData>['style'];
    className?: FieldDef<TData>['className'];
    classRules?: FieldDef<TData>['classRules'];
    render?: FieldDef<TData>['render'];
    renderParams?: FieldDef<TData>['renderParams'];
    wrap?: boolean;
    editableFn?: FieldDef<TData>['editableFn'];
    tooltipKey?: string;
    getTooltip?: FieldDef<TData>['getTooltip'];
    titleTooltip?: string;
    titleClass?: string;
    titleStyle?: Record<string, string>;
    mergeRows?: FieldDef<TData>['mergeRows'];
    flashOnChange?: boolean;
    externalEdit?: boolean;
    dragSource?: boolean;
    aggregate?: AggFunc;
    compare?: (a: unknown, b: unknown) => number;
    getValue?: FieldDef<TData>['getValue'];
    format?: FieldDef<TData>['format'];
    setValue?: FieldDef<TData>['setValue'];
    parse?: FieldDef<TData>['parse'];
    searchText?: FieldDef<TData>['searchText'];
    filterConfig?: FieldDef<TData>['filterConfig'];
    filter?: FieldDef<TData>['filter'];
}
type GridCommand<TData = unknown> = {
    type: 'LOAD_DATA';
    data: TData[];
} | {
    type: 'DEFINE_FIELDS';
    fields: FieldDef<TData>[];
} | {
    type: 'UPDATE_SORT';
    sortRules: SortRule[];
} | {
    type: 'PICK_ROW';
    rowKey: RowKey;
    selected: boolean;
} | {
    type: 'PICK_ALL';
    selected: boolean;
} | {
    type: 'RESIZE_FIELD';
    fieldId: FieldId;
    width: number;
} | {
    type: 'REORDER_FIELD';
    fieldId: FieldId;
    toIndex: number;
} | {
    type: 'LOCK_FIELD';
    fieldId: FieldId;
    locked: 'left' | 'right' | false;
} | {
    type: 'TOGGLE_FIELD';
    fieldId: FieldId;
    visible: boolean;
} | {
    type: 'PATCH_DATA';
    patch: DataPatch<TData>;
} | {
    type: 'SET_FILTERS';
    filters: FilterState;
} | {
    type: 'SET_SEARCH';
    text: string;
} | {
    type: 'GO_TO_PAGE';
    page: number;
} | {
    type: 'SET_GROUP_FIELDS';
    fields: FieldId[];
} | {
    type: 'ADD_GROUP_FIELDS';
    fields: FieldId[];
} | {
    type: 'REMOVE_GROUP_FIELDS';
    fields: FieldId[];
} | {
    type: 'TOGGLE_EXPAND';
    rowKey: RowKey;
    expanded: boolean;
} | {
    type: 'SET_STICKY_TOP';
    data: TData[];
} | {
    type: 'SET_STICKY_BOTTOM';
    data: TData[];
} | {
    type: 'SET_PIVOT_FIELDS';
    fields: FieldId[];
} | {
    type: 'TOGGLE_PIVOT';
    enabled: boolean;
} | {
    type: 'EXPAND_ALL';
} | {
    type: 'COLLAPSE_ALL';
} | {
    type: 'TOGGLE_PANEL';
    visible: boolean;
} | {
    type: 'OPEN_PANEL_TAB';
    tabId: string;
} | {
    type: 'CLOSE_PANEL_TAB';
} | {
    type: 'CONFIGURE_PANEL';
    panelDef: PanelDef;
} | {
    type: 'SET_FOCUS';
    rowKey: RowKey;
    fieldId: FieldId;
} | {
    type: 'CLEAR_FOCUS';
} | {
    type: 'SET_CELL_SPANS';
    cellSpans: CellSpan[];
} | {
    type: 'CLEAR_CELL_SPANS';
} | {
    type: 'EDIT_CELL';
    rowKey: RowKey;
    fieldId: FieldId;
    value: unknown;
} | {
    type: 'UNDO';
} | {
    type: 'REDO';
} | {
    type: 'CREATE_CHART';
    chart: ChartModelDef | ChartPivotDef;
} | {
    type: 'UPDATE_CHART';
    chartId: ChartId;
    updates: Partial<ChartModelDef>;
} | {
    type: 'DESTROY_CHART';
    chartId: ChartId;
} | {
    type: 'SET_CHART_CROSS_FILTER';
    chartId: ChartId;
    filter: FilterState | null;
};
interface GridEvents<TData = unknown> {
    dataLoaded: {
        data: TData[];
    };
    sortUpdated: {
        sortRules: SortRule[];
    };
    selectionUpdated: {
        selectedKeys: Set<RowKey>;
    };
    fieldResized: {
        fieldId: FieldId;
        width: number;
    };
    fieldReordered: {
        fieldId: FieldId;
        toIndex: number;
    };
    fieldLocked: {
        fieldId: FieldId;
        locked: 'left' | 'right' | false;
    };
    fieldToggled: {
        fieldId: FieldId;
        visible: boolean;
    };
    cellEdited: {
        rowKey: RowKey;
        fieldId: FieldId;
        oldValue: unknown;
        newValue: unknown;
    };
    dataPatched: {
        add: TData[];
        update: TData[];
        remove: TData[];
    };
    filtersUpdated: {
        filters: FilterState;
    };
    pageChanged: {
        page: number;
        totalPages: number;
    };
    cellSpanUpdated: {
        cellSpans: CellSpan[];
    };
    rowMoved: {
        fromIndex: number;
        toIndex: number;
    };
    cellHighlighted: {
        cells: {
            rowKey: RowKey;
            fieldId: FieldId;
        }[];
        flashDuration: number;
        fadeDuration: number;
    };
    editRequested: {
        rowKey: RowKey;
        fieldId: FieldId;
        oldValue: unknown;
        newValue: unknown;
    };
    scrollToRow: {
        rowIndex: number;
    };
    scrollToField: {
        fieldId: FieldId;
    };
    focusChanged: {
        rowKey: RowKey | null;
        fieldId: FieldId | null;
    };
    snapshotChanged: {
        state: GridSnapshot<TData>;
    };
    panelTabToggled: {
        tabId: string | null;
        visible: boolean;
    };
    panelResized: {
        width: number;
    };
    panelUpdated: {
        panel: PanelState;
    };
    panelRefreshRequested: {
        tabId: string;
    };
    contextMenuShown: {
        rowKey: RowKey | null;
        fieldId: FieldId | null;
        clientX: number;
        clientY: number;
    };
    contextMenuDismissed: Record<string, never>;
    fieldMenuShown: {
        fieldId: FieldId;
    };
    fieldMenuDismissed: {
        fieldId: FieldId;
    };
    chartCreated: {
        chartId: ChartId;
        chart: ChartModelDef | ChartPivotDef;
    };
    chartUpdated: {
        chartId: ChartId;
    };
    chartDestroyed: {
        chartId: ChartId;
    };
    chartDownloadRequested: {
        chartId: ChartId;
        filename?: string;
    };
}
/** A single item in a context or field menu. */
interface MenuEntry {
    /** Display name. */
    name: string;
    /** Unique action identifier (e.g., 'copy', 'paste', 'separator'). */
    action?: string;
    /** Disable the item. */
    disabled?: boolean;
    /** CSS class for an icon. */
    icon?: string;
    /** Keyboard shortcut label (display only). */
    shortcut?: string;
    /** Submenu items. */
    subMenu?: MenuEntry[];
    /** Custom callback when clicked. */
    callback?: () => void;
}
/** Built-in context menu action names. */
type BuiltInMenuAction = 'copy' | 'cut' | 'paste' | 'separator' | 'sortAscending' | 'sortDescending' | 'pinLeft' | 'pinRight' | 'unpinColumn' | 'autoSizeColumn' | 'autoSizeAllColumns' | 'resetColumns' | 'groupByColumn' | 'ungroupByColumn' | 'expandAll' | 'collapseAll' | 'exportCsv' | 'hideColumn' | 'chartRange';
/** Parameters passed to contextMenuBuilder callback. */
interface GetContextMenuItemsParams<TData = unknown> {
    /** The row entry right-clicked (null if header). */
    node: RowEntry<TData> | null;
    /** The field right-clicked. */
    column: ResolvedField<TData> | null;
    /** The cell value. */
    value: unknown;
}
/** Parameters passed to fieldMenuBuilder callback. */
interface GetFieldMenuItemsParams<TData = unknown> {
    /** The field whose menu is open. */
    column: ResolvedField<TData>;
}
interface DataPatch<TData = unknown> {
    add?: TData[];
    update?: TData[];
    remove?: TData[];
}
interface CellSpan {
    startRowIndex: number;
    endRowIndex: number;
    fields: FieldId[];
}
type FieldFilterType = 'text' | 'set' | 'number' | 'date';
type FilterConditionType = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between' | 'blank' | 'notBlank' | 'inSet';
interface FilterCriteria {
    type: FilterConditionType;
    filter: unknown;
    /** When true, string comparisons are case-sensitive. Default is false (case-insensitive). */
    caseSensitive?: boolean;
}
/** Composite filter combining multiple criteria with AND/OR logic. */
interface CompositeFilterCriteria {
    filterType: 'join';
    operator: 'AND' | 'OR';
    conditions: FilterCriteria[];
}
/** A single filter rule: either a simple criteria or a composite AND/OR. */
type FilterRule = FilterCriteria | CompositeFilterCriteria;
/** Map of fieldId → filter rule. All field entries are AND-ed across fields. */
type FilterState = Record<string, FilterRule>;
/** Valid filter operators for each field filter type. */
declare const VALID_OPERATORS_BY_FILTER_TYPE: Record<FieldFilterType, readonly FilterConditionType[]>;
interface StreamingProviderParams {
    startRow: number;
    endRow: number;
    sortRules: SortRule[];
    filters: FilterState;
}
interface StreamingProviderResult<TData = unknown> {
    data: TData[];
    rowCount: number;
}
interface StreamingProvider<TData = unknown> {
    getRows: (params: StreamingProviderParams) => Promise<StreamingProviderResult<TData>>;
}
interface PersistableLayout {
    fields: FieldLayout[];
    sortRules: SortRule[];
    filters: FilterState;
    page: number;
}
declare const FIELDS_TAB_ID = "columns";
declare const FILTERS_TAB_ID = "filters";
declare const CHARTS_TAB_ID = "charts";
declare const PanelTabDefSchema: z.ZodObject<{
    id: z.ZodString;
    labelDefault: z.ZodString;
    iconKey: z.ZodOptional<z.ZodString>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    labelDefault: string;
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    iconKey?: string | undefined;
}, {
    id: string;
    labelDefault: string;
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    iconKey?: string | undefined;
}>;
type PanelTabDef = z.infer<typeof PanelTabDefSchema>;
declare const PanelDefSchema: z.ZodObject<{
    tabs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        labelDefault: z.ZodString;
        iconKey: z.ZodOptional<z.ZodString>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        width: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        labelDefault: string;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        iconKey?: string | undefined;
    }, {
        id: string;
        labelDefault: string;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        iconKey?: string | undefined;
    }>, "many">>;
    defaultTab: z.ZodOptional<z.ZodString>;
    position: z.ZodDefault<z.ZodEnum<["left", "right"]>>;
    width: z.ZodOptional<z.ZodNumber>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    showButtons: z.ZodDefault<z.ZodBoolean>;
    hiddenByDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    tabs: {
        id: string;
        labelDefault: string;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        iconKey?: string | undefined;
    }[];
    position: "left" | "right";
    showButtons: boolean;
    hiddenByDefault: boolean;
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    defaultTab?: string | undefined;
}, {
    width?: number | undefined;
    minWidth?: number | undefined;
    maxWidth?: number | undefined;
    tabs?: {
        id: string;
        labelDefault: string;
        width?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
        iconKey?: string | undefined;
    }[] | undefined;
    defaultTab?: string | undefined;
    position?: "left" | "right" | undefined;
    showButtons?: boolean | undefined;
    hiddenByDefault?: boolean | undefined;
}>;
type PanelDef = z.infer<typeof PanelDefSchema>;
type PanelDefInput = z.input<typeof PanelDefSchema>;
type PanelConfig = boolean | 'columns' | 'filters' | string[] | PanelDefInput;
interface PanelState {
    /** The resolved panel definition (always normalized to full form). */
    def: PanelDef;
    /** Whether the panel is visible. */
    visible: boolean;
    /** ID of the currently open panel tab, or null if none. */
    openTabId: string | null;
}
declare const TOTAL_COUNT_WIDGET = "gk-total-count";
declare const FILTERED_TOTAL_WIDGET = "gk-filtered-total";
declare const FILTERED_COUNT_WIDGET = "gk-filtered-count";
declare const SELECTED_COUNT_WIDGET = "gk-selected-count";
declare const AGGREGATION_WIDGET = "gk-aggregation";
declare const FooterWidgetDefSchema: z.ZodObject<{
    key: z.ZodString;
    widget: z.ZodString;
    align: z.ZodDefault<z.ZodEnum<["left", "center", "right"]>>;
    widgetParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    widget: string;
    align: "left" | "right" | "center";
    widgetParams?: Record<string, unknown> | undefined;
}, {
    key: string;
    widget: string;
    align?: "left" | "right" | "center" | undefined;
    widgetParams?: Record<string, unknown> | undefined;
}>;
type FooterWidgetDef = z.infer<typeof FooterWidgetDefSchema>;
declare const FooterDefSchema: z.ZodObject<{
    widgets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        widget: z.ZodString;
        align: z.ZodDefault<z.ZodEnum<["left", "center", "right"]>>;
        widgetParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        widget: string;
        align: "left" | "right" | "center";
        widgetParams?: Record<string, unknown> | undefined;
    }, {
        key: string;
        widget: string;
        align?: "left" | "right" | "center" | undefined;
        widgetParams?: Record<string, unknown> | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    widgets: {
        key: string;
        widget: string;
        align: "left" | "right" | "center";
        widgetParams?: Record<string, unknown> | undefined;
    }[];
}, {
    widgets?: {
        key: string;
        widget: string;
        align?: "left" | "right" | "center" | undefined;
        widgetParams?: Record<string, unknown> | undefined;
    }[] | undefined;
}>;
type FooterDef = z.infer<typeof FooterDefSchema>;
type FooterDefInput = z.input<typeof FooterDefSchema>;
type FooterConfig = boolean | FooterDefInput;
declare const ChartIdSchema: z.ZodBranded<z.ZodString, "ChartId">;
type ChartId = z.infer<typeof ChartIdSchema>;
declare const ChartTypeSchema: z.ZodEnum<["bar", "stackedBar", "normalizedBar", "column", "stackedColumn", "normalizedColumn", "line", "area", "stackedArea", "normalizedArea", "scatter", "bubble", "pie", "doughnut", "histogram", "heatmap", "treemap"]>;
type ChartType = z.infer<typeof ChartTypeSchema>;
/** Defines which grid data feeds a range chart. */
interface ChartRangeDef {
    /** Row range: indices into visibleRows, or 'all' for all filtered data. */
    rowRange: {
        startIndex: number;
        endIndex: number;
    } | 'all';
    /** Category field (x-axis / labels). */
    categoryFieldId: FieldId;
    /** Value fields (y-axis / series). */
    valueFieldIds: FieldId[];
}
/** Full chart configuration for a range chart. */
interface ChartModelDef {
    chartId: ChartId;
    chartType: ChartType;
    range: ChartRangeDef;
    /** Title displayed above the chart. */
    title?: string;
    /** Subtitle. */
    subtitle?: string;
    /** Whether chart auto-updates when grid data changes. Default true. */
    liveUpdate?: boolean;
    /** Cross-filter: clicking chart segments filters the grid. */
    crossFilter?: boolean;
    /** Chart width in pixels. Null means auto-size to container. */
    width?: number;
    /** Chart height in pixels. Null means auto-size to container. */
    height?: number;
    /** ECharts option overrides for advanced customization. */
    echartsOverrides?: Record<string, unknown>;
}
/** Chart configuration for a pivot chart. */
interface ChartPivotDef {
    chartId: ChartId;
    chartType: ChartType;
    /** The group field(s) whose values become categories. */
    categoryFieldIds: FieldId[];
    /** The aggregated value fields to chart. */
    valueFieldIds: FieldId[];
    /** Title displayed above the chart. */
    title?: string;
    /** Subtitle. */
    subtitle?: string;
    /** Whether chart auto-updates when grid data changes. Default true. */
    liveUpdate?: boolean;
    /** Cross-filter: clicking chart segments filters the grid. */
    crossFilter?: boolean;
    /** Chart width in pixels. Null means auto-size to container. */
    width?: number;
    /** Chart height in pixels. Null means auto-size to container. */
    height?: number;
    /** ECharts option overrides for advanced customization. */
    echartsOverrides?: Record<string, unknown>;
}
/** Runtime chart state stored in GridSnapshot. */
interface ChartState {
    /** All active chart models keyed by ChartId. */
    charts: Map<ChartId, ChartModelDef | ChartPivotDef>;
    /** Currently active cross-filter source chart, if any. */
    crossFilterSource: ChartId | null;
}

export { AGGREGATION_WIDGET, type AggFunc, type BuiltInMenuAction, CHARTS_TAB_ID, type CellRendererParams, type CellSpan, type ChartId, ChartIdSchema, type ChartModelDef, type ChartPivotDef, type ChartRangeDef, type ChartState, type ChartType, ChartTypeSchema, type ColorScheme, type CompositeFilterCriteria, type DataPatch, FIELDS_TAB_ID, FILTERED_COUNT_WIDGET, FILTERED_TOTAL_WIDGET, FILTERS_TAB_ID, type FieldDef, FieldDefSchema, type FieldFilterType, type FieldGroup, type FieldId, FieldIdSchema, type FieldLayout, type FilterConditionType, type FilterCriteria, type FilterRule, type FilterState, type FooterConfig, type FooterDef, type FooterDefInput, FooterDefSchema, type FooterWidgetDef, FooterWidgetDefSchema, type GetContextMenuItemsParams, type GetFieldMenuItemsParams, type GridCommand, type GridConfig, GridConfigSchema, type GridEvents, type GridSnapshot, type MenuEntry, type PanelConfig, type PanelDef, type PanelDefInput, PanelDefSchema, type PanelState, type PanelTabDef, PanelTabDefSchema, type PersistableLayout, type ResolvedField, type RowEntry, type RowKey, RowKeySchema, SELECTED_COUNT_WIDGET, type SortDirection, SortDirectionSchema, type SortRule, SortRuleSchema, type StreamingProvider, type StreamingProviderParams, type StreamingProviderResult, TOTAL_COUNT_WIDGET, type ThemeConfig, type ThemeParams, VALID_OPERATORS_BY_FILTER_TYPE };
