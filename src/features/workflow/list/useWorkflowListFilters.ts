import { useCallback, useMemo, useState } from "react";

import {
  applyWorkflowFilters,
  DEFAULT_STATUS_FILTERS,
  isWorkflowFilterActive,
  mapWorkflowsToListItems,
  type WorkflowLike,
  type WorkflowListFilters,
  type WorkflowListItem,
} from "./workflowListModel";

type UseWorkflowListFiltersArgs<T extends WorkflowLike> = {
  workflows: T[] | null | undefined;
  currentStaffId?: string;
};

export type UseWorkflowListFiltersResult = {
  items: WorkflowListItem[];
  filteredItems: WorkflowListItem[];
  filters: WorkflowListFilters;
  anyFilterActive: boolean;
  setFilter: <K extends keyof WorkflowListFilters>(
    key: K,
    value: WorkflowListFilters[K]
  ) => void;
  clearFilters: () => void;
};

const createInitialFilters = (): WorkflowListFilters => ({
  name: "",
  category: "",
  status: DEFAULT_STATUS_FILTERS,
  applicationFrom: "",
  applicationTo: "",
  createdFrom: "",
  createdTo: "",
});

export function useWorkflowListFilters<T extends WorkflowLike>(
  args: UseWorkflowListFiltersArgs<T>
): UseWorkflowListFiltersResult {
  const { workflows, currentStaffId } = args;

  const [filters, setFilters] =
    useState<WorkflowListFilters>(createInitialFilters);

  const items = useMemo(
    () => mapWorkflowsToListItems(workflows, currentStaffId),
    [workflows, currentStaffId]
  );

  const filteredItems = useMemo(
    () => applyWorkflowFilters(items, filters),
    [items, filters]
  );

  const anyFilterActive = useMemo(
    () => isWorkflowFilterActive(filters),
    [filters]
  );

  const setFilter = useCallback(
    <K extends keyof WorkflowListFilters>(
      key: K,
      value: WorkflowListFilters[K]
    ) => {
      setFilters((prev) => {
        const prevValue = prev[key];
        const nextValue = (value ?? "") as WorkflowListFilters[K];

        const isSame =
          Array.isArray(prevValue) && Array.isArray(nextValue)
            ? prevValue.length === nextValue.length &&
              prevValue.every((item) => nextValue.includes(item))
            : prevValue === nextValue;

        if (isSame) return prev;

        return { ...prev, [key]: nextValue };
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(createInitialFilters());
  }, []);

  return {
    items,
    filteredItems,
    filters,
    anyFilterActive,
    setFilter,
    clearFilters,
  };
}
