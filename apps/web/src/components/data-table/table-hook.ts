import {
  columnVisibilityFeature,
  createSortedRowModel,
  createTableHook,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * One factory for every list view — Companies, People, Deals, Feedback.
 *
 * v9 registers features explicitly: state and methods for a feature do not
 * exist until it is listed here. Adding pagination or column pinning later is
 * a change in this file, and every table gets it at once.
 */
export const { createAppColumnHelper, useAppTable, useTableContext } =
  createTableHook({
    features: tableFeatures({
      rowSortingFeature,
      sortedRowModel: createSortedRowModel(),
      // Comparators are a registry in v9, and `sortFn: 'auto'` resolves
      // through it — an unregistered one warns and silently does nothing.
      // These three cover what we list: names and roles are text, money and
      // counts are numbers, created/updated are Dates. Registering the three
      // rather than the whole object keeps the rest out of the bundle.
      sortFns: {
        text: sortFn_text,
        basic: sortFn_basic,
        datetime: sortFn_datetime,
      },
      rowSelectionFeature,
      columnVisibilityFeature,
    }),
    // Every record we list is a row with a uuid, so selection keys are stable
    // across sorts and refetches instead of being array indices.
    getRowId: (row: { id: string }) => row.id,
  });
