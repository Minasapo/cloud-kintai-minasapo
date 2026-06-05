import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@features/admin/layout/ui/SettingsPrimitives";
import { useContext, useState } from "react";

import { useSaveAppConfigSection } from "../lib/useSaveAppConfigSection";
import TimeRecorderAnnouncementSection from "./TimeRecorderAnnouncementSection";

export default function TimeRecorderAnnouncement() {
    const { getTimeRecorderAnnouncement } = useContext(AppConfigContext);
    const initialAnnouncement = getTimeRecorderAnnouncement();
    const [enabled, setEnabled] = useState(() => initialAnnouncement.enabled);
    const [message, setMessage] = useState(() => initialAnnouncement.message);
    const saveAppConfigSection = useSaveAppConfigSection();
    const handleSave = async () => {
        await saveAppConfigSection({
            timeRecorderAnnouncementEnabled: enabled,
            timeRecorderAnnouncementMessage: message,
        });
    };
    return (<AdminSettingsLayout>
      <AdminSettingsSection actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}>
        <TimeRecorderAnnouncementSection enabled={enabled} message={message} onEnabledChange={setEnabled} onMessageChange={setMessage}/>
      </AdminSettingsSection>
    </AdminSettingsLayout>);
}
