import { AppButton } from "@/shared/ui/button";

import AppDialog from "./AppDialog";

type LeaveGuardDialogProps = {
  open: boolean;
  target: "page" | "dialog";
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const getDescription = ({
  isBusy,
  target,
}: Pick<LeaveGuardDialogProps, "isBusy" | "target">) => {
  if (isBusy) {
    return "処理中です。中断される可能性があります。続行しますか？";
  }

  if (target === "dialog") {
    return "未保存の変更があります。破棄して閉じますか？";
  }

  return "未保存の変更があります。破棄して画面を離れますか？";
};

export default function LeaveGuardDialog({
  open,
  target,
  isBusy = false,
  onConfirm,
  onCancel,
}: LeaveGuardDialogProps) {
  return (
    <AppDialog
      open={open}
      onClose={onCancel}
      title="変更内容の確認"
      description={getDescription({ isBusy, target })}
      maxWidth="xs"
      actions={
        <>
          <AppButton variant="outline" tone="neutral" onClick={onCancel}>
            キャンセル
          </AppButton>
          <AppButton variant="solid" tone="danger" onClick={onConfirm}>
            破棄して続行
          </AppButton>
        </>
      }
    />
  );
}
