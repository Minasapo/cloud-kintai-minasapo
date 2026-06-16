import { DataStateContainer } from "@shared/ui/feedback/DataStateContainer";

import {
  useWorkflowListActions,
  useWorkflowListData,
} from "../context/WorkflowListPageContext";
import DesktopWorkflowRow from "./DesktopWorkflowRow";
import MobileWorkflowCard from "./MobileWorkflowCard";
import {
  cx,
  WORKFLOW_LIST_COLUMN_HEADER_IDS,
  WORKFLOW_LIST_COLUMNS,
} from "./workflowListContentShared";
import { InfoCard, Spinner } from "./WorkflowSharedUi";

function WorkflowLoadingState({ isCompact }: { isCompact: boolean }) {
  if (!isCompact) {
    return (
      <tr className="workflow-loading-state workflow-loading-state--desktop">
        <td colSpan={WORKFLOW_LIST_COLUMNS.length}>
          <Spinner />
        </td>
      </tr>
    );
  }

  return (
    <div
      className={cx(
        "workflow-loading-state",
        "workflow-loading-state--compact",
      )}
    >
      <Spinner />
    </div>
  );
}

function WorkflowEmptyState({ isCompact }: { isCompact: boolean }) {
  if (!isCompact) {
    return (
      <tr className="workflow-empty-state workflow-empty-state--desktop">
        <td colSpan={WORKFLOW_LIST_COLUMNS.length}>
          <InfoCard>該当するワークフローがありません。</InfoCard>
        </td>
      </tr>
    );
  }

  return (
    <div className={cx("workflow-empty-state")}>
      <InfoCard>該当するワークフローがありません。</InfoCard>
    </div>
  );
}

export default function WorkflowResults() {
  const { isCompact, loading, filteredItems } = useWorkflowListData();
  const { resolveWorkflowKey, onCardClick } = useWorkflowListActions();
  const hasData = filteredItems.length > 0;
  const loadingContent = <WorkflowLoadingState isCompact={isCompact} />;
  const emptyContent = <WorkflowEmptyState isCompact={isCompact} />;

  if (isCompact) {
    return (
      <div
        className={!loading && hasData ? "workflow-mobile-results" : undefined}
      >
        <DataStateContainer
          isLoading={loading}
          hasData={hasData}
          loadingContent={loadingContent}
          emptyContent={emptyContent}
        >
          <>
            {filteredItems.map((item) => (
              <MobileWorkflowCard
                key={resolveWorkflowKey(item)}
                item={item}
                onClick={onCardClick}
              />
            ))}
            <p className="workflow-mobile-end-message">これ以上ありません。</p>
          </>
        </DataStateContainer>
      </div>
    );
  }

  return (
    <div className="workflow-desktop-results-shell">
      <table
        className="workflow-desktop-results-head"
        aria-label="ワークフロー一覧"
      >
        <thead>
          <tr>
            {WORKFLOW_LIST_COLUMNS.map((column, index) => (
              <th
                key={column}
                id={WORKFLOW_LIST_COLUMN_HEADER_IDS[index]}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <div className="workflow-desktop-results-body">
        <table className="w-full" aria-label="ワークフロー一覧データ">
          <tbody>
            <DataStateContainer
              isLoading={loading}
              hasData={hasData}
              loadingContent={loadingContent}
              emptyContent={emptyContent}
            >
              <>
                {filteredItems.map((item) => (
                  <DesktopWorkflowRow
                    key={resolveWorkflowKey(item)}
                    item={item}
                    onClick={onCardClick}
                  />
                ))}
              </>
            </DataStateContainer>
          </tbody>
        </table>
      </div>
    </div>
  );
}
