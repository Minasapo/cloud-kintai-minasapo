import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import { StaffType } from "@/hooks/useStaffs/useStaffs";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { GenericMailSender } from "@/lib/mail/GenericMailSender";

import {
  Attendance,
  AttendanceChangeRequest,
  UpdateAttendanceInput,
} from "../../../API";
import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";
import AfterCard from "./AfterCard/AfterCard";
import BeforeCard from "./BeforeCard/BeforeCard";
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
  const [open, setOpen] = useState(false);
  const [changeRequest, setChangeRequest] =
    useState<AttendanceChangeRequest | null>(null);
  const [comment, setComment] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!attendance?.changeRequests) {
      setOpen(false);
      return;
    }

    const changeRequests = attendance.changeRequests
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => !item.completed);

    if (changeRequests.length === 0) {
      setOpen(false);
      return;
    }

    setChangeRequest(changeRequests[0]);
    setOpen(true);
  }, [attendance?.changeRequests]);

  const handleClose = () => {
    setOpen(false);
  };

  const getWorkDate = () => {
    if (!attendance) return "";
    const { workDate } = attendance;
    if (!dayjs(workDate).isValid()) return "";

    return dayjs(workDate).format(AttendanceDate.DisplayFormat);
  };

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
          <Stack direction="row" spacing={2} justifyContent="center">
            <Box>
              <BeforeCard attendance={attendance} />
            </Box>
            <Box sx={{ alignSelf: "center" }}>
              <ArrowForwardIcon fontSize="large" />
            </Box>
            <Box>
              <AfterCard
                changeRequest={changeRequest}
                attendance={attendance}
              />
            </Box>
          </Stack>
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

                new GenericMailSender(
                  staff,
                  updatedAttendance
                ).rejectChangeRequest(comment);

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

                new GenericMailSender(
                  staff,
                  updatedAttendance
                ).approveChangeRequest(comment);

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
