import AppButton from "@shared/ui/button/AppButton";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useEffect } from "react";

import { ShiftState } from "../../lib/generateMockShifts";
import {
  shiftStateOptions,
  statusVisualMap,
} from "../../lib/shiftStateMapping";
import { ShiftEditingTarget } from "../../model/useShiftManagementDialogs";

export type ShiftEditDialogProps = {
  open: boolean;
  editingCell: ShiftEditingTarget | null;
  editingState: ShiftState;
  isSaving: boolean;
  onClose: () => void;
  onStateChange: (state: ShiftState) => void;
  onSubmit: () => void;
};

export default function ShiftEditDialog({
  open,
  editingCell,
  editingState,
  isSaving,
  onClose,
  onStateChange,
  onSubmit,
}: ShiftEditDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, isSaving, onClose]);

  if (!open) return null;

  const editingDialogDateLabel = editingCell
    ? dayjs(editingCell.dateKey).format("YYYY年M月D日 (dd)")
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !isSaving && onClose()}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">シフトを変更</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {editingCell && (
            <div className="mb-6">
              <div className="text-base font-bold text-gray-800">
                {editingCell.staffName}
              </div>
              <div className="text-sm text-gray-500">
                {editingDialogDateLabel}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 ml-1">
              ステータス
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 transition-all disabled:bg-gray-100 disabled:opacity-50"
                value={editingState}
                onChange={(e) => onStateChange(e.target.value as ShiftState)}
                disabled={isSaving}
              >
                {shiftStateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {statusVisualMap[option.value].label} {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="h-4 w-4 border-l-2 border-b-2 border-gray-400 rotate-[-45deg] translate-y-[-2px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <AppButton
            variant="ghost"
            tone="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            キャンセル
          </AppButton>
          <AppButton
            variant="solid"
            tone="primary"
            onClick={onSubmit}
            disabled={!editingCell || isSaving}
            loading={isSaving}
          >
            {isSaving ? "保存中..." : "変更する"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
