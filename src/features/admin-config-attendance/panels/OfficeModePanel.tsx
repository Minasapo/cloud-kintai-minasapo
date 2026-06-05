import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import OfficeModeSection from "@features/admin/configManagement/ui/OfficeModeSection";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { useCallback, useContext } from "react";

import {
  AutoSaveStatus,
  useAutoSaveObjectState,
} from "../attendanceSettingsHooks";

type OfficeModeState = {
  officeMode: boolean;
  hourlyPaidHolidayEnabled: boolean;
};

export default function OfficeModePanel() {
  const { getOfficeMode, getHourlyPaidHolidayEnabled } =
    useContext(AppConfigContext);
  const getInitialState = useCallback(
    (): OfficeModeState => ({
      officeMode: getOfficeMode(),
      hourlyPaidHolidayEnabled: getHourlyPaidHolidayEnabled(),
    }),
    [getHourlyPaidHolidayEnabled, getOfficeMode],
  );
  const {
    state: { officeMode, hourlyPaidHolidayEnabled },
    updateField,
    saving: autoSaving,
  } = useAutoSaveObjectState<OfficeModeState>({
    getInitialState,
    createPayload: (state) => ({
      officeMode: state.officeMode,
      hourlyPaidHolidayEnabled: state.hourlyPaidHolidayEnabled,
    }),
  });

  return (
    <AdminSettingsSection
      title="出勤モード"
      description="打刻運用方式と時間単位休暇機能を切り替えます。"
      actions={<AutoSaveStatus saving={autoSaving} />}
    >
      <OfficeModeSection
        officeMode={officeMode}
        onOfficeModeChange={(checked) => updateField("officeMode", checked)}
        hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
        onHourlyPaidHolidayEnabledChange={(checked) =>
          updateField("hourlyPaidHolidayEnabled", checked)
        }
      />
    </AdminSettingsSection>
  );
}
