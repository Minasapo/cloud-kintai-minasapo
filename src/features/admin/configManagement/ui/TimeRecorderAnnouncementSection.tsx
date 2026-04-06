import {
  SettingsSwitch,
  SettingsTextAreaField,
} from "@/features/admin/layout/ui/SettingsPrimitives";

type TimeRecorderAnnouncementSectionProps = {
  enabled: boolean;
  message: string;
  onEnabledChange: (checked: boolean) => void;
  onMessageChange: (value: string) => void;
};

export default function TimeRecorderAnnouncementSection({
  enabled,
  message,
  onEnabledChange,
  onMessageChange,
}: TimeRecorderAnnouncementSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <SettingsSwitch
          checked={enabled}
          onChange={onEnabledChange}
          label={enabled ? "表示" : "非表示"}
          ariaLabel="打刻画面アナウンスの表示切り替え"
        />
      </div>
      <div className="flex flex-col gap-1 w-full max-w-[640px]">
        <SettingsTextAreaField
          label="アナウンス本文"
          value={message}
          onChange={onMessageChange}
          minRows={3}
          placeholder="例: 本日18:00〜18:30はシステムメンテナンスのため打刻が反映されにくくなる場合があります。"
        />
      </div>
      <p className="text-sm text-slate-500">
        /register のヘッダー直下に固定表示します。本文が空の場合は表示されません。
      </p>
    </div>
  );
}
