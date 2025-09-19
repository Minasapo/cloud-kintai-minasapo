import { Divider, Typography } from "@mui/material";
import { useContext } from "react";

import { AttendanceEditContext } from "../../AttendanceEditProvider";
import { GoDirectlyFlagInput } from "../GoDirectlyFlagInput";
import { Label } from "../Label";
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
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        開始時刻
      </Typography>
      {/* 直行 */}
      <GoDirectlyFlagInput />
      <StartTimeInputMobile dataTestId="mobile-start-time-input" />
      <Divider />
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        終了時刻
      </Typography>
      {/* 直帰 */}
      <ReturnDirectlyFlagInput />
      <EndTimeInput workDate={workDate} control={control} setValue={setValue} />
    </>
  );
}
