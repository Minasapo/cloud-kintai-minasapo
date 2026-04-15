import AppDialog from "@shared/ui/feedback/AppDialog";

import AttendanceSettingsContent from "./AttendanceSettingsContent";

type AttendanceSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const subtleButtonClassName =
  "rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white";

export default function AttendanceSettingsDialog({
  open,
  onClose,
}: AttendanceSettingsDialogProps) {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="勤怠設定"
      description="勤怠一覧と勤怠編集に関わる設定を、この画面からまとめて見直せます。"
      maxWidth="xl"
      actions={
        <button
          type="button"
          onClick={onClose}
          className={subtleButtonClassName}
        >
          閉じる
        </button>
      }
    >
      <div className="max-h-[72vh] overflow-y-auto pr-1">
        <AttendanceSettingsContent />
      </div>
    </AppDialog>
  );
}
