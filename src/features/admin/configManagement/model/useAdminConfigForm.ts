import { useAppDispatchV2 } from "@app/hooks";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import { appendItem, removeItemAt, toggleEnabledAt, updateItem, } from "@features/admin/configManagement/lib/arrayHelpers";
import { type AdminConfigFormState, createAdminConfigFormState, type LinkItem, type QuickInputEntry, type ReasonItem, } from "@features/admin/configManagement/lib/formState";
import { buildCreatePayload, buildUpdatePayload, } from "@features/admin/configManagement/lib/payloadHelpers";
import { validateAdminConfigForm } from "@features/admin/configManagement/lib/validation";
import type { CreateAppConfigInput, UpdateAppConfigInput } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useContext, useState } from "react";

import { E14001, S14001, S14002 } from "@/errors";

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

function resolveSetStateAction<T>(value: SetStateAction<T>, current: T): T {
    return typeof value === "function"
        ? (value as (prev: T) => T)(current)
        : value;
}

type AdminConfigStateSetters = {
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

function createAdminConfigStateSetters(
    setFormState: Dispatch<SetStateAction<AdminConfigFormState>>,
): AdminConfigStateSetters {
    return {
        setStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                startTime: resolveSetStateAction(value, prev.startTime),
            })),
        setEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                endTime: resolveSetStateAction(value, prev.endTime),
            })),
        setLunchRestStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                lunchRestStartTime: resolveSetStateAction(
                    value,
                    prev.lunchRestStartTime,
                ),
            })),
        setLunchRestEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                lunchRestEndTime: resolveSetStateAction(
                    value,
                    prev.lunchRestEndTime,
                ),
            })),
        setAmHolidayStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                amHolidayStartTime: resolveSetStateAction(
                    value,
                    prev.amHolidayStartTime,
                ),
            })),
        setAmHolidayEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                amHolidayEndTime: resolveSetStateAction(
                    value,
                    prev.amHolidayEndTime,
                ),
            })),
        setPmHolidayStartTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                pmHolidayStartTime: resolveSetStateAction(
                    value,
                    prev.pmHolidayStartTime,
                ),
            })),
        setPmHolidayEndTime: (value) =>
            setFormState((prev) => ({
                ...prev,
                pmHolidayEndTime: resolveSetStateAction(
                    value,
                    prev.pmHolidayEndTime,
                ),
            })),
        setAmPmHolidayEnabled: (value) =>
            setFormState((prev) => ({
                ...prev,
                amPmHolidayEnabled: resolveSetStateAction(
                    value,
                    prev.amPmHolidayEnabled,
                ),
            })),
        setTimeRecorderAnnouncementEnabled: (value) =>
            setFormState((prev) => ({
                ...prev,
                timeRecorderAnnouncementEnabled: resolveSetStateAction(
                    value,
                    prev.timeRecorderAnnouncementEnabled,
                ),
            })),
        setTimeRecorderAnnouncementMessage: (value) =>
            setFormState((prev) => ({
                ...prev,
                timeRecorderAnnouncementMessage: resolveSetStateAction(
                    value,
                    prev.timeRecorderAnnouncementMessage,
                ),
            })),
    };
}

type AdminConfigActionHandlers = {
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

function createAdminConfigActionHandlers(
    setFormState: Dispatch<SetStateAction<AdminConfigFormState>>,
): AdminConfigActionHandlers {
    return {
        handleAddLink: () => {
            setFormState((prev) => ({
                ...prev,
                links: appendItem(prev.links, {
                    label: "",
                    url: "",
                    enabled: true,
                    icon: "",
                }),
            }));
        },
        handleLinkChange: (index, field, value) => {
            setFormState((prev) => ({
                ...prev,
                links: updateItem(prev.links, index, (link) => ({
                    ...link,
                    [field]: value,
                }) as LinkItem),
            }));
        },
        handleRemoveLink: (index) => {
            setFormState((prev) => ({
                ...prev,
                links: removeItemAt(prev.links, index),
            }));
        },
        handleAddReason: () => {
            setFormState((prev) => ({
                ...prev,
                reasons: appendItem(prev.reasons, {
                    reason: "",
                    enabled: true,
                }),
            }));
        },
        handleReasonChange: (index, field, value) => {
            setFormState((prev) => ({
                ...prev,
                reasons: updateItem(prev.reasons, index, (reason) => ({
                    ...reason,
                    [field]: value,
                }) as ReasonItem),
            }));
        },
        handleRemoveReason: (index) => {
            setFormState((prev) => ({
                ...prev,
                reasons: removeItemAt(prev.reasons, index),
            }));
        },
        handleOfficeModeChange: (event) => {
            setFormState((prev) => ({
                ...prev,
                officeMode: event.target.checked,
            }));
        },
        handleAddQuickInputStartTime: () => {
            setFormState((prev) => ({
                ...prev,
                quickInputStartTimes: appendItem(prev.quickInputStartTimes, {
                    time: dayjs(),
                    enabled: true,
                }),
            }));
        },
        handleQuickInputStartTimeChange: (index, newValue) => {
            if (!newValue) {
                return;
            }
            setFormState((prev) => ({
                ...prev,
                quickInputStartTimes: updateItem(
                    prev.quickInputStartTimes,
                    index,
                    (entry) => ({
                        ...entry,
                        time: newValue,
                    }),
                ),
            }));
        },
        handleQuickInputStartTimeToggle: (index) => {
            setFormState((prev) => ({
                ...prev,
                quickInputStartTimes: toggleEnabledAt(
                    prev.quickInputStartTimes,
                    index,
                ),
            }));
        },
        handleRemoveQuickInputStartTime: (index) => {
            setFormState((prev) => ({
                ...prev,
                quickInputStartTimes: removeItemAt(
                    prev.quickInputStartTimes,
                    index,
                ),
            }));
        },
        handleAddQuickInputEndTime: () => {
            setFormState((prev) => ({
                ...prev,
                quickInputEndTimes: appendItem(prev.quickInputEndTimes, {
                    time: dayjs(),
                    enabled: true,
                }),
            }));
        },
        handleQuickInputEndTimeChange: (index, newValue) => {
            if (!newValue) {
                return;
            }
            setFormState((prev) => ({
                ...prev,
                quickInputEndTimes: updateItem(
                    prev.quickInputEndTimes,
                    index,
                    (entry) => ({
                        ...entry,
                        time: newValue,
                    }),
                ),
            }));
        },
        handleQuickInputEndTimeToggle: (index) => {
            setFormState((prev) => ({
                ...prev,
                quickInputEndTimes: toggleEnabledAt(prev.quickInputEndTimes, index),
            }));
        },
        handleRemoveQuickInputEndTime: (index) => {
            setFormState((prev) => ({
                ...prev,
                quickInputEndTimes: removeItemAt(prev.quickInputEndTimes, index),
            }));
        },
        handleHourlyPaidHolidayEnabledChange: (event) => {
            setFormState((prev) => ({
                ...prev,
                hourlyPaidHolidayEnabled: event.target.checked,
            }));
        },
        handleSpecialHolidayEnabledChange: (event) => {
            setFormState((prev) => ({
                ...prev,
                specialHolidayEnabled: event.target.checked,
            }));
        },
        handleAbsentEnabledChange: (event) => {
            setFormState((prev) => ({
                ...prev,
                absentEnabled: event.target.checked,
            }));
        },
        handleAttendanceStatisticsEnabledChange: (_event, checked) => {
            setFormState((prev) => ({
                ...prev,
                attendanceStatisticsEnabled: checked,
            }));
        },
        handleOverTimeCheckEnabledChange: (event) => {
            setFormState((prev) => ({
                ...prev,
                overTimeCheckEnabled: event.target.checked,
            }));
        },
        handleWorkflowNotificationEnabledChange: (_event, checked) => {
            setFormState((prev) => ({
                ...prev,
                workflowNotificationEnabled: checked,
            }));
        },
        handleShiftCollaborativeEnabledChange: (event) => {
            const enabled = event.target.checked;
            setFormState((prev) => ({
                ...prev,
                shiftCollaborativeEnabled: enabled,
                shiftDefaultMode: enabled ? prev.shiftDefaultMode : "normal",
            }));
        },
        handleShiftDefaultModeChange: (mode) => {
            setFormState((prev) => ({
                ...prev,
                shiftDefaultMode: mode,
            }));
        },
    };
}

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
    const sectionSpacing = getThemeTokens().component.adminPanel.sectionSpacing;
    const [formState, setFormState] = useState<AdminConfigFormState>(() =>
        createAdminConfigFormState({
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
            getOverTimeCheckEnabled,
            getShiftCollaborativeEnabled,
            getShiftDefaultMode,
            getAttendanceStatisticsEnabled,
            getWorkflowNotificationEnabled,
            getTimeRecorderAnnouncement,
        }),
    );
    const dispatch = useAppDispatchV2();
    const handleSave = async () => {
        await executeAdminConfigSave(
            formState,
            { saveConfig, dispatch, fetchConfig },
        );
    };
    const stateSetters = createAdminConfigStateSetters(setFormState);
    const actionHandlers = createAdminConfigActionHandlers(setFormState);
    return {
        sectionSpacing,
        ...formState,
        ...stateSetters,
        ...actionHandlers,
        handleSave,
    };
}
