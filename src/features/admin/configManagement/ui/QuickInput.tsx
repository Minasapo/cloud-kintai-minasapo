import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { appendItem, removeItemAt, toggleEnabledAt, updateItem, } from "@features/admin/configManagement/lib/arrayHelpers";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@features/admin/layout/ui/SettingsPrimitives";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useState } from "react";

import { createQuickInputState, getQuickInputStateKey, type QuickInputEntry,type QuickInputState } from "../lib/formState";
import { useSaveAppConfigSection } from "../lib/useSaveAppConfigSection";
import QuickInputSection from "./QuickInputSection";

export default function QuickInput() {
    const { getQuickInputStartTimes, getQuickInputEndTimes } = useContext(AppConfigContext);
    const initialState = createQuickInputState({ getQuickInputStartTimes, getQuickInputEndTimes });
    const stateKey = getQuickInputStateKey(initialState);
    return <QuickInputContent key={stateKey} initialState={initialState} />;
}

function mapEntries(entries: QuickInputEntry[]) {
    return entries.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
    }));
}

function QuickInputContent({ initialState }: { initialState: QuickInputState }) {
    const [quickInputStartTimes, setQuickInputStartTimes] = useState<QuickInputEntry[]>(() => mapEntries(initialState.quickInputStartTimes));
    const [quickInputEndTimes, setQuickInputEndTimes] = useState<QuickInputEntry[]>(() => mapEntries(initialState.quickInputEndTimes));
    const saveAppConfigSection = useSaveAppConfigSection();
    const handleAddQuickInputStartTime = () => setQuickInputStartTimes(appendItem(quickInputStartTimes, { time: dayjs(), enabled: true }));
    const handleQuickInputStartTimeChange = (index: number, newValue: Dayjs | null) => {
        if (!newValue)
            return;
        setQuickInputStartTimes(updateItem(quickInputStartTimes, index, (e) => ({ ...e, time: newValue })));
    };
    const handleQuickInputStartTimeToggle = (index: number) => setQuickInputStartTimes(toggleEnabledAt(quickInputStartTimes, index));
    const handleRemoveQuickInputStartTime = (index: number) => setQuickInputStartTimes(removeItemAt(quickInputStartTimes, index));
    const handleAddQuickInputEndTime = () => setQuickInputEndTimes(appendItem(quickInputEndTimes, { time: dayjs(), enabled: true }));
    const handleQuickInputEndTimeChange = (index: number, newValue: Dayjs | null) => {
        if (!newValue)
            return;
        setQuickInputEndTimes(updateItem(quickInputEndTimes, index, (e) => ({ ...e, time: newValue })));
    };
    const handleQuickInputEndTimeToggle = (index: number) => setQuickInputEndTimes(toggleEnabledAt(quickInputEndTimes, index));
    const handleRemoveQuickInputEndTime = (index: number) => setQuickInputEndTimes(removeItemAt(quickInputEndTimes, index));
    const handleSave = async () => {
        await saveAppConfigSection({
            quickInputStartTimes: quickInputStartTimes.map((e) => ({
                time: e.time.format("HH:mm"),
                enabled: e.enabled,
            })),
            quickInputEndTimes: quickInputEndTimes.map((e) => ({
                time: e.time.format("HH:mm"),
                enabled: e.enabled,
            })),
        });
    };
    return (<AdminSettingsLayout description={<>
          勤怠編集画面でボタンを押すと時刻が簡単に入力されます。
          <br />
          この機能は、勤務開始時刻と勤務終了時刻のみを設定できます。
        </>}>
      <AdminSettingsSection actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}>
        <QuickInputSection quickInputStartTimes={quickInputStartTimes} quickInputEndTimes={quickInputEndTimes} onAddQuickInputStartTime={handleAddQuickInputStartTime} onQuickInputStartTimeChange={handleQuickInputStartTimeChange} onQuickInputStartTimeToggle={handleQuickInputStartTimeToggle} onRemoveQuickInputStartTime={handleRemoveQuickInputStartTime} onAddQuickInputEndTime={handleAddQuickInputEndTime} onQuickInputEndTimeChange={handleQuickInputEndTimeChange} onQuickInputEndTimeToggle={handleQuickInputEndTimeToggle} onRemoveQuickInputEndTime={handleRemoveQuickInputEndTime}/>
      </AdminSettingsSection>
    </AdminSettingsLayout>);
}
