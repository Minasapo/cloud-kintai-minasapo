import AttendanceList from "@features/attendance/list/AttendanceList";
import Page from "@shared/ui/page/Page";

import { PageSection } from "@/shared/ui/layout";

export default function AttendanceListPage() {
  return (
    <Page title="勤怠一覧" maxWidth="xl">
      <PageSection layoutVariant="dashboard" sx={{ height: 1, minHeight: 480 }}>
        <AttendanceList />
      </PageSection>
    </Page>
  );
}
