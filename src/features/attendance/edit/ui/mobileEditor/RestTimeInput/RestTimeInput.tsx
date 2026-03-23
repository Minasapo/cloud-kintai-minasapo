import { useContext } from "react";
import {
  FieldArrayMethodProps,
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
} from "react-hook-form";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs, RestInputs } from "@/features/attendance/edit/model/common";
import { Label } from "@/features/attendance/edit/ui/mobile/Label";

import RestEndTimeInput from "./RestEndTimeInput";
import RestStartTimeInput from "./RestStartTimeInputMobile";

type RestTimeInputProps = {
  restFields: FieldArrayWithId<AttendanceEditInputs, "rests", "id">[];
  restAppend: (
    value: RestInputs | RestInputs[],
    options?: FieldArrayMethodProps | undefined
  ) => void;
  restRemove: UseFieldArrayRemove;
  restUpdate: UseFieldArrayUpdate<AttendanceEditInputs, "rests">;
};

export function RestTimeInput({
  restFields,
  restAppend,
  restRemove,
  restUpdate,
}: RestTimeInputProps) {
  const { workDate, isOnBreak } = useContext(AttendanceEditContext);

  if (!workDate) return null;

  return (
    <>
      <Label>休憩時間</Label>
      {restFields.map((rest, index) => (
        <div
          key={index}
          className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.28)]"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm font-semibold text-slate-900">
                開始時刻
              </div>
              <button
                type="button"
                aria-label="休憩を削除"
                onClick={() => restRemove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                ×
              </button>
            </div>
            <RestStartTimeInput
              rest={rest}
              index={index}
              testIdPrefix="mobile"
            />
            <div className="border-t border-slate-200/80" />
            <div className="text-sm font-semibold text-slate-900">
              終了時間
            </div>
            <RestEndTimeInput
              workDate={workDate}
              rest={rest}
              index={index}
              restUpdate={restUpdate}
              testIdPrefix="mobile"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={isOnBreak}
        onClick={() =>
          restAppend({
            startTime: null,
            endTime: null,
          })
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500/40 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-base leading-none">+</span>
        休憩時間を追加
      </button>
    </>
  );
}
