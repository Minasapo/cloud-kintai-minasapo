import { WORKFLOW_CLEAR_FILTERS_LABEL } from "./workflowListContentShared";

type WorkflowClearFiltersActionProps = {
  onClearFilters: () => void;
};

export default function WorkflowClearFiltersAction({
  onClearFilters,
}: WorkflowClearFiltersActionProps) {
  return (
    <div className="workflow-filter-actions">
      <button
        type="button"
        onClick={onClearFilters}
        className="workflow-clear-filters-button"
      >
        <span className="workflow-clear-filters-button__icon">×</span>
        {WORKFLOW_CLEAR_FILTERS_LABEL}
      </button>
    </div>
  );
}
