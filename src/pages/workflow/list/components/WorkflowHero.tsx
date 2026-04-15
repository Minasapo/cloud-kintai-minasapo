import { PageTitle } from "@shared/ui/typography";

import { useWorkflowListActions, useWorkflowListData } from "../context/WorkflowListPageContext";
import WorkflowCreateButton from "./WorkflowCreateButton";

export default function WorkflowHero() {
  const { isCompact } = useWorkflowListData();
  const { onCreateClick } = useWorkflowListActions();

  return (
    <section className="workflow-hero">
      <div className="workflow-hero__inner">
        <div className="workflow-hero__copy">
          <PageTitle className="workflow-hero__title">ワークフロー</PageTitle>
          <p className="workflow-hero__description">
            ワークフローの申請状況を確認・管理できます。
          </p>
        </div>
        <WorkflowCreateButton isCompact={isCompact} onClick={onCreateClick} />
      </div>
    </section>
  );
}
