import { ShiftRequestForm } from "@features/shift/request-form";
import Page from "@shared/ui/page/Page";

import { PageSection } from "@/shared/ui/layout";

export default function ShiftRequestPage() {
  return (
    <Page title="希望シフト" maxWidth="xl">
      <PageSection layoutVariant="dashboard" sx={{ minHeight: 480 }}>
        <ShiftRequestForm />
      </PageSection>
    </Page>
  );
}
