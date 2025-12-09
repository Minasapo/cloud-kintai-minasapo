import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Attendance, AttendanceChangeRequest } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useMemo } from "react";

import { ChangeRequestDiffTable } from "@/components/attendance_editor/ChangeRequestDialog/ChangeRequestDiffTable";
import { AttendanceDate } from "@/lib/AttendanceDate";

export type ChangeRequestQuickViewDialogProps = {
  open: boolean;
  attendance: Attendance | null;
  changeRequest: AttendanceChangeRequest | null;
  onClose: () => void;
};

export default function ChangeRequestQuickViewDialog({
  open,
  attendance,
  changeRequest,
  onClose,
}: ChangeRequestQuickViewDialogProps) {
  const workDateLabel = useMemo(() => {
    if (!attendance?.workDate) return "";
    const date = dayjs(attendance.workDate);
    if (!date.isValid()) return "";
    return date.format(AttendanceDate.DisplayFormat);
  }, [attendance?.workDate]);

  if (!attendance || !changeRequest) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>変更リクエスト</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            未承認の変更リクエストはありません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>変更リクエスト(勤務日: {workDateLabel || "-"})</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            編集画面を開かなくても、スタッフから申請された内容を確認できます。
          </Typography>
          <ChangeRequestDiffTable
            attendance={attendance}
            changeRequest={changeRequest}
          />
          <Stack direction="column" spacing={1}>
            <Typography variant="body1">【スタッフからのコメント】</Typography>
            <TextField
              fullWidth
              multiline
              disabled
              minRows={3}
              value={changeRequest.staffComment || "コメントはありません"}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
