import useAppConfig from "@entities/app-config/model/useAppConfig";

/**
 * Hook to manage the configuration related to the attendance editor.
 */
export function useAttendanceEditorConfig() {
  const { derived, loading, config } = useAppConfig();

  const {
    lunchRestStartTime,
    lunchRestEndTime,
    hourlyPaidHolidayEnabled,
    specialHolidayEnabled,
    startTime: configStartTime,
    endTime: configEndTime,
    absentEnabled,
  } = derived;

  const getLunchRestStartTime = () => lunchRestStartTime;
  const getLunchRestEndTime = () => lunchRestEndTime;
  const getHourlyPaidHolidayEnabled = (): boolean =>
    hourlyPaidHolidayEnabled ?? false;
  const getSpecialHolidayEnabled = (): boolean =>
    specialHolidayEnabled ?? false;
  const getStartTime = () => configStartTime;
  const getEndTime = () => configEndTime;
  const getAbsentEnabled = (): boolean => absentEnabled ?? false;

  return {
    loading,
    config,
    lunchRestStartTime,
    lunchRestEndTime,
    hourlyPaidHolidayEnabled,
    specialHolidayEnabled,
    configStartTime,
    configEndTime,
    absentEnabled,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getHourlyPaidHolidayEnabled,
    getSpecialHolidayEnabled,
    getStartTime,
    getEndTime,
    getAbsentEnabled,
  };
}
