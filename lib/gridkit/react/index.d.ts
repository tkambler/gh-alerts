import * as react_jsx_runtime from 'react/jsx-runtime';
import { GridEngine } from '@repo/gridkit-core';
export { GridEngine } from '@repo/gridkit-core';
import { GridViewConfig } from '@repo/gridkit-vanilla';
import { GridConfig, ChartId } from '@repo/types';
export { ChartId, ChartModelDef, ChartPivotDef, ChartType, FieldDef, FieldId, GridConfig, RowKey } from '@repo/types';
import { ChartEngine, ChartEngineOptions } from '@repo/gridkit-charts';
export { ChartEngine } from '@repo/gridkit-charts';

interface GridKitProps<TData = unknown> {
    /** Grid config (used to create an internal engine). Ignored if `engine` is provided. */
    options?: GridConfig<TData>;
    /** External engine instance. Takes precedence over `options`. */
    engine?: GridEngine<TData>;
    /** Options forwarded to GridView. */
    viewConfig?: GridViewConfig;
    /** CSS class name for the wrapper div. */
    className?: string;
    /** Inline style for the wrapper div. */
    style?: React.CSSProperties;
}
declare function GridKit<TData = unknown>(props: GridKitProps<TData>): react_jsx_runtime.JSX.Element;

interface GridKitChartProps<TData = unknown> {
    /** The GridEngine instance that owns the chart. */
    engine: GridEngine<TData>;
    /** The ChartEngine instance (from useChartEngine or GridView.getChartEngine). */
    chartEngine: ChartEngine<TData>;
    /** The chart ID to render. */
    chartId: ChartId;
    /** CSS class name for the chart container. */
    className?: string;
    /** Inline style for the chart container. */
    style?: React.CSSProperties;
}
/**
 * React component that mounts an ECharts instance for a specific chart.
 * Use this for standalone chart rendering outside the grid's built-in
 * chart container.
 */
declare function GridKitChart<TData = unknown>(props: GridKitChartProps<TData>): react_jsx_runtime.JSX.Element;

/**
 * Creates a stable GridEngine instance that persists across re-renders.
 * The `options` argument is only read on first call.
 */
declare function useGridEngine<TData = unknown>(options: GridConfig<TData>): GridEngine<TData>;

/**
 * Creates a stable ChartEngine instance tied to a GridEngine.
 * The ChartEngine is created on first call and destroyed on unmount.
 */
declare function useChartEngine<TData = unknown>(engine: GridEngine<TData>, options?: ChartEngineOptions): ChartEngine<TData> | null;

export { GridKit, GridKitChart, type GridKitChartProps, type GridKitProps, useChartEngine, useGridEngine };
