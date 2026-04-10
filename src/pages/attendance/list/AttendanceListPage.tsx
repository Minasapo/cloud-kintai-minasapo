import AttendanceList from "@features/attendance/list/ui/AttendanceList";
import { PageContent, PageSection } from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";

export default function AttendanceListPage() {
  return (
    <Page title="勤怠一覧" width="full" showDefaultHeader={false}>
      <PageContent width="content">
        <PageSection
          layoutVariant="dashboard"
          variant="plain"
          className="px-0 py-0 md:px-0"
        >
          <AttendanceList />
        </PageSection>
      </PageContent>
    </Page>
  );
}
