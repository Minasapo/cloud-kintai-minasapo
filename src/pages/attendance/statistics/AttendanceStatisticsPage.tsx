import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Page from "@shared/ui/page/Page";

import { PageSection, dashboardInnerSurfaceSx } from "@/shared/ui/layout";

export default function AttendanceStatisticsPage() {
  return (
    <Page title="稼働統計" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box sx={{ ...dashboardInnerSurfaceSx, minHeight: 480 }}>
          <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h1">稼働統計</Typography>
            <Typography color="text.secondary">
              稼働統計のレポートは準備中です。必要な集計指標の要件を教えてください。
            </Typography>
          </Stack>
        </Box>
      </PageSection>
    </Page>
  );
}
