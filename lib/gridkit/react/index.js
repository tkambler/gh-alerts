// src/GridKit.tsx
import { useRef as useRef2, useEffect } from "react";
import { GridView } from "@repo/gridkit-vanilla";

// src/useGridEngine.ts
import { useRef } from "react";
import { GridEngine } from "@repo/gridkit-core";
function useGridEngine(options) {
  const engineRef = useRef(null);
  if (engineRef.current === null) {
    engineRef.current = new GridEngine(options);
  }
  return engineRef.current;
}

// src/GridKit.tsx
import { jsx } from "react/jsx-runtime";
function GridKit(props) {
  const {
    options,
    engine: externalEngine,
    viewConfig,
    className,
    style
  } = props;
  const internalEngine = useGridEngine(options ?? { fields: [] });
  const engine = externalEngine ?? internalEngine;
  const containerRef = useRef2(null);
  const viewRef = useRef2(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    viewRef.current = new GridView(
      container,
      engine,
      viewConfig
    );
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [engine]);
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className, style });
}

// src/GridKitChart.tsx
import { useRef as useRef3, useEffect as useEffect2 } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function GridKitChart(props) {
  const { engine, chartEngine, chartId, className, style } = props;
  const containerRef = useRef3(null);
  useEffect2(() => {
    const container = containerRef.current;
    if (!container) return;
    chartEngine.mount(chartId, container);
    return () => {
      chartEngine.unmount(chartId);
    };
  }, [chartEngine, chartId]);
  const defaultStyle = {
    width: "100%",
    height: "400px",
    ...style
  };
  return /* @__PURE__ */ jsx2("div", { ref: containerRef, className, style: defaultStyle });
}

// src/useChartEngine.ts
import { useRef as useRef4, useEffect as useEffect3 } from "react";
import { ChartEngine } from "@repo/gridkit-charts";
function useChartEngine(engine, options) {
  const chartEngineRef = useRef4(null);
  if (chartEngineRef.current === null && engine.isChartsEnabled()) {
    chartEngineRef.current = new ChartEngine(engine, options);
  }
  useEffect3(() => {
    return () => {
      chartEngineRef.current?.destroy();
      chartEngineRef.current = null;
    };
  }, [engine]);
  return chartEngineRef.current;
}

// src/index.ts
import { GridEngine as GridEngine2 } from "@repo/gridkit-core";
import { ChartEngine as ChartEngine2 } from "@repo/gridkit-charts";
export {
  ChartEngine2 as ChartEngine,
  GridEngine2 as GridEngine,
  GridKit,
  GridKitChart,
  useChartEngine,
  useGridEngine
};
