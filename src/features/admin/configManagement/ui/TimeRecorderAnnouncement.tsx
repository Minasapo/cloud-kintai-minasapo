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
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import TimeRecorderAnnouncementSection from "./TimeRecorderAnnouncementSection";

export default function TimeRecorderAnnouncement() {
  const { getTimeRecorderAnnouncement, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const announcement = getTimeRecorderAnnouncement();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(announcement.enabled);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(announcement.message);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getTimeRecorderAnnouncement, getConfigId]);

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          timeRecorderAnnouncementEnabled: enabled,
          timeRecorderAnnouncementMessage: message,
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          timeRecorderAnnouncementEnabled: enabled,
          timeRecorderAnnouncementMessage: message,
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <AdminSettingsLayout title="打刻画面アナウンス">
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
        <TimeRecorderAnnouncementSection
          enabled={enabled}
          message={message}
          onEnabledChange={(_, checked) => setEnabled(checked)}
          onMessageChange={(event) => setMessage(event.target.value)}
        />
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
