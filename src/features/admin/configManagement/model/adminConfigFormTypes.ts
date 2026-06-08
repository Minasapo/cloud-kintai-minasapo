import type { useAppDispatchV2 } from "@app/hooks";
import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import type { LinkItem, QuickInputEntry, ReasonItem } from "@features/admin/configManagement/lib/formState";
import type { CreateAppConfigInput, UpdateAppConfigInput } from "@shared/api/graphql/types";
import type { Dayjs } from "dayjs";
import type { ChangeEvent, SetStateAction  } from "react";

export type AdminConfigSaveDeps = {
    saveConfig: (payload: CreateAppConfigInput | UpdateAppConfigInput) => Promise<void>;
    dispatch: ReturnType<typeof useAppDispatchV2>;
    fetchConfig: () => Promise<void>;
};

export type AdminConfigFormValues = {
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

export type AdminConfigStateSetters = {
    setStartTime: (value: SetStateAction<Dayjs | null>) => void;
    setEndTime: (value: SetStateAction<Dayjs | null>) => void;
    setLunchRestStartTime: (value: SetStateAction<Dayjs | null>) => void;
    setLunchRestEndTime: (value: SetStateAction<Dayjs | null>) => void;
    setAmHolidayStartTime: (value: SetStateAction<Dayjs | null>) => void;
    setAmHolidayEndTime: (value: SetStateAction<Dayjs | null>) => void;
    setPmHolidayStartTime: (value: SetStateAction<Dayjs | null>) => void;
    setPmHolidayEndTime: (value: SetStateAction<Dayjs | null>) => void;
    setAmPmHolidayEnabled: (value: SetStateAction<boolean>) => void;
    setTimeRecorderAnnouncementEnabled: (value: SetStateAction<boolean>) => void;
    setTimeRecorderAnnouncementMessage: (value: SetStateAction<string>) => void;
};

export type AdminConfigActionHandlers = {
    handleAddLink: () => void;
    handleLinkChange: (
        index: number,
        field: keyof LinkItem,
        value: string | boolean,
    ) => void;
    handleRemoveLink: (index: number) => void;
    handleAddReason: () => void;
    handleReasonChange: (
        index: number,
        field: keyof ReasonItem,
        value: string | boolean,
    ) => void;
    handleRemoveReason: (index: number) => void;
    handleOfficeModeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleAddQuickInputStartTime: () => void;
    handleQuickInputStartTimeChange: (
        index: number,
        newValue: Dayjs | null,
    ) => void;
    handleQuickInputStartTimeToggle: (index: number) => void;
    handleRemoveQuickInputStartTime: (index: number) => void;
    handleAddQuickInputEndTime: () => void;
    handleQuickInputEndTimeChange: (
        index: number,
        newValue: Dayjs | null,
    ) => void;
    handleQuickInputEndTimeToggle: (index: number) => void;
    handleRemoveQuickInputEndTime: (index: number) => void;
    handleHourlyPaidHolidayEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    handleSpecialHolidayEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    handleAbsentEnabledChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleAttendanceStatisticsEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) => void;
    handleOverTimeCheckEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    handleWorkflowNotificationEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) => void;
    handleShiftCollaborativeEnabledChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    handleShiftDefaultModeChange: (mode: ShiftDisplayMode) => void;
};