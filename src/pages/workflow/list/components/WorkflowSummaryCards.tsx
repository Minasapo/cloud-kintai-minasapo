import { useWorkflowListData } from "../context/WorkflowListPageContext";
import SummaryStatCard from "./SummaryStatCard";

export default function WorkflowSummaryCards() {
  const { statusSummary } = useWorkflowListData();

  return (
    <div className="workflow-summary-grid">
      <SummaryStatCard label="全件数" value={statusSummary.total} />
      <SummaryStatCard label="下書き" value={statusSummary.draft} />
      <SummaryStatCard
        label="承認待ち"
        value={statusSummary.pending}
        tone="pending"
      />
      <SummaryStatCard
        label="完了"
        value={statusSummary.approved}
        tone="approved"
      />
    </div>
  );
}
