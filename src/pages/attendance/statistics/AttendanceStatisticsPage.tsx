import AttendanceStatistics from "@features/attendance/statistics/AttendanceStatistics";
import Box from "@mui/material/Box";
import Page from "@shared/ui/page/Page";

import { PageSection, dashboardInnerSurfaceSx } from "@/shared/ui/layout";

export default function AttendanceStatisticsPage() {
  return (
    <Page title="稼働統計" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box
          sx={{
            ...dashboardInnerSurfaceSx,
            minHeight: 480,
            p: { xs: 2, sm: 3 },
          }}
        >
          <AttendanceStatistics />
        </Box>
      </PageSection>
    </Page>
  );
}
