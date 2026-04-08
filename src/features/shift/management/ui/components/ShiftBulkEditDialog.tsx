import AppButton from "@shared/ui/button/AppButton";
import { X } from "lucide-react";
import { useEffect } from "react";

import { ShiftState } from "../../lib/generateMockShifts";
import {
  shiftStateOptions,
  statusVisualMap,
} from "../../lib/shiftStateMapping";

export type ShiftBulkEditDialogProps = {
  open: boolean;
  selectedStaffCount: number;
  selectedDayCount: number;
  selectedCellCount: number;
  bulkEditState: ShiftState;
  isSaving: boolean;
  canSubmit: boolean;
  onClose: () => void;
  onStateChange: (state: ShiftState) => void;
  onSubmit: () => void;
};

export default function ShiftBulkEditDialog({
  open,
  selectedStaffCount,
  selectedDayCount,
  selectedCellCount,
  bulkEditState,
  isSaving,
  canSubmit,
  onClose,
  onStateChange,
  onSubmit,
}: ShiftBulkEditDialogProps) {
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
          <h2 className="text-lg font-bold text-gray-900">
            選択した項目を一括変更
          </h2>
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
          <div className="mb-6 space-y-1 rounded-lg bg-gray-50 p-4">
            <div className="text-sm text-gray-600">
              選択スタッフ: <span className="font-bold">{selectedStaffCount}</span> 名
            </div>
            <div className="text-sm text-gray-600">
              選択日付: <span className="font-bold">{selectedDayCount}</span> 日
            </div>
            <div className="text-sm font-bold text-blue-600 pt-1">
              対象セル: {selectedCellCount} 件
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 ml-1">
              ステータス
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none ring-blue-500/20 focus:border-blue-500 focus:ring-4 transition-all disabled:bg-gray-100 disabled:opacity-50"
                value={bulkEditState}
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
            disabled={!canSubmit || isSaving}
            loading={isSaving}
          >
            {isSaving ? "保存中..." : "変更する"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
