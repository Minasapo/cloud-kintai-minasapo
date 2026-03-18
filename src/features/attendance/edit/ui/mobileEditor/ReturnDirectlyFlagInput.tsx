import useAppConfig from "@entities/app-config/model/useAppConfig";
import ReturnDirectlyFlagInputBase from "@shared/ui/form/flags/ReturnDirectlyFlagInputBase";
import { useContext, useState } from "react";

import { resolveConfigTimeOnDate } from "@/entities/attendance/lib/resolveConfigTimeOnDate";
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
        inputVariant="switch"
        layout="inline"
        onChangeFlag={handleChangeFlag}
      />
      {highlightEndTime && (
        <div className="my-1 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 font-bold text-emerald-900 animate-pulse">
          勤務終了時間が自動設定されました
        </div>
      )}
    </>
  );
}
