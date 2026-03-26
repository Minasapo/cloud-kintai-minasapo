import { forwardRef, type Ref } from "react";

import WorkflowListFilterFields from "./workflow-list-filters/WorkflowListFilterFields";
import {
  useFilterPopoverState,
  type WorkflowListFiltersProps,
} from "./workflow-list-filters/workflowListFiltersShared";
import type { WorkflowListFiltersHandle } from "./WorkflowListFilters";

const WorkflowListFiltersPanel = forwardRef(
  (
    { filters, setFilter }: WorkflowListFiltersProps,
    ref: Ref<WorkflowListFiltersHandle>,
  ) => {
    const { openKey, togglePopover, closePopovers } = useFilterPopoverState(ref);

    return (
      <div className="rounded-[8px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,252,248,0.95)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex flex-col gap-3">
          <WorkflowListFilterFields
            filters={filters}
            setFilter={setFilter}
            layout="panel"
            openKey={openKey}
            togglePopover={togglePopover}
            closePopovers={closePopovers}
          />
        </div>
      </div>
    );
  },
);

WorkflowListFiltersPanel.displayName = "WorkflowListFiltersPanel";

export default WorkflowListFiltersPanel;
