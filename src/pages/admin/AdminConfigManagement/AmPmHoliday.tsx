import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, E14002, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import {
  DEFAULT_AM_HOLIDAY_END,
  DEFAULT_AM_HOLIDAY_START,
  DEFAULT_PM_HOLIDAY_END,
  DEFAULT_PM_HOLIDAY_START,
  TIME_FORMAT,
} from "./constants";

export default function AmPmHoliday() {
  const {
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);

  const [amHolidayStartTime, setAmHolidayStartTime] = useState<Dayjs | null>(
    dayjs(DEFAULT_AM_HOLIDAY_START, TIME_FORMAT)
  );
  const [amHolidayEndTime, setAmHolidayEndTime] = useState<Dayjs | null>(
    dayjs(DEFAULT_AM_HOLIDAY_END, TIME_FORMAT)
  );
  const [pmHolidayStartTime, setPmHolidayStartTime] = useState<Dayjs | null>(
    dayjs(DEFAULT_PM_HOLIDAY_START, TIME_FORMAT)
  );
  const [pmHolidayEndTime, setPmHolidayEndTime] = useState<Dayjs | null>(
    dayjs(DEFAULT_PM_HOLIDAY_END, TIME_FORMAT)
  );
  const [amPmHolidayEnabled, setAmPmHolidayEnabled] = useState<boolean>(true);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getAmHolidayStartTime === "function" && getAmHolidayStartTime())
      setAmHolidayStartTime(getAmHolidayStartTime());
    if (typeof getAmHolidayEndTime === "function" && getAmHolidayEndTime())
      setAmHolidayEndTime(getAmHolidayEndTime());
    if (typeof getPmHolidayStartTime === "function" && getPmHolidayStartTime())
      setPmHolidayStartTime(getPmHolidayStartTime());
    if (typeof getPmHolidayEndTime === "function" && getPmHolidayEndTime())
      setPmHolidayEndTime(getPmHolidayEndTime());
    if (typeof getAmPmHolidayEnabled === "function")
      setAmPmHolidayEnabled(getAmPmHolidayEnabled());
    setId(getConfigId());
  }, [
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
    getConfigId,
  ]);

  const handleSave = async () => {
    if (
      amHolidayStartTime &&
      amHolidayEndTime &&
      pmHolidayStartTime &&
      pmHolidayEndTime
    ) {
      try {
        if (id) {
          await saveConfig({
            id,
            amHolidayStartTime: amHolidayStartTime.format("HH:mm"),
            amHolidayEndTime: amHolidayEndTime.format("HH:mm"),
            pmHolidayStartTime: pmHolidayStartTime.format("HH:mm"),
            pmHolidayEndTime: pmHolidayEndTime.format("HH:mm"),
            amPmHolidayEnabled,
          } as unknown as UpdateAppConfigInput);
          dispatch(setSnackbarSuccess(S14002));
        } else {
          await saveConfig({
            name: "default",
            amHolidayStartTime: amHolidayStartTime.format("HH:mm"),
            amHolidayEndTime: amHolidayEndTime.format("HH:mm"),
            pmHolidayStartTime: pmHolidayStartTime.format("HH:mm"),
            pmHolidayEndTime: pmHolidayEndTime.format("HH:mm"),
            amPmHolidayEnabled,
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
          午前/午後休
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            この機能が有効な場合、午前休暇と午後休暇の時間帯を設定できます。
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={amPmHolidayEnabled}
                onChange={(_, checked) => setAmPmHolidayEnabled(checked)}
                color="primary"
              />
            }
            label={amPmHolidayEnabled ? "有効" : "無効"}
            sx={{ mb: 1 }}
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1">午前</Typography>
            <TimePicker
              label="開始"
              value={amHolidayStartTime}
              onChange={setAmHolidayStartTime}
              ampm={false}
              format="HH:mm"
              slotProps={{ textField: { size: "small" } }}
              disabled={!amPmHolidayEnabled}
            />
            <Typography>〜</Typography>
            <TimePicker
              label="終了"
              value={amHolidayEndTime}
              onChange={setAmHolidayEndTime}
              ampm={false}
              format="HH:mm"
              slotProps={{ textField: { size: "small" } }}
              disabled={!amPmHolidayEnabled}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1">午後</Typography>
            <TimePicker
              label="開始"
              value={pmHolidayStartTime}
              onChange={setPmHolidayStartTime}
              ampm={false}
              format="HH:mm"
              slotProps={{ textField: { size: "small" } }}
              disabled={!amPmHolidayEnabled}
            />
            <Typography>〜</Typography>
            <TimePicker
              label="終了"
              value={pmHolidayEndTime}
              onChange={setPmHolidayEndTime}
              ampm={false}
              format="HH:mm"
              slotProps={{ textField: { size: "small" } }}
              disabled={!amPmHolidayEnabled}
            />
          </Stack>

          <Button variant="contained" color="primary" onClick={handleSave}>
            保存
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
