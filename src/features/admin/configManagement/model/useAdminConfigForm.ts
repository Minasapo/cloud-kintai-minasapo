import { useAppDispatchV2 } from "@app/hooks";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { type AdminConfigFormState, createAdminConfigFormState } from "@features/admin/configManagement/lib/formState";
import { useContext, useState } from "react";

import { createAdminConfigActionHandlers } from "./adminConfigActionHandlers";
import { executeAdminConfigSave } from "./adminConfigSave";
import { createAdminConfigStateSetters } from "./adminConfigStateSetters";

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
        getWorkflowNotificationEnabled,
        getTimeRecorderAnnouncement,
        getOverTimeCheckEnabled,
        getShiftCollaborativeEnabled,
        getShiftDefaultMode,
        getThemeTokens,
    } = useContext(AppConfigContext);

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
        await executeAdminConfigSave(formState, {
            saveConfig,
            dispatch,
            fetchConfig,
        });
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