import dayjs from "dayjs";
import type { UseFormSetValue } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import { useQuickInputActions } from "../model/useQuickInputActions";
import { useQuickInputSelection } from "../model/useQuickInputSelection";

type Props = {
  setValue: UseFormSetValue<AttendanceEditInputs>;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  visibleMode?: "all" | "admin" | "staff";
  readOnly?: boolean;
};

export default function QuickInputButtonsMobile({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  readOnly,
}: Props) {
  const actions = useQuickInputActions({
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    workDate,
    visibleMode,
    readOnly,
  });
  const {
    open,
    selectedKey,
    setOpen,
    setSelectedKey,
    applySelectedAction,
    close,
  } = useQuickInputSelection(actions);

  // ボタンが表示されない場合は null を返す
  if (actions.length === 0) return null;

  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-base font-bold text-slate-900">定型入力</div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[14px] border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          選択
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-sm rounded-[24px] border border-emerald-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
            <div className="text-base font-semibold text-slate-950">定型入力</div>
            <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => setSelectedKey(action.key)}
                className={[
                  "flex w-full items-center rounded-[14px] border px-4 py-3 text-left text-sm font-medium transition",
                  selectedKey === action.key
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {action.label}
              </button>
            ))}
            {actions.length === 0 && (
              <p className="text-sm text-slate-500">
                操作可能な項目がありません。
              </p>
            )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-[12px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={applySelectedAction}
                disabled={!selectedKey}
                className="rounded-[12px] border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
