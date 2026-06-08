import { appendItem, removeItemAt, toggleEnabledAt, updateItem } from "@features/admin/configManagement/lib/arrayHelpers";
import type { AdminConfigFormState, LinkItem, ReasonItem } from "@features/admin/configManagement/lib/formState";
import dayjs from "dayjs";
import type { Dispatch, SetStateAction } from "react";

import type { AdminConfigActionHandlers } from "./adminConfigFormTypes";

export function createAdminConfigActionHandlers(
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
                quickInputStartTimes: removeItemAt(prev.quickInputStartTimes, index),
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