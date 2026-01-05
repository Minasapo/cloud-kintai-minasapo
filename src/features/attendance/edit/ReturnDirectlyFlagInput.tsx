import ReturnDirectlyFlagInputBase from "@shared/ui/form/flags/ReturnDirectlyFlagInputBase";
import { useContext } from "react";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

interface ReturnDirectlyFlagInputProps {
  onHighlightEndTime?: (highlight: boolean) => void;
}

export default function ReturnDirectlyFlagInput({
  onHighlightEndTime,
}: ReturnDirectlyFlagInputProps) {
  const { workDate, control, setValue, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );
  const { getEndTime } = useAppConfig();
  if (!workDate || !control || !setValue) return null;
  // getEndTime returns a dayjs with the configured time (HH:mm)
  const computeEndTimeIso = () => {
    const configured = getEndTime();
    const hours = configured.hour();
    const minutes = configured.minute();
    const dt = new AttendanceDateTime().setDate(workDate);
    // apply configured hour/minute to the workDate
    dt.date = dt.date.hour(hours).minute(minutes).second(0).millisecond(0);
    return dt.toISOString();
  };

  return (
    <ReturnDirectlyFlagInputBase
      control={control}
      disabled={changeRequests?.length > 0 || !!readOnly}
      onChangeFlag={(checked) => {
        if (checked) {
          setValue("endTime", computeEndTimeIso());
          // トリガーハイライトアニメーション
          if (onHighlightEndTime) {
            onHighlightEndTime(true);
            setTimeout(() => onHighlightEndTime(false), 2500);
          }
        }
      }}
    />
  );
}
