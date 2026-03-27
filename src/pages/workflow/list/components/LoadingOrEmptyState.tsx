import { cx } from "./workflowListContentShared";
import { InfoCard, Spinner } from "./WorkflowSharedUi";

export default function LoadingOrEmptyState({
  loading,
  isCompact,
}: {
  loading: boolean;
  isCompact: boolean;
}) {
  if (loading) {
    return (
      <div
        className={cx(
          "workflow-loading-state",
          isCompact
            ? "workflow-loading-state--compact"
            : "workflow-loading-state--desktop",
        )}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={cx(
        "workflow-empty-state",
        !isCompact && "workflow-empty-state--desktop",
      )}
    >
      <InfoCard>該当するワークフローがありません。</InfoCard>
    </div>
  );
}
