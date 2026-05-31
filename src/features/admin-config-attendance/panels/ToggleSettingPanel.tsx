import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { SettingsSwitch } from "@features/admin/layout/ui/SettingsPrimitives";

import { AutoSaveStatus, useToggleSetting } from "../attendanceSettingsHooks";

export default function ToggleSettingPanel({
  title,
  description,
  helperText,
  getter,
  saveKey,
}: {
  title: string;
  description: string;
  helperText: string;
  getter: () => boolean;
  saveKey: string;
}) {
  const { enabled, setEnabledAndQueueSave, saving } = useToggleSetting(
    getter,
    saveKey,
  );

  return (
    <AdminSettingsSection
      title={title}
      description={description}
      actions={<AutoSaveStatus saving={saving} />}
    >
      <div className="flex flex-col gap-4">
        <div>
          <SettingsSwitch
            checked={enabled}
            onChange={setEnabledAndQueueSave}
            label={enabled ? "有効" : "無効"}
          />
        </div>
        <p className="text-sm text-slate-500">{helperText}</p>
      </div>
    </AdminSettingsSection>
  );
}
