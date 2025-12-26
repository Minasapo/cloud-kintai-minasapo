import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import type { ChangeEvent } from "react";
import { useContext, useEffect, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, E14002, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

export type QuickInputEntry = { time: Dayjs; enabled: boolean };
export type LinkItem = {
  label: string;
  url: string;
  enabled: boolean;
  icon: string;
};
export type ReasonItem = { reason: string; enabled: boolean };

type RequiredTimes = {
  startTime: Dayjs;
  endTime: Dayjs;
  lunchRestStartTime: Dayjs;
  lunchRestEndTime: Dayjs;
  amHolidayStartTime: Dayjs;
  amHolidayEndTime: Dayjs;
  pmHolidayStartTime: Dayjs;
  pmHolidayEndTime: Dayjs;
};

type BaseAppConfigPayload = {
  workStartTime: string;
  workEndTime: string;
  standardWorkHours: number;
  links: { label: string; url: string; enabled: boolean; icon: string }[];
  reasons: { reason: string; enabled: boolean }[];
  officeMode: boolean;
  absentEnabled: boolean;
  quickInputStartTimes: { time: string; enabled: boolean }[];
  quickInputEndTimes: { time: string; enabled: boolean }[];
  lunchRestStartTime: string;
  lunchRestEndTime: string;
  hourlyPaidHolidayEnabled: boolean;
  amHolidayStartTime: string;
  amHolidayEndTime: string;
  pmHolidayStartTime: string;
  pmHolidayEndTime: string;
  amPmHolidayEnabled: boolean;
  specialHolidayEnabled: boolean;
  attendanceStatisticsEnabled: boolean;
};

export function useAdminConfigForm() {
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
    getSpecialHolidayEnabled,
    getAbsentEnabled,
    getAttendanceStatisticsEnabled,
    getThemeTokens,
  } = useContext(AppConfigContext);

  const adminPanelTokens = useMemo(() => getThemeTokens(), []);
  const sectionSpacing = adminPanelTokens.component.adminPanel.sectionSpacing;

  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [quickInputStartTimes, setQuickInputStartTimes] = useState<
    QuickInputEntry[]
  >([]);
  const [quickInputEndTimes, setQuickInputEndTimes] = useState<
    QuickInputEntry[]
  >([]);
  const [id, setId] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [reasons, setReasons] = useState<ReasonItem[]>([]);
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
  const [attendanceStatisticsEnabled, setAttendanceStatisticsEnabled] =
    useState<boolean>(false);
  const [amPmHolidayEnabled, setAmPmHolidayEnabled] = useState<boolean>(true);
  const [specialHolidayEnabled, setSpecialHolidayEnabled] =
    useState<boolean>(false);
  const [absentEnabled, setAbsentEnabled] = useState<boolean>(false);

  const dispatch = useAppDispatchV2();

  const hydrateFromContext = () => {
    setStartTime(getStartTime());
    setEndTime(getEndTime());
    setId(getConfigId());
    setLinks(getLinks());
    setReasons(getReasons());
    setOfficeMode(getOfficeMode());

    const startTimes = getQuickInputStartTimes();
    setQuickInputStartTimes(
      startTimes.map((entry) => ({
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

    if (typeof getSpecialHolidayEnabled === "function") {
      setSpecialHolidayEnabled(getSpecialHolidayEnabled());
    }
    if (typeof getAbsentEnabled === "function") {
      setAbsentEnabled(getAbsentEnabled());
    }

    setAttendanceStatisticsEnabled(getAttendanceStatisticsEnabled());

    if (
      typeof getAmHolidayStartTime === "function" &&
      getAmHolidayStartTime()
    ) {
      setAmHolidayStartTime(getAmHolidayStartTime());
    }
    if (typeof getAmHolidayEndTime === "function" && getAmHolidayEndTime()) {
      setAmHolidayEndTime(getAmHolidayEndTime());
    }
    if (
      typeof getPmHolidayStartTime === "function" &&
      getPmHolidayStartTime()
    ) {
      setPmHolidayStartTime(getPmHolidayStartTime());
    }
    if (typeof getPmHolidayEndTime === "function" && getPmHolidayEndTime()) {
      setPmHolidayEndTime(getPmHolidayEndTime());
    }

    if (typeof getAmPmHolidayEnabled === "function") {
      setAmPmHolidayEnabled(getAmPmHolidayEnabled());
    }
  };

  const formatTime = (time: Dayjs) => time.format("HH:mm");

  const buildStandardWorkHours = (
    start: Dayjs,
    end: Dayjs,
    restStart: Dayjs,
    restEnd: Dayjs
  ) => {
    const baseHours = end.diff(start, "hour", true);
    const lunchHours = Math.max(restEnd.diff(restStart, "hour", true), 0);
    return Math.max(baseHours - lunchHours, 0);
  };

  const buildBasePayload = (
    requiredTimes: RequiredTimes
  ): BaseAppConfigPayload => ({
    workStartTime: formatTime(requiredTimes.startTime),
    workEndTime: formatTime(requiredTimes.endTime),
    standardWorkHours: buildStandardWorkHours(
      requiredTimes.startTime,
      requiredTimes.endTime,
      requiredTimes.lunchRestStartTime,
      requiredTimes.lunchRestEndTime
    ),
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
    absentEnabled,
    quickInputStartTimes: quickInputStartTimes.map((entry) => ({
      time: formatTime(entry.time),
      enabled: entry.enabled,
    })),
    quickInputEndTimes: quickInputEndTimes.map((entry) => ({
      time: formatTime(entry.time),
      enabled: entry.enabled,
    })),
    lunchRestStartTime: formatTime(requiredTimes.lunchRestStartTime),
    lunchRestEndTime: formatTime(requiredTimes.lunchRestEndTime),
    hourlyPaidHolidayEnabled,
    amHolidayStartTime: formatTime(requiredTimes.amHolidayStartTime),
    amHolidayEndTime: formatTime(requiredTimes.amHolidayEndTime),
    pmHolidayStartTime: formatTime(requiredTimes.pmHolidayStartTime),
    pmHolidayEndTime: formatTime(requiredTimes.pmHolidayEndTime),
    amPmHolidayEnabled,
    specialHolidayEnabled,
    attendanceStatisticsEnabled,
  });

  useEffect(() => {
    hydrateFromContext();
  }, []);

  const handleAddLink = () => {
    setLinks([...links, { label: "", url: "", enabled: true, icon: "" }]);
  };

  const handleLinkChange = (
    index: number,
    field: keyof LinkItem,
    value: string | boolean
  ) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value as never;
    setLinks(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleAddReason = () => {
    setReasons([...reasons, { reason: "", enabled: true }]);
  };

  const handleReasonChange = (
    index: number,
    field: keyof ReasonItem,
    value: string | boolean
  ) => {
    const updatedReasons = [...reasons];
    updatedReasons[index][field] = value as never;
    setReasons(updatedReasons);
  };

  const handleRemoveReason = (index: number) => {
    setReasons(reasons.filter((_, i) => i !== index));
  };

  const handleOfficeModeChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    setQuickInputStartTimes(quickInputStartTimes.filter((_, i) => i !== index));
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
    setQuickInputEndTimes(quickInputEndTimes.filter((_, i) => i !== index));
  };

  const handleHourlyPaidHolidayEnabledChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setHourlyPaidHolidayEnabled(event.target.checked);
  };

  const handleSpecialHolidayEnabledChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSpecialHolidayEnabled(event.target.checked);
  };

  const handleAbsentEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAbsentEnabled(event.target.checked);
  };

  const handleAttendanceStatisticsEnabledChange = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setAttendanceStatisticsEnabled(checked);
  };

  const handleSave = async () => {
    if (
      !startTime ||
      !endTime ||
      !lunchRestStartTime ||
      !lunchRestEndTime ||
      !amHolidayStartTime ||
      !amHolidayEndTime ||
      !pmHolidayStartTime ||
      !pmHolidayEndTime
    ) {
      dispatch(setSnackbarError(E14002));
      return;
    }

    const requiredTimes: RequiredTimes = {
      startTime,
      endTime,
      lunchRestStartTime,
      lunchRestEndTime,
      amHolidayStartTime,
      amHolidayEndTime,
      pmHolidayStartTime,
      pmHolidayEndTime,
    };

    const basePayload = buildBasePayload(requiredTimes);

    try {
      if (id) {
        const updatePayload: UpdateAppConfigInput = { id, ...basePayload };
        await saveConfig(updatePayload);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        const createPayload: CreateAppConfigInput = {
          name: "default",
          ...basePayload,
        };
        await saveConfig(createPayload);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return {
    sectionSpacing,
    startTime,
    endTime,
    lunchRestStartTime,
    lunchRestEndTime,
    quickInputStartTimes,
    quickInputEndTimes,
    links,
    reasons,
    officeMode,
    hourlyPaidHolidayEnabled,
    amHolidayStartTime,
    amHolidayEndTime,
    pmHolidayStartTime,
    pmHolidayEndTime,
    amPmHolidayEnabled,
    specialHolidayEnabled,
    absentEnabled,
    attendanceStatisticsEnabled,
    setStartTime,
    setEndTime,
    setLunchRestStartTime,
    setLunchRestEndTime,
    setAmHolidayStartTime,
    setAmHolidayEndTime,
    setPmHolidayStartTime,
    setPmHolidayEndTime,
    setAmPmHolidayEnabled,
    handleOfficeModeChange,
    handleHourlyPaidHolidayEnabledChange,
    handleSpecialHolidayEnabledChange,
    handleAbsentEnabledChange,
    handleAttendanceStatisticsEnabledChange,
    handleAddLink,
    handleLinkChange,
    handleRemoveLink,
    handleAddReason,
    handleReasonChange,
    handleRemoveReason,
    handleAddQuickInputStartTime,
    handleQuickInputStartTimeChange,
    handleQuickInputStartTimeToggle,
    handleRemoveQuickInputStartTime,
    handleAddQuickInputEndTime,
    handleQuickInputEndTimeChange,
    handleQuickInputEndTimeToggle,
    handleRemoveQuickInputEndTime,
    handleSave,
  };
}
