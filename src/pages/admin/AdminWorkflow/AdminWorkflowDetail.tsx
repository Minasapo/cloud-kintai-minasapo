import Page from "@shared/ui/page/Page";
import { useNavigate, useParams } from "react-router-dom";

import { designTokenVar } from "@/shared/designSystem";

import WorkflowDetailPanel from "./components/WorkflowDetailPanel";

const ADMIN_WORKFLOW_DETAIL_MAX_WIDTH = designTokenVar(
  "component.adminWorkflow.detail.maxWidth",
  "1600px"
);

export default function AdminWorkflowDetail() {
  const { id } = useParams() as { id?: string };
  const navigate = useNavigate();

  return (
    <Page
      title="申請内容（管理者）"
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー管理", href: "/admin/workflow" },
      ]}
      maxWidth={false}
    >
      <div
        style={{
          width: "100%",
          maxWidth: ADMIN_WORKFLOW_DETAIL_MAX_WIDTH,
          marginInline: "auto",
        }}
      >
        <WorkflowDetailPanel
          workflowId={id}
          showBackButton
          onBack={() => navigate(-1)}
        />
      </div>
    </Page>
  );
}
