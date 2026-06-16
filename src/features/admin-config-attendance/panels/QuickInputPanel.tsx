import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  appendItem,
  removeItemAt,
  toggleEnabledAt,
  updateItem,
} from "@features/admin/configManagement/lib/arrayHelpers";
import { TIME_FORMAT } from "@features/admin/configManagement/lib/constants";
import QuickInputSection from "@features/admin/configManagement/ui/QuickInputSection";
import AdminSettingsSection from "@features/admin/layout/ui/AdminSettingsSection";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useContext, useMemo, useState } from "react";

import {
  AutoSaveStatus,
  SavePayload,
  SetStateAndQueueSave,
  useAppConfigSaveAction,
  useAutoSaveAction,
} from "../attendanceSettingsHooks";

type QuickInputEntry = {
  time: Dayjs;
  enabled: boolean;
};

export default function QuickInputPanel() {
  const { getQuickInputStartTimes, getQuickInputEndTimes } =
    useContext(AppConfigContext);
  const { save } = useAppConfigSaveAction();
  const quickInputResetKey = useMemo(
    () =>
      JSON.stringify({
        startTimes: getQuickInputStartTimes(),
        endTimes: getQuickInputEndTimes(),
      }),
    [getQuickInputEndTimes, getQuickInputStartTimes],
  );
  const initialQuickInputStartTimes = useMemo(
    () =>
      getQuickInputStartTimes().map((entry) => ({
        time: dayjs(entry.time, TIME_FORMAT),
        enabled: entry.enabled,
      })),
    [getQuickInputStartTimes, quickInputResetKey],
  );
  const initialQuickInputEndTimes = useMemo(
    () =>
      getQuickInputEndTimes().map((entry) => ({
        time: dayjs(entry.time, TIME_FORMAT),
        enabled: entry.enabled,
      })),
    [getQuickInputEndTimes, quickInputResetKey],
  );

  return (
    <QuickInputPanelBody
      key={quickInputResetKey}
      quickInputStartTimesSeed={initialQuickInputStartTimes}
      quickInputEndTimesSeed={initialQuickInputEndTimes}
      save={save}
    />
  );
}

function QuickInputPanelBody({
  quickInputStartTimesSeed,
  quickInputEndTimesSeed,
  save,
}: {
  quickInputStartTimesSeed: QuickInputEntry[];
  quickInputEndTimesSeed: QuickInputEntry[];
  save: (payload: SavePayload) => Promise<void>;
}) {
  const [quickInputStartTimes, setQuickInputStartTimes] = useState(
    quickInputStartTimesSeed,
  );
  const [quickInputEndTimes, setQuickInputEndTimes] = useState(
    quickInputEndTimesSeed,
  );

  const persist = useCallback(async () => {
    await save({
      quickInputStartTimes: quickInputStartTimes.map((entry) => ({
        time: entry.time.format("HH:mm"),
        enabled: entry.enabled,
      })),
      quickInputEndTimes: quickInputEndTimes.map((entry) => ({
        time: entry.time.format("HH:mm"),
        enabled: entry.enabled,
      })),
    });
  }, [quickInputEndTimes, quickInputStartTimes, save]);
  const { saving: autoSaving, queueSave } = useAutoSaveAction({
    onSave: persist,
  });
  const updateEntriesAndQueue = useCallback(
    (
      setEntries: SetStateAndQueueSave<QuickInputEntry[]>,
      updater: (prev: QuickInputEntry[]) => QuickInputEntry[],
    ) => {
      setEntries((prev) => updater(prev));
      queueSave();
    },
    [queueSave],
  );
  const updateStartEntries = useCallback(
    (updater: (prev: QuickInputEntry[]) => QuickInputEntry[]) => {
      updateEntriesAndQueue(setQuickInputStartTimes, updater);
    },
    [updateEntriesAndQueue],
  );
  const updateEndEntries = useCallback(
    (updater: (prev: QuickInputEntry[]) => QuickInputEntry[]) => {
      updateEntriesAndQueue(setQuickInputEndTimes, updater);
    },
    [updateEntriesAndQueue],
  );
  const createEntry = useCallback(
    (): QuickInputEntry => ({
      time: dayjs(),
      enabled: true,
    }),
    [],
  );

  return (
    <AdminSettingsSection
      title="クイック入力"
      description="勤怠編集画面で使う出勤・退勤時刻の候補を整備します。"
      actions={<AutoSaveStatus saving={autoSaving} />}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">
          勤怠編集画面でボタンを押すと時刻が簡単に入力されます。この機能は、勤務開始時刻と勤務終了時刻のみを設定できます。
        </p>
        <QuickInputSection
          quickInputStartTimes={quickInputStartTimes}
          quickInputEndTimes={quickInputEndTimes}
          onAddQuickInputStartTime={() => {
            updateStartEntries((prev) => appendItem(prev, createEntry()));
          }}
          onQuickInputStartTimeChange={(index, newValue) => {
            if (!newValue) {
              return;
            }
            updateStartEntries((prev) =>
              updateItem(prev, index, (entry) => ({
                ...entry,
                time: newValue,
              })),
            );
          }}
          onQuickInputStartTimeToggle={(index) => {
            updateStartEntries((prev) => toggleEnabledAt(prev, index));
          }}
          onRemoveQuickInputStartTime={(index) => {
            updateStartEntries((prev) => removeItemAt(prev, index));
          }}
          onAddQuickInputEndTime={() => {
            updateEndEntries((prev) => appendItem(prev, createEntry()));
          }}
          onQuickInputEndTimeChange={(index, newValue) => {
            if (!newValue) {
              return;
            }
            updateEndEntries((prev) =>
              updateItem(prev, index, (entry) => ({
                ...entry,
                time: newValue,
              })),
            );
          }}
          onQuickInputEndTimeToggle={(index) => {
            updateEndEntries((prev) => toggleEnabledAt(prev, index));
          }}
          onRemoveQuickInputEndTime={(index) => {
            updateEndEntries((prev) => removeItemAt(prev, index));
          }}
        />
      </div>
    </AdminSettingsSection>
  );
}
