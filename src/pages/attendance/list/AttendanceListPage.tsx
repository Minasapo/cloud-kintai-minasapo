import AttendanceList from "@features/attendance/list/ui/AttendanceList";
import Page from "@shared/ui/page/Page";

import { PageSection } from "@/shared/ui/layout";

export default function AttendanceListPage() {
  return (
    <Page title="勤怠一覧" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard" variant="plain" className="px-0 py-0 md:px-0">
          <AttendanceList />
      </PageSection>
    </Page>
  );
}
