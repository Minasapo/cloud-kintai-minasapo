import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import QuickInputSection from "./QuickInputSection";

type Entry = { time: Dayjs; enabled: boolean };

export default function QuickInput() {
  const {
    getQuickInputStartTimes,
    getQuickInputEndTimes,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [quickInputStartTimes, setQuickInputStartTimes] = useState<Entry[]>([]);
  const [quickInputEndTimes, setQuickInputEndTimes] = useState<Entry[]>([]);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setQuickInputStartTimes(
      getQuickInputStartTimes().map((entry) => ({
        time: dayjs(entry.time, "HH:mm"),
        enabled: entry.enabled,
      }))
    );
    setQuickInputEndTimes(
      getQuickInputEndTimes().map((entry) => ({
        time: dayjs(entry.time, "HH:mm"),
        enabled: entry.enabled,
      }))
    );
    setId(getConfigId());
  }, [getQuickInputStartTimes, getQuickInputEndTimes, getConfigId]);

  const handleAddQuickInputStartTime = () =>
    setQuickInputStartTimes([
      ...quickInputStartTimes,
      { time: dayjs(), enabled: true },
    ]);
  const handleQuickInputStartTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    const updated = [...quickInputStartTimes];
    if (newValue) updated[index].time = newValue;
    setQuickInputStartTimes(updated);
  };
  const handleQuickInputStartTimeToggle = (index: number) => {
    const updated = [...quickInputStartTimes];
    updated[index].enabled = !updated[index].enabled;
    setQuickInputStartTimes(updated);
  };
  const handleRemoveQuickInputStartTime = (index: number) =>
    setQuickInputStartTimes(quickInputStartTimes.filter((_, i) => i !== index));

  const handleAddQuickInputEndTime = () =>
    setQuickInputEndTimes([
      ...quickInputEndTimes,
      { time: dayjs(), enabled: true },
    ]);
  const handleQuickInputEndTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    const updated = [...quickInputEndTimes];
    if (newValue) updated[index].time = newValue;
    setQuickInputEndTimes(updated);
  };
  const handleQuickInputEndTimeToggle = (index: number) => {
    const updated = [...quickInputEndTimes];
    updated[index].enabled = !updated[index].enabled;
    setQuickInputEndTimes(updated);
  };
  const handleRemoveQuickInputEndTime = (index: number) =>
    setQuickInputEndTimes(quickInputEndTimes.filter((_, i) => i !== index));

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          quickInputStartTimes: quickInputStartTimes.map((e) => ({
            time: e.time.format("HH:mm"),
            enabled: e.enabled,
          })),
          quickInputEndTimes: quickInputEndTimes.map((e) => ({
            time: e.time.format("HH:mm"),
            enabled: e.enabled,
          })),
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          quickInputStartTimes: quickInputStartTimes.map((e) => ({
            time: e.time.format("HH:mm"),
            enabled: e.enabled,
          })),
          quickInputEndTimes: quickInputEndTimes.map((e) => ({
            time: e.time.format("HH:mm"),
            enabled: e.enabled,
          })),
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
        クイック入力(打刻)
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <QuickInputSection
          quickInputStartTimes={quickInputStartTimes}
          quickInputEndTimes={quickInputEndTimes}
          onAddQuickInputStartTime={handleAddQuickInputStartTime}
          onQuickInputStartTimeChange={handleQuickInputStartTimeChange}
          onQuickInputStartTimeToggle={handleQuickInputStartTimeToggle}
          onRemoveQuickInputStartTime={handleRemoveQuickInputStartTime}
          onAddQuickInputEndTime={handleAddQuickInputEndTime}
          onQuickInputEndTimeChange={handleQuickInputEndTimeChange}
          onQuickInputEndTimeToggle={handleQuickInputEndTimeToggle}
          onRemoveQuickInputEndTime={handleRemoveQuickInputEndTime}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
