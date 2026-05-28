import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { useDeleteWithConfirm } from "@shared/lib/hooks/useDeleteWithConfirm";
import type { MessageGenerator } from "@shared/lib/message/Message";
import { MessageStatus } from "@shared/lib/message/Message";
import { AppDeleteIconButton } from "@shared/ui/button/AppActionIconButton";
import ConfirmDialog from "@shared/ui/feedback/ConfirmDialog";
import dayjs from "dayjs";

type Props<TInput> = {
  date: string;
  name: string;
  deleteInput: TInput;
  messageFactory: MessageGenerator;
  onDelete: (input: TInput) => Promise<void>;
};

export function CalendarItemDelete<TInput extends { id: string }>({
  date,
  name,
  deleteInput,
  messageFactory,
  onDelete,
}: Props<TInput>) {
  const confirmMessage = `「${dayjs(date).format(AttendanceDate.DisplayFormat)}(${name})」を削除しますか？\nこの操作は取り消せません。`;
  const { requestDelete, confirmDialogProps } = useDeleteWithConfirm<TInput>(
    confirmMessage,
    onDelete,
    messageFactory.delete(MessageStatus.SUCCESS),
    messageFactory.delete(MessageStatus.ERROR),
  );

  return (
    <>
      <AppDeleteIconButton onClick={() => requestDelete(deleteInput)} />
      <ConfirmDialog
        {...confirmDialogProps}
        title="削除確認"
        confirmLabel="削除"
      />
    </>
  );
}
