import { useContext } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { Label } from "@/features/attendance/edit/ui/mobile/Label";

import { GoDirectlyFlagInput } from "../GoDirectlyFlagInput";
import { ReturnDirectlyFlagInput } from "../ReturnDirectlyFlagInput";
import EndTimeInput from "./EndTimeInput";
import StartTimeInputMobile from "./StartTimeInputMobile";

export function WorkTimeInput() {
  const { workDate, control, setValue } = useContext(AttendanceEditContext);

  if (!workDate || !control || !setValue) {
    return null;
  }

  return (
    <>
      <Label>勤務時間</Label>
      <div className="text-sm font-semibold text-slate-900">開始時刻</div>
      {/* 直行 */}
      <GoDirectlyFlagInput />
      <StartTimeInputMobile dataTestId="mobile-start-time-input" />
      <div className="border-t border-slate-200/80" />
      <div className="text-sm font-semibold text-slate-900">終了時刻</div>
      {/* 直帰 */}
      <ReturnDirectlyFlagInput />
      <EndTimeInput workDate={workDate} setValue={setValue} />
    </>
  );
}
