import Page from "@shared/ui/page/Page";

import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";
import { useWorkflowDetailContext } from "@/features/workflow/detail-panel/model/WorkflowDetailContext";
import { WorkflowDetailProvider } from "@/features/workflow/detail-panel/model/WorkflowDetailProvider";
import WorkflowDetailHeader from "@/features/workflow/detail-panel/ui/WorkflowDetailHeader";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import { PageSection } from "@/shared/ui/layout";

import styles from "./WorkflowDetail.module.scss";

function WorkflowDetailContent() {
  const { workflow } = useWorkflowDetailContext();

  return (
    <Page title="申請内容" showDefaultHeader={false}>
      <PageSection variant="plain" layoutVariant="detail">
        <div className={styles.layout}>
          <WorkflowDetailHeader />

          {!workflow ? (
            <div className={styles.errorMessage}>
              ワークフローの読み込みに失敗しました。
            </div>
          ) : (
            <div className={styles.grid}>
              <div className={styles.col}>
                <WorkflowMetadataPanel />
              </div>

              <div className={styles.commentThreadPanel}>
                <WorkflowCommentThread />
              </div>
            </div>
          )}
        </div>
      </PageSection>
    </Page>
  );
}

export default function WorkflowDetail() {
  return (
    <WorkflowDetailProvider>
      <WorkflowDetailContent />
    </WorkflowDetailProvider>
  );
}
