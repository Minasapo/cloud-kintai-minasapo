import { buildCreatePayload, buildUpdatePayload } from "@features/admin/configManagement/lib/payloadHelpers";
import { validateAdminConfigForm } from "@features/admin/configManagement/lib/validation";
import { pushNotification } from "@shared/lib/store/notificationSlice";

import { E14001, S14001, S14002 } from "@/errors";

import type { AdminConfigFormValues,AdminConfigSaveDeps } from "./adminConfigFormTypes";

export async function executeAdminConfigSave(
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