import Page from "@shared/ui/page/Page";

import { designTokenVar } from "@/shared/designSystem";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

import { Spinner } from "./WorkflowSharedUi";

const LOADING_SECTION_MIN_HEIGHT = `calc(${designTokenVar(
  "spacing.xxl",
  "32px",
)} * 7.5)`;

export default function WorkflowAuthLoadingState() {
  return (
    <Page title="ワークフロー" maxWidth="lg" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <DashboardInnerSurface
          className="workflow-auth-loading"
          style={{ minHeight: LOADING_SECTION_MIN_HEIGHT }}
        >
          <Spinner />
        </DashboardInnerSurface>
      </PageSection>
    </Page>
  );
}
