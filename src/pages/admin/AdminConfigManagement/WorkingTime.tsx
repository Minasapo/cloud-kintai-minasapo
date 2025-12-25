import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, E14002, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import WorkingTimeSection from "./WorkingTimeSection";

export default function WorkingTime() {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [lunchRestStartTime, setLunchRestStartTime] = useState<Dayjs | null>(
    null
  );
  const [lunchRestEndTime, setLunchRestEndTime] = useState<Dayjs | null>(null);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setStartTime(getStartTime());
    setEndTime(getEndTime());
    setLunchRestStartTime(getLunchRestStartTime());
    setLunchRestEndTime(getLunchRestEndTime());
    setId(getConfigId());
  }, [
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getConfigId,
  ]);

  const handleSave = async () => {
    if (startTime && endTime && lunchRestStartTime && lunchRestEndTime) {
      try {
        if (id) {
          await saveConfig({
            id,
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
            lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
          } as unknown as UpdateAppConfigInput);
          dispatch(setSnackbarSuccess(S14002));
        } else {
          await saveConfig({
            name: "default",
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
            lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
          } as unknown as CreateAppConfigInput);
          dispatch(setSnackbarSuccess(S14001));
        }
        await fetchConfig();
      } catch {
        dispatch(setSnackbarError(E14001));
      }
    } else {
      dispatch(setSnackbarError(E14002));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          勤務時間設定
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <WorkingTimeSection
            startTime={startTime}
            endTime={endTime}
            lunchRestStartTime={lunchRestStartTime}
            lunchRestEndTime={lunchRestEndTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
            setLunchRestStartTime={setLunchRestStartTime}
            setLunchRestEndTime={setLunchRestEndTime}
          />
          <Button variant="contained" color="primary" onClick={handleSave}>
            保存
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
