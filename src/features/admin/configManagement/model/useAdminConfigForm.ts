import { useAppDispatchV2 } from "@app/hooks";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import { appendItem, removeItemAt, toggleEnabledAt, updateItem, } from "@features/admin/configManagement/lib/arrayHelpers";
import { DEFAULT_AM_HOLIDAY_END, DEFAULT_AM_HOLIDAY_START, DEFAULT_PM_HOLIDAY_END, DEFAULT_PM_HOLIDAY_START, TIME_FORMAT, } from "@features/admin/configManagement/lib/constants";
import { buildCreatePayload, buildUpdatePayload, } from "@features/admin/configManagement/lib/payloadHelpers";
import { validateAdminConfigForm } from "@features/admin/configManagement/lib/validation";
import type { CreateAppConfigInput, UpdateAppConfigInput } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import dayjs, { Dayjs } from "dayjs";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useMemo, useState } from "react";

import { E14001, S14001, S14002 } from "@/errors";

export type QuickInputEntry = {
    time: Dayjs;
    enabled: boolean;
};
export type LinkItem = {
    label: string;
    url: string;
    enabled: boolean;
    icon: string;
};
export type ReasonItem = {
    reason: string;
    enabled: boolean;
};
type AdminConfigGetters = {
    getStartTime: () => Dayjs;
    getEndTime: () => Dayjs;
    getConfigId: () => string | null;
    getLinks: () => LinkItem[];
    getReasons: () => ReasonItem[];
    getOfficeMode: () => boolean;
    getQuickInputStartTimes: (onlyEnabled?: boolean) => { time: string; enabled: boolean }[];
    getQuickInputEndTimes: (onlyEnabled?: boolean) => { time: string; enabled: boolean }[];
    getLunchRestStartTime: () => Dayjs;
    getLunchRestEndTime: () => Dayjs;
    getHourlyPaidHolidayEnabled: () => boolean;
    getSpecialHolidayEnabled?: () => boolean;
    getAbsentEnabled?: () => boolean;
    getOverTimeCheckEnabled?: () => boolean;
    getShiftCollaborativeEnabled?: () => boolean;
    getShiftDefaultMode?: () => ShiftDisplayMode;
    getAttendanceStatisticsEnabled: () => boolean;
    getWorkflowNotificationEnabled: () => boolean;
    getTimeRecorderAnnouncement: () => { enabled: boolean; message: string };
    getAmHolidayStartTime?: () => Dayjs | null;
    getAmHolidayEndTime?: () => Dayjs | null;
    getPmHolidayStartTime?: () => Dayjs | null;
    getPmHolidayEndTime?: () => Dayjs | null;
    getAmPmHolidayEnabled?: () => boolean;
};

type AdminConfigSetters = {
    setStartTime: Dispatch<SetStateAction<Dayjs | null>>;
    setEndTime: Dispatch<SetStateAction<Dayjs | null>>;
    setId: Dispatch<SetStateAction<string | null>>;
    setLinks: Dispatch<SetStateAction<LinkItem[]>>;
    setReasons: Dispatch<SetStateAction<ReasonItem[]>>;
    setOfficeMode: Dispatch<SetStateAction<boolean>>;
    setQuickInputStartTimes: Dispatch<SetStateAction<QuickInputEntry[]>>;
    setQuickInputEndTimes: Dispatch<SetStateAction<QuickInputEntry[]>>;
    setLunchRestStartTime: Dispatch<SetStateAction<Dayjs | null>>;
    setLunchRestEndTime: Dispatch<SetStateAction<Dayjs | null>>;
    setHourlyPaidHolidayEnabled: Dispatch<SetStateAction<boolean>>;
    setAmHolidayStartTime: Dispatch<SetStateAction<Dayjs | null>>;
    setAmHolidayEndTime: Dispatch<SetStateAction<Dayjs | null>>;
    setPmHolidayStartTime: Dispatch<SetStateAction<Dayjs | null>>;
    setPmHolidayEndTime: Dispatch<SetStateAction<Dayjs | null>>;
    setAmPmHolidayEnabled: Dispatch<SetStateAction<boolean>>;
    setSpecialHolidayEnabled: Dispatch<SetStateAction<boolean>>;
    setAbsentEnabled: Dispatch<SetStateAction<boolean>>;
    setOverTimeCheckEnabled: Dispatch<SetStateAction<boolean>>;
    setShiftCollaborativeEnabled: Dispatch<SetStateAction<boolean>>;
    setShiftDefaultMode: Dispatch<SetStateAction<ShiftDisplayMode>>;
    setAttendanceStatisticsEnabled: Dispatch<SetStateAction<boolean>>;
    setWorkflowNotificationEnabled: Dispatch<SetStateAction<boolean>>;
    setTimeRecorderAnnouncementEnabled: Dispatch<SetStateAction<boolean>>;
    setTimeRecorderAnnouncementMessage: Dispatch<SetStateAction<string>>;
};

function hydrateAdminConfigFormState(g: AdminConfigGetters, s: AdminConfigSetters) {
    s.setStartTime(g.getStartTime());
    s.setEndTime(g.getEndTime());
    s.setId(g.getConfigId());
    s.setLinks(g.getLinks());
    s.setReasons(g.getReasons());
    s.setOfficeMode(g.getOfficeMode());
    s.setQuickInputStartTimes(g.getQuickInputStartTimes().map((entry) => ({ time: dayjs(entry.time, TIME_FORMAT), enabled: entry.enabled })));
    s.setQuickInputEndTimes(g.getQuickInputEndTimes().map((entry) => ({ time: dayjs(entry.time, TIME_FORMAT), enabled: entry.enabled })));
    s.setLunchRestStartTime(g.getLunchRestStartTime());
    s.setLunchRestEndTime(g.getLunchRestEndTime());
    s.setHourlyPaidHolidayEnabled(g.getHourlyPaidHolidayEnabled());
    if (typeof g.getSpecialHolidayEnabled === "function") s.setSpecialHolidayEnabled(g.getSpecialHolidayEnabled());
    if (typeof g.getAbsentEnabled === "function") s.setAbsentEnabled(g.getAbsentEnabled());
    if (typeof g.getOverTimeCheckEnabled === "function") s.setOverTimeCheckEnabled(g.getOverTimeCheckEnabled());
    if (typeof g.getShiftCollaborativeEnabled === "function") s.setShiftCollaborativeEnabled(g.getShiftCollaborativeEnabled());
    if (typeof g.getShiftDefaultMode === "function") s.setShiftDefaultMode(g.getShiftDefaultMode());
    s.setAttendanceStatisticsEnabled(g.getAttendanceStatisticsEnabled());
    s.setWorkflowNotificationEnabled(g.getWorkflowNotificationEnabled());
    const announcement = g.getTimeRecorderAnnouncement();
    s.setTimeRecorderAnnouncementEnabled(announcement.enabled);
    s.setTimeRecorderAnnouncementMessage(announcement.message);
    if (typeof g.getAmHolidayStartTime === "function" && g.getAmHolidayStartTime()) s.setAmHolidayStartTime(g.getAmHolidayStartTime());
    if (typeof g.getAmHolidayEndTime === "function" && g.getAmHolidayEndTime()) s.setAmHolidayEndTime(g.getAmHolidayEndTime());
    if (typeof g.getPmHolidayStartTime === "function" && g.getPmHolidayStartTime()) s.setPmHolidayStartTime(g.getPmHolidayStartTime());
    if (typeof g.getPmHolidayEndTime === "function" && g.getPmHolidayEndTime()) s.setPmHolidayEndTime(g.getPmHolidayEndTime());
    if (typeof g.getAmPmHolidayEnabled === "function") s.setAmPmHolidayEnabled(g.getAmPmHolidayEnabled());
}

type AdminConfigSaveDeps = {
    saveConfig: (payload: CreateAppConfigInput | UpdateAppConfigInput) => Promise<void>;
    dispatch: ReturnType<typeof useAppDispatchV2>;
    fetchConfig: () => Promise<void>;
};

type AdminConfigFormValues = {
    id: string | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    lunchRestStartTime: Dayjs | null;
    lunchRestEndTime: Dayjs | null;
    amHolidayStartTime: Dayjs | null;
    amHolidayEndTime: Dayjs | null;
    pmHolidayStartTime: Dayjs | null;
    pmHolidayEndTime: Dayjs | null;
    links: LinkItem[];
    reasons: ReasonItem[];
    quickInputStartTimes: QuickInputEntry[];
    quickInputEndTimes: QuickInputEntry[];
    officeMode: boolean;
    absentEnabled: boolean;
    hourlyPaidHolidayEnabled: boolean;
    amPmHolidayEnabled: boolean;
    specialHolidayEnabled: boolean;
    attendanceStatisticsEnabled: boolean;
    workflowNotificationEnabled: boolean;
    timeRecorderAnnouncementEnabled: boolean;
    timeRecorderAnnouncementMessage: string;
    overTimeCheckEnabled: boolean;
    shiftCollaborativeEnabled: boolean;
    shiftDefaultMode: ShiftDisplayMode;
};

async function executeAdminConfigSave(
    formValues: AdminConfigFormValues,
    deps: { saveConfig: AdminConfigSaveDeps["saveConfig"]; dispatch: AdminConfigSaveDeps["dispatch"]; fetchConfig: AdminConfigSaveDeps["fetchConfig"] },
) {
    const validationResult = validateAdminConfigForm({
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        lunchRestStartTime: formValues.lunchRestStartTime,
        lunchRestEndTime: formValues.lunchRestEndTime,
        amHolidayStartTime: formValues.amHolidayStartTime,
        amHolidayEndTime: formValues.amHolidayEndTime,
        pmHolidayStartTime: formValues.pmHolidayStartTime,
        pmHolidayEndTime: formValues.pmHolidayEndTime,
    });
    if (!validationResult.isValid) {
        deps.dispatch(pushNotification({ tone: "error", message: validationResult.errorMessage! }));
        return;
    }
    const formState = {
        id: formValues.id,
        links: formValues.links,
        reasons: formValues.reasons,
        quickInputStartTimes: formValues.quickInputStartTimes,
        quickInputEndTimes: formValues.quickInputEndTimes,
        officeMode: formValues.officeMode,
        absentEnabled: formValues.absentEnabled,
        hourlyPaidHolidayEnabled: formValues.hourlyPaidHolidayEnabled,
        amPmHolidayEnabled: formValues.amPmHolidayEnabled,
        specialHolidayEnabled: formValues.specialHolidayEnabled,
        attendanceStatisticsEnabled: formValues.attendanceStatisticsEnabled,
        workflowNotificationEnabled: formValues.workflowNotificationEnabled,
        timeRecorderAnnouncementEnabled: formValues.timeRecorderAnnouncementEnabled,
        timeRecorderAnnouncementMessage: formValues.timeRecorderAnnouncementMessage,
        overTimeCheckEnabled: formValues.overTimeCheckEnabled,
        shiftCollaborativeEnabled: formValues.shiftCollaborativeEnabled,
        shiftDefaultMode: formValues.shiftDefaultMode,
        startTime: formValues.startTime!,
        endTime: formValues.endTime!,
        lunchRestStartTime: formValues.lunchRestStartTime!,
        lunchRestEndTime: formValues.lunchRestEndTime!,
        amHolidayStartTime: formValues.amHolidayStartTime!,
        amHolidayEndTime: formValues.amHolidayEndTime!,
        pmHolidayStartTime: formValues.pmHolidayStartTime!,
        pmHolidayEndTime: formValues.pmHolidayEndTime!,
    };
    try {
        if (formValues.id) {
            await deps.saveConfig(buildUpdatePayload(formState));
            deps.dispatch(pushNotification({ tone: "success", message: S14002 }));
        } else {
            await deps.saveConfig(buildCreatePayload(formState));
            deps.dispatch(pushNotification({ tone: "success", message: S14001 }));
        }
        await deps.fetchConfig();
    } catch {
        deps.dispatch(pushNotification({ tone: "error", message: E14001 }));
    }
}

export function useAdminConfigForm() {
    const { fetchConfig, saveConfig, getStartTime, getEndTime, getConfigId, getLinks, getReasons, getOfficeMode, getQuickInputStartTimes, getQuickInputEndTimes, getLunchRestStartTime, getLunchRestEndTime, getHourlyPaidHolidayEnabled, getAmHolidayStartTime, getAmHolidayEndTime, getPmHolidayStartTime, getPmHolidayEndTime, getAmPmHolidayEnabled, getSpecialHolidayEnabled, getAbsentEnabled, getAttendanceStatisticsEnabled, getWorkflowNotificationEnabled, getTimeRecorderAnnouncement, getOverTimeCheckEnabled, getShiftCollaborativeEnabled, getShiftDefaultMode, getThemeTokens, } = useContext(AppConfigContext);
    const adminPanelTokens = useMemo(() => getThemeTokens(), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);
    const sectionSpacing = adminPanelTokens.component.adminPanel.sectionSpacing;
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [quickInputStartTimes, setQuickInputStartTimes] = useState<QuickInputEntry[]>([]);
    const [quickInputEndTimes, setQuickInputEndTimes] = useState<QuickInputEntry[]>([]);
    const [id, setId] = useState<string | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [reasons, setReasons] = useState<ReasonItem[]>([]);
    const [officeMode, setOfficeMode] = useState<boolean>(false);
    const [lunchRestStartTime, setLunchRestStartTime] = useState<Dayjs | null>(null);
    const [lunchRestEndTime, setLunchRestEndTime] = useState<Dayjs | null>(null);
    const [hourlyPaidHolidayEnabled, setHourlyPaidHolidayEnabled] = useState<boolean>(false);
    const [amHolidayStartTime, setAmHolidayStartTime] = useState<Dayjs | null>(dayjs(DEFAULT_AM_HOLIDAY_START, TIME_FORMAT));
    const [amHolidayEndTime, setAmHolidayEndTime] = useState<Dayjs | null>(dayjs(DEFAULT_AM_HOLIDAY_END, TIME_FORMAT));
    const [pmHolidayStartTime, setPmHolidayStartTime] = useState<Dayjs | null>(dayjs(DEFAULT_PM_HOLIDAY_START, TIME_FORMAT));
    const [pmHolidayEndTime, setPmHolidayEndTime] = useState<Dayjs | null>(dayjs(DEFAULT_PM_HOLIDAY_END, TIME_FORMAT));
    const [attendanceStatisticsEnabled, setAttendanceStatisticsEnabled] = useState<boolean>(false);
    const [workflowNotificationEnabled, setWorkflowNotificationEnabled] = useState<boolean>(false);
    const [timeRecorderAnnouncementEnabled, setTimeRecorderAnnouncementEnabled] = useState<boolean>(false);
    const [timeRecorderAnnouncementMessage, setTimeRecorderAnnouncementMessage] = useState<string>("");
    const [amPmHolidayEnabled, setAmPmHolidayEnabled] = useState<boolean>(true);
    const [specialHolidayEnabled, setSpecialHolidayEnabled] = useState<boolean>(false);
    const [absentEnabled, setAbsentEnabled] = useState<boolean>(false);
    const [overTimeCheckEnabled, setOverTimeCheckEnabled] = useState<boolean>(false);
    const [shiftCollaborativeEnabled, setShiftCollaborativeEnabled] = useState<boolean>(false);
    const [shiftDefaultMode, setShiftDefaultMode] = useState<ShiftDisplayMode>("normal");
    const dispatch = useAppDispatchV2();
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        hydrateAdminConfigFormState(
            { getStartTime, getEndTime, getConfigId, getLinks, getReasons, getOfficeMode, getQuickInputStartTimes, getQuickInputEndTimes, getLunchRestStartTime, getLunchRestEndTime, getHourlyPaidHolidayEnabled, getSpecialHolidayEnabled, getAbsentEnabled, getOverTimeCheckEnabled, getShiftCollaborativeEnabled, getShiftDefaultMode, getAttendanceStatisticsEnabled, getWorkflowNotificationEnabled, getTimeRecorderAnnouncement, getAmHolidayStartTime, getAmHolidayEndTime, getPmHolidayStartTime, getPmHolidayEndTime, getAmPmHolidayEnabled },
            { setStartTime, setEndTime, setId, setLinks, setReasons, setOfficeMode, setQuickInputStartTimes, setQuickInputEndTimes, setLunchRestStartTime, setLunchRestEndTime, setHourlyPaidHolidayEnabled, setAmHolidayStartTime, setAmHolidayEndTime, setPmHolidayStartTime, setPmHolidayEndTime, setAmPmHolidayEnabled, setSpecialHolidayEnabled, setAbsentEnabled, setOverTimeCheckEnabled, setShiftCollaborativeEnabled, setShiftDefaultMode, setAttendanceStatisticsEnabled, setWorkflowNotificationEnabled, setTimeRecorderAnnouncementEnabled, setTimeRecorderAnnouncementMessage },
        );
    }, []);
    const handleAddLink = () => {
        setLinks(appendItem(links, { label: "", url: "", enabled: true, icon: "" }));
    };
    const handleLinkChange = (index: number, field: keyof LinkItem, value: string | boolean) => {
        setLinks(updateItem(links, index, (link) => ({
            ...link,
            [field]: value,
        }) as LinkItem));
    };
    const handleRemoveLink = (index: number) => {
        setLinks(removeItemAt(links, index));
    };
    const handleAddReason = () => {
        setReasons(appendItem(reasons, { reason: "", enabled: true }));
    };
    const handleReasonChange = (index: number, field: keyof ReasonItem, value: string | boolean) => {
        setReasons(updateItem(reasons, index, (reason) => ({
            ...reason,
            [field]: value,
        }) as ReasonItem));
    };
    const handleRemoveReason = (index: number) => {
        setReasons(removeItemAt(reasons, index));
    };
    const handleOfficeModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOfficeMode(event.target.checked);
    };
    const handleAddQuickInputStartTime = () => {
        setQuickInputStartTimes(appendItem(quickInputStartTimes, { time: dayjs(), enabled: true }));
    };
    const handleQuickInputStartTimeChange = (index: number, newValue: Dayjs | null) => {
        if (!newValue)
            return;
        setQuickInputStartTimes(updateItem(quickInputStartTimes, index, (entry) => ({
            ...entry,
            time: newValue,
        })));
    };
    const handleQuickInputStartTimeToggle = (index: number) => {
        setQuickInputStartTimes(toggleEnabledAt(quickInputStartTimes, index));
    };
    const handleRemoveQuickInputStartTime = (index: number) => {
        setQuickInputStartTimes(removeItemAt(quickInputStartTimes, index));
    };
    const handleAddQuickInputEndTime = () => {
        setQuickInputEndTimes(appendItem(quickInputEndTimes, { time: dayjs(), enabled: true }));
    };
    const handleQuickInputEndTimeChange = (index: number, newValue: Dayjs | null) => {
        if (!newValue)
            return;
        setQuickInputEndTimes(updateItem(quickInputEndTimes, index, (entry) => ({
            ...entry,
            time: newValue,
        })));
    };
    const handleQuickInputEndTimeToggle = (index: number) => {
        setQuickInputEndTimes(toggleEnabledAt(quickInputEndTimes, index));
    };
    const handleRemoveQuickInputEndTime = (index: number) => {
        setQuickInputEndTimes(removeItemAt(quickInputEndTimes, index));
    };
    const handleHourlyPaidHolidayEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHourlyPaidHolidayEnabled(event.target.checked);
    };
    const handleSpecialHolidayEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSpecialHolidayEnabled(event.target.checked);
    };
    const handleAbsentEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAbsentEnabled(event.target.checked);
    };
    const handleAttendanceStatisticsEnabledChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setAttendanceStatisticsEnabled(checked);
    };
    const handleOverTimeCheckEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOverTimeCheckEnabled(event.target.checked);
    };
    const handleWorkflowNotificationEnabledChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setWorkflowNotificationEnabled(checked);
    };
    const handleShiftCollaborativeEnabledChange = (event: ChangeEvent<HTMLInputElement>) => {
        const enabled = event.target.checked;
        setShiftCollaborativeEnabled(enabled);
        if (!enabled) {
            setShiftDefaultMode("normal");
        }
    };
    const handleShiftDefaultModeChange = (mode: ShiftDisplayMode) => {
        setShiftDefaultMode(mode);
    };
    const handleSave = async () => {
        await executeAdminConfigSave(
            { id, startTime, endTime, lunchRestStartTime, lunchRestEndTime, amHolidayStartTime, amHolidayEndTime, pmHolidayStartTime, pmHolidayEndTime, links, reasons, quickInputStartTimes, quickInputEndTimes, officeMode, absentEnabled, hourlyPaidHolidayEnabled, amPmHolidayEnabled, specialHolidayEnabled, attendanceStatisticsEnabled, workflowNotificationEnabled, timeRecorderAnnouncementEnabled, timeRecorderAnnouncementMessage, overTimeCheckEnabled, shiftCollaborativeEnabled, shiftDefaultMode },
            { saveConfig, dispatch, fetchConfig },
        );
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
        workflowNotificationEnabled,
        timeRecorderAnnouncementEnabled,
        timeRecorderAnnouncementMessage,
        overTimeCheckEnabled,
        shiftCollaborativeEnabled,
        shiftDefaultMode,
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
        handleWorkflowNotificationEnabledChange,
        setTimeRecorderAnnouncementEnabled,
        setTimeRecorderAnnouncementMessage,
        handleOverTimeCheckEnabledChange,
        handleShiftCollaborativeEnabledChange,
        handleShiftDefaultModeChange,
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
