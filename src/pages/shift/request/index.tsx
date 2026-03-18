import { ShiftRequestForm } from "@features/shift/request-form";
import Page from "@shared/ui/page/Page";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
import ShiftCollaborativePage from "@/pages/shift/collaborative/ShiftCollaborativePage";
import { PageSection } from "@/shared/ui/layout";

export const resolveShiftRequestMode = (
  defaultMode: ShiftDisplayMode,
): ShiftDisplayMode => {
  return defaultMode;
};

export default function ShiftRequestPage() {
  const { getShiftDefaultMode } = useContext(AppConfigContext);
  const selectedMode = resolveShiftRequestMode(getShiftDefaultMode());

  if (selectedMode === "collaborative") {
    return <ShiftCollaborativePage />;
  }

  return (
    <Page title="希望シフト" maxWidth={false} showDefaultHeader={false}>
      <PageSection variant="plain" layoutVariant="detail" sx={{ gap: 0 }}>
          <ShiftRequestForm />
      </PageSection>
    </Page>
  );
}
