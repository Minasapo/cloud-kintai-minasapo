import { useCallback, useMemo, useState } from "react";

import {
  applyWorkflowFilters,
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
  status: "",
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
        const nextValue = value ?? "";
        if (prev[key] === nextValue) {
          return prev;
        }
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
