import { useWorkflowListActions, useWorkflowListData } from "../context/WorkflowListPageContext";
import WorkflowCreateButton from "./WorkflowCreateButton";

export default function WorkflowHero() {
  const { isCompact } = useWorkflowListData();
  const { onCreateClick } = useWorkflowListActions();

  return (
    <section className="workflow-hero">
      <div className="workflow-hero__inner">
        <div className="workflow-hero__copy">
          <h1 className="workflow-hero__title">ワークフロー</h1>
          <p className="workflow-hero__description">
            ワークフローの申請状況を確認・管理できます。
          </p>
        </div>
        <WorkflowCreateButton isCompact={isCompact} onClick={onCreateClick} />
      </div>
    </section>
  );
}
