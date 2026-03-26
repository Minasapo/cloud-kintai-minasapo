import ReturnDirectlyFlagInputBase from "@shared/ui/form/flags/ReturnDirectlyFlagInputBase";
import { useContext } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { useAutoConfiguredTimeFlag } from "@/features/attendance/edit/model/useAutoConfiguredTimeFlag";

interface ReturnDirectlyFlagInputProps {
  onHighlightEndTime?: (highlight: boolean) => void;
  label?: string;
  layout?: "row" | "inline";
  inputVariant?: "checkbox" | "switch";
  successMessage?: string;
}

export default function ReturnDirectlyFlagInput({
  onHighlightEndTime,
  label,
  layout = "row",
  inputVariant = "checkbox",
  successMessage,
}: ReturnDirectlyFlagInputProps) {
  const { changeRequests, readOnly } = useContext(AttendanceEditContext);
  const { control, disabled, highlighted, applyConfiguredTime } =
    useAutoConfiguredTimeFlag({
      timeField: "endTime",
    });

  if (!control || disabled) return null;

  return (
    <>
      <ReturnDirectlyFlagInputBase
        control={control}
        disabled={changeRequests?.length > 0 || !!readOnly}
        label={label}
        layout={layout}
        inputVariant={inputVariant}
        onChangeFlag={(checked) => {
          applyConfiguredTime(checked);
          if (checked && onHighlightEndTime) {
            onHighlightEndTime(true);
            setTimeout(() => onHighlightEndTime(false), 2500);
          }
        }}
      />
      {highlighted && successMessage ? (
        <div className="my-1 animate-pulse rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 font-bold text-emerald-900">
          {successMessage}
        </div>
      ) : null}
    </>
  );
}
