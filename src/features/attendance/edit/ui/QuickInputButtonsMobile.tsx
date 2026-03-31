import dayjs from "dayjs";
import type { UseFormSetValue } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";
import { AppButton } from "@/shared/ui/button";

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
        <AppButton
          onClick={() => setOpen(true)}
          variant="outline"
          tone="primary"
          size="sm"
        >
          選択
        </AppButton>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-sm rounded-[14px] border border-emerald-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
            <div className="text-base font-semibold text-slate-950">定型入力</div>
            <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <AppButton
                key={action.key}
                onClick={() => setSelectedKey(action.key)}
                variant={selectedKey === action.key ? "solid" : "outline"}
                tone={selectedKey === action.key ? "primary" : "neutral"}
                size="sm"
                fullWidth
                className="justify-start"
              >
                {action.label}
              </AppButton>
            ))}
            {actions.length === 0 && (
              <p className="text-sm text-slate-500">
                操作可能な項目がありません。
              </p>
            )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AppButton
                onClick={close}
                variant="outline"
                tone="neutral"
                size="sm"
              >
                閉じる
              </AppButton>
              <AppButton
                onClick={applySelectedAction}
                disabled={!selectedKey}
                variant="solid"
                tone="primary"
                size="sm"
              >
                適用
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
