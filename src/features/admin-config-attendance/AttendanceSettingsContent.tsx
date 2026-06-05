import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { SettingsAlert } from "@features/admin/layout/ui/SettingsPrimitives";
import { AppTabs } from "@shared/ui/tabs";
import { useContext, useState } from "react";

import AmPmHolidayPanel from "./panels/AmPmHolidayPanel";
import OfficeModePanel from "./panels/OfficeModePanel";
import QuickInputPanel from "./panels/QuickInputPanel";
import ToggleSettingPanel from "./panels/ToggleSettingPanel";
import WorkingTimePanel from "./panels/WorkingTimePanel";

type AttendanceSettingsTabKey = "rules" | "inputs";

const TAB_LABELS: Record<AttendanceSettingsTabKey, string> = {
  rules: "勤務ルール",
  inputs: "申請・入力",
};

export default function AttendanceSettingsContent() {
  const [activeTab, setActiveTab] = useState<AttendanceSettingsTabKey>("rules");
  const {
    getSpecialHolidayEnabled = () => false,
    getAbsentEnabled = () => false,
    getOverTimeCheckEnabled = () => false,
  } = useContext(AppConfigContext);
  const tabs = [
    {
      value: "rules" as const,
      label: TAB_LABELS.rules,
      content: (
        <div className="flex flex-col gap-6">
          <SettingsAlert>
            勤怠一覧と勤怠編集に直接影響するルールを、このタブでまとめて更新できます。
          </SettingsAlert>
          <WorkingTimePanel />
          <AmPmHolidayPanel />
          <OfficeModePanel />
          <ToggleSettingPanel
            title="特別休暇"
            description="忌引きなどの特別休暇を勤怠編集で扱えるようにします。"
            helperText="特別休暇を有効化すると、勤怠編集画面で申請や編集ができるようになります。"
            getter={getSpecialHolidayEnabled}
            saveKey="specialHolidayEnabled"
          />
          <ToggleSettingPanel
            title="欠勤"
            description="欠勤を勤怠編集画面で扱えるようにします。"
            helperText="欠勤設定を有効にすると、勤怠編集画面で欠勤の管理が可能になります。"
            getter={getAbsentEnabled}
            saveKey="absentEnabled"
          />
        </div>
      ),
    },
    {
      value: "inputs" as const,
      label: TAB_LABELS.inputs,
      content: (
        <div className="flex flex-col gap-6">
          <SettingsAlert>
            申請時の確認挙動や、勤怠入力の補助設定をこのタブで管理します。
          </SettingsAlert>
          <ToggleSettingPanel
            title="残業確認"
            description="残業確認メッセージの表示可否を切り替えます。"
            helperText="勤怠編集画面で、残業申請がない場合や承認時間を超えた場合に確認メッセージを表示するかどうかを切り替えます。"
            getter={getOverTimeCheckEnabled}
            saveKey="overTimeCheckEnabled"
          />
          <QuickInputPanel />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <AppTabs
        value={activeTab}
        onChange={setActiveTab}
        items={tabs}
        appearance="underline"
        panelPadding={3}
        tabsProps={{
          "aria-label": "勤怠設定タブ",
          variant: "scrollable",
        }}
      />
    </div>
  );
}
