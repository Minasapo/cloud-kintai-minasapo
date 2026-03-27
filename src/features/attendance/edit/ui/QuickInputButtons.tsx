import dayjs from "dayjs";

import { AttendanceGetValues, AttendanceSetValue } from "../model/types";
import { useQuickInputActions } from "../model/useQuickInputActions";
import { useQuickInputSelection } from "../model/useQuickInputSelection";

type QuickInputButtonsProps = {
  setValue: AttendanceSetValue;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  /**
   * 表示モード: all(すべて)/admin(管理者のみ)/staff(スタッフのみ)
   * 親コンポーネントから渡された値に応じて表示を切り替えます。
   */
  visibleMode?: "all" | "admin" | "staff";
  getValues?: AttendanceGetValues;
  readOnly?: boolean;
};

export default function QuickInputButtons({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  getValues,
  readOnly,
}: QuickInputButtonsProps) {
  const actions = useQuickInputActions({
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    workDate,
    visibleMode,
    getValues,
    readOnly,
  });
  const { open, confirmLabel, askConfirm, applySelectedAction, close } =
    useQuickInputSelection(actions);

  // どのボタンも表示されない場合はコンポーネントを非表示にする
  if (actions.length === 0) return null;

  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-base font-bold text-slate-900">定型入力</div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              title={action.tooltip || ""}
              onClick={() =>
                askConfirm(
                  `定型入力: 「${action.label}」を適用します。よろしいですか？`,
                  action.action
                )
              }
              disabled={!!readOnly}
              className="rounded-[14px] border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-sm rounded-[24px] border border-emerald-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
            <div className="text-base font-semibold text-slate-950">確認</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{confirmLabel}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-[12px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={applySelectedAction}
                className="rounded-[12px] border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
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
