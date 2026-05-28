import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import {
  SettingsAlert,
  SettingsButton,
} from "@features/admin/layout/ui/SettingsPrimitives";
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
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onSwitchShiftDefaultMode("normal")}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-medium transition",
                    shiftDefaultMode === "normal"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  通常モード
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchShiftDefaultMode("collaborative")}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-medium transition",
                    shiftDefaultMode === "collaborative"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  共同編集モード
                </button>
              </div>
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
