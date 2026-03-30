import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@/features/admin/layout/ui/SettingsPrimitives";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import OfficeModeSection from "./OfficeModeSection";

export default function OfficeMode() {
  const {
    getOfficeMode,
    getHourlyPaidHolidayEnabled,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [officeMode, setOfficeMode] = useState<boolean>(false);
  const [hourlyPaidHolidayEnabled, setHourlyPaidHolidayEnabled] =
    useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOfficeMode(getOfficeMode());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHourlyPaidHolidayEnabled(getHourlyPaidHolidayEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getOfficeMode, getHourlyPaidHolidayEnabled, getConfigId]);

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          officeMode,
          hourlyPaidHolidayEnabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          officeMode,
          hourlyPaidHolidayEnabled,
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <AdminSettingsLayout>
      <AdminSettingsSection
        actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}
      >
        <OfficeModeSection
          officeMode={officeMode}
          onOfficeModeChange={setOfficeMode}
          hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
          onHourlyPaidHolidayEnabledChange={setHourlyPaidHolidayEnabled}
        />
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
