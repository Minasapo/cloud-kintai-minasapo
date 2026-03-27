import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
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

export default function OvertimeConfirmation() {
  const { getOverTimeCheckEnabled, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (typeof getOverTimeCheckEnabled === "function") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(getOverTimeCheckEnabled());
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getOverTimeCheckEnabled, getConfigId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          overTimeCheckEnabled: enabled,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          overTimeCheckEnabled: enabled,
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <AdminSettingsLayout title="残業確認">
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
        <div className="flex flex-col gap-4">
          <div>
            <FormControlLabel
              control={
                <Switch checked={enabled} onChange={handleChange} color="primary" />
              }
              label={enabled ? "有効" : "無効"}
            />
          </div>
          <p className="text-sm text-slate-500">
            勤怠編集画面で、残業申請がない場合や承認時間を超えた場合に確認メッセージを表示するかどうかを切り替えます。
          </p>
        </div>
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
