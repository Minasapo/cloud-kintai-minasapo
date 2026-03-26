import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import type { UseWorkflowListFiltersResult } from "@/features/workflow/list/useWorkflowListFilters";

import type { WorkflowListFiltersHandle } from "./WorkflowListFilters";
import WorkflowListFiltersPanel from "./WorkflowListFiltersPanel";

type WorkflowMobileFiltersProps = {
  anyFilterActive: boolean;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: Dispatch<SetStateAction<boolean>>;
  filterRowRef: RefObject<WorkflowListFiltersHandle | null>;
  filters: UseWorkflowListFiltersResult["filters"];
  setFilter: UseWorkflowListFiltersResult["setFilter"];
  clearFiltersAction: ReactNode;
};

export default function WorkflowMobileFilters({
  anyFilterActive,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  filterRowRef,
  filters,
  setFilter,
  clearFiltersAction,
}: WorkflowMobileFiltersProps) {
  return (
    <div className="workflow-mobile-filter-shell">
      <button
        type="button"
        onClick={() => setMobileFiltersOpen((prev) => !prev)}
        className="workflow-mobile-filter-trigger"
      >
        <div className="workflow-mobile-filter-trigger__left">
          <span className="workflow-mobile-filter-trigger__label">フィルター</span>
          {anyFilterActive && (
            <span className="workflow-mobile-filter-trigger__badge">適用中</span>
          )}
        </div>
        <span className="workflow-mobile-filter-trigger__chevron">
          {mobileFiltersOpen ? "▲" : "▼"}
        </span>
      </button>
      {mobileFiltersOpen ? (
        <div className="workflow-mobile-filter-panel">
          <WorkflowListFiltersPanel
            ref={filterRowRef}
            filters={filters}
            setFilter={setFilter}
          />
          {clearFiltersAction}
        </div>
      ) : null}
    </div>
  );
}
