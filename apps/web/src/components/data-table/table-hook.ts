import {
  columnVisibilityFeature,
  createSortedRowModel,
  createTableHook,
  rowSelectionFeature,
  rowSortingFeature,
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
      rowSelectionFeature,
      columnVisibilityFeature,
    }),
    // Every record we list is a row with a uuid, so selection keys are stable
    // across sorts and refetches instead of being array indices.
    getRowId: (row: { id: string }) => row.id,
  });
