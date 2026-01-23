import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Alert,Switch } from "@mui/material";
import ReturnDirectlyFlagInputBase from "@shared/ui/form/flags/ReturnDirectlyFlagInputBase";
import { useContext, useState } from "react";

import useAppConfig from "@entities/app-config/model/useAppConfig";
import { resolveConfigTimeOnDate } from "@/entities/attendance/lib/resolveConfigTimeOnDate";
import { pulseAnimationStyles } from "@/shared/ui/animations/highlightAnimation";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export function ReturnDirectlyFlagInput() {
  const { control, setValue, workDate, getValues, attendance } = useContext(
    AttendanceEditContext
  );
  const { getEndTime } = useAppConfig();
  const [highlightEndTime, setHighlightEndTime] = useState(false);

  if (!control || !setValue) {
    return null;
  }

  const computeEndTimeIso = () =>
    resolveConfigTimeOnDate(
      getEndTime(),
      getValues?.("endTime") as string | null | undefined,
      workDate ?? undefined,
      attendance?.workDate
    );

  const handleChangeFlag = (checked: boolean) => {
    if (checked) {
      setValue("returnDirectlyFlag", true);
      setValue("endTime", computeEndTimeIso());
      // トリガーハイライトアニメーション
      setHighlightEndTime(true);
      setTimeout(() => setHighlightEndTime(false), 2500);
    }
  };

  return (
    <>
      <ReturnDirectlyFlagInputBase
        control={control}
        inputComponent={Switch}
        layout="inline"
        onChangeFlag={handleChangeFlag}
      />
      {highlightEndTime && (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{
            mt: 1,
            mb: 1,
            ...pulseAnimationStyles,
            fontWeight: "bold",
          }}
        >
          勤務終了時間が自動設定されました
        </Alert>
      )}
    </>
  );
}
