import { forwardRef, type Ref } from "react";

import WorkflowListFilterFields from "./workflow-list-filters/WorkflowListFilterFields";
import {
  useFilterPopoverState,
  type WorkflowListFiltersProps,
} from "./workflow-list-filters/workflowListFiltersShared";

export type WorkflowListFiltersHandle = {
  closeAllPopovers: () => void;
};

function WorkflowListFilters(
  { filters, setFilter }: WorkflowListFiltersProps,
  ref: Ref<WorkflowListFiltersHandle>,
) {
  const { openKey, togglePopover, closePopovers } = useFilterPopoverState(ref);

  return (
    <tr>
      <WorkflowListFilterFields
        filters={filters}
        setFilter={setFilter}
        layout="desktop"
        openKey={openKey}
        togglePopover={togglePopover}
        closePopovers={closePopovers}
      />
    </tr>
  );
}

const WorkflowListFiltersWithRef = forwardRef(WorkflowListFilters);
WorkflowListFiltersWithRef.displayName = "WorkflowListFilters";

export default WorkflowListFiltersWithRef;
