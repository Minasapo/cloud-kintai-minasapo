import { SettingsSwitch } from "@/features/admin/layout/ui/SettingsPrimitives";

type AttendanceStatisticsSectionProps = {
  enabled: boolean;
  onChange: (checked: boolean) => void;
};

export default function AttendanceStatisticsSection({
  enabled,
  onChange,
}: AttendanceStatisticsSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <SettingsSwitch
          checked={enabled}
          onChange={onChange}
          label={enabled ? "表示" : "非表示"}
          ariaLabel="稼働統計の表示切り替え"
        />
      </div>
      <p className="text-sm text-slate-500">
        稼働統計ページと関連メニューの表示を切り替えます。非表示にすると利用者の
        ナビゲーションから稼働統計が隠れ、直接アクセス時も無効化されます。
      </p>
    </div>
  );
}
