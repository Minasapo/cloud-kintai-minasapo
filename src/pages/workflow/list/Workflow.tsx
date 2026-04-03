import "./styles.scss";

import Page from "@shared/ui/page/Page";

import { PageContent, PageSection } from "@/shared/ui/layout";

import WorkflowAuthLoadingState from "./components/WorkflowAuthLoadingState";
import WorkflowHero from "./components/WorkflowHero";
import WorkflowListContent from "./components/WorkflowListContent";
import WorkflowNoStaffState from "./components/WorkflowNoStaffState";
import { InfoCard } from "./components/WorkflowSharedUi";
import WorkflowSummaryCards from "./components/WorkflowSummaryCards";
import {
  useWorkflowListData,
  WorkflowListPageProvider,
} from "./context/WorkflowListPageContext";

function WorkflowPageContent() {
  const { isAuthenticated, currentStaffId, error } = useWorkflowListData();

  if (!isAuthenticated) {
    return <WorkflowAuthLoadingState />;
  }

  return (
    <Page title="ワークフロー" width="full" showDefaultHeader={false}>
      <PageContent width="content">
        <PageSection
          layoutVariant="dashboard"
          variant="plain"
          className="workflow-page-section"
        >
          <div className="workflow-page-container">
            <WorkflowHero />
            {currentStaffId ? (
              <>
                <WorkflowSummaryCards />
                {error && <InfoCard tone="error">{error}</InfoCard>}
                <WorkflowListContent />
              </>
            ) : (
              <WorkflowNoStaffState />
            )}
          </div>
        </PageSection>
      </PageContent>
    </Page>
  );
}

export default function Workflow() {
  return (
    <WorkflowListPageProvider>
      <WorkflowPageContent />
    </WorkflowListPageProvider>
  );
}
