import { CreateAppConfigInput, UpdateAppConfigInput, } from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@/features/admin/layout/ui/SettingsPrimitives";
import { pushNotification } from "@/shared/lib/store/notificationSlice";

import TimeRecorderAnnouncementSection from "./TimeRecorderAnnouncementSection";

export default function TimeRecorderAnnouncement() {
    const { getTimeRecorderAnnouncement, getConfigId, saveConfig, fetchConfig } = useContext(AppConfigContext);
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
                dispatch(pushNotification({
                    tone: "success",
                    message: S14002
                }));
            }
            else {
                await saveConfig({
                    name: "default",
                    timeRecorderAnnouncementEnabled: enabled,
                    timeRecorderAnnouncementMessage: message,
                } as unknown as CreateAppConfigInput);
                dispatch(pushNotification({
                    tone: "success",
                    message: S14001
                }));
            }
            await fetchConfig();
        }
        catch {
            dispatch(pushNotification({
                tone: "error",
                message: E14001
            }));
        }
    };
    return (<AdminSettingsLayout>
      <AdminSettingsSection actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}>
        <TimeRecorderAnnouncementSection enabled={enabled} message={message} onEnabledChange={setEnabled} onMessageChange={setMessage}/>
      </AdminSettingsSection>
    </AdminSettingsLayout>);
}
