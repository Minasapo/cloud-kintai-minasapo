import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import TimeRecorderAnnouncementSection from "./TimeRecorderAnnouncementSection";

export default function TimeRecorderAnnouncement() {
  const { getTimeRecorderAnnouncement, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const announcement = getTimeRecorderAnnouncement();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(announcement.enabled);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(announcement.message);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getTimeRecorderAnnouncement, getConfigId]);

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          timeRecorderAnnouncementEnabled: enabled,
          timeRecorderAnnouncementMessage: message,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          timeRecorderAnnouncementEnabled: enabled,
          timeRecorderAnnouncementMessage: message,
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        打刻画面アナウンス
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TimeRecorderAnnouncementSection
          enabled={enabled}
          message={message}
          onEnabledChange={(_, checked) => setEnabled(checked)}
          onMessageChange={(event) => setMessage(event.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
