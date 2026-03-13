import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import React, { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export default function OvertimeConfirmation() {
  const { getOverTimeCheckEnabled, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getOverTimeCheckEnabled === "function") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(getOverTimeCheckEnabled());
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getOverTimeCheckEnabled, getConfigId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          overTimeCheckEnabled: enabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          overTimeCheckEnabled: enabled,
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
      <Typography variant="h4" sx={{ mb: 1 }}>
        残業確認
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch checked={enabled} onChange={handleChange} color="primary" />
          }
          label={enabled ? "有効" : "無効"}
        />
        <Typography variant="body2" color="textSecondary">
          勤怠編集画面で、残業申請がない場合や承認時間を超えた場合に確認メッセージを表示するかどうかを切り替えます。
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
