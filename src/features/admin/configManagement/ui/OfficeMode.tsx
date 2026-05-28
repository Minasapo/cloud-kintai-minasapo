import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@features/admin/layout/ui/SettingsPrimitives";
import { useContext, useState } from "react";

import { createOfficeModeState, getOfficeModeStateKey, type OfficeModeState } from "../lib/formState";
import { useSaveAppConfigSection } from "../lib/useSaveAppConfigSection";
import OfficeModeSection from "./OfficeModeSection";

export default function OfficeMode() {
  const { getOfficeMode, getHourlyPaidHolidayEnabled } = useContext(AppConfigContext);
  const initialState = createOfficeModeState({ getOfficeMode, getHourlyPaidHolidayEnabled });
  const stateKey = getOfficeModeStateKey(initialState);
  return <OfficeModeContent key={stateKey} initialState={initialState} />;
}

function OfficeModeContent({ initialState }: { initialState: OfficeModeState }) {
  const [officeMode, setOfficeMode] = useState<boolean>(() => initialState.officeMode);
  const [hourlyPaidHolidayEnabled, setHourlyPaidHolidayEnabled] = useState<boolean>(() => initialState.hourlyPaidHolidayEnabled);
  const saveAppConfigSection = useSaveAppConfigSection();
  const handleSave = async () => {
    await saveAppConfigSection({ officeMode, hourlyPaidHolidayEnabled });
  };
    return (<AdminSettingsLayout>
      <AdminSettingsSection actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}>
        <OfficeModeSection officeMode={officeMode} onOfficeModeChange={setOfficeMode} hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled} onHourlyPaidHolidayEnabledChange={setHourlyPaidHolidayEnabled}/>
      </AdminSettingsSection>
    </AdminSettingsLayout>);
}
