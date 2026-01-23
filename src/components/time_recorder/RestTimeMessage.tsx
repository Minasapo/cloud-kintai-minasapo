import RestTimeMessageView from "@shared/ui/time-recorder/RestTimeMessage";

import useAppConfig from "@entities/app-config/model/useAppConfig";

export function RestTimeMessage() {
  const { getLunchRestStartTime, getLunchRestEndTime } = useAppConfig();

  const lunchRestStartTime = getLunchRestStartTime().format("HH:mm");
  const lunchRestEndTime = getLunchRestEndTime().format("HH:mm");

  return (
    <RestTimeMessageView
      lunchRestStartTime={lunchRestStartTime}
      lunchRestEndTime={lunchRestEndTime}
    />
  );
}
