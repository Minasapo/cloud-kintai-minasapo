import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import AdminSettingsLayout from "@features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { SettingsButton } from "@features/admin/layout/ui/SettingsPrimitives";
import type { Dayjs } from "dayjs";
import { useContext, useState } from "react";

import { createWorkingTimeState, getWorkingTimeStateKey, type WorkingTimeState } from "../lib/formState";
import { useSaveAppConfigSection } from "../lib/useSaveAppConfigSection";
import WorkingTimeSection from "./WorkingTimeSection";

export default function WorkingTime() {
    const { getStartTime, getEndTime, getLunchRestStartTime, getLunchRestEndTime } = useContext(AppConfigContext);
    const initialState = createWorkingTimeState({ getStartTime, getEndTime, getLunchRestStartTime, getLunchRestEndTime });
    const stateKey = getWorkingTimeStateKey(initialState);
    return <WorkingTimeContent key={stateKey} initialState={initialState} />;
}

function WorkingTimeContent({ initialState }: { initialState: WorkingTimeState }) {
    const [startTime, setStartTime] = useState<Dayjs | null>(() => initialState.startTime);
    const [endTime, setEndTime] = useState<Dayjs | null>(() => initialState.endTime);
    const [lunchRestStartTime, setLunchRestStartTime] = useState<Dayjs | null>(() => initialState.lunchRestStartTime);
    const [lunchRestEndTime, setLunchRestEndTime] = useState<Dayjs | null>(() => initialState.lunchRestEndTime);
    const saveAppConfigSection = useSaveAppConfigSection();
    const handleSave = async () => {
        if (startTime && endTime && lunchRestStartTime && lunchRestEndTime) {
            await saveAppConfigSection({
                workStartTime: startTime.format("HH:mm"),
                workEndTime: endTime.format("HH:mm"),
                lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
                lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
            });
        }
    };
    return (<AdminSettingsLayout>
      <AdminSettingsSection actions={<SettingsButton onClick={handleSave}>保存</SettingsButton>}>
        <WorkingTimeSection startTime={startTime} endTime={endTime} lunchRestStartTime={lunchRestStartTime} lunchRestEndTime={lunchRestEndTime} setStartTime={setStartTime} setEndTime={setEndTime} setLunchRestStartTime={setLunchRestStartTime} setLunchRestEndTime={setLunchRestEndTime}/>
      </AdminSettingsSection>
    </AdminSettingsLayout>);
}
