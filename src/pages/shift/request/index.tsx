import useAppConfig from "@entities/app-config/model/useAppConfig";
import { ShiftRequestForm } from "@features/shift/request-form";
import { LinearProgress } from "@mui/material";
import Page from "@shared/ui/page/Page";

import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
import ShiftCollaborativePage from "@/pages/shift/collaborative/ShiftCollaborative";
import { PageSection } from "@/shared/ui/layout";

export const resolveShiftRequestMode = (
  defaultMode: ShiftDisplayMode,
): ShiftDisplayMode => {
  return defaultMode;
};

export default function ShiftRequestPage() {
  const { config, getShiftDefaultMode, isConfigLoading } = useAppConfig();

  if (isConfigLoading && !config) {
    return (
      <Page title="希望シフト" width="full" showDefaultHeader={false}>
        <PageSection variant="plain" layoutVariant="detail" sx={{ gap: 0 }}>
          <LinearProgress data-testid="shift-mode-loading" />
        </PageSection>
      </Page>
    );
  }

  const selectedMode = resolveShiftRequestMode(getShiftDefaultMode());

  if (selectedMode === "collaborative") {
    return <ShiftCollaborativePage />;
  }

  return (
    <Page title="希望シフト" width="full" showDefaultHeader={false}>
      <PageSection variant="plain" layoutVariant="detail" sx={{ gap: 0 }}>
        <ShiftRequestForm />
      </PageSection>
    </Page>
  );
}
