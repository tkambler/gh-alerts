// src/store.ts
import { TOTAL_COUNT_WIDGET } from "@repo/types";

// src/eventBus.ts
var EventHub = class {
  listeners = /* @__PURE__ */ new Map();
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    const set = this.listeners.get(event);
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }
  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    for (const listener of set) {
      listener(payload);
    }
  }
  off(event, listener) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
    }
  }
  removeAllListeners() {
    this.listeners.clear();
  }
};

// src/columns.ts
var COLUMN_DEFAULTS = {
  width: 200,
  minWidth: 50,
  maxWidth: Infinity,
  resizable: true,
  sortable: false,
  editable: false,
  visible: true,
  locked: false
};
function resolveFieldDef(fieldDef, index, defaultFieldDef, fieldPresets) {
  const typeProps = fieldDef.type && fieldPresets?.[fieldDef.type] ? fieldPresets[fieldDef.type] : {};
  const merged = { ...defaultFieldDef, ...typeProps, ...fieldDef };
  const id = merged.id ?? merged.dataKey ?? `col-${index}`;
  const locked = merged.locked === true ? "left" : merged.locked || false;
  return {
    id,
    dataKey: merged.dataKey,
    title: merged.getTitle ? merged.getTitle({ fieldDef: merged }) : merged.title ?? merged.dataKey ?? id,
    width: merged.width ?? COLUMN_DEFAULTS.width,
    minWidth: merged.minWidth ?? COLUMN_DEFAULTS.minWidth,
    maxWidth: merged.maxWidth ?? COLUMN_DEFAULTS.maxWidth,
    flex: merged.flex,
    resizable: merged.resizable ?? COLUMN_DEFAULTS.resizable,
    sortable: merged.sortable ?? COLUMN_DEFAULTS.sortable,
    editable: typeof merged.editable === "boolean" ? merged.editable : merged.editable != null ? true : COLUMN_DEFAULTS.editable,
    visible: merged.visible !== false,
    locked,
    fixedPosition: merged.fixedPosition,
    fixedVisibility: merged.fixedVisibility,
    fixedLock: merged.fixedLock,
    draggable: merged.draggable,
    span: merged.span,
    style: merged.style,
    className: merged.className,
    classRules: merged.classRules,
    render: merged.render,
    renderParams: merged.renderParams,
    wrap: merged.wrap,
    editableFn: merged.editableFn ?? (typeof merged.editable === "function" ? merged.editable : void 0),
    tooltipKey: merged.tooltipKey,
    getTooltip: merged.getTooltip,
    titleTooltip: merged.titleTooltip,
    titleClass: merged.titleClass,
    titleStyle: merged.titleStyle,
    mergeRows: merged.mergeRows,
    flashOnChange: merged.flashOnChange,
    aggregate: merged.aggregate,
    compare: merged.compare,
    getValue: merged.getValue,
    format: merged.format,
    setValue: merged.setValue,
    parse: merged.parse,
    searchText: merged.searchText,
    filterConfig: merged.filterConfig,
    filter: merged.filter,
    externalEdit: merged.externalEdit,
    dragSource: merged.dragSource
  };
}
function resolveFieldDefs(fieldDefs, defaultFieldDef, fieldPresets) {
  const result = [];
  let index = 0;
  function walk(defs) {
    for (const def of defs) {
      if (def.children && def.children.length > 0) {
        walk(def.children);
      } else {
        result.push(resolveFieldDef(def, index++, defaultFieldDef, fieldPresets));
      }
    }
  }
  walk(fieldDefs);
  return result;
}
function extractFieldGroups(fieldDefs) {
  const groups = [];
  function walk(defs) {
    for (const def of defs) {
      if (def.children && def.children.length > 0) {
        const leafIds = [];
        collectLeafIds(def.children, leafIds);
        groups.push({
          groupId: def.groupId ?? def.title ?? `group-${groups.length}`,
          title: def.title ?? "",
          children: leafIds
        });
        walk(def.children);
      }
    }
  }
  walk(fieldDefs);
  return groups;
}
function collectLeafIds(defs, result) {
  for (const def of defs) {
    if (def.children && def.children.length > 0) {
      collectLeafIds(def.children, result);
    } else {
      result.push(def.id ?? def.dataKey ?? "");
    }
  }
}
function clampWidth(width, col) {
  return Math.max(col.minWidth, Math.min(col.maxWidth, width));
}

// src/rows.ts
var rowCounter = 0;
function createEntry(data, index, id) {
  return {
    id: id ?? `row-${rowCounter++}`,
    data,
    rowIndex: index,
    selected: false
  };
}
function buildEntries(rowData, getRowId) {
  return rowData.map((data, i) => {
    const id = getRowId ? getRowId(data, i) : void 0;
    return createEntry(data, i, id);
  });
}
function resetRowCounter() {
  rowCounter = 0;
}

// src/treeData.ts
function buildTreeFromPaths(rows, getDataPath) {
  const root = [];
  for (const row of rows) {
    const path = getDataPath(row.data);
    let current = root;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      let node = current.find((n) => n.key === key);
      if (!node) {
        node = { key, children: [] };
        current.push(node);
      }
      if (i === path.length - 1) {
        node.data = row.data;
      }
      current = node.children;
    }
  }
  return root;
}
function buildTreeFromParentIds(rows, parentIdField, getRowId) {
  const nodeMap = /* @__PURE__ */ new Map();
  const root = [];
  for (const row of rows) {
    const id = String(getRowId(row.data));
    const data = row.data;
    const name = data["name"] ?? id;
    nodeMap.set(id, { key: name, data: row.data, children: [] });
  }
  for (const row of rows) {
    const id = String(getRowId(row.data));
    const data = row.data;
    const parentId = data[parentIdField];
    const node = nodeMap.get(id);
    if (parentId == null || !nodeMap.has(parentId)) {
      root.push(node);
    } else {
      nodeMap.get(parentId).children.push(node);
    }
  }
  return root;
}
function flattenTree(tree, expandedGroups, groupDefaultExpanded, level = 0) {
  const result = [];
  for (const node of tree) {
    const hasChildren = node.children.length > 0;
    const groupId = `tree-${node.key}`;
    if (hasChildren) {
      const isExpanded = expandedGroups.has(groupId) || groupDefaultExpanded === -1;
      const groupRow = {
        id: groupId,
        data: node.data ?? {},
        rowIndex: result.length,
        selected: false,
        isGroup: true,
        groupValue: node.key,
        childCount: countLeaves(node),
        expanded: isExpanded,
        level
      };
      result.push(groupRow);
      if (isExpanded) {
        const children = flattenTree(
          node.children,
          expandedGroups,
          groupDefaultExpanded,
          level + 1
        );
        result.push(...children);
      }
    } else {
      const leafRow = {
        id: `tree-leaf-${node.key}`,
        data: node.data,
        rowIndex: result.length,
        selected: false,
        level
      };
      result.push(leafRow);
    }
  }
  return result;
}
function countLeaves(node) {
  if (node.children.length === 0) {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

// src/reducer.ts
function commandReducer(state, command, events, opts = {}) {
  const {
    getRowId,
    pagination,
    paginationPageSize = 100,
    groupDefaultExpanded,
    isGroupOpenByDefault,
    cascadeSelection,
    overallSummary,
    groupSummary,
    aggregators,
    groupAggregator,
    includeHiddenFieldsInSearch,
    searchParser,
    searchMatcher,
    filterAggregates,
    hierarchical,
    pathGetter,
    parentKeyField,
    hasCustomFilter,
    customFilterPass,
    expandableRows,
    isExpandable,
    getNestedData,
    isSpanningRow
  } = opts;
  const treeArgs = {
    hierarchical,
    pathGetter,
    parentKeyField,
    getRowId
  };
  const extraArgs = {
    hasCustomFilter,
    customFilterPass,
    expandableRows,
    isExpandable,
    getNestedData,
    isSpanningRow
  };
  const groupArgs = {
    isGroupOpenByDefault,
    overallSummary,
    groupSummary,
    aggregators,
    groupAggregator,
    filterAggregates
  };
  const searchFilterArgs = {
    includeHiddenFieldsInSearch,
    searchParser,
    searchMatcher
  };
  const recompute = (gde) => recomputeVisibleRows(
    state,
    pagination,
    paginationPageSize,
    gde ?? groupDefaultExpanded,
    treeArgs,
    extraArgs,
    groupArgs,
    searchFilterArgs
  );
  switch (command.type) {
    case "LOAD_DATA": {
      state.data = command.data;
      state.entries = buildEntries(
        command.data,
        getRowId
      );
      recompute();
      events.emit("dataLoaded", { data: state.data });
      break;
    }
    case "DEFINE_FIELDS": {
      state.fields = resolveFieldDefs(command.fields);
      break;
    }
    case "UPDATE_SORT": {
      state.sortRules = command.sortRules;
      recompute();
      events.emit("sortUpdated", { sortRules: state.sortRules });
      break;
    }
    case "PICK_ROW": {
      if (command.selected) {
        state.selectedKeys.add(command.rowKey);
      } else {
        state.selectedKeys.delete(command.rowKey);
      }
      const entry = state.entries.find((n) => n.id === command.rowKey);
      if (entry) {
        entry.selected = command.selected;
      }
      if (cascadeSelection) {
        const groupEntry = state.filteredRows.find(
          (n) => n.id === command.rowKey
        );
        if (groupEntry?.isGroup) {
          const groupIdx = state.filteredRows.indexOf(groupEntry);
          const groupLevel = groupEntry.level ?? 0;
          for (let i = groupIdx + 1; i < state.filteredRows.length; i++) {
            const child = state.filteredRows[i];
            if (child.isGroup && (child.level ?? 0) <= groupLevel) {
              break;
            }
            if (!child.isGroup) {
              child.selected = command.selected;
              if (command.selected) {
                state.selectedKeys.add(child.id);
              } else {
                state.selectedKeys.delete(child.id);
              }
            }
          }
        }
      }
      events.emit("selectionUpdated", {
        selectedKeys: state.selectedKeys
      });
      break;
    }
    case "PICK_ALL": {
      for (const entry of state.entries) {
        entry.selected = command.selected;
        if (command.selected) {
          state.selectedKeys.add(entry.id);
        } else {
          state.selectedKeys.delete(entry.id);
        }
      }
      events.emit("selectionUpdated", {
        selectedKeys: state.selectedKeys
      });
      break;
    }
    case "RESIZE_FIELD": {
      const col = findField(state, command.fieldId);
      if (col) {
        let width = clampWidth(command.width, col);
        if (col.locked && opts.gridWidth != null) {
          const minUnpinned = opts.minUnpinnedWidth ?? 50;
          const otherLockedWidth = state.fields.filter((c) => c.visible !== false && c.locked && c.id !== command.fieldId).reduce((sum, c) => sum + c.width, 0);
          const maxAllowed = opts.gridWidth - minUnpinned - otherLockedWidth;
          if (maxAllowed > 0) {
            width = Math.min(width, maxAllowed);
          }
        }
        col.width = width;
        col.flex = void 0;
        events.emit("fieldResized", {
          fieldId: command.fieldId,
          width: col.width
        });
      }
      break;
    }
    case "REORDER_FIELD": {
      const colToMove = findField(state, command.fieldId);
      if (colToMove?.fixedPosition || colToMove?.draggable === false) {
        break;
      }
      const fromIdx = state.fields.findIndex((c) => c.id === command.fieldId);
      if (fromIdx !== -1 && command.toIndex !== fromIdx) {
        const [removed] = state.fields.splice(fromIdx, 1);
        state.fields.splice(command.toIndex, 0, removed);
        if (state.groupFields.length > 1) {
          const colOrder = new Map(state.fields.map((c, i) => [c.id, i]));
          state.groupFields.sort(
            (a, b) => (colOrder.get(a) ?? 0) - (colOrder.get(b) ?? 0)
          );
          recompute();
        }
        events.emit("fieldReordered", {
          fieldId: command.fieldId,
          toIndex: command.toIndex
        });
      }
      break;
    }
    case "LOCK_FIELD": {
      const col = findField(state, command.fieldId);
      if (!col || col.fixedLock) {
        break;
      }
      col.locked = command.locked;
      events.emit("fieldLocked", {
        fieldId: command.fieldId,
        locked: command.locked
      });
      if (command.locked && opts.processUnpinnedFields) {
        const lockedCols = state.fields.filter(
          (c) => c.locked === command.locked && c.id !== command.fieldId
        );
        const toUnlock = opts.processUnpinnedFields({
          fields: lockedCols,
          locked: command.locked
        });
        for (const unlockId of toUnlock) {
          const unlockCol = findField(state, unlockId);
          if (unlockCol && !unlockCol.fixedLock) {
            unlockCol.locked = false;
            events.emit("fieldLocked", { fieldId: unlockId, locked: false });
          }
        }
      }
      break;
    }
    case "TOGGLE_FIELD": {
      const col = findField(state, command.fieldId);
      if (!col || col.fixedVisibility) {
        break;
      }
      col.visible = command.visible;
      events.emit("fieldToggled", {
        fieldId: command.fieldId,
        visible: command.visible
      });
      break;
    }
    case "SET_FILTERS": {
      state.filters = command.filters;
      state.page = 0;
      recompute();
      events.emit("filtersUpdated", { filters: state.filters });
      break;
    }
    case "SET_SEARCH": {
      state.searchText = command.text;
      state.page = 0;
      recompute();
      events.emit("filtersUpdated", { filters: state.filters });
      break;
    }
    case "GO_TO_PAGE": {
      const totalPages = getPaginationTotalPages(state, paginationPageSize);
      state.page = Math.max(0, Math.min(command.page, totalPages - 1));
      applyPagination(state, pagination, paginationPageSize);
      events.emit("pageChanged", {
        page: state.page,
        totalPages
      });
      break;
    }
    case "SET_STICKY_TOP": {
      state.stickyTop = buildEntries(command.data);
      break;
    }
    case "SET_STICKY_BOTTOM": {
      state.stickyBottom = buildEntries(command.data);
      break;
    }
    case "SET_GROUP_FIELDS": {
      state.groupFields = command.fields;
      state.expandedGroups = /* @__PURE__ */ new Set();
      recompute();
      break;
    }
    case "TOGGLE_EXPAND": {
      if (command.expanded) {
        state.expandedGroups.add(command.rowKey);
      } else {
        state.expandedGroups.delete(command.rowKey);
      }
      recompute();
      break;
    }
    case "SET_PIVOT_FIELDS": {
      state.pivotFields = command.fields;
      recompute();
      break;
    }
    case "TOGGLE_PIVOT": {
      state.pivoting = command.enabled;
      recompute();
      break;
    }
    case "EXPAND_ALL": {
      for (const row of state.filteredRows) {
        if (row.isGroup) {
          state.expandedGroups.add(row.id);
        }
      }
      for (const row of state.visibleRows) {
        if (row.isGroup) {
          state.expandedGroups.add(row.id);
        }
      }
      recompute(-1);
      break;
    }
    case "COLLAPSE_ALL": {
      state.expandedGroups.clear();
      recompute(0);
      break;
    }
    case "ADD_GROUP_FIELDS": {
      for (const col of command.fields) {
        if (!state.groupFields.includes(col)) {
          state.groupFields.push(col);
        }
      }
      recompute();
      break;
    }
    case "REMOVE_GROUP_FIELDS": {
      state.groupFields = state.groupFields.filter(
        (c) => !command.fields.includes(c)
      );
      recompute();
      break;
    }
    case "PATCH_DATA": {
      const { patch } = command;
      if (patch.remove?.length) {
        for (const removeItem of patch.remove) {
          const removeId = getRowId ? getRowId(removeItem) : void 0;
          const idx = removeId ? state.entries.findIndex((n) => n.id === removeId) : -1;
          if (idx !== -1) {
            state.entries.splice(idx, 1);
            state.data.splice(idx, 1);
          }
        }
      }
      if (patch.update?.length) {
        for (const updateItem of patch.update) {
          const updateId = getRowId ? getRowId(updateItem) : void 0;
          const entry = updateId ? state.entries.find((n) => n.id === updateId) : void 0;
          if (entry) {
            entry.data = updateItem;
            const dataIdx = state.data.indexOf(
              state.data.find((_d, i) => state.entries[i] === entry)
            );
            if (dataIdx !== -1) {
              state.data[dataIdx] = updateItem;
            }
          }
        }
      }
      if (patch.add?.length) {
        for (const addItem of patch.add) {
          const id = getRowId ? getRowId(addItem) : void 0;
          const newEntry = createEntry(addItem, state.entries.length, id);
          state.entries.push(newEntry);
          state.data.push(addItem);
        }
      }
      recompute();
      events.emit("dataPatched", {
        add: patch.add ?? [],
        update: patch.update ?? [],
        remove: patch.remove ?? []
      });
      break;
    }
    case "TOGGLE_PANEL": {
      if (state.panel) {
        state.panel.visible = command.visible;
        if (!command.visible) {
          state.panel.openTabId = null;
        }
        events.emit("panelTabToggled", {
          tabId: state.panel.openTabId,
          visible: command.visible
        });
      }
      break;
    }
    case "OPEN_PANEL_TAB": {
      if (state.panel) {
        const panel = state.panel.def.tabs.find(
          (p) => p.id === command.tabId
        );
        if (panel) {
          state.panel.openTabId = command.tabId;
          state.panel.visible = true;
          events.emit("panelTabToggled", {
            tabId: command.tabId,
            visible: true
          });
        }
      }
      break;
    }
    case "CLOSE_PANEL_TAB": {
      if (state.panel) {
        state.panel.openTabId = null;
        events.emit("panelTabToggled", {
          tabId: null,
          visible: state.panel.visible
        });
      }
      break;
    }
    case "CONFIGURE_PANEL": {
      state.panel = {
        def: command.panelDef,
        visible: !command.panelDef.hiddenByDefault,
        openTabId: command.panelDef.hiddenByDefault ? null : command.panelDef.defaultTab ?? null
      };
      events.emit("panelUpdated", { panel: state.panel });
      break;
    }
    case "CREATE_CHART": {
      if (state.charts) {
        state.charts.charts.set(command.chart.chartId, command.chart);
        events.emit("chartCreated", {
          chartId: command.chart.chartId,
          chart: command.chart
        });
      }
      break;
    }
    case "UPDATE_CHART": {
      if (state.charts) {
        const existing = state.charts.charts.get(command.chartId);
        if (existing) {
          Object.assign(existing, command.updates);
          events.emit("chartUpdated", { chartId: command.chartId });
        }
      }
      break;
    }
    case "DESTROY_CHART": {
      if (state.charts) {
        state.charts.charts.delete(command.chartId);
        if (state.charts.crossFilterSource === command.chartId) {
          state.charts.crossFilterSource = null;
          removeCrossFilters(state, command.chartId);
          recompute();
        }
        events.emit("chartDestroyed", { chartId: command.chartId });
      }
      break;
    }
    case "SET_CHART_CROSS_FILTER": {
      if (state.charts) {
        if (command.filter) {
          state.charts.crossFilterSource = command.chartId;
          applyCrossFilter(state, command.chartId, command.filter);
        } else {
          state.charts.crossFilterSource = null;
          removeCrossFilters(state, command.chartId);
        }
        recompute();
        events.emit("filtersUpdated", { filters: state.filters });
      }
      break;
    }
  }
  events.emit("snapshotChanged", { state });
  return state;
}
function findField(state, fieldId) {
  return state.fields.find((c) => c.id === fieldId);
}
function readCellValue(data, col) {
  if (col.getValue) {
    return col.getValue({ data, fieldDef: col });
  }
  if (col.dataKey) {
    return getNestedValue(data, col.dataKey);
  }
  return void 0;
}
function getNestedValue(obj, path) {
  if (!path.includes(".")) {
    return obj[path];
  }
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return void 0;
    }
    current = current[part];
  }
  return current;
}
function recomputeVisibleRows(state, pagination, paginationPageSize, groupDefaultExpanded, treeOpts, extraOpts, groupOpts, searchFilterOpts) {
  let rows = [...state.entries];
  const filterEntries = Object.entries(state.filters);
  const isFilterAggregates = groupOpts?.filterAggregates && state.groupFields.length > 0;
  if (filterEntries.length > 0) {
    rows = rows.filter((entry) => {
      return filterEntries.every(([fieldIdStr, condition]) => {
        const resolvedFieldId = resolveCrossFilterFieldId(fieldIdStr);
        const col = state.fields.find((c) => c.id === resolvedFieldId);
        if (!col) {
          return true;
        }
        if (isFilterAggregates && col.aggregate) {
          return true;
        }
        const value = readCellValue(entry.data, col);
        return matchesFilterRule(value, condition, col.filterConfig, col.filter);
      });
    });
  }
  if (state.searchText) {
    const parser = searchFilterOpts?.searchParser ?? ((text) => text.toLowerCase().split(/\s+/).filter(Boolean));
    const parts = parser(state.searchText);
    if (parts.length > 0) {
      const matcher = searchFilterOpts?.searchMatcher ?? ((ps, rowText) => ps.every((p) => rowText.includes(p)));
      rows = rows.filter((entry) => {
        const rowText = buildSearchText(
          entry,
          state.fields,
          searchFilterOpts?.includeHiddenFieldsInSearch
        );
        return matcher(parts, rowText);
      });
    }
  }
  if (extraOpts?.hasCustomFilter?.() && extraOpts.customFilterPass) {
    const pass = extraOpts.customFilterPass;
    rows = rows.filter((entry) => pass(entry));
  }
  if (state.sortRules.length > 0) {
    rows.sort((a, b) => {
      for (const sortRule of state.sortRules) {
        const col = state.fields.find((c) => c.id === sortRule.id);
        if (!col || !col.dataKey && !col.getValue) {
          continue;
        }
        const aVal = readCellValue(a.data, col);
        const bVal = readCellValue(b.data, col);
        let cmp = 0;
        if (col.compare) {
          cmp = col.compare(aVal, bVal);
        } else if (aVal == null && bVal == null) {
          cmp = 0;
        } else if (aVal == null) {
          cmp = -1;
        } else if (bVal == null) {
          cmp = 1;
        } else if (typeof aVal === "string" && typeof bVal === "string") {
          cmp = aVal.localeCompare(bVal);
        } else {
          cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
        if (sortRule.sort === "desc") {
          cmp = -cmp;
        }
        if (cmp !== 0) {
          return cmp;
        }
      }
      return 0;
    });
  }
  if (treeOpts?.hierarchical && treeOpts.pathGetter) {
    const tree = buildTreeFromPaths(rows, treeOpts.pathGetter);
    rows = flattenTree(tree, state.expandedGroups, groupDefaultExpanded ?? 0);
  } else if (treeOpts?.hierarchical && treeOpts.parentKeyField && treeOpts.getRowId) {
    const tree = buildTreeFromParentIds(
      rows,
      treeOpts.parentKeyField,
      treeOpts.getRowId
    );
    rows = flattenTree(tree, state.expandedGroups, groupDefaultExpanded ?? 0);
  }
  if (!treeOpts?.hierarchical && state.groupFields.length > 0) {
    rows = applyGrouping(
      rows,
      state,
      groupDefaultExpanded,
      groupOpts?.isGroupOpenByDefault,
      groupOpts?.groupSummary,
      groupOpts?.aggregators,
      groupOpts?.groupAggregator
    );
  }
  if (groupOpts?.filterAggregates && state.groupFields.length > 0 && filterEntries.length > 0) {
    rows = rows.filter((row) => {
      if (!row.isGroup || !row.aggData) {
        return true;
      }
      return filterEntries.every(([fieldIdStr, condition]) => {
        const col = state.fields.find((c) => c.id === fieldIdStr);
        if (!col?.dataKey || !col.aggregate) {
          return true;
        }
        const aggValue = row.aggData[col.dataKey];
        return matchesFilterRule(aggValue, condition, col.filterConfig);
      });
    });
  }
  if (extraOpts?.expandableRows) {
    const withDetail = [];
    for (const row of rows) {
      const isExpandableRow = extraOpts.isExpandable ? extraOpts.isExpandable(row.data) : true;
      row.isExpandable = isExpandableRow;
      withDetail.push(row);
      if (isExpandableRow && state.expandedGroups.has(row.id) && extraOpts.getNestedData) {
        const nestedData = extraOpts.getNestedData(row.data);
        const nestedRow = {
          id: `detail-${row.id}`,
          data: {},
          rowIndex: withDetail.length,
          selected: false,
          isNestedRow: true,
          nestedData
        };
        withDetail.push(nestedRow);
      }
    }
    rows = withDetail;
  }
  if (extraOpts?.isSpanningRow) {
    for (const row of rows) {
      row.isSpanningRow = extraOpts.isSpanningRow({
        data: row.data,
        entry: row
      });
    }
  }
  if (state.pivoting && state.pivotFields.length > 0 && state.groupFields.length > 0) {
    applyPivotAggregation(rows, state);
  }
  if (groupOpts?.overallSummary && state.groupFields.length > 0) {
    const aggFields = state.fields.filter((c) => c.aggregate);
    const aggData = {};
    for (const col of aggFields) {
      if (col.dataKey) {
        aggData[col.dataKey] = computeAggregation(
          state.entries.map((n) => readCellValue(n.data, col)),
          col.aggregate,
          groupOpts?.aggregators
        );
      }
    }
    const grandTotalEntry = {
      id: "grand-total",
      data: {},
      rowIndex: -1,
      selected: false,
      isGroup: true,
      groupValue: "__grandTotal",
      childCount: state.entries.length,
      expanded: false,
      aggData,
      level: -1
    };
    if (groupOpts.overallSummary === "top") {
      rows.unshift(grandTotalEntry);
    } else {
      rows.push(grandTotalEntry);
    }
  }
  state.filteredRows = rows;
  applyPagination(state, pagination, paginationPageSize);
}
function getPaginationTotalPages(state, paginationPageSize) {
  const hasGroups = state.groupFields.length > 0;
  let itemCount;
  if (hasGroups) {
    itemCount = state.filteredRows.filter(
      (r) => r.isGroup && (r.level === 0 || r.level === -1)
    ).length;
  } else {
    itemCount = state.filteredRows.length;
  }
  return Math.max(1, Math.ceil(itemCount / paginationPageSize));
}
function applyPagination(state, pagination, paginationPageSize) {
  if (pagination && paginationPageSize) {
    const hasGroups = state.groupFields.length > 0;
    if (hasGroups) {
      const topLevelIndices = [];
      for (let i = 0; i < state.filteredRows.length; i++) {
        const row = state.filteredRows[i];
        if (row.isGroup && (row.level === 0 || row.level === -1)) {
          topLevelIndices.push(i);
        }
      }
      const startGroup = state.page * paginationPageSize;
      const endGroup = startGroup + paginationPageSize;
      const sliceStart = topLevelIndices[startGroup] ?? state.filteredRows.length;
      const sliceEnd = topLevelIndices[endGroup] ?? state.filteredRows.length;
      state.visibleRows = state.filteredRows.slice(sliceStart, sliceEnd);
    } else {
      const start = state.page * paginationPageSize;
      state.visibleRows = state.filteredRows.slice(
        start,
        start + paginationPageSize
      );
    }
  } else {
    state.visibleRows = state.filteredRows;
  }
}
function matchesFilterRule(value, entry, filterConfig, columnFilterType) {
  if ("filterType" in entry && entry.filterType === "join") {
    const { operator, conditions } = entry;
    if (operator === "OR") {
      return conditions.some((c) => matchesCriteria(value, c, filterConfig, columnFilterType));
    }
    return conditions.every((c) => matchesCriteria(value, c, filterConfig, columnFilterType));
  }
  return matchesCriteria(value, entry, filterConfig, columnFilterType);
}
function matchesCriteria(value, condition, filterConfig, columnFilterType) {
  if (columnFilterType === "number") {
    return matchesNumberCriteria(value, condition, filterConfig);
  }
  if (columnFilterType === "date") {
    return matchesDateCriteria(value, condition, filterConfig);
  }
  const filter = condition.filter;
  const cs = filterConfig?.caseSensitive ?? condition.caseSensitive === true;
  const isBlank = value == null || value === "";
  switch (condition.type) {
    case "equals":
      if (isBlank && filterConfig?.includeBlanksInEquals) {
        return true;
      }
      return value === filter;
    case "notEquals":
      return value !== filter;
    case "contains":
      return typeof value === "string" && typeof filter === "string" ? cs ? value.includes(filter) : value.toLowerCase().includes(filter.toLowerCase()) : false;
    case "notContains":
      return typeof value === "string" && typeof filter === "string" ? cs ? !value.includes(filter) : !value.toLowerCase().includes(filter.toLowerCase()) : true;
    case "startsWith":
      return typeof value === "string" && typeof filter === "string" ? cs ? value.startsWith(filter) : value.toLowerCase().startsWith(filter.toLowerCase()) : false;
    case "endsWith":
      return typeof value === "string" && typeof filter === "string" ? cs ? value.endsWith(filter) : value.toLowerCase().endsWith(filter.toLowerCase()) : false;
    case "greaterThan":
      if (isBlank && filterConfig?.includeBlanksInGreaterThan) {
        return true;
      }
      return typeof value === "number" && typeof filter === "number" ? value > filter : false;
    case "greaterThanOrEqual":
      if (isBlank && filterConfig?.includeBlanksInGreaterThan) {
        return true;
      }
      return typeof value === "number" && typeof filter === "number" ? value >= filter : false;
    case "lessThan":
      if (isBlank && filterConfig?.includeBlanksInLessThan) {
        return true;
      }
      return typeof value === "number" && typeof filter === "number" ? value < filter : false;
    case "lessThanOrEqual":
      return typeof value === "number" && typeof filter === "number" ? value <= filter : false;
    case "between":
      return typeof value === "number" && Array.isArray(filter) && filter.length === 2 ? value >= filter[0] && value <= filter[1] : false;
    case "blank":
      return value == null || value === "";
    case "notBlank":
      return value != null && value !== "";
    case "inSet":
      if (!Array.isArray(filter)) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.some((v) => filter.includes(v));
      }
      return filter.includes(value);
    default:
      return true;
  }
}
function defaultNumberParser(value) {
  if (typeof value === "number") return isNaN(value) ? null : value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
  }
  return null;
}
function roundToPrecision(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
function toNumber(value, parser, precision) {
  const n = parser(value);
  if (n == null) return null;
  return precision != null ? roundToPrecision(n, precision) : n;
}
function matchesNumberCriteria(value, condition, filterConfig) {
  const isBlank = value == null || value === "";
  const parser = filterConfig?.numberParser ?? defaultNumberParser;
  const precision = filterConfig?.allowedDecimalPlaces;
  const numValue = isBlank ? null : toNumber(value, parser, precision);
  switch (condition.type) {
    case "blank":
      return isBlank || numValue == null;
    case "notBlank":
      return !isBlank && numValue != null;
    case "equals": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInEquals) return true;
      if (numValue == null) return false;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null && numValue === filterNum;
    }
    case "notEquals": {
      if (numValue == null) return true;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null ? numValue !== filterNum : true;
    }
    case "greaterThan": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInGreaterThan) return true;
      if (numValue == null) return false;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null && numValue > filterNum;
    }
    case "greaterThanOrEqual": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInGreaterThan) return true;
      if (numValue == null) return false;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null && numValue >= filterNum;
    }
    case "lessThan": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInLessThan) return true;
      if (numValue == null) return false;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null && numValue < filterNum;
    }
    case "lessThanOrEqual": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInLessThan) return true;
      if (numValue == null) return false;
      const filterNum = toNumber(condition.filter, parser, precision);
      return filterNum != null && numValue <= filterNum;
    }
    case "between": {
      if ((isBlank || numValue == null) && filterConfig?.includeBlanksInRange) return true;
      if (numValue == null) return false;
      const f = condition.filter;
      if (!Array.isArray(f) || f.length !== 2) return false;
      const lo = toNumber(f[0], parser, precision);
      const hi = toNumber(f[1], parser, precision);
      return lo != null && hi != null && numValue >= lo && numValue <= hi;
    }
    // Text-only operators are invalid for number filters — pass through
    default:
      return true;
  }
}
function defaultDateParser(value) {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function compareDates(a, b) {
  return a.getTime() - b.getTime();
}
function matchesDateCriteria(value, condition, filterConfig) {
  const isBlank = value == null || value === "";
  const parser = filterConfig?.dateParser ?? defaultDateParser;
  const dateValue = isBlank ? null : parser(value);
  switch (condition.type) {
    case "blank":
      return isBlank || dateValue == null;
    case "notBlank":
      return !isBlank && dateValue != null;
    case "equals": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInEquals) return true;
      if (dateValue == null) return false;
      const filterDate = parser(condition.filter);
      return filterDate != null && compareDates(dateValue, filterDate) === 0;
    }
    case "notEquals": {
      if (dateValue == null) return true;
      const filterDate = parser(condition.filter);
      return filterDate != null ? compareDates(dateValue, filterDate) !== 0 : true;
    }
    case "greaterThan": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInGreaterThan) return true;
      if (dateValue == null) return false;
      const filterDate = parser(condition.filter);
      return filterDate != null && compareDates(dateValue, filterDate) > 0;
    }
    case "greaterThanOrEqual": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInGreaterThan) return true;
      if (dateValue == null) return false;
      const filterDate = parser(condition.filter);
      return filterDate != null && compareDates(dateValue, filterDate) >= 0;
    }
    case "lessThan": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInLessThan) return true;
      if (dateValue == null) return false;
      const filterDate = parser(condition.filter);
      return filterDate != null && compareDates(dateValue, filterDate) < 0;
    }
    case "lessThanOrEqual": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInLessThan) return true;
      if (dateValue == null) return false;
      const filterDate = parser(condition.filter);
      return filterDate != null && compareDates(dateValue, filterDate) <= 0;
    }
    case "between": {
      if ((isBlank || dateValue == null) && filterConfig?.includeBlanksInRange) return true;
      if (dateValue == null) return false;
      const f = condition.filter;
      if (!Array.isArray(f) || f.length !== 2) return false;
      const lo = parser(f[0]);
      const hi = parser(f[1]);
      return lo != null && hi != null && compareDates(dateValue, lo) >= 0 && compareDates(dateValue, hi) <= 0;
    }
    // Text-only operators are invalid for date filters — pass through
    default:
      return true;
  }
}
function buildSearchText(entry, fields, includeHidden) {
  return fields.filter((col) => includeHidden || col.visible !== false).map((col) => {
    if (col.searchText) {
      const val2 = readCellValue(entry.data, col);
      return col.searchText({ data: entry.data, value: val2 });
    }
    const val = readCellValue(entry.data, col);
    return val != null ? String(val) : "";
  }).join(" ").toLowerCase();
}
function applyGrouping(rows, state, groupDefaultExpanded, isGroupOpenByDefault, groupSummary, customAggFuncs, groupAggregator) {
  return applyGroupingRecursive(
    rows,
    state,
    state.groupFields,
    0,
    groupDefaultExpanded,
    "",
    isGroupOpenByDefault,
    groupSummary,
    customAggFuncs,
    groupAggregator
  );
}
function applyGroupingRecursive(rows, state, groupCols, level, groupDefaultExpanded, parentPrefix = "", isGroupOpenByDefault, groupSummary, customAggFuncs, groupAggregator) {
  if (groupCols.length === 0) {
    return rows;
  }
  const groupFieldId = groupCols[0];
  const remainingCols = groupCols.slice(1);
  const groupCol = state.fields.find((c) => c.id === groupFieldId);
  if (!groupCol) {
    return rows;
  }
  const groups = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const key = readCellValue(row.data, groupCol);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  }
  const aggFields = state.fields.filter((c) => c.aggregate);
  const result = [];
  for (const [key, children] of groups) {
    const groupId = `group-${parentPrefix}${String(key)}`;
    let aggData;
    if (groupAggregator) {
      aggData = groupAggregator({
        entries: children,
        fields: aggFields
      });
    } else {
      aggData = {};
      for (const col of aggFields) {
        if (col.dataKey) {
          aggData[col.dataKey] = computeAggregation(
            children.map((c) => readCellValue(c.data, col)),
            col.aggregate,
            customAggFuncs
          );
        }
      }
    }
    let isExpanded;
    if (state.expandedGroups.has(groupId)) {
      isExpanded = true;
    } else if (isGroupOpenByDefault && groupCol.dataKey) {
      isExpanded = isGroupOpenByDefault({
        groupValue: key,
        level,
        dataKey: groupCol.dataKey
      });
    } else if (groupDefaultExpanded === -1) {
      isExpanded = true;
    } else if (typeof groupDefaultExpanded === "number" && groupDefaultExpanded > level) {
      isExpanded = true;
    } else {
      isExpanded = false;
    }
    const groupEntry = {
      id: groupId,
      data: {},
      rowIndex: result.length,
      selected: false,
      isGroup: true,
      groupValue: key,
      childCount: children.length,
      expanded: isExpanded,
      aggData,
      level
    };
    result.push(groupEntry);
    if (isExpanded) {
      const subtotalEntry = groupSummary ? {
        id: `total-${groupId}`,
        data: {},
        rowIndex: -1,
        selected: false,
        isGroup: true,
        groupValue: `__total_${String(key)}`,
        childCount: children.length,
        expanded: false,
        aggData: { ...aggData },
        level
      } : null;
      if (subtotalEntry && groupSummary === "top") {
        result.push(subtotalEntry);
      }
      if (remainingCols.length > 0) {
        const subGrouped = applyGroupingRecursive(
          children,
          state,
          remainingCols,
          level + 1,
          groupDefaultExpanded,
          `${parentPrefix}${String(key)}-`,
          isGroupOpenByDefault,
          groupSummary,
          customAggFuncs,
          groupAggregator
        );
        result.push(...subGrouped);
      } else {
        for (const child of children) {
          result.push(child);
        }
      }
      if (subtotalEntry && groupSummary === "bottom") {
        result.push(subtotalEntry);
      }
    }
  }
  return result;
}
function applyPivotAggregation(rows, state) {
  const pivotFieldId = state.pivotFields[0];
  const groupFieldId = state.groupFields[0];
  if (!pivotFieldId || !groupFieldId) {
    return;
  }
  const pivotCol = state.fields.find((c) => c.id === pivotFieldId);
  const groupCol = state.fields.find((c) => c.id === groupFieldId);
  if (!pivotCol?.dataKey || !groupCol?.dataKey) {
    return;
  }
  const aggCols = state.fields.filter((c) => c.aggregate);
  const groupMap = /* @__PURE__ */ new Map();
  for (const entry of state.entries) {
    const gk = readCellValue(entry.data, groupCol);
    if (!groupMap.has(gk)) {
      groupMap.set(gk, []);
    }
    groupMap.get(gk).push(entry);
  }
  for (const row of rows) {
    if (!row.isGroup) {
      continue;
    }
    const children = groupMap.get(row.groupValue) ?? [];
    if (!row.aggData) {
      row.aggData = {};
    }
    const pivotGroups = /* @__PURE__ */ new Map();
    for (const child of children) {
      const pv = String(readCellValue(child.data, pivotCol));
      if (!pivotGroups.has(pv)) {
        pivotGroups.set(pv, []);
      }
      pivotGroups.get(pv).push(child);
    }
    for (const [pivotVal, pivotChildren] of pivotGroups) {
      for (const aggCol of aggCols) {
        if (aggCol.dataKey) {
          const key = `${aggCol.dataKey}_${pivotVal}`;
          row.aggData[key] = computeAggregation(
            pivotChildren.map((c) => readCellValue(c.data, aggCol)),
            aggCol.aggregate
          );
        }
      }
    }
  }
}
var CROSS_FILTER_PREFIX = "__cf_";
function resolveCrossFilterFieldId(key) {
  if (!key.startsWith(CROSS_FILTER_PREFIX)) {
    return key;
  }
  const withoutPrefix = key.slice(CROSS_FILTER_PREFIX.length);
  const separatorIdx = withoutPrefix.indexOf("_");
  if (separatorIdx === -1) {
    return key;
  }
  return withoutPrefix.slice(separatorIdx + 1);
}
function applyCrossFilter(state, chartId, filter) {
  removeCrossFilters(state, chartId);
  for (const [fieldId, rule] of Object.entries(filter)) {
    state.filters[`${CROSS_FILTER_PREFIX}${chartId}_${fieldId}`] = rule;
  }
}
function removeCrossFilters(state, chartId) {
  const prefix = `${CROSS_FILTER_PREFIX}${chartId}_`;
  for (const key of Object.keys(state.filters)) {
    if (key.startsWith(prefix)) {
      delete state.filters[key];
    }
  }
}
function computeAggregation(values, aggFunc, customAggFuncs) {
  if (customAggFuncs && aggFunc in customAggFuncs) {
    return customAggFuncs[aggFunc]({ values });
  }
  const nums = values.filter((v) => typeof v === "number");
  switch (aggFunc) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "min":
      return nums.length > 0 ? Math.min(...nums) : void 0;
    case "max":
      return nums.length > 0 ? Math.max(...nums) : void 0;
    case "count":
      return values.length;
    case "avg":
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : void 0;
    case "first":
      return values[0];
    case "last":
      return values[values.length - 1];
    default:
      return void 0;
  }
}

// src/formulas.ts
function colLetterToIndex(letter) {
  let idx = 0;
  for (let i = 0; i < letter.length; i++) {
    idx = idx * 26 + (letter.charCodeAt(i) - 64);
  }
  return idx - 1;
}
function indexToColLetter(index) {
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    n--;
    letter = String.fromCharCode(65 + n % 26) + letter;
    n = Math.floor(n / 26);
  }
  return letter;
}
function parseCellRef(ref) {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new FormulaError(`Invalid cell reference: ${ref}`);
  }
  return {
    col: colLetterToIndex(match[1]),
    row: parseInt(match[2], 10) - 1
    // 0-based
  };
}
var FormulaError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "FormulaError";
  }
};
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " " || ch === "	") {
      i++;
      continue;
    }
    if (ch === '"') {
      let str = "";
      i++;
      while (i < expr.length && expr[i] !== '"') {
        str += expr[i];
        i++;
      }
      if (i >= expr.length) {
        throw new FormulaError("Unterminated string literal");
      }
      i++;
      tokens.push({ type: "STRING", value: str });
      continue;
    }
    if (ch >= "0" && ch <= "9" || ch === "." && i + 1 < expr.length && expr[i + 1] >= "0" && expr[i + 1] <= "9") {
      let num = "";
      while (i < expr.length && (expr[i] >= "0" && expr[i] <= "9" || expr[i] === ".")) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: parseFloat(num) });
      continue;
    }
    if (ch >= "A" && ch <= "Z" || ch >= "a" && ch <= "z") {
      let word = "";
      while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i])) {
        word += expr[i];
        i++;
      }
      const upper = word.toUpperCase();
      if (upper === "TRUE") {
        tokens.push({ type: "BOOLEAN", value: true });
        continue;
      }
      if (upper === "FALSE") {
        tokens.push({ type: "BOOLEAN", value: false });
        continue;
      }
      if (i < expr.length && expr[i] === "(") {
        tokens.push({ type: "FUNCTION", value: upper });
        continue;
      }
      if (i < expr.length && expr[i] === ":") {
        let endRef = "";
        let j = i + 1;
        while (j < expr.length && /[A-Za-z0-9]/.test(expr[j])) {
          endRef += expr[j];
          j++;
        }
        if (/^[A-Z]+\d+$/i.test(upper) && /^[A-Z]+\d+$/i.test(endRef)) {
          tokens.push({ type: "RANGE_REF", value: `${upper}:${endRef.toUpperCase()}` });
          i = j;
          continue;
        }
      }
      if (/^[A-Z]+\d+$/.test(upper)) {
        tokens.push({ type: "CELL_REF", value: upper });
        continue;
      }
      throw new FormulaError(`Unknown identifier: ${word}`);
    }
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }
    if (ch === "+") {
      tokens.push({ type: "OP_ADD", value: "+" });
      i++;
      continue;
    }
    if (ch === "-") {
      tokens.push({ type: "OP_SUB", value: "-" });
      i++;
      continue;
    }
    if (ch === "*") {
      tokens.push({ type: "OP_MUL", value: "*" });
      i++;
      continue;
    }
    if (ch === "/") {
      tokens.push({ type: "OP_DIV", value: "/" });
      i++;
      continue;
    }
    if (ch === "&") {
      tokens.push({ type: "OP_CONCAT", value: "&" });
      i++;
      continue;
    }
    if (ch === "=") {
      tokens.push({ type: "OP_EQ", value: "=" });
      i++;
      continue;
    }
    if (ch === "<") {
      if (i + 1 < expr.length && expr[i + 1] === ">") {
        tokens.push({ type: "OP_NEQ", value: "<>" });
        i += 2;
        continue;
      }
      if (i + 1 < expr.length && expr[i + 1] === "=") {
        tokens.push({ type: "OP_LTE", value: "<=" });
        i += 2;
        continue;
      }
      tokens.push({ type: "OP_LT", value: "<" });
      i++;
      continue;
    }
    if (ch === ">") {
      if (i + 1 < expr.length && expr[i + 1] === "=") {
        tokens.push({ type: "OP_GTE", value: ">=" });
        i += 2;
        continue;
      }
      tokens.push({ type: "OP_GT", value: ">" });
      i++;
      continue;
    }
    throw new FormulaError(`Unexpected character: ${ch}`);
  }
  tokens.push({ type: "EOF", value: "" });
  return tokens;
}
var Parser = class {
  tokens;
  pos = 0;
  constructor(tokens) {
    this.tokens = tokens;
  }
  peek() {
    return this.tokens[this.pos];
  }
  advance() {
    const t = this.tokens[this.pos];
    this.pos++;
    return t;
  }
  expect(type) {
    const t = this.peek();
    if (t.type !== type) {
      throw new FormulaError(`Expected ${type} but got ${t.type}`);
    }
    return this.advance();
  }
  parse() {
    const node = this.parseExpression();
    if (this.peek().type !== "EOF") {
      throw new FormulaError(`Unexpected token: ${this.peek().value}`);
    }
    return node;
  }
  // Expression = Comparison ((& ) Comparison)*
  parseExpression() {
    return this.parseComparison();
  }
  // Comparison = Addition ((= | <> | < | > | <= | >=) Addition)?
  parseComparison() {
    let left = this.parseConcatenation();
    const t = this.peek();
    if (t.type === "OP_EQ" || t.type === "OP_NEQ" || t.type === "OP_LT" || t.type === "OP_GT" || t.type === "OP_LTE" || t.type === "OP_GTE") {
      const op = this.advance();
      const right = this.parseConcatenation();
      left = { type: "binary", op: String(op.value), left, right };
    }
    return left;
  }
  // Concatenation = Addition (& Addition)*
  parseConcatenation() {
    let left = this.parseAddition();
    while (this.peek().type === "OP_CONCAT") {
      this.advance();
      const right = this.parseAddition();
      left = { type: "binary", op: "&", left, right };
    }
    return left;
  }
  // Addition = Multiplication ((+ | -) Multiplication)*
  parseAddition() {
    let left = this.parseMultiplication();
    while (this.peek().type === "OP_ADD" || this.peek().type === "OP_SUB") {
      const op = this.advance();
      const right = this.parseMultiplication();
      left = { type: "binary", op: String(op.value), left, right };
    }
    return left;
  }
  // Multiplication = Unary ((* | /) Unary)*
  parseMultiplication() {
    let left = this.parseUnary();
    while (this.peek().type === "OP_MUL" || this.peek().type === "OP_DIV") {
      const op = this.advance();
      const right = this.parseUnary();
      left = { type: "binary", op: String(op.value), left, right };
    }
    return left;
  }
  // Unary = (- | +) Unary | Primary
  parseUnary() {
    if (this.peek().type === "OP_SUB") {
      this.advance();
      return { type: "unary", op: "-", operand: this.parseUnary() };
    }
    if (this.peek().type === "OP_ADD") {
      this.advance();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }
  // Primary = NUMBER | STRING | BOOLEAN | CELL_REF | RANGE_REF | FUNCTION(args) | (expr)
  parsePrimary() {
    const t = this.peek();
    if (t.type === "NUMBER") {
      this.advance();
      return { type: "number", value: t.value };
    }
    if (t.type === "STRING") {
      this.advance();
      return { type: "string", value: t.value };
    }
    if (t.type === "BOOLEAN") {
      this.advance();
      return { type: "boolean", value: t.value };
    }
    if (t.type === "CELL_REF") {
      this.advance();
      return { type: "cellRef", ref: t.value };
    }
    if (t.type === "RANGE_REF") {
      this.advance();
      return { type: "rangeRef", ref: t.value };
    }
    if (t.type === "FUNCTION") {
      const name = t.value;
      this.advance();
      this.expect("LPAREN");
      const args = [];
      if (this.peek().type !== "RPAREN") {
        args.push(this.parseExpression());
        while (this.peek().type === "COMMA") {
          this.advance();
          args.push(this.parseExpression());
        }
      }
      this.expect("RPAREN");
      return { type: "call", name, args };
    }
    if (t.type === "LPAREN") {
      this.advance();
      const node = this.parseExpression();
      this.expect("RPAREN");
      return node;
    }
    throw new FormulaError(`Unexpected token: ${t.type} (${t.value})`);
  }
};
function evaluateFormula(expression, resolve, depth = 0) {
  if (depth > 50) {
    throw new FormulaError("Circular reference detected");
  }
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return evalNode(ast, resolve, depth);
}
function evalNode(node, resolve, depth) {
  switch (node.type) {
    case "number":
      return node.value;
    case "string":
      return node.value;
    case "boolean":
      return node.value;
    case "cellRef": {
      const { col, row } = parseCellRef(node.ref);
      const raw = resolve(col, row);
      if (typeof raw === "string" && raw.startsWith("=")) {
        return evaluateFormula(raw.slice(1), resolve, depth + 1);
      }
      return raw;
    }
    case "rangeRef":
      return resolveRange(node.ref, resolve, depth);
    case "unary": {
      const val = toNumber2(evalNode(node.operand, resolve, depth));
      return node.op === "-" ? -val : val;
    }
    case "binary":
      return evalBinary(node, resolve, depth);
    case "call":
      return evalFunction(node.name, node.args, resolve, depth);
  }
}
function evalBinary(node, resolve, depth) {
  const left = evalNode(node.left, resolve, depth);
  const right = evalNode(node.right, resolve, depth);
  switch (node.op) {
    case "+":
      return toNumber2(left) + toNumber2(right);
    case "-":
      return toNumber2(left) - toNumber2(right);
    case "*":
      return toNumber2(left) * toNumber2(right);
    case "/": {
      const divisor = toNumber2(right);
      if (divisor === 0) throw new FormulaError("#DIV/0!");
      return toNumber2(left) / divisor;
    }
    case "&":
      return String(left ?? "") + String(right ?? "");
    case "=":
      return left === right;
    case "<>":
      return left !== right;
    case "<":
      return toNumber2(left) < toNumber2(right);
    case ">":
      return toNumber2(left) > toNumber2(right);
    case "<=":
      return toNumber2(left) <= toNumber2(right);
    case ">=":
      return toNumber2(left) >= toNumber2(right);
    default:
      throw new FormulaError(`Unknown operator: ${node.op}`);
  }
}
function resolveRange(rangeStr, resolve, depth) {
  const [startStr, endStr] = rangeStr.split(":");
  const start = parseCellRef(startStr);
  const end = parseCellRef(endStr);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const values = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const raw = resolve(c, r);
      if (typeof raw === "string" && raw.startsWith("=")) {
        values.push(evaluateFormula(raw.slice(1), resolve, depth + 1));
      } else {
        values.push(raw);
      }
    }
  }
  return values;
}
function evalFunction(name, argNodes, resolve, depth) {
  const flattenArgs = () => {
    const result = [];
    for (const arg of argNodes) {
      const val = evalNode(arg, resolve, depth);
      if (Array.isArray(val)) {
        result.push(...val);
      } else {
        result.push(val);
      }
    }
    return result;
  };
  const numericArgs = () => flattenArgs().filter((v) => v != null && v !== "").map(toNumber2);
  switch (name) {
    case "SUM": {
      const nums = numericArgs();
      return nums.reduce((a, b) => a + b, 0);
    }
    case "AVERAGE": {
      const nums = numericArgs();
      if (nums.length === 0) throw new FormulaError("#DIV/0!");
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    case "MIN": {
      const nums = numericArgs();
      if (nums.length === 0) return 0;
      return Math.min(...nums);
    }
    case "MAX": {
      const nums = numericArgs();
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    }
    case "COUNT": {
      return flattenArgs().filter((v) => typeof v === "number").length;
    }
    case "COUNTA": {
      return flattenArgs().filter((v) => v != null && v !== "").length;
    }
    case "ABS": {
      if (argNodes.length !== 1) throw new FormulaError("ABS requires 1 argument");
      return Math.abs(toNumber2(evalNode(argNodes[0], resolve, depth)));
    }
    case "ROUND": {
      if (argNodes.length < 1 || argNodes.length > 2)
        throw new FormulaError("ROUND requires 1-2 arguments");
      const val = toNumber2(evalNode(argNodes[0], resolve, depth));
      const places = argNodes.length > 1 ? toNumber2(evalNode(argNodes[1], resolve, depth)) : 0;
      const factor = Math.pow(10, places);
      return Math.round(val * factor) / factor;
    }
    case "CONCAT": {
      return flattenArgs().map((v) => String(v ?? "")).join("");
    }
    case "IF": {
      if (argNodes.length < 2 || argNodes.length > 3)
        throw new FormulaError("IF requires 2-3 arguments");
      const condition = evalNode(argNodes[0], resolve, depth);
      if (isTruthy(condition)) {
        return evalNode(argNodes[1], resolve, depth);
      }
      return argNodes.length > 2 ? evalNode(argNodes[2], resolve, depth) : false;
    }
    case "LEN": {
      if (argNodes.length !== 1) throw new FormulaError("LEN requires 1 argument");
      return String(evalNode(argNodes[0], resolve, depth) ?? "").length;
    }
    case "UPPER": {
      if (argNodes.length !== 1) throw new FormulaError("UPPER requires 1 argument");
      return String(evalNode(argNodes[0], resolve, depth) ?? "").toUpperCase();
    }
    case "LOWER": {
      if (argNodes.length !== 1) throw new FormulaError("LOWER requires 1 argument");
      return String(evalNode(argNodes[0], resolve, depth) ?? "").toLowerCase();
    }
    default:
      throw new FormulaError(`Unknown function: ${name}`);
  }
}
function toNumber2(val) {
  if (typeof val === "number") return val;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "string") {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
function isTruthy(val) {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") return val.length > 0;
  return val != null;
}
function isFormula(value) {
  return typeof value === "string" && value.length > 1 && value[0] === "=";
}

// src/store.ts
var GridEngine = class {
  state;
  config;
  undoStack = [];
  redoStack = [];
  dataHasBeenSet = false;
  loadingOverride = null;
  infiniteBlocks = [];
  infiniteRowCount = 0;
  gridWidth = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alignedGrids = [];
  propagatingAlignment = false;
  chartIdCounter = 0;
  editingCell = null;
  customAggFuncs;
  events;
  constructor(config) {
    this.config = config;
    this.events = new EventHub();
    this.customAggFuncs = { ...config.aggregators };
    this.state = {
      fields: resolveFieldDefs(
        config.fields,
        config.fieldDefaults,
        config.fieldPresets
      ),
      data: [],
      entries: [],
      sortRules: extractInitialSort(config.fields),
      groupFields: [],
      expandedGroups: /* @__PURE__ */ new Set(),
      pivotFields: [],
      pivoting: false,
      filters: {},
      searchText: "",
      focus: null,
      cellSpans: [],
      selectedKeys: /* @__PURE__ */ new Set(),
      stickyTop: config.stickyTopRows ? buildEntries(config.stickyTopRows) : [],
      stickyBottom: config.stickyBottomRows ? buildEntries(config.stickyBottomRows) : [],
      page: 0,
      filteredRows: [],
      visibleRows: [],
      panel: (() => {
        const def = normalizePanelDef(config.panel);
        if (!def) {
          return null;
        }
        return {
          def,
          visible: !def.hiddenByDefault,
          openTabId: def.hiddenByDefault ? null : def.defaultTab ?? null
        };
      })(),
      charts: config.enableCharts ? { charts: /* @__PURE__ */ new Map(), crossFilterSource: null } : null
    };
  }
  // -----------------------------------------------------------------------
  // Dispatch
  // -----------------------------------------------------------------------
  dispatch(command) {
    commandReducer(this.state, command, this.events, {
      getRowId: this.config.rowKeyGetter,
      pagination: this.config.paginate,
      paginationPageSize: this.config.pageSize,
      groupDefaultExpanded: this.config.groupExpandDepth,
      isGroupOpenByDefault: this.config.isGroupExpanded ? (params) => this.config.isGroupExpanded({
        groupKey: params.groupValue,
        level: params.level,
        field: params.dataKey
      }) : void 0,
      cascadeSelection: this.config.cascadeSelection,
      overallSummary: this.config.overallSummary,
      groupSummary: this.config.groupSummary,
      aggregators: this.customAggFuncs,
      groupAggregator: this.config.groupAggregator ? (params) => this.config.groupAggregator({
        nodes: params.entries,
        columns: params.fields
      }) : void 0,
      filterAggregates: this.config.filterAggregates,
      includeHiddenFieldsInSearch: this.config.searchHiddenFields,
      searchParser: this.config.searchParser,
      searchMatcher: this.config.searchMatcher,
      hierarchical: this.config.hierarchical,
      pathGetter: this.config.pathGetter,
      parentKeyField: this.config.parentKeyField,
      hasCustomFilter: this.config.hasCustomFilter,
      customFilterPass: this.config.customFilterPass,
      expandableRows: this.config.expandableRows,
      isExpandable: this.config.isExpandable,
      getNestedData: this.config.getNestedData,
      isSpanningRow: this.config.isSpanningRow ? (params) => this.config.isSpanningRow({
        data: params.data,
        node: params.entry
      }) : void 0,
      processUnpinnedFields: this.config.processUnpinnedColumns ? (params) => this.config.processUnpinnedColumns({
        columns: params.fields,
        pinned: params.locked
      }) : void 0,
      gridWidth: this.gridWidth,
      minUnpinnedWidth: this.config.minUnpinnedWidth
    });
  }
  // -----------------------------------------------------------------------
  // Selectors (read-only access to state)
  // -----------------------------------------------------------------------
  snapshot() {
    return this.state;
  }
  getFields() {
    return this.state.fields;
  }
  getVisibleFields() {
    return this.state.fields.filter((c) => c.visible !== false);
  }
  getEntries() {
    return this.state.entries;
  }
  getVisibleRows() {
    return this.state.visibleRows;
  }
  getEntry(rowKey) {
    return this.state.entries.find((n) => n.id === rowKey);
  }
  getSortRules() {
    return this.state.sortRules;
  }
  getSelectedKeys() {
    return this.state.selectedKeys;
  }
  getSelectedData() {
    return this.state.entries.filter((n) => n.selected).map((n) => n.data);
  }
  getField(fieldId) {
    return this.state.fields.find((c) => c.id === fieldId);
  }
  getVisibleRowCount() {
    return this.state.visibleRows.length;
  }
  getVisibleRowAt(index) {
    return this.state.visibleRows[index];
  }
  eachEntry(callback) {
    this.state.entries.forEach(callback);
  }
  getConfig(key) {
    return this.config[key];
  }
  getFieldGroups() {
    return extractFieldGroups(this.config.fields);
  }
  getFieldLayouts() {
    return this.state.fields.map((col) => ({
      id: col.id,
      width: col.width,
      visible: col.visible,
      locked: col.locked
    }));
  }
  applyFieldLayouts(fieldLayouts) {
    const newFields = [];
    for (const fl of fieldLayouts) {
      const col = this.state.fields.find((c) => c.id === fl.id);
      if (col) {
        col.width = fl.width;
        col.visible = fl.visible;
        col.locked = fl.locked;
        newFields.push(col);
      }
    }
    for (const col of this.state.fields) {
      if (!newFields.includes(col)) {
        newFields.push(col);
      }
    }
    this.state.fields = newFields;
  }
  autoFitFields(totalWidth) {
    const cols = this.state.fields.filter((c) => c.visible !== false);
    const lockedWidth = cols.filter((c) => c.locked).reduce((sum, c) => sum + c.width, 0);
    const unlockedCols = cols.filter((c) => !c.locked);
    const fixedCols = unlockedCols.filter((c) => !c.flex);
    const flexCols = unlockedCols.filter((c) => c.flex);
    const fixedWidth = fixedCols.reduce((sum, c) => sum + c.width, 0);
    const remaining = totalWidth - lockedWidth - fixedWidth;
    const totalFlex = flexCols.reduce((sum, c) => sum + (c.flex ?? 0), 0);
    if (totalFlex <= 0 || remaining <= 0) {
      return;
    }
    const allocations = /* @__PURE__ */ new Map();
    let overflow = 0;
    let overflowFlex = 0;
    for (const col of flexCols) {
      const flex = col.flex ?? 0;
      const allocated = Math.floor(flex / totalFlex * remaining);
      if (allocated < col.minWidth) {
        allocations.set(col, col.minWidth);
        overflow += col.minWidth - allocated;
        overflowFlex += flex;
      } else {
        allocations.set(col, allocated);
      }
    }
    if (overflow > 0) {
      const remainingFlex = totalFlex - overflowFlex;
      for (const col of flexCols) {
        if (allocations.get(col) > col.minWidth && remainingFlex > 0) {
          const flex = col.flex ?? 0;
          const reduction = Math.floor(flex / remainingFlex * overflow);
          allocations.set(col, allocations.get(col) - reduction);
        }
      }
    }
    for (const col of flexCols) {
      col.width = Math.max(col.minWidth, allocations.get(col) ?? col.width);
    }
  }
  getFieldSpan(col, entry) {
    if (!col.span) {
      return 1;
    }
    const rawSpan = col.span({ data: entry.data });
    if (rawSpan <= 1) {
      return rawSpan;
    }
    const ordered = this.getOrderedFields().filter((c) => c.visible !== false);
    const colIndex = ordered.findIndex((c) => c.id === col.id);
    if (colIndex === -1) {
      return rawSpan;
    }
    const region = col.locked || "center";
    let maxSpan = 1;
    for (let i = colIndex + 1; i < ordered.length; i++) {
      const nextRegion = ordered[i].locked || "center";
      if (nextRegion !== region) {
        break;
      }
      maxSpan++;
    }
    return Math.min(rawSpan, maxSpan);
  }
  setConfig(key, value) {
    this.config[key] = value;
    this.dispatch({ type: "LOAD_DATA", data: this.state.data });
  }
  // -----------------------------------------------------------------------
  // Value helpers
  // -----------------------------------------------------------------------
  canEditCell(col, entry) {
    if (col.editableFn) {
      return col.editableFn({ data: entry.data });
    }
    return col.editable;
  }
  formatValue(value, col) {
    if (col.format) {
      return col.format({
        value,
        data: void 0,
        fieldDef: col
      });
    }
    return String(value);
  }
  editCell(rowKey, fieldId, newValue) {
    const entry = this.state.entries.find((n) => n.id === rowKey);
    const col = this.state.fields.find((c) => c.id === fieldId);
    if (!entry || !col || !col.editable) {
      return false;
    }
    if (col.externalEdit) {
      const oldValue2 = col.dataKey ? entry.data[col.dataKey] : void 0;
      this.events.emit("editRequested", {
        rowKey,
        fieldId,
        oldValue: oldValue2,
        newValue
      });
      return false;
    }
    let parsedValue = newValue;
    if (col.parse) {
      const oldValue2 = col.dataKey ? entry.data[col.dataKey] : void 0;
      parsedValue = col.parse({
        newValue,
        oldValue: oldValue2,
        data: entry.data,
        fieldDef: col
      });
    }
    const oldValue = col.dataKey ? entry.data[col.dataKey] : void 0;
    if (col.setValue) {
      const changed = col.setValue({
        data: entry.data,
        newValue: parsedValue,
        fieldDef: col
      });
      if (!changed) {
        return false;
      }
    } else if (col.dataKey) {
      entry.data[col.dataKey] = parsedValue;
    } else {
      return false;
    }
    if (this.config.editHistory) {
      const limit = this.config.editHistoryLimit ?? 10;
      this.undoStack.push({ rowKey, fieldId, oldValue, newValue: parsedValue });
      if (this.undoStack.length > limit) {
        this.undoStack.shift();
      }
      this.redoStack = [];
    }
    this.events.emit("cellEdited", {
      rowKey,
      fieldId,
      oldValue,
      newValue: parsedValue
    });
    return true;
  }
  // -----------------------------------------------------------------------
  // Convenience dispatchers
  // -----------------------------------------------------------------------
  loadData(rowData) {
    this.dataHasBeenSet = true;
    this.dispatch({ type: "LOAD_DATA", data: rowData });
  }
  defineFields(fieldDefs) {
    this.dispatch({ type: "DEFINE_FIELDS", fields: fieldDefs });
  }
  setSortRules(sortRules) {
    const model = this.config.singleSort ? sortRules.slice(0, 1) : sortRules;
    this.dispatch({ type: "UPDATE_SORT", sortRules: model });
  }
  pickRow(rowKey, selected) {
    if (!this.config.selectionMode) {
      return;
    }
    if (selected && this.config.selectionMode === "single") {
      this.dispatch({ type: "PICK_ALL", selected: false });
    }
    this.dispatch({ type: "PICK_ROW", rowKey, selected });
  }
  pickAll(selected) {
    if (!this.config.selectionMode) {
      return;
    }
    this.dispatch({ type: "PICK_ALL", selected });
  }
  clearSelection() {
    this.dispatch({ type: "PICK_ALL", selected: false });
  }
  getSelectedEntries() {
    return this.state.entries.filter((n) => n.selected);
  }
  resizeField(fieldId, width) {
    this.dispatch({ type: "RESIZE_FIELD", fieldId, width });
  }
  reorderField(fieldId, toIndex) {
    this.dispatch({ type: "REORDER_FIELD", fieldId, toIndex });
  }
  lockField(fieldId, locked) {
    this.dispatch({ type: "LOCK_FIELD", fieldId, locked });
  }
  toggleField(fieldId, visible) {
    this.dispatch({ type: "TOGGLE_FIELD", fieldId, visible });
  }
  toggleFields(fieldIds, visible) {
    for (const fieldId of fieldIds) {
      this.dispatch({ type: "TOGGLE_FIELD", fieldId, visible });
    }
  }
  setFieldWidths(widths) {
    for (const { fieldId, width } of widths) {
      this.dispatch({ type: "RESIZE_FIELD", fieldId, width });
    }
  }
  setFieldsLocked(fieldIds, locked) {
    for (const fieldId of fieldIds) {
      this.dispatch({ type: "LOCK_FIELD", fieldId, locked });
    }
  }
  refreshCells() {
    this.events.emit("snapshotChanged", { state: this.state });
  }
  redrawRows() {
    this.events.emit("snapshotChanged", { state: this.state });
  }
  autoSizeFields(fieldIds) {
    let changed = false;
    for (const fieldId of fieldIds) {
      const col = this.state.fields.find((c) => c.id === fieldId);
      if (!col?.dataKey) {
        continue;
      }
      const charWidth = 8;
      const padding = 24;
      let maxLen = col.title.length;
      for (const entry of this.state.entries) {
        const val = readCellValue(entry.data, col);
        const len = val != null ? String(val).length : 0;
        if (len > maxLen) {
          maxLen = len;
        }
      }
      const newWidth = Math.max(
        col.minWidth,
        Math.min(col.maxWidth, maxLen * charWidth + padding)
      );
      if (col.width !== newWidth || col.flex) {
        col.width = newWidth;
        col.flex = void 0;
        changed = true;
      }
    }
    if (changed) {
      this.events.emit("snapshotChanged", { state: this.state });
    }
  }
  autoSizeAllFields() {
    this.autoSizeFields(this.state.fields.map((c) => c.id));
  }
  getCellValueForEntry(entry, col) {
    const raw = readCellValue(entry.data, col);
    if (this.config.cellExpressions && isFormula(raw)) {
      try {
        return evaluateFormula(raw.slice(1), (colIdx, rowIdx) => {
          const field = this.state.fields[colIdx];
          const row = this.state.entries[rowIdx];
          if (!field || !row) return void 0;
          return readCellValue(row.data, field);
        });
      } catch {
        return "#ERROR!";
      }
    }
    return raw;
  }
  /** Set the grid container width (in px). Called by framework adapters on resize. */
  setGridWidth(width) {
    this.gridWidth = width;
  }
  /** Get the current grid container width, or null if not set. */
  getGridWidth() {
    return this.gridWidth;
  }
  /** Get total width of visible locked fields on a given side. */
  getLockedAreaWidth(side) {
    return this.state.fields.filter((c) => c.visible !== false && c.locked === side).reduce((sum, c) => sum + c.width, 0);
  }
  /** Returns fields ordered: locked-left, unlocked, locked-right. */
  getOrderedFields() {
    const left = this.state.fields.filter((c) => c.locked === "left");
    const center = this.state.fields.filter((c) => !c.locked);
    const right = this.state.fields.filter((c) => c.locked === "right");
    return [...left, ...center, ...right];
  }
  isSearchEnabled() {
    return this.config.quickFilter === true;
  }
  isFooterEnabled() {
    return this.config.footer != null && this.config.footer !== false;
  }
  getFooterDef() {
    return normalizeFooterDef(this.config.footer);
  }
  getFooterWidget(key) {
    const def = this.getFooterDef();
    if (!def) {
      return null;
    }
    return def.widgets.find((p) => p.key === key) ?? null;
  }
  isSearchPresent() {
    return this.state.searchText.length > 0;
  }
  getSearchText() {
    return this.state.searchText;
  }
  resetSearch() {
    this.setSearch("");
  }
  patchData(transaction) {
    this.dispatch({ type: "PATCH_DATA", patch: transaction });
  }
  setFilters(filters) {
    this.dispatch({ type: "SET_FILTERS", filters });
  }
  getFilters() {
    return this.state.filters;
  }
  setSearch(text) {
    this.dispatch({ type: "SET_SEARCH", text });
  }
  getFieldFilter(fieldId) {
    return this.state.filters[fieldId];
  }
  setFieldFilter(fieldId, condition) {
    this.setFilters({ ...this.state.filters, [fieldId]: condition });
  }
  onFilterChanged() {
    this.dispatch({
      type: "SET_FILTERS",
      filters: this.state.filters
    });
  }
  destroyFilter(fieldId) {
    const { [fieldId]: _, ...rest } = this.state.filters;
    this.setFilters(rest);
  }
  getStickyTopRows() {
    return this.state.stickyTop;
  }
  getStickyBottomRows() {
    return this.state.stickyBottom;
  }
  setStickyTopData(rowData) {
    this.dispatch({ type: "SET_STICKY_TOP", data: rowData });
  }
  setStickyBottomData(rowData) {
    this.dispatch({ type: "SET_STICKY_BOTTOM", data: rowData });
  }
  setGroupFields(fields) {
    this.dispatch({ type: "SET_GROUP_FIELDS", fields });
  }
  addGroupFields(fields) {
    this.dispatch({ type: "ADD_GROUP_FIELDS", fields });
  }
  removeGroupFields(fields) {
    this.dispatch({ type: "REMOVE_GROUP_FIELDS", fields });
  }
  expandAll() {
    this.dispatch({ type: "EXPAND_ALL" });
  }
  collapseAll() {
    this.dispatch({ type: "COLLAPSE_ALL" });
  }
  setEntryExpanded(rowKey, expanded) {
    this.dispatch({ type: "TOGGLE_EXPAND", rowKey, expanded });
  }
  addAggFuncs(funcs) {
    Object.assign(this.customAggFuncs, funcs);
    if (this.state.groupFields.length > 0) {
      this.dispatch({
        type: "SET_GROUP_FIELDS",
        fields: this.state.groupFields
      });
    }
  }
  setFieldAggFunc(fieldId, aggFunc) {
    const col = this.state.fields.find((c) => c.id === fieldId);
    if (col) {
      col.aggregate = aggFunc;
      if (this.state.groupFields.length > 0) {
        this.dispatch({
          type: "SET_GROUP_FIELDS",
          fields: this.state.groupFields
        });
      }
    }
  }
  // --- Pivoting ---
  setPivotMode(enabled) {
    this.dispatch({ type: "TOGGLE_PIVOT", enabled });
  }
  isPivotMode() {
    return this.state.pivoting;
  }
  setPivotFields(fields) {
    this.dispatch({ type: "SET_PIVOT_FIELDS", fields });
  }
  getPivotFields() {
    return [...this.state.pivotFields];
  }
  getPivotResultFields() {
    if (!this.state.pivoting || this.state.pivotFields.length === 0) {
      return [];
    }
    const pivotFieldId = this.state.pivotFields[0];
    const pivotCol = this.state.fields.find((c) => c.id === pivotFieldId);
    if (!pivotCol?.dataKey) {
      return [];
    }
    const pivotValues = /* @__PURE__ */ new Set();
    for (const entry of this.state.entries) {
      const val = readCellValue(entry.data, pivotCol);
      if (val != null) {
        pivotValues.add(String(val));
      }
    }
    const aggCols = this.state.fields.filter((c) => c.aggregate);
    const result = [];
    for (const pivotVal of pivotValues) {
      for (const aggCol of aggCols) {
        result.push({
          fieldId: `${aggCol.dataKey}_${pivotVal}`,
          title: pivotVal,
          dataKey: `${aggCol.dataKey}_${pivotVal}`
        });
      }
    }
    return result;
  }
  paginationGoToPage(page) {
    this.dispatch({ type: "GO_TO_PAGE", page });
  }
  paginationGoToNextPage() {
    this.dispatch({ type: "GO_TO_PAGE", page: this.state.page + 1 });
  }
  paginationGoToPreviousPage() {
    this.dispatch({ type: "GO_TO_PAGE", page: this.state.page - 1 });
  }
  paginationGetCurrentPage() {
    return this.state.page;
  }
  paginationGetTotalPages() {
    const pageSize = this.config.pageSize ?? 100;
    const hasGroups = this.state.groupFields.length > 0;
    let itemCount;
    if (hasGroups) {
      itemCount = this.state.filteredRows.filter(
        (r) => r.isGroup && (r.level === 0 || r.level === -1)
      ).length;
    } else {
      itemCount = this.state.filteredRows.length;
    }
    return Math.max(1, Math.ceil(itemCount / pageSize));
  }
  // -----------------------------------------------------------------------
  // Row Height
  // -----------------------------------------------------------------------
  getRowHeightForEntry(entry) {
    if (this.config.rowHeightGetter) {
      return this.config.rowHeightGetter({ data: entry.data, node: entry });
    }
    return this.config.rowHeight ?? 25;
  }
  // -----------------------------------------------------------------------
  // Row Spanning
  // -----------------------------------------------------------------------
  getRowSpan(col, rowIndex) {
    if (!col.mergeRows) {
      return 1;
    }
    const displayed = this.state.visibleRows;
    if (rowIndex >= displayed.length) {
      return 1;
    }
    const dataKey = col.dataKey;
    if (!dataKey) {
      return 1;
    }
    const currentVal = displayed[rowIndex].data[dataKey];
    if (rowIndex > 0) {
      const prevVal = displayed[rowIndex - 1].data[dataKey];
      if (currentVal === prevVal) {
        return 0;
      }
    }
    let span = 1;
    for (let i = rowIndex + 1; i < displayed.length; i++) {
      const val = displayed[i].data[dataKey];
      if (val === currentVal) {
        span++;
      } else {
        break;
      }
    }
    return span;
  }
  // -----------------------------------------------------------------------
  // Row Styles
  // -----------------------------------------------------------------------
  getRowClassForEntry(entry) {
    if (this.config.rowClassGetter) {
      return this.config.rowClassGetter({ data: entry.data, node: entry });
    }
    return "";
  }
  getRowClassRulesForEntry(entry) {
    const rules = this.config.rowClassRules;
    if (!rules) {
      return [];
    }
    const result = [];
    for (const [className, fn] of Object.entries(rules)) {
      if (fn({ data: entry.data, node: entry })) {
        result.push(className);
      }
    }
    return result;
  }
  // -----------------------------------------------------------------------
  // Async Transactions
  // -----------------------------------------------------------------------
  asyncTransactionQueue = [];
  asyncFlushTimer = null;
  patchDataAsync(transaction) {
    this.asyncTransactionQueue.push(transaction);
    if (!this.asyncFlushTimer) {
      this.asyncFlushTimer = setTimeout(() => {
        this.flushAsyncPatches();
      }, 0);
    }
  }
  async flushAsyncPatches() {
    if (this.asyncFlushTimer) {
      clearTimeout(this.asyncFlushTimer);
      this.asyncFlushTimer = null;
    }
    const queue = this.asyncTransactionQueue.splice(0);
    const merged = { add: [], update: [], remove: [] };
    for (const tx of queue) {
      if (tx.add) {
        merged.add.push(...tx.add);
      }
      if (tx.update) {
        merged.update.push(...tx.update);
      }
      if (tx.remove) {
        merged.remove.push(...tx.remove);
      }
    }
    if (merged.add.length || merged.update.length || merged.remove.length) {
      this.dispatch({ type: "PATCH_DATA", patch: merged });
    }
  }
  // -----------------------------------------------------------------------
  // Row Dragging
  // -----------------------------------------------------------------------
  moveRowByIndex(fromIndex, toIndex) {
    const entries = this.state.entries;
    const clampedTo = Math.max(0, Math.min(toIndex, entries.length - 1));
    if (fromIndex < 0 || fromIndex >= entries.length || fromIndex === clampedTo) {
      return;
    }
    const [removed] = entries.splice(fromIndex, 1);
    entries.splice(clampedTo, 0, removed);
    const data = this.state.data;
    const [removedData] = data.splice(fromIndex, 1);
    data.splice(clampedTo, 0, removedData);
    this.dispatch({ type: "LOAD_DATA", data: this.state.data });
    this.events.emit("rowMoved", { fromIndex, toIndex: clampedTo });
  }
  // -----------------------------------------------------------------------
  // Focused Cell
  // -----------------------------------------------------------------------
  getFocusedCell() {
    return this.state.focus;
  }
  setFocusedCell(rowKey, fieldId) {
    this.state.focus = { rowId: rowKey, fieldId };
    this.events.emit("focusChanged", { rowKey, fieldId });
  }
  clearFocusedCell() {
    this.state.focus = null;
    this.events.emit("focusChanged", { rowKey: null, fieldId: null });
  }
  // -----------------------------------------------------------------------
  // Clipboard
  // -----------------------------------------------------------------------
  getCopyData(opts) {
    const ranges = this.state.cellSpans;
    if (ranges.length === 0) {
      return "";
    }
    const range = ranges[0];
    const cols = range.fields.map((fieldId) => this.state.fields.find((c) => c.id === fieldId)).filter((c) => c != null);
    const lines = [];
    if (opts?.includeHeaders) {
      lines.push(cols.map((c) => c.title).join("	"));
    }
    const displayed = this.state.visibleRows;
    const startIdx = Math.min(range.startRowIndex, range.endRowIndex);
    const endIdx = Math.max(range.startRowIndex, range.endRowIndex);
    for (let i = startIdx; i <= endIdx && i < displayed.length; i++) {
      const entry = displayed[i];
      const values = cols.map((col) => {
        const raw = readCellValue(entry.data, col);
        if (col.format) {
          return col.format({
            value: raw,
            data: entry.data,
            fieldDef: col
          });
        }
        return raw != null ? String(raw) : "";
      });
      lines.push(values.join("	"));
    }
    return lines.join("\n");
  }
  pasteData(text, startRowKey, startFieldId) {
    const rows = text.split("\n").filter(Boolean);
    const cols = this.getVisibleFields();
    const startColIdx = cols.findIndex((c) => c.id === startFieldId);
    if (startColIdx === -1) {
      return;
    }
    const allEntries = this.state.entries;
    const startRowIdx = allEntries.findIndex((n) => n.id === startRowKey);
    if (startRowIdx === -1) {
      return;
    }
    for (let r = 0; r < rows.length; r++) {
      const rowIdx = startRowIdx + r;
      if (rowIdx >= allEntries.length) {
        break;
      }
      const entry = allEntries[rowIdx];
      const cells = rows[r].split("	");
      for (let c = 0; c < cells.length; c++) {
        const colIdx = startColIdx + c;
        if (colIdx >= cols.length) {
          break;
        }
        const col = cols[colIdx];
        if (col.editable && col.dataKey) {
          entry.data[col.dataKey] = cells[c];
        }
      }
    }
  }
  // -----------------------------------------------------------------------
  // Cell Span Selection
  // -----------------------------------------------------------------------
  addCellSpan(range) {
    if (!this.config.cellSelect) {
      return;
    }
    this.state.cellSpans.push(range);
    this.events.emit("cellSpanUpdated", {
      cellSpans: this.state.cellSpans
    });
  }
  deleteSpanValues() {
    const ranges = this.state.cellSpans;
    for (const range of ranges) {
      const cols = range.fields.map((fieldId) => this.state.fields.find((c) => c.id === fieldId)).filter((c) => c != null && c.editable);
      const displayed = this.state.visibleRows;
      const start = Math.min(range.startRowIndex, range.endRowIndex);
      const end = Math.max(range.startRowIndex, range.endRowIndex);
      for (let i = start; i <= end && i < displayed.length; i++) {
        const entry = displayed[i];
        for (const col of cols) {
          if (col.dataKey) {
            entry.data[col.dataKey] = null;
          }
        }
      }
    }
  }
  copyDownSpan() {
    const ranges = this.state.cellSpans;
    if (ranges.length === 0) {
      return;
    }
    const range = ranges[0];
    const cols = range.fields.map((fieldId) => this.state.fields.find((c) => c.id === fieldId)).filter((c) => c != null && c.editable);
    const displayed = this.state.visibleRows;
    const start = Math.min(range.startRowIndex, range.endRowIndex);
    const end = Math.max(range.startRowIndex, range.endRowIndex);
    if (start >= displayed.length) {
      return;
    }
    const sourceEntry = displayed[start];
    for (let i = start + 1; i <= end && i < displayed.length; i++) {
      const entry = displayed[i];
      for (const col of cols) {
        if (col.dataKey) {
          const sourceVal = sourceEntry.data[col.dataKey];
          entry.data[col.dataKey] = sourceVal;
        }
      }
    }
  }
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
  fillDown(fieldId, sourceStart, sourceEnd, targetEnd) {
    const col = this.state.fields.find((c) => c.id === fieldId);
    if (!col?.dataKey || !col.editable) {
      return;
    }
    const entries = this.state.entries;
    const dataKey = col.dataKey;
    const sourceValues = [];
    for (let i = sourceStart; i <= sourceEnd && i < entries.length; i++) {
      sourceValues.push(entries[i].data[dataKey]);
    }
    if (sourceValues.length === 0) {
      return;
    }
    const allNumbers = sourceValues.every((v) => typeof v === "number");
    let step = null;
    if (allNumbers && sourceValues.length >= 2) {
      const diffs = /* @__PURE__ */ new Set();
      for (let i = 1; i < sourceValues.length; i++) {
        diffs.add(
          sourceValues[i] - sourceValues[i - 1]
        );
      }
      if (diffs.size === 1) {
        step = [...diffs][0];
      }
    }
    const fillStart = sourceEnd + 1;
    for (let i = fillStart; i <= targetEnd && i < entries.length; i++) {
      const targetOffset = i - fillStart;
      let value;
      if (step != null) {
        const lastSourceVal = sourceValues[sourceValues.length - 1];
        value = lastSourceVal + step * (targetOffset + 1);
      } else if (sourceValues.length === 1) {
        value = sourceValues[0];
      } else {
        value = sourceValues[targetOffset % sourceValues.length];
      }
      entries[i].data[dataKey] = value;
    }
  }
  clearCellSpans() {
    this.state.cellSpans = [];
    this.events.emit("cellSpanUpdated", {
      cellSpans: this.state.cellSpans
    });
  }
  getCellSpans() {
    return this.state.cellSpans;
  }
  // -----------------------------------------------------------------------
  // CSV Export
  // -----------------------------------------------------------------------
  getDataAsCsv(opts) {
    const sep = opts?.columnSeparator ?? ",";
    const visibleCols = this.getVisibleFields();
    const lines = [];
    if (!opts?.suppressHeaders) {
      const header = visibleCols.map((c) => {
        const name = opts?.processHeaderCallback ? opts.processHeaderCallback({
          title: c.title,
          fieldId: c.id
        }) : c.title;
        return csvEscape(name, sep);
      }).join(sep);
      lines.push(header);
    }
    const visibleRows = this.getVisibleRows().filter((r) => !r.isGroup);
    for (const entry of visibleRows) {
      if (opts?.shouldRowBeSkipped?.({ data: entry.data, entry })) {
        continue;
      }
      const row = visibleCols.map((col) => {
        const raw = readCellValue(entry.data, col);
        let value;
        if (opts?.processCellCallback) {
          value = opts.processCellCallback({
            value: raw,
            data: entry.data,
            fieldId: col.id,
            field: col
          });
        } else if (col.format) {
          value = col.format({
            value: raw,
            data: entry.data,
            fieldDef: col
          });
        } else {
          value = raw != null ? String(raw) : "";
        }
        if (opts?.suppressFormulaInjection) {
          value = sanitizeFormulaInjection(value);
        }
        return csvEscape(value, sep);
      }).join(sep);
      lines.push(row);
    }
    return lines.join("\n");
  }
  // -----------------------------------------------------------------------
  // Undo/Redo
  // -----------------------------------------------------------------------
  undoCellEditing() {
    const entry = this.undoStack.pop();
    if (!entry) {
      return;
    }
    const node = this.state.entries.find((n) => n.id === entry.rowKey);
    const col = this.state.fields.find((c) => c.id === entry.fieldId);
    if (node && col?.dataKey) {
      node.data[col.dataKey] = entry.oldValue;
      this.redoStack.push(entry);
    }
  }
  redoCellEditing() {
    const entry = this.redoStack.pop();
    if (!entry) {
      return;
    }
    const node = this.state.entries.find((n) => n.id === entry.rowKey);
    const col = this.state.fields.find((c) => c.id === entry.fieldId);
    if (node && col?.dataKey) {
      node.data[col.dataKey] = entry.newValue;
      this.undoStack.push(entry);
    }
  }
  getCurrentUndoSize() {
    return this.undoStack.length;
  }
  getCurrentRedoSize() {
    return this.redoStack.length;
  }
  // -----------------------------------------------------------------------
  // Infinite Row Model
  // -----------------------------------------------------------------------
  async loadInfiniteBlock(blockIndex) {
    const ds = this.config.streamProvider;
    if (!ds) {
      return;
    }
    const blockSize = this.config.fetchSize ?? 100;
    const startRow = blockIndex * blockSize;
    const endRow = startRow + blockSize;
    const result = await ds.getRows({
      startRow,
      endRow,
      sortRules: [...this.state.sortRules],
      filters: { ...this.state.filters }
    });
    this.infiniteRowCount = result.rowCount;
    const entries = buildEntries(result.data);
    this.infiniteBlocks.push({ blockIndex, rows: entries });
    const maxBlocks = this.config.maxCachedPages;
    if (maxBlocks && this.infiniteBlocks.length > maxBlocks) {
      this.infiniteBlocks = this.infiniteBlocks.slice(-maxBlocks);
    }
    this.rebuildInfiniteVisibleRows();
  }
  getInfiniteRowCount() {
    return this.infiniteRowCount;
  }
  purgeInfiniteCache() {
    this.infiniteBlocks = [];
    this.state.entries = [];
    this.state.visibleRows = [];
    this.state.filteredRows = [];
  }
  rebuildInfiniteVisibleRows() {
    this.infiniteBlocks.sort((a, b) => a.blockIndex - b.blockIndex);
    const allRows = this.infiniteBlocks.flatMap((b) => b.rows);
    this.state.entries = allRows;
    this.state.filteredRows = allRows;
    this.state.visibleRows = allRows;
  }
  // -----------------------------------------------------------------------
  // Overlays
  // -----------------------------------------------------------------------
  getActiveOverlay() {
    if (this.loadingOverride === true) {
      return "loading";
    }
    if (this.loadingOverride === false) {
      return null;
    }
    if (!this.dataHasBeenSet) {
      return "loading";
    }
    if (this.state.data.length === 0 && !this.config.suppressNoRowsOverlay) {
      return "noRows";
    }
    return null;
  }
  setLoading(loading) {
    this.loadingOverride = loading ? true : false;
  }
  // -----------------------------------------------------------------------
  // Footer Data
  // -----------------------------------------------------------------------
  getTotalRowCount() {
    return this.state.entries.length;
  }
  getFilteredRowCount() {
    return this.state.filteredRows.filter((r) => !r.isGroup).length;
  }
  getSelectedRowCount() {
    return this.state.selectedKeys.size;
  }
  getSpanAggregation() {
    const ranges = this.state.cellSpans;
    if (ranges.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, avg: 0 };
    }
    const range = ranges[0];
    const cols = range.fields.map((fieldId) => this.state.fields.find((c) => c.id === fieldId)).filter((c) => c != null);
    const displayed = this.state.visibleRows;
    const start = Math.min(range.startRowIndex, range.endRowIndex);
    const end = Math.max(range.startRowIndex, range.endRowIndex);
    const nums = [];
    for (let i = start; i <= end && i < displayed.length; i++) {
      const entry = displayed[i];
      for (const col of cols) {
        const val = readCellValue(entry.data, col);
        if (typeof val === "number") {
          nums.push(val);
        }
      }
    }
    if (nums.length === 0) {
      return { count: 0, sum: 0, min: 0, max: 0, avg: 0 };
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      count: nums.length,
      sum,
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: sum / nums.length
    };
  }
  // -----------------------------------------------------------------------
  // Flashing Cells
  // -----------------------------------------------------------------------
  flashCells(params) {
    const cells = params.rowKeys.flatMap(
      (rowKey) => params.fields.map((fieldId) => ({ rowKey, fieldId }))
    );
    this.events.emit("cellHighlighted", {
      cells,
      flashDuration: params.flashDuration ?? 500,
      fadeDuration: params.fadeDuration ?? 1e3
    });
  }
  // -----------------------------------------------------------------------
  // Aligned Grids
  // -----------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addAlignedGrid(grid) {
    this.alignedGrids.push(grid);
    this.events.on("fieldResized", (e) => {
      if (!this.propagatingAlignment) {
        this.propagateToAligned((g) => g.resizeField(e.fieldId, e.width));
      }
    });
    this.events.on("fieldToggled", (e) => {
      if (!this.propagatingAlignment) {
        this.propagateToAligned((g) => g.toggleField(e.fieldId, e.visible));
      }
    });
    this.events.on("fieldReordered", (e) => {
      if (!this.propagatingAlignment) {
        this.propagateToAligned((g) => g.reorderField(e.fieldId, e.toIndex));
      }
    });
    this.events.on("fieldLocked", (e) => {
      if (!this.propagatingAlignment) {
        this.propagateToAligned((g) => g.lockField(e.fieldId, e.locked));
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeAlignedGrid(grid) {
    this.alignedGrids = this.alignedGrids.filter((g) => g !== grid);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propagateToAligned(fn) {
    for (const grid of this.alignedGrids) {
      grid.propagatingAlignment = true;
      try {
        fn(grid);
      } finally {
        grid.propagatingAlignment = false;
      }
    }
  }
  // -----------------------------------------------------------------------
  // Localization
  // -----------------------------------------------------------------------
  getLocaleText(key) {
    if (this.config.translations?.[key]) {
      return this.config.translations[key];
    }
    if (this.config.translate) {
      return this.config.translate(key);
    }
    return key;
  }
  // -----------------------------------------------------------------------
  // Persistable Layout (save/restore)
  // -----------------------------------------------------------------------
  getPersistableLayout() {
    return {
      fields: this.getFieldLayouts(),
      sortRules: [...this.state.sortRules],
      filters: { ...this.state.filters },
      page: this.state.page
    };
  }
  applyPersistableLayout(saved) {
    this.applyFieldLayouts(saved.fields);
    this.setSortRules(saved.sortRules);
    this.setFilters(saved.filters);
    if (saved.page > 0) {
      this.paginationGoToPage(saved.page);
    }
  }
  // -----------------------------------------------------------------------
  // Panel API
  // -----------------------------------------------------------------------
  setPanelVisible(visible) {
    this.dispatch({ type: "TOGGLE_PANEL", visible });
  }
  isPanelVisible() {
    return this.state.panel?.visible ?? false;
  }
  openPanelTab(panelId) {
    this.dispatch({ type: "OPEN_PANEL_TAB", tabId: panelId });
  }
  closePanelTab() {
    this.dispatch({ type: "CLOSE_PANEL_TAB" });
  }
  getOpenedPanelTab() {
    return this.state.panel?.openTabId ?? null;
  }
  isPanelTabShowing(panelId) {
    if (!this.state.panel?.visible) {
      return false;
    }
    if (panelId) {
      return this.state.panel.openTabId === panelId;
    }
    return this.state.panel.openTabId !== null;
  }
  refreshPanelTab(panelId) {
    const id = panelId ?? this.state.panel?.openTabId;
    if (id) {
      this.events.emit("panelRefreshRequested", { tabId: id });
    }
  }
  getPanelDef() {
    return this.state.panel?.def ?? null;
  }
  configurePanelDef(panelConfig) {
    const def = normalizePanelDef(panelConfig);
    if (def) {
      this.dispatch({ type: "CONFIGURE_PANEL", panelDef: def });
    }
  }
  // -----------------------------------------------------------------------
  // Chart API
  // -----------------------------------------------------------------------
  nextChartId() {
    return `chart-${++this.chartIdCounter}`;
  }
  createRangeChart(params) {
    const chartId = this.nextChartId();
    const defaults = this.config.chartDefaults;
    const chart = {
      chartId,
      chartType: params.chartType,
      range: {
        rowRange: params.rowRange ?? "all",
        categoryFieldId: params.categoryFieldId,
        valueFieldIds: params.valueFieldIds
      },
      title: params.title,
      subtitle: params.subtitle,
      liveUpdate: defaults?.liveUpdate ?? true,
      crossFilter: params.crossFilter,
      width: params.width ?? defaults?.width,
      height: params.height ?? defaults?.height
    };
    this.dispatch({ type: "CREATE_CHART", chart });
    return chartId;
  }
  createPivotChart(params) {
    const chartId = this.nextChartId();
    const defaults = this.config.chartDefaults;
    const chart = {
      chartId,
      chartType: params.chartType,
      categoryFieldIds: params.categoryFieldIds,
      valueFieldIds: params.valueFieldIds,
      title: params.title,
      subtitle: params.subtitle,
      liveUpdate: defaults?.liveUpdate ?? true,
      crossFilter: params.crossFilter,
      width: params.width ?? defaults?.width,
      height: params.height ?? defaults?.height
    };
    this.dispatch({ type: "CREATE_CHART", chart });
    return chartId;
  }
  updateChart(chartId, updates) {
    this.dispatch({ type: "UPDATE_CHART", chartId, updates });
  }
  destroyChart(chartId) {
    this.dispatch({ type: "DESTROY_CHART", chartId });
  }
  getChartModels() {
    if (!this.state.charts) {
      return [];
    }
    return [...this.state.charts.charts.values()];
  }
  getChartModel(chartId) {
    return this.state.charts?.charts.get(chartId);
  }
  downloadChart(chartId, filename) {
    this.events.emit("chartDownloadRequested", { chartId, filename });
  }
  isChartsEnabled() {
    return this.config.enableCharts === true;
  }
  // -----------------------------------------------------------------------
  // Context Menu API
  // -----------------------------------------------------------------------
  showContextMenu(params) {
    this.events.emit("contextMenuShown", {
      rowKey: params.rowKey ?? null,
      fieldId: params.fieldId ?? null,
      clientX: params.clientX,
      clientY: params.clientY
    });
  }
  hidePopupMenu() {
    this.events.emit("contextMenuDismissed", {});
  }
  // -----------------------------------------------------------------------
  // Cell Editing State
  // -----------------------------------------------------------------------
  isEditing() {
    return this.editingCell !== null;
  }
  startEditingCell(rowKey, fieldId) {
    this.editingCell = { rowKey, fieldId };
  }
  stopEditing() {
    this.editingCell = null;
  }
  getEditingCell() {
    return this.editingCell;
  }
  // -----------------------------------------------------------------------
  // Scroll API
  // -----------------------------------------------------------------------
  ensureIndexVisible(rowIndex) {
    this.events.emit("scrollToRow", { rowIndex });
  }
  ensureFieldVisible(fieldId) {
    this.events.emit("scrollToField", { fieldId });
  }
  // -----------------------------------------------------------------------
  // ARIA Metadata
  // -----------------------------------------------------------------------
  getAriaMetadata() {
    const isTreeOrGrouped = this.state.groupFields.length > 0 || !!this.config.hierarchical;
    return {
      role: isTreeOrGrouped ? "treegrid" : "grid",
      rowCount: this.state.visibleRows.length,
      colCount: this.state.fields.length
    };
  }
  // -----------------------------------------------------------------------
  // Pagination Page Size
  // -----------------------------------------------------------------------
  paginationGetPageSize() {
    return this.config.pageSize ?? 100;
  }
  // -----------------------------------------------------------------------
  // Row Entry Data
  // -----------------------------------------------------------------------
  setEntryData(rowKey, data) {
    const entry = this.state.entries.find((n) => n.id === rowKey);
    if (entry) {
      entry.data = data;
    }
  }
  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------
  destroy() {
    this.events.removeAllListeners();
  }
};
function csvEscape(value, sep = ",") {
  if (value.includes(sep) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
function extractInitialSort(fieldDefs) {
  const sortItems = [];
  function walk(defs) {
    for (const def of defs) {
      if (def.children) {
        walk(def.children);
      } else if (def.sort) {
        const fieldId = def.id ?? def.dataKey ?? "";
        sortItems.push({
          fieldId,
          sort: def.sort,
          sortIndex: def.sortIndex ?? 0
        });
      }
    }
  }
  walk(fieldDefs);
  sortItems.sort((a, b) => a.sortIndex - b.sortIndex);
  return sortItems.map(({ fieldId, sort }) => ({ id: fieldId, sort }));
}
var FORMULA_CHARS = /* @__PURE__ */ new Set(["+", "-", "=", "@", "	", "\r"]);
function sanitizeFormulaInjection(value) {
  if (value.length > 0 && FORMULA_CHARS.has(value[0])) {
    return `'${value}`;
  }
  return value;
}
var DEFAULT_FIELDS_PANEL = {
  id: "columns",
  labelDefault: "Columns"
};
var DEFAULT_FILTERS_PANEL = {
  id: "filters",
  labelDefault: "Filters"
};
function normalizePanelDef(panelConfig) {
  if (panelConfig === void 0 || panelConfig === false) {
    return null;
  }
  if (panelConfig === true) {
    return {
      tabs: [DEFAULT_FIELDS_PANEL, DEFAULT_FILTERS_PANEL],
      position: "right",
      showButtons: true,
      hiddenByDefault: false
    };
  }
  if (panelConfig === "columns") {
    return {
      tabs: [DEFAULT_FIELDS_PANEL],
      defaultTab: "columns",
      position: "right",
      showButtons: true,
      hiddenByDefault: false
    };
  }
  if (panelConfig === "filters") {
    return {
      tabs: [DEFAULT_FILTERS_PANEL],
      defaultTab: "filters",
      position: "right",
      showButtons: true,
      hiddenByDefault: false
    };
  }
  if (Array.isArray(panelConfig)) {
    const tabs = panelConfig.map((id) => {
      if (id === "columns") {
        return DEFAULT_FIELDS_PANEL;
      }
      if (id === "filters") {
        return DEFAULT_FILTERS_PANEL;
      }
      return { id, labelDefault: id };
    });
    return {
      tabs,
      position: "right",
      showButtons: true,
      hiddenByDefault: false
    };
  }
  return {
    ...panelConfig,
    tabs: panelConfig.tabs ?? [],
    position: panelConfig.position ?? "right",
    showButtons: panelConfig.showButtons ?? true,
    hiddenByDefault: panelConfig.hiddenByDefault ?? false
  };
}
function normalizeFooterDef(config) {
  if (config === void 0 || config === false) {
    return null;
  }
  if (config === true) {
    return {
      widgets: [
        {
          key: "totalRowCount",
          widget: TOTAL_COUNT_WIDGET,
          align: "right"
        }
      ]
    };
  }
  return {
    widgets: (config.widgets ?? []).map((p) => ({
      ...p,
      align: p.align ?? "right"
    }))
  };
}

// src/testingUtils.ts
var testIdFor = {
  cell: (rowKey, fieldId) => `gk-cell-${rowKey}-${fieldId}`,
  headerCell: (fieldId) => `gk-header-cell-${fieldId}`,
  row: (rowKey) => `gk-row-${rowKey}`
};
export {
  EventHub,
  FormulaError,
  GridEngine,
  buildEntries,
  buildTreeFromParentIds,
  buildTreeFromPaths,
  clampWidth,
  colLetterToIndex,
  commandReducer,
  createEntry,
  evaluateFormula,
  extractFieldGroups,
  flattenTree,
  indexToColLetter,
  isFormula,
  normalizeFooterDef,
  parseCellRef,
  readCellValue,
  resetRowCounter,
  resolveFieldDef,
  resolveFieldDefs,
  testIdFor
};
