import { SettingsSwitch } from "@/features/admin/layout/ui/SettingsPrimitives";

interface OfficeModeSectionProps {
  officeMode: boolean;
  onOfficeModeChange: (checked: boolean) => void;
  hourlyPaidHolidayEnabled: boolean;
  onHourlyPaidHolidayEnabledChange: (checked: boolean) => void;
}

const OfficeModeSection = ({
  officeMode,
  onOfficeModeChange,
  hourlyPaidHolidayEnabled,
  onHourlyPaidHolidayEnabledChange,
}: OfficeModeSectionProps) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-row flex-wrap gap-4 items-start justify-between">
      <div className="flex flex-col gap-1 flex-1 min-w-[280px] max-w-[640px]">
        <h3 className="text-base font-semibold text-slate-800">オフィスモード(β版)</h3>
        <p className="text-sm text-slate-500">
          オフィスモードを有効にすると、オフィスに設置した端末からQRコードを読み込み出退勤が可能になります。
          <br />
          ベータ(β)版は、まだ完全ではないため、予期しない動作が発生する可能性があります。
        </p>
      </div>
      <div className="min-w-[140px]">
        <SettingsSwitch
          checked={officeMode}
          onChange={onOfficeModeChange}
          label={officeMode ? "有効" : "無効"}
        />
      </div>
    </div>

    <div className="flex flex-row flex-wrap gap-4 items-start justify-between">
      <div className="flex flex-col gap-1 flex-1 min-w-[280px] max-w-[640px]">
        <h3 className="text-base font-semibold text-slate-800">時間単位休暇(β版)</h3>
        <p className="text-sm text-slate-500">
          時間単位で休暇を取得できる機能を有効にします。
        </p>
      </div>
      <div className="min-w-[140px]">
        <SettingsSwitch
          checked={hourlyPaidHolidayEnabled}
          onChange={onHourlyPaidHolidayEnabledChange}
          label={hourlyPaidHolidayEnabled ? "有効" : "無効"}
        />
      </div>
    </div>
  </div>
);

export default OfficeModeSection;
