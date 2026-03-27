import { styled, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { Controller } from "react-hook-form";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

const Label = styled(Typography)(() => ({
  width: "150px",
  fontWeight: "bold",
}));

export function SubstituteHolidayDateInput() {
  const { control, setValue, restReplace, readOnly } =
    useContext(AttendanceEditContext);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<dayjs.Dayjs | null>(null);

  if (!control || !setValue || !restReplace) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Label variant="body1">振替休日</Label>
      <Controller
        name="substituteHolidayDate"
        control={control}
        render={({ field, fieldState }) => {
          const { value, onChange, ...restField } = field;

          return (
            <>
              <div className="min-w-0 flex-1">
                <input
                  {...restField}
                  type="date"
                  value={value ? dayjs(value).format("YYYY-MM-DD") : ""}
                  aria-label="勤務した日"
                  disabled={!!readOnly}
                  className="w-full max-w-[340px] rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  onChange={(e) => {
                    if (!e.target.value) {
                      onChange(null);
                      return;
                    }
                    const date = dayjs(e.target.value);
                    if (date.isValid()) {
                      setPendingDate(date);
                      setConfirmOpen(true);
                    }
                  }}
                />
                {fieldState.error?.message ? (
                  <p className="mt-2 text-sm text-rose-600">{fieldState.error.message}</p>
                ) : null}
              </div>
              {confirmOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
                  <div className="w-full max-w-md rounded-[24px] border border-emerald-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
                    <div className="text-base font-semibold text-slate-950">
                      一部の入力内容をクリアします
                    </div>
                    <div className="mt-3 text-sm leading-6 text-slate-600">
                    振替休日を設定すると、以下の入力内容がクリアされます。
                    <ul>
                      <li>勤務開始・終了時刻</li>
                      <li>休憩時間</li>
                      <li>有給フラグ</li>
                      <li>直行フラグ</li>
                      <li>直帰フラグ</li>
                    </ul>
                    よろしいですか？
                    </div>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-[12px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => {
                      if (pendingDate) {
                        onChange(pendingDate.format(AttendanceDate.DataFormat));
                      }

                      setConfirmOpen(false);
                      setPendingDate(null);
                    }}
                  >
                    クリアせず設定
                      </button>
                      <button
                        type="button"
                        className="rounded-[12px] border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    onClick={() => {
                      if (readOnly) {
                        setConfirmOpen(false);
                        setPendingDate(null);
                        return;
                      }

                      if (pendingDate) {
                        onChange(pendingDate.format(AttendanceDate.DataFormat));

                        setValue("paidHolidayFlag", false);
                        setValue("goDirectlyFlag", false);
                        setValue("returnDirectlyFlag", false);
                        setValue("startTime", null);
                        setValue("endTime", null);
                        restReplace([]);
                      }

                      setConfirmOpen(false);
                      setPendingDate(null);
                    }}
                  >
                    クリアして設定
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          );
        }}
      />
    </div>
  );
}
