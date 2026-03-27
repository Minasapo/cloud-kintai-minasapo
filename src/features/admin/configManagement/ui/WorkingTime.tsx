import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, E14002, S14001, S14002 } from "@/errors";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import WorkingTimeSection from "./WorkingTimeSection";

export default function WorkingTime() {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [lunchRestStartTime, setLunchRestStartTime] = useState<Dayjs | null>(
    null
  );
  const [lunchRestEndTime, setLunchRestEndTime] = useState<Dayjs | null>(null);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartTime(getStartTime());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEndTime(getEndTime());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLunchRestStartTime(getLunchRestStartTime());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLunchRestEndTime(getLunchRestEndTime());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getConfigId,
  ]);

  const handleSave = async () => {
    if (startTime && endTime && lunchRestStartTime && lunchRestEndTime) {
      try {
        if (id) {
          await saveConfig({
            id,
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
            lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
          } as unknown as UpdateAppConfigInput);
          dispatch(setSnackbarSuccess(S14002));
        } else {
          await saveConfig({
            name: "default",
            workStartTime: startTime.format("HH:mm"),
            workEndTime: endTime.format("HH:mm"),
            lunchRestStartTime: lunchRestStartTime.format("HH:mm"),
            lunchRestEndTime: lunchRestEndTime.format("HH:mm"),
          } as unknown as CreateAppConfigInput);
          dispatch(setSnackbarSuccess(S14001));
        }
        await fetchConfig();
      } catch {
        dispatch(setSnackbarError(E14001));
      }
    } else {
      dispatch(setSnackbarError(E14002));
    }
  };

  return (
    <AdminSettingsLayout title="勤務時間設定">
      <AdminSettingsSection
        actions={
          <button
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            onClick={handleSave}
          >
            保存
          </button>
        }
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <WorkingTimeSection
            startTime={startTime}
            endTime={endTime}
            lunchRestStartTime={lunchRestStartTime}
            lunchRestEndTime={lunchRestEndTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
            setLunchRestStartTime={setLunchRestStartTime}
            setLunchRestEndTime={setLunchRestEndTime}
          />
        </LocalizationProvider>
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
