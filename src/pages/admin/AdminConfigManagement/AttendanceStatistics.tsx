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
} from "@/lib/reducers/snackbarReducer";

export default function AttendanceStatistics() {
  const {
    getAttendanceStatisticsEnabled,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(getAttendanceStatisticsEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getAttendanceStatisticsEnabled, getConfigId]);

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setEnabled(checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          attendanceStatisticsEnabled: enabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          attendanceStatisticsEnabled: enabled,
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
        稼働統計
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={handleChange}
              color="primary"
              inputProps={{ "aria-label": "稼働統計の表示切り替え" }}
            />
          }
          label={enabled ? "有効" : "無効"}
        />
        <Typography variant="body2" color="textSecondary">
          勤怠メニューの稼働統計ページ表示を有効/無効にします。無効時はメニューから非表示になり、直接アクセスは勤怠一覧にリダイレクトされます。
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
