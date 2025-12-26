import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
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

import OfficeModeSection from "./OfficeModeSection";

export default function OfficeMode() {
  const {
    getOfficeMode,
    getHourlyPaidHolidayEnabled,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [officeMode, setOfficeMode] = useState<boolean>(false);
  const [hourlyPaidHolidayEnabled, setHourlyPaidHolidayEnabled] =
    useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setOfficeMode(getOfficeMode());
    setHourlyPaidHolidayEnabled(getHourlyPaidHolidayEnabled());
    setId(getConfigId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOfficeModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOfficeMode(event.target.checked);
  };

  const handleHourlyPaidHolidayEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHourlyPaidHolidayEnabled(event.target.checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          officeMode,
          hourlyPaidHolidayEnabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          officeMode,
          hourlyPaidHolidayEnabled,
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
        出勤モード / 時間単位休暇
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <OfficeModeSection
          officeMode={officeMode}
          onOfficeModeChange={handleOfficeModeChange}
          hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
          onHourlyPaidHolidayEnabledChange={
            handleHourlyPaidHolidayEnabledChange
          }
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
