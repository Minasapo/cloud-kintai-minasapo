import {
  default as useAppConfig,
  DEFAULT_CONFIG,
} from "@entities/app-config/model/useAppConfig";
import RestTimeMessageView from "@shared/ui/time-recorder/RestTimeMessage";

export interface RestTimeMessageContainerProps {
  displayMode?: "compact" | "detailed";
}

export function RestTimeMessage({
  displayMode = "detailed",
}: RestTimeMessageContainerProps) {
  const { getLunchRestStartTime, getLunchRestEndTime } = useAppConfig();

  const lunchStart = getLunchRestStartTime();
  const lunchEnd = getLunchRestEndTime();
  const lunchRestStartTime: string = lunchStart.isValid()
    ? lunchStart.format("HH:mm")
    : (DEFAULT_CONFIG.lunchRestStartTime ?? "12:00");
  const lunchRestEndTime: string = lunchEnd.isValid()
    ? lunchEnd.format("HH:mm")
    : (DEFAULT_CONFIG.lunchRestEndTime ?? "13:00");

  return (
    <RestTimeMessageView
      lunchRestStartTime={lunchRestStartTime}
      lunchRestEndTime={lunchRestEndTime}
      displayMode={displayMode}
    />
  );
}
