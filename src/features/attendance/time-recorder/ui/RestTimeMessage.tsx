import {
  default as useAppConfig,
  DEFAULT_CONFIG,
} from "@entities/app-config/model/useAppConfig";
import RestTimeMessageView from "@shared/ui/time-recorder/RestTimeMessage";

export function RestTimeMessage() {
  const { getLunchRestStartTime, getLunchRestEndTime } = useAppConfig();

  const lunchStart = getLunchRestStartTime();
  const lunchEnd = getLunchRestEndTime();
  const lunchRestStartTime = lunchStart.isValid()
    ? lunchStart.format("HH:mm")
    : DEFAULT_CONFIG.lunchRestStartTime;
  const lunchRestEndTime = lunchEnd.isValid()
    ? lunchEnd.format("HH:mm")
    : DEFAULT_CONFIG.lunchRestEndTime;

  return (
    <RestTimeMessageView
      lunchRestStartTime={lunchRestStartTime}
      lunchRestEndTime={lunchRestEndTime}
    />
  );
}
