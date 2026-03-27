import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import { appendItem, removeItemAt, updateItem } from "@/features/admin/configManagement/lib/arrayHelpers";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import ReasonListSection from "./ReasonListSection";

export default function Reasons() {
  const { getReasons, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [reasons, setReasons] = useState<
    { reason: string; enabled: boolean }[]
  >([]);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReasons(getReasons());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getReasons, getConfigId]);

  const handleAddReason = () =>
    setReasons(appendItem(reasons, { reason: "", enabled: true }));

  const handleReasonChange = (
    index: number,
    field: "reason" | "enabled",
    value: string | boolean
  ) => {
    setReasons(
      updateItem(reasons, index, (r) => ({ ...r, [field]: value } as typeof r))
    );
  };

  const handleRemoveReason = (index: number) =>
    setReasons(removeItemAt(reasons, index));

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          reasons: reasons.map((r) => ({
            reason: r.reason,
            enabled: r.enabled,
          })),
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          reasons: reasons.map((r) => ({
            reason: r.reason,
            enabled: r.enabled,
          })),
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <AdminSettingsLayout
      title="修正理由"
      description="修正理由のテキスト一覧を管理してください。"
    >
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
        <ReasonListSection
          reasons={reasons}
          onAddReason={handleAddReason}
          onReasonChange={handleReasonChange}
          onRemoveReason={handleRemoveReason}
        />
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
