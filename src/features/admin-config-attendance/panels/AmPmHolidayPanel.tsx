import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  DEFAULT_AM_HOLIDAY_END,
  DEFAULT_AM_HOLIDAY_START,
  DEFAULT_PM_HOLIDAY_END,
  DEFAULT_PM_HOLIDAY_START,
  TIME_FORMAT,
} from "@features/admin/configManagement/lib/constants";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import {
  SettingsSwitch,
  SettingsTimeField,
} from "@features/admin/layout/ui/SettingsPrimitives";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useContext } from "react";

import {
  AutoSaveStatus,
  useAppConfigSaveAction,
  useAutoSaveObjectState,
} from "../attendanceSettingsHooks";

type AmPmHolidayState = {
  amHolidayStartTime: Dayjs | null;
  amHolidayEndTime: Dayjs | null;
  pmHolidayStartTime: Dayjs | null;
  pmHolidayEndTime: Dayjs | null;
  enabled: boolean;
};

export default function AmPmHolidayPanel() {
  const {
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
  } = useContext(AppConfigContext);
  const { notifyValidationError } = useAppConfigSaveAction();
  const getInitialState = useCallback(
    (): AmPmHolidayState => ({
      amHolidayStartTime:
        getAmHolidayStartTime() ?? dayjs(DEFAULT_AM_HOLIDAY_START, TIME_FORMAT),
      amHolidayEndTime:
        getAmHolidayEndTime() ?? dayjs(DEFAULT_AM_HOLIDAY_END, TIME_FORMAT),
      pmHolidayStartTime:
        getPmHolidayStartTime() ?? dayjs(DEFAULT_PM_HOLIDAY_START, TIME_FORMAT),
      pmHolidayEndTime:
        getPmHolidayEndTime() ?? dayjs(DEFAULT_PM_HOLIDAY_END, TIME_FORMAT),
      enabled: getAmPmHolidayEnabled(),
    }),
    [
      getAmHolidayEndTime,
      getAmHolidayStartTime,
      getAmPmHolidayEnabled,
      getPmHolidayEndTime,
      getPmHolidayStartTime,
    ],
  );
  const {
    state: {
      amHolidayStartTime,
      amHolidayEndTime,
      pmHolidayStartTime,
      pmHolidayEndTime,
      enabled,
    },
    updateField,
    saving: autoSaving,
  } = useAutoSaveObjectState<AmPmHolidayState>({
    getInitialState,
    createPayload: (state) => ({
      amHolidayStartTime: state.amHolidayStartTime?.format("HH:mm"),
      amHolidayEndTime: state.amHolidayEndTime?.format("HH:mm"),
      pmHolidayStartTime: state.pmHolidayStartTime?.format("HH:mm"),
      pmHolidayEndTime: state.pmHolidayEndTime?.format("HH:mm"),
      amPmHolidayEnabled: state.enabled,
    }),
    validate: (state) =>
      Boolean(
        state.amHolidayStartTime &&
        state.amHolidayEndTime &&
        state.pmHolidayStartTime &&
        state.pmHolidayEndTime,
      ),
    onInvalid: () => notifyValidationError(),
  });

  return (
    <AdminSettingsSection
      title="午前/午後休"
      description="半休機能の有効化と時間帯を設定します。"
      actions={<AutoSaveStatus saving={autoSaving} />}
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-slate-500">
          この機能が有効な場合、午前休暇と午後休暇の時間帯を設定できます。
        </p>
        <div>
          <SettingsSwitch
            checked={enabled}
            onChange={(checked) => updateField("enabled", checked)}
            label={enabled ? "有効" : "無効"}
          />
        </div>

        <div className="flex flex-row flex-wrap items-end gap-4">
          <span className="w-12 text-sm font-semibold text-slate-700">
            午前
          </span>
          <SettingsTimeField
            label="開始"
            value={amHolidayStartTime}
            onChange={(value) => updateField("amHolidayStartTime", value)}
            disabled={!enabled}
            className="w-full max-w-[200px]"
          />
          <span className="text-base text-slate-800">〜</span>
          <SettingsTimeField
            label="終了"
            value={amHolidayEndTime}
            onChange={(value) => updateField("amHolidayEndTime", value)}
            disabled={!enabled}
            className="w-full max-w-[200px]"
          />
        </div>

        <div className="flex flex-row flex-wrap items-end gap-4">
          <span className="w-12 text-sm font-semibold text-slate-700">
            午後
          </span>
          <SettingsTimeField
            label="開始"
            value={pmHolidayStartTime}
            onChange={(value) => updateField("pmHolidayStartTime", value)}
            disabled={!enabled}
            className="w-full max-w-[200px]"
          />
          <span className="text-base text-slate-800">〜</span>
          <SettingsTimeField
            label="終了"
            value={pmHolidayEndTime}
            onChange={(value) => updateField("pmHolidayEndTime", value)}
            disabled={!enabled}
            className="w-full max-w-[200px]"
          />
        </div>
      </div>
    </AdminSettingsSection>
  );
}
