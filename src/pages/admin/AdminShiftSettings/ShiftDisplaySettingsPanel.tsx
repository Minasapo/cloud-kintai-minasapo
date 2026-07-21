import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import {
  SettingsAlert,
  SettingsButton,
} from "@features/admin/layout/ui/SettingsPrimitives";
import ShiftDisplayModeButtonGroup from "@features/admin-config-shift/ShiftDisplayModeButtonGroup";
import { SubsectionTitle } from "@shared/ui/typography";

type ShiftDisplaySettingsPanelProps = {
  shiftDefaultMode: ShiftDisplayMode;
  savingShiftDisplay: boolean;
  onSwitchShiftDefaultMode: (mode: ShiftDisplayMode) => void;
  onSaveShiftDisplay: () => void;
};

export default function ShiftDisplaySettingsPanel({
  shiftDefaultMode,
  savingShiftDisplay,
  onSwitchShiftDefaultMode,
  onSaveShiftDisplay,
}: ShiftDisplaySettingsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsAlert>シフト管理画面の表示モードを設定します。</SettingsAlert>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6">
          <SubsectionTitle className="border-b border-slate-100 pb-2 text-lg font-semibold text-slate-800">
            シフト表示
          </SubsectionTitle>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                表示モード
              </span>
              <ShiftDisplayModeButtonGroup
                value={shiftDefaultMode}
                onChange={onSwitchShiftDefaultMode}
              />
            </div>
            <span className="text-sm text-slate-500">
              スタッフ側への設定反映には数分程度かかる場合があります。
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end pb-8">
        <SettingsButton
          onClick={onSaveShiftDisplay}
          disabled={savingShiftDisplay}
        >
          {savingShiftDisplay ? "保存中..." : "保存"}
        </SettingsButton>
      </div>
    </div>
  );
}
