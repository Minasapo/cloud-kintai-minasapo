import { SettingsRow, SettingsSwitch } from "@/features/admin/layout/ui/SettingsPrimitives";

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
    <SettingsRow
      label="オフィスモード(β版)"
      description={
        <>
          オフィスモードを有効にすると、オフィスに設置した端末からQRコードを読み込み出退勤が可能になります。
          <br />
          ベータ(β)版は、まだ完全ではないため、予期しない動作が発生する可能性があります。
        </>
      }
    >
      <SettingsSwitch
        checked={officeMode}
        onChange={onOfficeModeChange}
        label={officeMode ? "有効" : "無効"}
      />
    </SettingsRow>

    <SettingsRow
      label="時間単位休暇(β版)"
      description="時間単位で休暇を取得できる機能を有効にします。"
    >
      <SettingsSwitch
        checked={hourlyPaidHolidayEnabled}
        onChange={onHourlyPaidHolidayEnabledChange}
        label={hourlyPaidHolidayEnabled ? "有効" : "無効"}
      />
    </SettingsRow>
  </div>
);

export default OfficeModeSection;
