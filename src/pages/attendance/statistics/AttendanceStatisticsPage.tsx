import AttendanceStatistics from "@features/attendance/statistics/ui/AttendanceStatistics";
import Box from "@mui/material/Box";
import Page from "@shared/ui/page/Page";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";
import { dashboardInnerSurfaceSx, PageSection } from "@/shared/ui/layout";

export default function AttendanceStatisticsPage() {
  const { getAttendanceStatisticsEnabled } = useContext(AppConfigContext);
  const isEnabled = getAttendanceStatisticsEnabled();

  if (!isEnabled) {
    return <Navigate to="/attendance/list" replace />;
  }

  return (
    <Page title="稼働統計" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box
          sx={{
            ...dashboardInnerSurfaceSx,
            minHeight: PANEL_HEIGHTS.STATISTICS_MIN,
            p: { xs: 2, sm: 3 },
          }}
        >
          <AttendanceStatistics />
        </Box>
      </PageSection>
    </Page>
  );
}
