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
} from "@/app/slices/snackbarSlice";

export default function SpecialHoliday() {
  const { getSpecialHolidayEnabled, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [specialHolidayEnabled, setSpecialHolidayEnabled] =
    useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getSpecialHolidayEnabled === "function")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpecialHolidayEnabled(getSpecialHolidayEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getSpecialHolidayEnabled, getConfigId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialHolidayEnabled(event.target.checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          specialHolidayEnabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          specialHolidayEnabled,
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
        特別休暇
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={specialHolidayEnabled}
              onChange={handleChange}
              color="primary"
            />
          }
          label={specialHolidayEnabled ? "有効" : "無効"}
        />
        <Typography variant="body2" color="textSecondary">
          忌引きなどの特別休暇を有効化すると、勤怠編集画面で申請や編集ができるようになります。
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
