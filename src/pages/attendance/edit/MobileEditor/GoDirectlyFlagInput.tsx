import { GoDirectlyFlagCheckbox } from "@features/attendance/edit/ui/GoDirectlyFlagCheckbox";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Alert,Switch } from "@mui/material";
import { useContext, useState } from "react";

import useAppConfig from "@entities/app-config/model/useAppConfig";
import { resolveConfigTimeOnDate } from "@/lib/resolveConfigTimeOnDate";
import { pulseAnimationStyles } from "@/shared/ui/animations/highlightAnimation";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export function GoDirectlyFlagInput() {
  const { control, setValue, workDate, getValues, attendance } = useContext(
    AttendanceEditContext
  );
  const { getStartTime } = useAppConfig();
  const [highlightStartTime, setHighlightStartTime] = useState(false);

  if (!control || !setValue) {
    return null;
  }

  const computeStartTimeIso = () =>
    resolveConfigTimeOnDate(
      getStartTime(),
      getValues?.("startTime") as string | null | undefined,
      workDate ?? undefined,
      attendance?.workDate
    );

  const handleChangeFlag = (checked: boolean) => {
    if (checked) {
      setValue("goDirectlyFlag", true);
      setValue("startTime", computeStartTimeIso());
      // トリガーハイライトアニメーション
      setHighlightStartTime(true);
      setTimeout(() => setHighlightStartTime(false), 2500);
    }
  };

  return (
    <>
      <GoDirectlyFlagCheckbox
        name="goDirectlyFlag"
        control={control}
        inputComponent={Switch}
        onChangeExtra={handleChangeFlag}
      />
      {highlightStartTime && (
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
          勤務開始時間が自動設定されました
        </Alert>
      )}
    </>
  );
}
