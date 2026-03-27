import useAppConfig from "@entities/app-config/model/useAppConfig";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import { type Ref, useImperativeHandle, useMemo, useState } from "react";

import type { UseWorkflowListFiltersResult } from "@/features/workflow/list/useWorkflowListFilters";

import type { WorkflowListFiltersHandle } from "../WorkflowListFilters";

export type WorkflowListFiltersProps = {
  filters: UseWorkflowListFiltersResult["filters"];
  setFilter: UseWorkflowListFiltersResult["setFilter"];
};

export type FilterPopoverKey = "application" | "created" | "status";

export type DateFilterKey =
  | "applicationFrom"
  | "applicationTo"
  | "createdFrom"
  | "createdTo";

export const DISPLAY_LABEL_APPLICATION = "申請日で絞込";
export const DISPLAY_LABEL_CREATED = "作成日で絞込";
export const STATUS_ALL_VALUE = "__ALL__";

export const FIELD_LABELS = {
  category: "種別",
  application: "申請日",
  status: "ステータス",
  created: "作成日",
} as const;

export const DATE_FILTER_CONFIG = [
  {
    key: "application",
    label: FIELD_LABELS.application,
    emptyLabel: DISPLAY_LABEL_APPLICATION,
    fromKey: "applicationFrom",
    toKey: "applicationTo",
  },
  {
    key: "created",
    label: FIELD_LABELS.created,
    emptyLabel: DISPLAY_LABEL_CREATED,
    fromKey: "createdFrom",
    toKey: "createdTo",
  },
] as const;

export type DateFilterConfig = (typeof DATE_FILTER_CONFIG)[number];

export const STATUS_OPTIONS = [
  WorkflowStatus.DRAFT,
  WorkflowStatus.SUBMITTED,
  WorkflowStatus.PENDING,
  WorkflowStatus.APPROVED,
  WorkflowStatus.REJECTED,
  WorkflowStatus.CANCELLED,
] as const;

type WorkflowListFiltersStateProps = {
  filters: WorkflowListFiltersProps["filters"];
  setFilter: WorkflowListFiltersProps["setFilter"];
};

export function getDateRangeDisplayValue(
  fromValue: string | undefined,
  toValue: string | undefined,
  emptyLabel: string,
) {
  return fromValue && toValue ? `${fromValue} → ${toValue}` : emptyLabel;
}

export function useWorkflowListFiltersState({
  filters,
  setFilter,
}: WorkflowListFiltersStateProps) {
  const {
    category: rawCategoryFilter,
    status: statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
  } = filters;

  const categoryFilter = rawCategoryFilter ?? "";

  const handleDateChange = (key: DateFilterKey, value: string) => {
    setFilter(key, value);
  };

  const clearDateRange = (config: Pick<DateFilterConfig, "fromKey" | "toKey">) => {
    setFilter(config.fromKey, "");
    setFilter(config.toKey, "");
  };

  const handleStatusToggle = (value: string) => {
    if (value === STATUS_ALL_VALUE) {
      setFilter("status", []);
      return;
    }

    const current = statusFilter ?? [];
    const next = current.includes(value)
      ? current.filter((status) => status !== value)
      : [...current, value];
    setFilter("status", next);
  };

  return {
    categoryFilter,
    statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
    handleDateChange,
    clearDateRange,
    handleStatusToggle,
  };
}

export function useWorkflowCategoryOptions() {
  const { config, getAbsentEnabled, getWorkflowCategoryOrder } = useAppConfig();

  return useMemo(
    () =>
      getWorkflowCategoryOrder()
        .filter((item) => item.enabled)
        .filter(
          (item) =>
            item.category !== WorkflowCategory.ABSENCE || getAbsentEnabled(),
        ),
    [config, getAbsentEnabled, getWorkflowCategoryOrder],
  );
}

export function useFilterPopoverState(ref: Ref<WorkflowListFiltersHandle>) {
  const [openKey, setOpenKey] = useState<FilterPopoverKey | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      closeAllPopovers: () => setOpenKey(null),
    }),
    [],
  );

  return {
    openKey,
    togglePopover: (key: FilterPopoverKey) =>
      setOpenKey((prev) => (prev === key ? null : key)),
    closePopovers: () => setOpenKey(null),
  };
}
