import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import Title from "@/components/common/Title";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, E14002, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import LinkListSection from "./LinkListSection";
import OfficeModeSection from "./OfficeModeSection";
import QuickInputSection from "./QuickInputSection";
import ReasonListSection from "./ReasonListSection";
import WorkingTimeSection from "./WorkingTimeSection";

export default function AdminConfigManagement() {
  // AppConfigContextからamPmHolidayEnabledのgetterを取得
  const {
    fetchConfig,
    saveConfig,
    getStartTime,
    getEndTime,
    getConfigId,
    getLinks,
    getReasons,
    getOfficeMode,
    getQuickInputStartTimes,
    getQuickInputEndTimes,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
  } = useContext(AppConfigContext);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [quickInputStartTimes, setQuickInputStartTimes] = useState<
    { time: Dayjs; enabled: boolean }[]
  >([]);
  const [quickInputEndTimes, setQuickInputEndTimes] = useState<
    { time: Dayjs; enabled: boolean }[]
  >([]);
  const [id, setId] = useState<string | null>(null);
  const [links, setLinks] = useState<
    { label: string; url: string; enabled: boolean; icon: string }[]
  >([]);
  const [reasons, setReasons] = useState<
    { reason: string; enabled: boolean }[]
  >([]);
  const [officeMode, setOfficeMode] = useState<boolean>(false);
  const [lunchRestStartTime, setLunchRestStartTime] = useState<Dayjs | null>(
    null
  );
  const [lunchRestEndTime, setLunchRestEndTime] = useState<Dayjs | null>(null);
  const [hourlyPaidHolidayEnabled, setHourlyPaidHolidayEnabled] =
    useState<boolean>(false);
  const [amHolidayStartTime, setAmHolidayStartTime] = useState<Dayjs | null>(
    dayjs("09:00", "HH:mm")
  );
  const [amHolidayEndTime, setAmHolidayEndTime] = useState<Dayjs | null>(
    dayjs("12:00", "HH:mm")
  );
  const [pmHolidayStartTime, setPmHolidayStartTime] = useState<Dayjs | null>(
    dayjs("13:00", "HH:mm")
  );
  const [pmHolidayEndTime, setPmHolidayEndTime] = useState<Dayjs | null>(
    dayjs("18:00", "HH:mm")
  );
  const [amPmHolidayEnabled, setAmPmHolidayEnabled] = useState<boolean>(true);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setStartTime(getStartTime());
    setEndTime(getEndTime());
    setId(getConfigId());
    setLinks(getLinks());
    setReasons(getReasons());
    setOfficeMode(getOfficeMode());
    const quickInputStartTimes = getQuickInputStartTimes();
    setQuickInputStartTimes(
      quickInputStartTimes.map((entry) => ({
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
    setLunchRestStartTime(getLunchRestStartTime());
    setLunchRestEndTime(getLunchRestEndTime());
    setHourlyPaidHolidayEnabled(getHourlyPaidHolidayEnabled());
    // fetchConfigで午前休・午後休の時間帯があればセット
    if (typeof getAmHolidayStartTime === "function" && getAmHolidayStartTime())
      setAmHolidayStartTime(getAmHolidayStartTime());
    if (typeof getAmHolidayEndTime === "function" && getAmHolidayEndTime())
      setAmHolidayEndTime(getAmHolidayEndTime());
    if (typeof getPmHolidayStartTime === "function" && getPmHolidayStartTime())
      setPmHolidayStartTime(getPmHolidayStartTime());
    if (typeof getPmHolidayEndTime === "function" && getPmHolidayEndTime())
      setPmHolidayEndTime(getPmHolidayEndTime());
    // 取得時に有効無効もセット（configに値があれば）
    if (typeof getAmPmHolidayEnabled === "function")
      setAmPmHolidayEnabled(getAmPmHolidayEnabled());
  }, [
    getStartTime,
    getEndTime,
    getConfigId,
    getLinks,
    getReasons,
    getOfficeMode,
    getQuickInputStartTimes,
    getQuickInputEndTimes,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
  ]);

  const handleAddLink = () => {
    setLinks([...links, { label: "", url: "", enabled: true, icon: "" }]);
  };

  const handleLinkChange = (
    index: number,
    field: "label" | "url" | "enabled" | "icon",
    value: string | boolean
  ) => {
    const updatedLinks = [...links];
    updatedLinks[index][field as keyof (typeof updatedLinks)[number]] =
      value as never;
    setLinks(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleAddReason = () => {
    setReasons([...reasons, { reason: "", enabled: true }]);
  };

  const handleReasonChange = (
    index: number,
    field: "reason" | "enabled",
    value: string | boolean
  ) => {
    const updatedReasons = [...reasons];
    updatedReasons[index][field as keyof (typeof updatedReasons)[number]] =
      value as never;
    setReasons(updatedReasons);
  };

  const handleRemoveReason = (index: number) => {
    const updatedReasons = reasons.filter((_, i) => i !== index);
    setReasons(updatedReasons);
  };

  const handleOfficeModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOfficeMode(event.target.checked);
  };

  const handleAddQuickInputStartTime = () => {
    setQuickInputStartTimes([
      ...quickInputStartTimes,
      { time: dayjs(), enabled: true },
    ]);
  };

  const handleQuickInputStartTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    const updatedStartTimes = [...quickInputStartTimes];
    if (newValue) {
      updatedStartTimes[index].time = newValue;
    }
    setQuickInputStartTimes(updatedStartTimes);
  };

  const handleQuickInputStartTimeToggle = (index: number) => {
    const updatedStartTimes = [...quickInputStartTimes];
    updatedStartTimes[index].enabled = !updatedStartTimes[index].enabled;
    setQuickInputStartTimes(updatedStartTimes);
  };

  const handleRemoveQuickInputStartTime = (index: number) => {
    const updatedStartTimes = quickInputStartTimes.filter(
      (_, i) => i !== index
    );
    setQuickInputStartTimes(updatedStartTimes);
  };

  const handleAddQuickInputEndTime = () => {
    setQuickInputEndTimes([
      ...quickInputEndTimes,
      { time: dayjs(), enabled: true },
    ]);
  };

  const handleQuickInputEndTimeChange = (
    index: number,
    newValue: Dayjs | null
  ) => {
    const updatedEndTimes = [...quickInputEndTimes];
    if (newValue) {
      updatedEndTimes[index].time = newValue;
    }
    setQuickInputEndTimes(updatedEndTimes);
  };

  const handleQuickInputEndTimeToggle = (index: number) => {
    const updatedEndTimes = [...quickInputEndTimes];
    updatedEndTimes[index].enabled = !updatedEndTimes[index].enabled;
    setQuickInputEndTimes(updatedEndTimes);
  };

  const handleRemoveQuickInputEndTime = (index: number) => {
    const updatedEndTimes = quickInputEndTimes.filter((_, i) => i !== index);
    setQuickInputEndTimes(updatedEndTimes);
  };

  const handleHourlyPaidHolidayEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHourlyPaidHolidayEnabled(event.target.checked);
  };

  const handleSave = async () => {
    if (
      startTime &&
      endTime &&
      lunchRestStartTime &&
      lunchRestEndTime &&
      amHolidayStartTime &&
      amHolidayEndTime &&
      pmHolidayStartTime &&
      pmHolidayEndTime
    ) {
      try {
        if (id) {
          await saveConfig({
            id,
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            links: links.map((link) => ({
              label: link.label,
              url: link.url,
              enabled: link.enabled,
              icon: link.icon,
            })),
            reasons: reasons.map((reason) => ({
              reason: reason.reason,
              enabled: reason.enabled,
            })),
            officeMode,
            quickInputStartTimes: quickInputStartTimes.map((entry) => ({
              time: entry.time.format("HH:mm"),
              enabled: entry.enabled,
            })),
            quickInputEndTimes: quickInputEndTimes.map((entry) => ({
              time: entry.time.format("HH:mm"),
              enabled: entry.enabled,
            })),
            lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
            lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
            hourlyPaidHolidayEnabled,
            amHolidayStartTime: amHolidayStartTime.format("HH:mm"),
            amHolidayEndTime: amHolidayEndTime.format("HH:mm"),
            pmHolidayStartTime: pmHolidayStartTime.format("HH:mm"),
            pmHolidayEndTime: pmHolidayEndTime.format("HH:mm"),
            amPmHolidayEnabled,
          });
          dispatch(setSnackbarSuccess(S14002));
        } else {
          await saveConfig({
            name: "default",
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            links: links.map((link) => ({
              label: link.label,
              url: link.url,
              enabled: link.enabled,
              icon: link.icon,
            })),
            reasons: reasons.map((reason) => ({
              reason: reason.reason,
              enabled: reason.enabled,
            })),
            officeMode,
            hourlyPaidHolidayEnabled,
            amHolidayStartTime: amHolidayStartTime.format("HH:mm"),
            amHolidayEndTime: amHolidayEndTime.format("HH:mm"),
            pmHolidayStartTime: pmHolidayStartTime.format("HH:mm"),
            pmHolidayEndTime: pmHolidayEndTime.format("HH:mm"),
            amPmHolidayEnabled,
          });
          dispatch(setSnackbarSuccess(S14001));
        }
        await fetchConfig();
      } catch (error) {
        dispatch(setSnackbarError(E14001));
      }
    } else {
      dispatch(setSnackbarError(E14002));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2} sx={{ pb: 2 }}>
        <Title text="設定" />
        <WorkingTimeSection
          startTime={startTime}
          endTime={endTime}
          lunchRestStartTime={lunchRestStartTime}
          lunchRestEndTime={lunchRestEndTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
          setLunchRestStartTime={setLunchRestStartTime}
          setLunchRestEndTime={setLunchRestEndTime}
          renderTimeViewClock={renderTimeViewClock}
        />
        <Typography variant="h6">午前/午後休暇(β版)</Typography>
        <Typography variant="body2" color="textSecondary">
          この機能が有効な場合、午前休暇と午後休暇の時間帯を設定できます。
          <br />
          午前休暇は通常の勤務時間の前半、午後休暇は後半に適用されます。
          <br />
          ベータ(β)版は、まだ完全ではないため、予期しない動作が発生する可能性があります。
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
        <OfficeModeSection
          officeMode={officeMode}
          onOfficeModeChange={handleOfficeModeChange}
          hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
          onHourlyPaidHolidayEnabledChange={
            handleHourlyPaidHolidayEnabledChange
          }
        />
        <LinkListSection
          links={links}
          onAddLink={handleAddLink}
          onLinkChange={handleLinkChange}
          onRemoveLink={handleRemoveLink}
        />
        <ReasonListSection
          reasons={reasons}
          onAddReason={handleAddReason}
          onReasonChange={handleReasonChange}
          onRemoveReason={handleRemoveReason}
        />
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
        <Typography variant="body2" color="textSecondary">
          スタッフ側への設定反映には数分程度かかる場合があります。
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </LocalizationProvider>
  );
}
