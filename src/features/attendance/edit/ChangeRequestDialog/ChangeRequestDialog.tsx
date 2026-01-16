import { useAppDispatchV2 } from "@app/hooks";
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
import { Attendance, UpdateAttendanceInput } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as MESSAGE_CODE from "@/errors";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import { StaffType } from "@/hooks/useStaffs/useStaffs";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { GenericMailSender } from "@/lib/mail/GenericMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import { ChangeRequestDiffTable } from "./ChangeRequestDiffTable";
import handleApproveChangeRequest from "./handleApproveChangeRequest";
import handleRejectChangeRequest from "./handleRejectChangeRequest";

export default function ChangeRequestDialog({
  attendance,
  updateAttendance,
  staff,
}: {
  attendance: Attendance | null;
  updateAttendance: (input: UpdateAttendanceInput) => Promise<Attendance>;
  staff: StaffType | null | undefined;
}) {
  const dispatch = useAppDispatchV2();
  const navigate = useNavigate();
  const [comment, setComment] = useState<string | undefined>(undefined);
  const [manualClose, setManualClose] = useState(false);

  // 派生状態として計算：未完了の変更リクエストがあれば表示
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { open: shouldOpen, changeRequest } = useMemo(() => {
    if (!attendance?.changeRequests) {
      return { open: false, changeRequest: null };
    }

    const changeRequests = attendance.changeRequests
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => !item.completed);

    if (changeRequests.length === 0) {
      return { open: false, changeRequest: null };
    }

    return { open: true, changeRequest: changeRequests[0] };
  }, [attendance?.changeRequests]);

  // 実際の表示状態（手動で閉じられていない場合のみ表示）
  const open = shouldOpen && !manualClose;

  // changeRequestが変わったらmanualCloseをリセット
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManualClose(false);
  }, [changeRequest]);

  const handleClose = () => {
    setManualClose(true);
  };

  const getWorkDate = () => {
    if (!attendance) return "";
    const { workDate } = attendance;
    if (!dayjs(workDate).isValid()) return "";

    return dayjs(workDate).format(AttendanceDate.DisplayFormat);
  };

  if (!attendance || !changeRequest) {
    return null;
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>変更リクエスト(勤務日: {getWorkDate()})</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            スタッフから勤怠情報の変更リクエストが届いています。
            <br />
            内容を確認して承認または却下してください。
          </Typography>
          <ChangeRequestDiffTable
            attendance={attendance}
            changeRequest={changeRequest}
            size="medium"
          />
          <Stack direction="column" spacing={1}>
            <Typography variant="body1">【スタッフからのコメント】</Typography>
            <TextField
              fullWidth
              multiline
              disabled
              minRows={3}
              value={changeRequest?.staffComment || "コメントはありません"}
            />
          </Stack>
          <Stack direction="column" spacing={1}>
            <Typography variant="body1">【スタッフへのコメント】</Typography>
            <TextField
              label="コメント"
              fullWidth
              multiline
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
        <Button
          onClick={() => {
            handleRejectChangeRequest(attendance, updateAttendance, comment)
              .then(async (updatedAttendance) => {
                if (!staff || !updatedAttendance) {
                  throw new Error(MESSAGE_CODE.E00002);
                }

                try {
                  await new GenericMailSender(
                    staff,
                    updatedAttendance
                  ).rejectChangeRequest(comment);
                } catch (mailError) {
                  console.error(
                    "Failed to send rejection notification mail:",
                    mailError
                  );
                }

                // OperationLog を作成（失敗しても処理を止めない）
                try {
                  await createOperationLogData({
                    staffId: staff.id,
                    action: "reject_change_request",
                    resource: "attendance",
                    resourceId: updatedAttendance.id,
                    timestamp: new Date().toISOString(),
                    details: JSON.stringify({
                      workDate: updatedAttendance.workDate,
                      applicantStaffId: updatedAttendance.staffId,
                      result: "rejected",
                      comment: comment ?? null,
                    }),
                  });
                } catch (err) {
                  console.error(
                    "Failed to create operation log for reject change request:",
                    err
                  );
                }

                dispatch(setSnackbarSuccess(MESSAGE_CODE.S04007));
                handleClose();
              })
              .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E04007)));
            handleClose();
          }}
          variant="contained"
          color="error"
        >
          却下
        </Button>
        <Button
          onClick={() => {
            handleApproveChangeRequest(attendance, updateAttendance, comment)
              .then(async (updatedAttendance) => {
                if (!staff || !updatedAttendance) {
                  throw new Error(MESSAGE_CODE.E00002);
                }

                try {
                  await new GenericMailSender(
                    staff,
                    updatedAttendance
                  ).approveChangeRequest(comment);
                } catch (mailError) {
                  console.error(
                    "Failed to send approval notification mail:",
                    mailError
                  );
                }

                // OperationLog を作成（失敗しても処理を止めない）
                try {
                  await createOperationLogData({
                    staffId: staff.id,
                    action: "approve_change_request",
                    resource: "attendance",
                    resourceId: updatedAttendance.id,
                    timestamp: new Date().toISOString(),
                    details: JSON.stringify({
                      workDate: updatedAttendance.workDate,
                      applicantStaffId: updatedAttendance.staffId,
                      result: "approved",
                      comment: comment ?? null,
                    }),
                  });
                } catch (err) {
                  console.error(
                    "Failed to create operation log for approve change request:",
                    err
                  );
                }

                dispatch(setSnackbarSuccess(MESSAGE_CODE.S04006));
                // navigate to staff attendance list
                navigate(
                  `/admin/staff/${updatedAttendance.staffId}/attendance`
                );
                handleClose();
              })
              .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E04006)));
          }}
          variant="contained"
        >
          承認
        </Button>
      </DialogActions>
    </Dialog>
  );
}
