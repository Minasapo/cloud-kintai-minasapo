import { UseFormHandleSubmit } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

export function RequestButtonItem({
  handleSubmit,
  onSubmit,
  isDirty: _isDirty,
  isValid: _isValid,
  isSubmitting,
}: {
  handleSubmit: UseFormHandleSubmit<AttendanceEditInputs>;
  onSubmit: (data: AttendanceEditInputs) => Promise<void>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}) {
  return (
    <button
      type="button"
      onClick={handleSubmit(onSubmit)}
      // disabled={!isDirty || !isValid || isSubmitting}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-700/55 bg-[#19b985] px-7 py-3 text-base font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(5,150,105,0.55)] transition hover:bg-[#17ab7b] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
    >
      {isSubmitting ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      申請
    </button>
  );
}
