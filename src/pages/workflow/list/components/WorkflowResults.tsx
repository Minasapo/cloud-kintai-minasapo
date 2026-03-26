import {
  useWorkflowListActions,
  useWorkflowListData,
} from "../context/WorkflowListPageContext";
import DesktopWorkflowRow from "./DesktopWorkflowRow";
import LoadingOrEmptyState from "./LoadingOrEmptyState";
import MobileWorkflowCard from "./MobileWorkflowCard";
import { WORKFLOW_LIST_COLUMNS } from "./workflowListContentShared";

export default function WorkflowResults() {
  const { isCompact, loading, filteredItems } = useWorkflowListData();
  const { resolveWorkflowKey, onCardClick } = useWorkflowListActions();
  const shouldShowFallback = loading || filteredItems.length === 0;
  const content = shouldShowFallback ? (
    <LoadingOrEmptyState loading={loading} isCompact={isCompact} />
  ) : (
    filteredItems.map((item) =>
      isCompact ? (
        <MobileWorkflowCard
          key={resolveWorkflowKey(item)}
          item={item}
          onClick={onCardClick}
        />
      ) : (
        <DesktopWorkflowRow
          key={resolveWorkflowKey(item)}
          item={item}
          onClick={onCardClick}
        />
      ),
    )
  );

  if (isCompact) {
    return (
      <div className={!shouldShowFallback ? "workflow-mobile-results" : undefined}>
        {content}
      </div>
    );
  }

  return (
    <div className="workflow-desktop-results-shell">
      <div className="workflow-desktop-results-head">
        {WORKFLOW_LIST_COLUMNS.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      <div className="workflow-desktop-results-body">{content}</div>
    </div>
  );
}
