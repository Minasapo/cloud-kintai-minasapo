import useAppConfig from "@entities/app-config/model/useAppConfig";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import { forwardRef, type Ref, useImperativeHandle, useMemo, useState } from "react";

import {
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/entities/workflow/lib/workflowLabels";
import type { UseWorkflowListFiltersResult } from "@/features/workflow/list/useWorkflowListFilters";

export type WorkflowListFiltersHandle = {
  closeAllPopovers: () => void;
};

type WorkflowListFiltersProps = {
  filters: UseWorkflowListFiltersResult["filters"];
  setFilter: UseWorkflowListFiltersResult["setFilter"];
};

const DISPLAY_LABEL_APPLICATION = "申請日で絞込";
const DISPLAY_LABEL_CREATED = "作成日で絞込";
const STATUS_ALL_VALUE = "__ALL__";

const FIELD_LABELS = {
  category: "種別",
  application: "申請日",
  status: "ステータス",
  created: "作成日",
} as const;

const STATUS_OPTIONS = [
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

const useWorkflowListFiltersState = ({
  filters,
  setFilter,
}: WorkflowListFiltersStateProps) => {
  const {
    category: rawCategoryFilter,
    status: statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
  } = filters;

  const categoryFilter = rawCategoryFilter ?? "";
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const closeAllPopovers = () => {
    setApplicationOpen(false);
    setCreatedOpen(false);
    setStatusOpen(false);
  };

  const handleDateChange = (
    key: "applicationFrom" | "applicationTo" | "createdFrom" | "createdTo",
    value: string,
  ) => {
    setFilter(key, value);
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
    applicationOpen,
    createdOpen,
    statusOpen,
    closeAllPopovers,
    handleDateChange,
    handleStatusToggle,
    setApplicationOpen,
    setCreatedOpen,
    setStatusOpen,
  };
};

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">
      {children}
    </p>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-[30px] border border-slate-300 bg-white px-6 py-4 text-[0.95rem] text-slate-900 outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-100"
    >
      {children}
    </select>
  );
}

function FilterTrigger({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-[30px] border px-6 py-4 text-left text-[0.95rem] transition",
        isOpen
          ? "border-emerald-500/45 bg-white ring-2 ring-emerald-100"
          : "border-slate-300 bg-white hover:border-slate-400",
      ].join(" ")}
    >
      <span className="truncate text-slate-900">{label}</span>
      <span className="ml-3 text-slate-500">{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}

function FloatingPanel({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className={`absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-[22px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,252,248,0.96)_100%)] p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur ${className}`.trim()}
    >
      {children}
    </div>
  );
}

type DateRangeFieldProps = {
  displayValue: string;
  open: boolean;
  onOpenToggle: () => void;
  onClose: () => void;
  fromValue: string | undefined;
  toValue: string | undefined;
  onChange: (
    key: "applicationFrom" | "applicationTo" | "createdFrom" | "createdTo",
    value: string,
  ) => void;
  fromKey: "applicationFrom" | "createdFrom";
  toKey: "applicationTo" | "createdTo";
  onClear: () => void;
};

function DateRangeField({
  displayValue,
  open,
  onOpenToggle,
  onClose,
  fromValue,
  toValue,
  onChange,
  fromKey,
  toKey,
  onClear,
}: DateRangeFieldProps) {
  return (
    <div className="relative">
      <FilterTrigger label={displayValue} isOpen={open} onClick={onOpenToggle} />
      <FloatingPanel open={open}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-semibold tracking-[0.04em] text-slate-500">
              From
            </span>
            <input
              type="date"
              value={fromValue ?? ""}
              onChange={(event) => onChange(fromKey, event.target.value)}
              className="w-full rounded-[30px] border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-semibold tracking-[0.04em] text-slate-500">
              To
            </span>
            <input
              type="date"
              value={toValue ?? ""}
              onChange={(event) => onChange(toKey, event.target.value)}
              className="w-full rounded-[30px] border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div className="flex gap-2 sm:flex-col sm:items-stretch">
            <button
              type="button"
              onClick={onClear}
              className="rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              クリア
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[14px] border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-500/35 hover:bg-emerald-100"
            >
              閉じる
            </button>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}

function StatusField({
  value,
  open,
  onOpenToggle,
  onClose,
  onToggle,
}: {
  value: string[];
  open: boolean;
  onOpenToggle: () => void;
  onClose: () => void;
  onToggle: (value: string) => void;
}) {
  const displayValue =
    value.length === 0
      ? "すべて"
      : value
          .map((status) => STATUS_LABELS[status as WorkflowStatus] || String(status))
          .join("、");

  return (
    <div className="relative">
      <FilterTrigger label={displayValue} isOpen={open} onClick={onOpenToggle} />
      <FloatingPanel open={open}>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 text-sm text-slate-700 transition hover:bg-emerald-50/80">
            <input
              type="checkbox"
              checked={value.length === 0}
              onChange={() => onToggle(STATUS_ALL_VALUE)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
            />
            <span>すべて</span>
          </label>
          {STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 text-sm text-slate-700 transition hover:bg-emerald-50/80"
            >
              <input
                type="checkbox"
                checked={value.includes(status)}
                onChange={() => onToggle(status)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
              />
              <span>{STATUS_LABELS[status]}</span>
            </label>
          ))}
          <div className="pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[14px] border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-500/35 hover:bg-emerald-100"
            >
              閉じる
            </button>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}

function WorkflowListFilters(
  { filters, setFilter }: WorkflowListFiltersProps,
  ref: Ref<WorkflowListFiltersHandle>,
) {
  const { config, getAbsentEnabled, getWorkflowCategoryOrder } = useAppConfig();
  const [openKey, setOpenKey] = useState<"application" | "created" | "status" | null>(
    null,
  );

  const categoryOptions = useMemo(
    () =>
      getWorkflowCategoryOrder()
        .filter((item) => item.enabled)
        .filter(
          (item) =>
            item.category !== WorkflowCategory.ABSENCE || getAbsentEnabled(),
        ),
    [config, getAbsentEnabled, getWorkflowCategoryOrder],
  );

  useImperativeHandle(
    ref,
    () => ({
      closeAllPopovers: () => setOpenKey(null),
    }),
    [],
  );

  const {
    categoryFilter,
    statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
    handleDateChange,
    handleStatusToggle,
  } = useWorkflowListFiltersState({ filters, setFilter });

  return (
    <tr>
      <td className="px-1 py-1 align-top">
        <SelectField value={categoryFilter} onChange={(value) => setFilter("category", value)}>
          <option value="">すべて</option>
          {categoryOptions.map((item) => (
            <option key={item.category} value={item.category}>
              {CATEGORY_LABELS[item.category] ?? item.label}
            </option>
          ))}
        </SelectField>
      </td>
      <td className="px-1 py-1 align-top">
        <DateRangeField
          displayValue={
            applicationFrom && applicationTo
              ? `${applicationFrom} → ${applicationTo}`
              : DISPLAY_LABEL_APPLICATION
          }
          open={openKey === "application"}
          onOpenToggle={() =>
            setOpenKey((prev) => (prev === "application" ? null : "application"))
          }
          onClose={() => setOpenKey(null)}
          fromValue={applicationFrom}
          toValue={applicationTo}
          onChange={handleDateChange}
          fromKey="applicationFrom"
          toKey="applicationTo"
          onClear={() => {
            setFilter("applicationFrom", "");
            setFilter("applicationTo", "");
            setOpenKey(null);
          }}
        />
      </td>
      <td className="px-1 py-1 align-top">
        <StatusField
          value={statusFilter ?? []}
          open={openKey === "status"}
          onOpenToggle={() => setOpenKey((prev) => (prev === "status" ? null : "status"))}
          onClose={() => setOpenKey(null)}
          onToggle={handleStatusToggle}
        />
      </td>
      <td className="px-1 py-1 align-top">
        <DateRangeField
          displayValue={
            createdFrom && createdTo
              ? `${createdFrom} → ${createdTo}`
              : DISPLAY_LABEL_CREATED
          }
          open={openKey === "created"}
          onOpenToggle={() =>
            setOpenKey((prev) => (prev === "created" ? null : "created"))
          }
          onClose={() => setOpenKey(null)}
          fromValue={createdFrom}
          toValue={createdTo}
          onChange={handleDateChange}
          fromKey="createdFrom"
          toKey="createdTo"
          onClear={() => {
            setFilter("createdFrom", "");
            setFilter("createdTo", "");
            setOpenKey(null);
          }}
        />
      </td>
      <td className="w-14 px-1 py-1" />
    </tr>
  );
}

export const WorkflowListFiltersPanel = forwardRef(
  (
    { filters, setFilter }: WorkflowListFiltersProps,
    ref: Ref<WorkflowListFiltersHandle>,
  ) => {
    const { config, getAbsentEnabled, getWorkflowCategoryOrder } = useAppConfig();
    const [openKey, setOpenKey] = useState<
      "application" | "created" | "status" | null
    >(null);
    const {
      categoryFilter,
      statusFilter,
      applicationFrom,
      applicationTo,
      createdFrom,
      createdTo,
      handleDateChange,
      handleStatusToggle,
    } = useWorkflowListFiltersState({ filters, setFilter });

    const categoryOptions = useMemo(
      () =>
        getWorkflowCategoryOrder()
          .filter((item) => item.enabled)
          .filter(
            (item) =>
              item.category !== WorkflowCategory.ABSENCE || getAbsentEnabled(),
          ),
      [config, getAbsentEnabled, getWorkflowCategoryOrder],
    );

    useImperativeHandle(
      ref,
      () => ({
        closeAllPopovers: () => setOpenKey(null),
      }),
      [],
    );

    return (
      <div className="rounded-[16px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,252,248,0.95)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <FilterLabel>{FIELD_LABELS.category}</FilterLabel>
            <SelectField value={categoryFilter} onChange={(value) => setFilter("category", value)}>
              <option value="">すべて</option>
              {categoryOptions.map((item) => (
                <option key={item.category} value={item.category}>
                  {CATEGORY_LABELS[item.category] ?? item.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex flex-col gap-1">
            <FilterLabel>{FIELD_LABELS.application}</FilterLabel>
            <DateRangeField
              displayValue={
                applicationFrom && applicationTo
                  ? `${applicationFrom} → ${applicationTo}`
                  : DISPLAY_LABEL_APPLICATION
              }
              open={openKey === "application"}
              onOpenToggle={() =>
                setOpenKey((prev) => (prev === "application" ? null : "application"))
              }
              onClose={() => setOpenKey(null)}
              fromValue={applicationFrom}
              toValue={applicationTo}
              onChange={handleDateChange}
              fromKey="applicationFrom"
              toKey="applicationTo"
              onClear={() => {
                setFilter("applicationFrom", "");
                setFilter("applicationTo", "");
                setOpenKey(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <FilterLabel>{FIELD_LABELS.status}</FilterLabel>
            <StatusField
              value={statusFilter ?? []}
              open={openKey === "status"}
              onOpenToggle={() =>
                setOpenKey((prev) => (prev === "status" ? null : "status"))
              }
              onClose={() => setOpenKey(null)}
              onToggle={handleStatusToggle}
            />
          </div>

          <div className="flex flex-col gap-1">
            <FilterLabel>{FIELD_LABELS.created}</FilterLabel>
            <DateRangeField
              displayValue={
                createdFrom && createdTo
                  ? `${createdFrom} → ${createdTo}`
                  : DISPLAY_LABEL_CREATED
              }
              open={openKey === "created"}
              onOpenToggle={() =>
                setOpenKey((prev) => (prev === "created" ? null : "created"))
              }
              onClose={() => setOpenKey(null)}
              fromValue={createdFrom}
              toValue={createdTo}
              onChange={handleDateChange}
              fromKey="createdFrom"
              toKey="createdTo"
              onClear={() => {
                setFilter("createdFrom", "");
                setFilter("createdTo", "");
                setOpenKey(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  },
);

WorkflowListFiltersPanel.displayName = "WorkflowListFiltersPanel";

const WorkflowListFiltersWithRef = forwardRef(WorkflowListFilters);
WorkflowListFiltersWithRef.displayName = "WorkflowListFilters";

export default WorkflowListFiltersWithRef;
