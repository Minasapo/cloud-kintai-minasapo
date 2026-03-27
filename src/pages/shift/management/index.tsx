import useAppConfig from "@entities/app-config/model/useAppConfig";
import { ShiftManagementBoard } from "@features/shift/management";
import { LinearProgress, Stack, Typography } from "@mui/material";
import Page from "@shared/ui/page/Page";

import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
import ShiftCollaborativePage from "@/pages/shift/collaborative/ShiftCollaborative";
import { PageSection } from "@/shared/ui/layout";

export const resolveShiftManagementMode = (
  defaultMode: ShiftDisplayMode,
): ShiftDisplayMode => {
  return defaultMode;
};

export default function ShiftManagementPage() {
  const { config, getShiftDefaultMode, isConfigLoading } = useAppConfig();

  if (isConfigLoading && !config) {
    return (
      <Page title="シフト管理" maxWidth={false} showDefaultHeader={false}>
        <PageSection variant="plain" layoutVariant="detail" sx={{ gap: 0 }}>
          <LinearProgress data-testid="shift-management-mode-loading" />
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ py: 6 }}
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              シフト画面を読み込み中です...
            </Typography>
          </Stack>
        </PageSection>
      </Page>
    );
  }

  const selectedMode = resolveShiftManagementMode(getShiftDefaultMode());

  return selectedMode === "collaborative" ? (
    <ShiftCollaborativePage />
  ) : (
    <ShiftManagementBoard />
  );
}
