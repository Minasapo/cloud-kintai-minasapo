import { AttendanceEditInputs } from "@features/attendance/edit/model/common";
import { AppButton, AppSplitButton } from "@shared/ui/button";
import dayjs from "dayjs";
import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";

import { useQuickInputActions } from "../model/useQuickInputActions";
import { useQuickInputSelection } from "../model/useQuickInputSelection";

type Props = {
  setValue: UseFormSetValue<AttendanceEditInputs>;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[],
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[],
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
    setSelectedKey,
    confirmLabel,
    askConfirm,
    applySelectedAction,
    close,
  } = useQuickInputSelection(actions);

  useEffect(() => {
    if (actions.length === 0) return;
    if (!actions.some((action) => action.key === selectedKey)) {
      setSelectedKey(actions[0].key);
    }
  }, [actions, selectedKey, setSelectedKey]);

  const selectedAction =
    actions.find((action) => action.key === selectedKey) ?? actions[0] ?? null;

  // ボタンが表示されない場合は null を返す
  if (actions.length === 0) return null;

  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-base font-bold text-slate-900">定型入力</div>
        <AppSplitButton
          options={actions.map((action) => ({
            key: action.key,
            label: action.label,
            title: action.tooltip,
          }))}
          selectedKey={selectedAction?.key ?? null}
          onSelectedKeyChange={setSelectedKey}
          onPrimaryClick={() => {
            if (!selectedAction) return;
            askConfirm(
              `定型入力: 「${selectedAction.label}」を適用します。よろしいですか？`,
              selectedAction.action,
            );
          }}
          disabled={!!readOnly}
          variant="outline"
          tone="primary"
          size="sm"
        />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-sm rounded-[14px] border border-emerald-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
            <div className="text-base font-semibold text-slate-950">確認</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmLabel}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <AppButton
                onClick={close}
                variant="outline"
                tone="neutral"
                size="sm"
              >
                キャンセル
              </AppButton>
              <AppButton
                onClick={applySelectedAction}
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
