import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import WorkingTimeSection from "@features/admin/configManagement/ui/WorkingTimeSection";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import { Dayjs } from "dayjs";
import { useCallback, useContext } from "react";

import {
  AutoSaveStatus,
  useAppConfigSaveAction,
  useAutoSaveObjectState,
} from "../attendanceSettingsHooks";

type WorkingTimeState = {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  lunchRestStartTime: Dayjs | null;
  lunchRestEndTime: Dayjs | null;
};

export default function WorkingTimePanel() {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const { notifyValidationError } = useAppConfigSaveAction();
  const getInitialState = useCallback(
    (): WorkingTimeState => ({
      startTime: getStartTime(),
      endTime: getEndTime(),
      lunchRestStartTime: getLunchRestStartTime(),
      lunchRestEndTime: getLunchRestEndTime(),
    }),
    [getEndTime, getLunchRestEndTime, getLunchRestStartTime, getStartTime],
  );
  const {
    state: { startTime, endTime, lunchRestStartTime, lunchRestEndTime },
    updateField,
    saving: autoSaving,
  } = useAutoSaveObjectState<WorkingTimeState>({
    getInitialState,
    createPayload: (state) => ({
      workStartTime: state.startTime?.format("HH:mm"),
      workEndTime: state.endTime?.format("HH:mm"),
      lunchRestStartTime: state.lunchRestStartTime?.format("HH:mm"),
      lunchRestEndTime: state.lunchRestEndTime?.format("HH:mm"),
    }),
    validate: (state) =>
      Boolean(
        state.startTime &&
        state.endTime &&
        state.lunchRestStartTime &&
        state.lunchRestEndTime,
      ),
    onInvalid: () => notifyValidationError(),
  });

  return (
    <AdminSettingsSection
      title="勤務時間"
      description="標準の始業、終業、昼休憩時間を設定します。"
      actions={<AutoSaveStatus saving={autoSaving} />}
    >
      <WorkingTimeSection
        startTime={startTime}
        endTime={endTime}
        lunchRestStartTime={lunchRestStartTime}
        lunchRestEndTime={lunchRestEndTime}
        setStartTime={(value) => updateField("startTime", value)}
        setEndTime={(value) => updateField("endTime", value)}
        setLunchRestStartTime={(value) =>
          updateField("lunchRestStartTime", value)
        }
        setLunchRestEndTime={(value) => updateField("lunchRestEndTime", value)}
      />
    </AdminSettingsSection>
  );
}
