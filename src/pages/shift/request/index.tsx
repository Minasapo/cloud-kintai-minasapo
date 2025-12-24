import { ShiftRequestForm } from "@features/shift/request-form";
import Box from "@mui/material/Box";
import Page from "@shared/ui/page/Page";

import { PageSection, dashboardInnerSurfaceSx } from "@/shared/ui/layout";

export default function ShiftRequestPage() {
  return (
    <Page title="希望シフト" maxWidth="xl">
      <PageSection layoutVariant="dashboard">
        <Box sx={{ ...dashboardInnerSurfaceSx, minHeight: 480 }}>
          <ShiftRequestForm />
        </Box>
      </PageSection>
    </Page>
  );
}
