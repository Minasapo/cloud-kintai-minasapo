import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import React, { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
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

  const handleOfficeModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOfficeMode(event.target.checked);
  };

  const handleHourlyPaidHolidayEnabledChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHourlyPaidHolidayEnabled(event.target.checked);
  };

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
        actions={
          <button
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            onClick={handleSave}
          >
            保存
          </button>
        }
      >
        <OfficeModeSection
          officeMode={officeMode}
          onOfficeModeChange={handleOfficeModeChange}
          hourlyPaidHolidayEnabled={hourlyPaidHolidayEnabled}
          onHourlyPaidHolidayEnabledChange={
            handleHourlyPaidHolidayEnabledChange
          }
        />
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
