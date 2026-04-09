// src/index.ts
import { z } from "zod";
var RowKeySchema = z.string().brand("RowKey");
var FieldIdSchema = z.string().brand("FieldId");
var SortDirectionSchema = z.enum(["asc", "desc"]);
var SortRuleSchema = z.object({
  id: FieldIdSchema,
  sort: SortDirectionSchema
});
var FieldDefSchema = z.object({
  id: FieldIdSchema.optional(),
  dataKey: z.string().optional(),
  title: z.string().optional(),
  type: z.string().optional(),
  // Sizing
  width: z.number().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  flex: z.number().optional(),
  resizable: z.boolean().optional(),
  // Behavior
  sortable: z.boolean().optional(),
  editable: z.boolean().optional(),
  visible: z.boolean().optional(),
  // Pinning
  locked: z.enum(["left", "right"]).or(z.boolean()).optional()
});
var GridConfigSchema = z.object({
  fields: z.array(FieldDefSchema).default([]),
  fieldDefaults: FieldDefSchema.optional(),
  selectionMode: z.enum(["single", "multiple"]).optional(),
  sortable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  paginate: z.boolean().optional(),
  pageSize: z.number().optional()
});
var VALID_OPERATORS_BY_FILTER_TYPE = {
  text: [
    "equals",
    "notEquals",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "blank",
    "notBlank"
  ],
  set: ["inSet"],
  number: [
    "equals",
    "notEquals",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
    "between",
    "blank",
    "notBlank"
  ],
  date: [
    "equals",
    "notEquals",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
    "between",
    "blank",
    "notBlank"
  ]
};
var FIELDS_TAB_ID = "columns";
var FILTERS_TAB_ID = "filters";
var CHARTS_TAB_ID = "charts";
var PanelTabDefSchema = z.object({
  id: z.string(),
  labelDefault: z.string(),
  iconKey: z.string().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  width: z.number().optional()
});
var PanelDefSchema = z.object({
  tabs: z.array(PanelTabDefSchema).default([]),
  defaultTab: z.string().optional(),
  position: z.enum(["left", "right"]).default("right"),
  width: z.number().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  showButtons: z.boolean().default(true),
  hiddenByDefault: z.boolean().default(false)
});
var TOTAL_COUNT_WIDGET = "gk-total-count";
var FILTERED_TOTAL_WIDGET = "gk-filtered-total";
var FILTERED_COUNT_WIDGET = "gk-filtered-count";
var SELECTED_COUNT_WIDGET = "gk-selected-count";
var AGGREGATION_WIDGET = "gk-aggregation";
var FooterWidgetDefSchema = z.object({
  key: z.string(),
  widget: z.string(),
  align: z.enum(["left", "center", "right"]).default("right"),
  widgetParams: z.record(z.unknown()).optional()
});
var FooterDefSchema = z.object({
  widgets: z.array(FooterWidgetDefSchema).default([])
});
var ChartIdSchema = z.string().brand("ChartId");
var ChartTypeSchema = z.enum([
  "bar",
  "stackedBar",
  "normalizedBar",
  "column",
  "stackedColumn",
  "normalizedColumn",
  "line",
  "area",
  "stackedArea",
  "normalizedArea",
  "scatter",
  "bubble",
  "pie",
  "doughnut",
  "histogram",
  "heatmap",
  "treemap"
]);
export {
  AGGREGATION_WIDGET,
  CHARTS_TAB_ID,
  ChartIdSchema,
  ChartTypeSchema,
  FIELDS_TAB_ID,
  FILTERED_COUNT_WIDGET,
  FILTERED_TOTAL_WIDGET,
  FILTERS_TAB_ID,
  FieldDefSchema,
  FieldIdSchema,
  FooterDefSchema,
  FooterWidgetDefSchema,
  GridConfigSchema,
  PanelDefSchema,
  PanelTabDefSchema,
  RowKeySchema,
  SELECTED_COUNT_WIDGET,
  SortDirectionSchema,
  SortRuleSchema,
  TOTAL_COUNT_WIDGET,
  VALID_OPERATORS_BY_FILTER_TYPE
};
