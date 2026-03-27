import { CATEGORY_LABELS } from "@/entities/workflow/lib/workflowLabels";

import DateRangeField from "./DateRangeField";
import SelectField from "./SelectField";
import StatusField from "./StatusField";
import WorkflowListFilterField from "./WorkflowListFilterField";
import {
  DATE_FILTER_CONFIG,
  FIELD_LABELS,
  type FilterPopoverKey,
  getDateRangeDisplayValue,
  useWorkflowCategoryOptions,
  useWorkflowListFiltersState,
  type WorkflowListFiltersProps,
} from "./workflowListFiltersShared";

export type WorkflowListFilterLayout = "desktop" | "panel";

type WorkflowListFilterFieldsProps = {
  filters: WorkflowListFiltersProps["filters"];
  setFilter: WorkflowListFiltersProps["setFilter"];
  layout: WorkflowListFilterLayout;
  openKey: FilterPopoverKey | null;
  togglePopover: (key: FilterPopoverKey) => void;
  closePopovers: () => void;
};

export default function WorkflowListFilterFields({
  filters,
  setFilter,
  layout,
  openKey,
  togglePopover,
  closePopovers,
}: WorkflowListFilterFieldsProps) {
  const categoryOptions = useWorkflowCategoryOptions();
  const {
    categoryFilter,
    statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
    handleDateChange,
    clearDateRange,
    handleStatusToggle,
  } = useWorkflowListFiltersState({ filters, setFilter });
  const [applicationDateFilter, createdDateFilter] = DATE_FILTER_CONFIG;
  const dateRangeValues = {
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
  };
  const renderDateField = (dateFilter: (typeof DATE_FILTER_CONFIG)[number]) => (
    <WorkflowListFilterField
      key={dateFilter.key}
      label={dateFilter.label}
      layout={layout}
    >
      <DateRangeField
        displayValue={getDateRangeDisplayValue(
          dateRangeValues[dateFilter.fromKey],
          dateRangeValues[dateFilter.toKey],
          dateFilter.emptyLabel,
        )}
        open={openKey === dateFilter.key}
        onOpenToggle={() => togglePopover(dateFilter.key)}
        onClose={closePopovers}
        fromValue={dateRangeValues[dateFilter.fromKey]}
        toValue={dateRangeValues[dateFilter.toKey]}
        onChange={handleDateChange}
        fromKey={dateFilter.fromKey}
        toKey={dateFilter.toKey}
        onClear={() => {
          clearDateRange(dateFilter);
          closePopovers();
        }}
      />
    </WorkflowListFilterField>
  );

  return (
    <>
      <WorkflowListFilterField label={FIELD_LABELS.category} layout={layout}>
        <SelectField
          value={categoryFilter}
          onChange={(value) => setFilter("category", value)}
        >
          <option value="">すべて</option>
          {categoryOptions.map((item) => (
            <option key={item.category} value={item.category}>
              {CATEGORY_LABELS[item.category] ?? item.label}
            </option>
          ))}
        </SelectField>
      </WorkflowListFilterField>

      {renderDateField(applicationDateFilter)}

      <WorkflowListFilterField label={FIELD_LABELS.status} layout={layout}>
        <StatusField
          value={statusFilter ?? []}
          open={openKey === "status"}
          onOpenToggle={() => togglePopover("status")}
          onClose={closePopovers}
          onToggle={handleStatusToggle}
        />
      </WorkflowListFilterField>

      {renderDateField(createdDateFilter)}
    </>
  );
}
