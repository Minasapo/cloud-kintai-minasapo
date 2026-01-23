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
} from "@/shared/lib/store/snackbarSlice";

import {
  appendItem,
  removeItemAt,
  toggleEnabledAt,
  updateItem,
} from "./arrayHelpers";
import { TIME_FORMAT } from "./constants";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuickInputStartTimes(
      getQuickInputStartTimes().map((entry) => ({
        time: dayjs(entry.time, TIME_FORMAT),
        enabled: entry.enabled,
      }))
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuickInputEndTimes(
      getQuickInputEndTimes().map((entry) => ({
        time: dayjs(entry.time, TIME_FORMAT),
        enabled: entry.enabled,
      }))
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getQuickInputStartTimes, getQuickInputEndTimes, getConfigId]);

  const handleAddQuickInputStartTime = () =>
    setQuickInputStartTimes(
      appendItem(quickInputStartTimes, { time: dayjs(), enabled: true })
    );
  const handleQuickInputStartTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    if (!newValue) return;
    setQuickInputStartTimes(
      updateItem(quickInputStartTimes, index, (e) => ({ ...e, time: newValue }))
    );
  };
  const handleQuickInputStartTimeToggle = (index: number) =>
    setQuickInputStartTimes(toggleEnabledAt(quickInputStartTimes, index));
  const handleRemoveQuickInputStartTime = (index: number) =>
    setQuickInputStartTimes(removeItemAt(quickInputStartTimes, index));

  const handleAddQuickInputEndTime = () =>
    setQuickInputEndTimes(
      appendItem(quickInputEndTimes, { time: dayjs(), enabled: true })
    );
  const handleQuickInputEndTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    if (!newValue) return;
    setQuickInputEndTimes(
      updateItem(quickInputEndTimes, index, (e) => ({ ...e, time: newValue }))
    );
  };
  const handleQuickInputEndTimeToggle = (index: number) =>
    setQuickInputEndTimes(toggleEnabledAt(quickInputEndTimes, index));
  const handleRemoveQuickInputEndTime = (index: number) =>
    setQuickInputEndTimes(removeItemAt(quickInputEndTimes, index));

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
      <Typography variant="h4" sx={{ mb: 1 }}>
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
