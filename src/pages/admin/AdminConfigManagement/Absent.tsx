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
} from "@/app/snackbarReducer";

export default function Absent() {
  const { getAbsentEnabled, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [absentEnabled, setAbsentEnabled] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getAbsentEnabled === "function")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAbsentEnabled(getAbsentEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getAbsentEnabled, getConfigId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAbsentEnabled(event.target.checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          absentEnabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          absentEnabled,
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
        欠勤
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={absentEnabled}
              onChange={handleChange}
              color="primary"
            />
          }
          label={absentEnabled ? "有効" : "無効"}
        />
        <Typography variant="body2" color="textSecondary">
          欠勤設定を有効にすると、勤怠編集画面で欠勤の管理が可能になります。
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
