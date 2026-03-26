import { useWorkflowListData } from "../context/WorkflowListPageContext";
import { InfoCard, Spinner, Surface } from "./WorkflowSharedUi";

export default function WorkflowNoStaffState() {
  const { loading } = useWorkflowListData();

  return (
    <Surface>
      <div className="workflow-no-staff-state">
        {loading ? (
          <Spinner />
        ) : (
          <InfoCard>一覧に表示する申請が見つかりませんでした。</InfoCard>
        )}
      </div>
    </Surface>
  );
}
