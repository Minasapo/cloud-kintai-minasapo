import AttendanceList from "@features/attendance/list/AttendanceList";
import Box from "@mui/material/Box";
import Page from "@shared/ui/page/Page";

import { dashboardInnerSurfaceSx,PageSection } from "@/shared/ui/layout";

export default function AttendanceListPage() {
  return (
    <Page title="勤怠一覧" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box sx={{ ...dashboardInnerSurfaceSx, height: 1, minHeight: 480 }}>
          <AttendanceList />
        </Box>
      </PageSection>
    </Page>
  );
}
