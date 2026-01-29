import { ShiftRequestForm } from "@features/shift/request-form";
import Box from "@mui/material/Box";
import Page from "@shared/ui/page/Page";

import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";
import { dashboardInnerSurfaceSx, PageSection } from "@/shared/ui/layout";

export default function ShiftRequestPage() {
  return (
    <Page title="希望シフト" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box
          sx={{
            ...dashboardInnerSurfaceSx,
            minHeight: PANEL_HEIGHTS.DASHBOARD_MIN,
          }}
        >
          <ShiftRequestForm />
        </Box>
      </PageSection>
    </Page>
  );
}
