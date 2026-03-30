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
import { SettingsButton, SettingsSwitch } from "@/features/admin/layout/ui/SettingsPrimitives";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export default function Absent() {
  const { getAbsentEnabled, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [absentEnabled, setAbsentEnabled] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getAbsentEnabled === "function")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAbsentEnabled(getAbsentEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getAbsentEnabled, getConfigId]);

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          absentEnabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          absentEnabled,
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
        <div className="flex flex-col gap-4">
          <div>
            <SettingsSwitch
              checked={absentEnabled}
              onChange={setAbsentEnabled}
              label={absentEnabled ? "有効" : "無効"}
            />
          </div>
          <p className="text-sm text-slate-500">
            欠勤設定を有効にすると、勤怠編集画面で欠勤の管理が可能になります。
          </p>
        </div>
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
