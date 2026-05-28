import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import { DEFAULT_AM_HOLIDAY_END, DEFAULT_AM_HOLIDAY_START, DEFAULT_PM_HOLIDAY_END, DEFAULT_PM_HOLIDAY_START, TIME_FORMAT, } from "@features/admin/configManagement/lib/constants";
import dayjs, { type Dayjs } from "dayjs";

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

export type WorkingTimeState = {
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    lunchRestStartTime: Dayjs | null;
    lunchRestEndTime: Dayjs | null;
};

export type QuickInputState = {
    quickInputStartTimes: QuickInputEntry[];
    quickInputEndTimes: QuickInputEntry[];
};

export type OfficeModeState = {
    officeMode: boolean;
    hourlyPaidHolidayEnabled: boolean;
};

export type AmPmHolidayState = {
    amHolidayStartTime: Dayjs | null;
    amHolidayEndTime: Dayjs | null;
    pmHolidayStartTime: Dayjs | null;
    pmHolidayEndTime: Dayjs | null;
    amPmHolidayEnabled: boolean;
};

export type AdminConfigFormState = WorkingTimeState &
    QuickInputState & {
        id: string | null;
        links: LinkItem[];
        reasons: ReasonItem[];
        officeMode: boolean;
        hourlyPaidHolidayEnabled: boolean;
        amHolidayStartTime: Dayjs | null;
        amHolidayEndTime: Dayjs | null;
        pmHolidayStartTime: Dayjs | null;
        pmHolidayEndTime: Dayjs | null;
        attendanceStatisticsEnabled: boolean;
        workflowNotificationEnabled: boolean;
        timeRecorderAnnouncementEnabled: boolean;
        timeRecorderAnnouncementMessage: string;
        amPmHolidayEnabled: boolean;
        specialHolidayEnabled: boolean;
        absentEnabled: boolean;
        overTimeCheckEnabled: boolean;
        shiftCollaborativeEnabled: boolean;
        shiftDefaultMode: ShiftDisplayMode;
    };

export type AdminConfigGetters = {
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
    getAmHolidayStartTime?: () => Dayjs | null;
    getAmHolidayEndTime?: () => Dayjs | null;
    getPmHolidayStartTime?: () => Dayjs | null;
    getPmHolidayEndTime?: () => Dayjs | null;
    getAmPmHolidayEnabled?: () => boolean;
    getSpecialHolidayEnabled?: () => boolean;
    getAbsentEnabled?: () => boolean;
    getOverTimeCheckEnabled?: () => boolean;
    getShiftCollaborativeEnabled?: () => boolean;
    getShiftDefaultMode?: () => ShiftDisplayMode;
    getAttendanceStatisticsEnabled: () => boolean;
    getWorkflowNotificationEnabled: () => boolean;
    getTimeRecorderAnnouncement: () => { enabled: boolean; message: string };
};

function mapQuickInputEntries(
    entries: { time: string; enabled: boolean }[],
): QuickInputEntry[] {
    return entries.map((entry) => ({
        time: dayjs(entry.time, TIME_FORMAT),
        enabled: entry.enabled,
    }));
}

export function createWorkingTimeState(getters: {
    getStartTime: () => Dayjs;
    getEndTime: () => Dayjs;
    getLunchRestStartTime: () => Dayjs;
    getLunchRestEndTime: () => Dayjs;
}): WorkingTimeState {
    return {
        startTime: getters.getStartTime(),
        endTime: getters.getEndTime(),
        lunchRestStartTime: getters.getLunchRestStartTime(),
        lunchRestEndTime: getters.getLunchRestEndTime(),
    };
}

export function createQuickInputState(getters: {
    getQuickInputStartTimes: (onlyEnabled?: boolean) => { time: string; enabled: boolean }[];
    getQuickInputEndTimes: (onlyEnabled?: boolean) => { time: string; enabled: boolean }[];
}): QuickInputState {
    return {
        quickInputStartTimes: mapQuickInputEntries(getters.getQuickInputStartTimes()),
        quickInputEndTimes: mapQuickInputEntries(getters.getQuickInputEndTimes()),
    };
}

export function createOfficeModeState(getters: {
    getOfficeMode: () => boolean;
    getHourlyPaidHolidayEnabled: () => boolean;
}): OfficeModeState {
    return {
        officeMode: getters.getOfficeMode(),
        hourlyPaidHolidayEnabled: getters.getHourlyPaidHolidayEnabled(),
    };
}

export function createAmPmHolidayState(getters: {
    getAmHolidayStartTime?: () => Dayjs | null;
    getAmHolidayEndTime?: () => Dayjs | null;
    getPmHolidayStartTime?: () => Dayjs | null;
    getPmHolidayEndTime?: () => Dayjs | null;
    getAmPmHolidayEnabled?: () => boolean;
}): AmPmHolidayState {
    return {
        amHolidayStartTime:
            getters.getAmHolidayStartTime?.() ??
            dayjs(DEFAULT_AM_HOLIDAY_START, TIME_FORMAT),
        amHolidayEndTime:
            getters.getAmHolidayEndTime?.() ??
            dayjs(DEFAULT_AM_HOLIDAY_END, TIME_FORMAT),
        pmHolidayStartTime:
            getters.getPmHolidayStartTime?.() ??
            dayjs(DEFAULT_PM_HOLIDAY_START, TIME_FORMAT),
        pmHolidayEndTime:
            getters.getPmHolidayEndTime?.() ??
            dayjs(DEFAULT_PM_HOLIDAY_END, TIME_FORMAT),
        amPmHolidayEnabled: getters.getAmPmHolidayEnabled?.() ?? true,
    };
}

export function createAdminConfigFormState(getters: AdminConfigGetters): AdminConfigFormState {
    const workingTimeState = createWorkingTimeState(getters);
    const quickInputState = createQuickInputState(getters);
    const amPmHolidayState = createAmPmHolidayState(getters);
    const timeRecorderAnnouncement = getters.getTimeRecorderAnnouncement();

    return {
        ...workingTimeState,
        ...quickInputState,
        id: getters.getConfigId(),
        links: getters.getLinks(),
        reasons: getters.getReasons(),
        officeMode: getters.getOfficeMode(),
        hourlyPaidHolidayEnabled: getters.getHourlyPaidHolidayEnabled(),
        amHolidayStartTime: amPmHolidayState.amHolidayStartTime,
        amHolidayEndTime: amPmHolidayState.amHolidayEndTime,
        pmHolidayStartTime: amPmHolidayState.pmHolidayStartTime,
        pmHolidayEndTime: amPmHolidayState.pmHolidayEndTime,
        attendanceStatisticsEnabled: getters.getAttendanceStatisticsEnabled(),
        workflowNotificationEnabled: getters.getWorkflowNotificationEnabled(),
        timeRecorderAnnouncementEnabled: timeRecorderAnnouncement.enabled,
        timeRecorderAnnouncementMessage: timeRecorderAnnouncement.message,
        amPmHolidayEnabled: amPmHolidayState.amPmHolidayEnabled,
        specialHolidayEnabled: getters.getSpecialHolidayEnabled?.() ?? false,
        absentEnabled: getters.getAbsentEnabled?.() ?? false,
        overTimeCheckEnabled: getters.getOverTimeCheckEnabled?.() ?? false,
        shiftCollaborativeEnabled: getters.getShiftCollaborativeEnabled?.() ?? false,
        shiftDefaultMode: getters.getShiftDefaultMode?.() ?? "normal",
    };
}

function serializeQuickInputEntries(entries: QuickInputEntry[]) {
    return entries
        .map((entry) => `${entry.time.format(TIME_FORMAT)}:${entry.enabled ? "1" : "0"}`)
        .join("|");
}

export function getWorkingTimeStateKey(state: WorkingTimeState) {
    return [
        state.startTime?.format(TIME_FORMAT) ?? "",
        state.endTime?.format(TIME_FORMAT) ?? "",
        state.lunchRestStartTime?.format(TIME_FORMAT) ?? "",
        state.lunchRestEndTime?.format(TIME_FORMAT) ?? "",
    ].join("|");
}

export function getQuickInputStateKey(state: QuickInputState) {
    return [
        serializeQuickInputEntries(state.quickInputStartTimes),
        serializeQuickInputEntries(state.quickInputEndTimes),
    ].join("::");
}

export function getOfficeModeStateKey(state: OfficeModeState) {
    return `${state.officeMode ? "1" : "0"}:${state.hourlyPaidHolidayEnabled ? "1" : "0"}`;
}

export function getAmPmHolidayStateKey(state: AmPmHolidayState) {
    return [
        state.amHolidayStartTime?.format(TIME_FORMAT) ?? "",
        state.amHolidayEndTime?.format(TIME_FORMAT) ?? "",
        state.pmHolidayStartTime?.format(TIME_FORMAT) ?? "",
        state.pmHolidayEndTime?.format(TIME_FORMAT) ?? "",
        state.amPmHolidayEnabled ? "1" : "0",
    ].join("|");
}
