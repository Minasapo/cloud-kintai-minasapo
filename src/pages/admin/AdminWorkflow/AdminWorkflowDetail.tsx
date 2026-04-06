import Page from "@shared/ui/page/Page";
import { useNavigate, useParams } from "react-router-dom";

import WorkflowDetailPanel from "./components/WorkflowDetailPanel";

export default function AdminWorkflowDetail() {
  const { id } = useParams() as { id?: string };
  const navigate = useNavigate();

  return (
    <Page title="申請内容（管理者）" maxWidth={false} showDefaultHeader={false}>
      <div style={{ width: "100%" }}>
        <WorkflowDetailPanel
          workflowId={id}
          showBackButton
          onBack={() => navigate("/admin/workflow")}
        />
      </div>
    </Page>
  );
}
