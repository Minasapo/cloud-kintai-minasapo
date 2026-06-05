import { type UpdateAttendanceMutationArg } from "@entities/attendance/api/attendanceApi";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { Stack, Typography } from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { GenericMailSender } from "@shared/lib/mail/GenericMailSender";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { AppButton } from "@shared/ui/button";
import AppDialog from "@shared/ui/feedback/AppDialog";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as MESSAGE_CODE from "@/errors";

import { ChangeRequestDiffTable } from "./ChangeRequestDiffTable";
import handleApproveChangeRequest from "./handleApproveChangeRequest";
import handleRejectChangeRequest from "./handleRejectChangeRequest";

const logger = createLogger("ChangeRequestDialog");

type ChangeRequestDialogProps = {
  attendance: Attendance | null;
  updateAttendance: (input: UpdateAttendanceMutationArg) => Promise<Attendance>;
  staff: StaffType | null | undefined;
};

type ActiveChangeRequest = Exclude<
  NonNullable<Attendance["changeRequests"]>[number],
  null
>;

function getActiveChangeRequest(attendance: Attendance | null): {
  open: boolean;
  changeRequest: ActiveChangeRequest | null;
} {
  if (!attendance?.changeRequests) {
    return { open: false, changeRequest: null };
  }

  const changeRequests = attendance.changeRequests
    .filter((item): item is ActiveChangeRequest => item !== null)
    .filter((item) => !item.completed);

  if (changeRequests.length === 0) {
    return { open: false, changeRequest: null };
  }

  return { open: true, changeRequest: changeRequests[0] };
}

const getChangeRequestSignature = (
  changeRequest: ActiveChangeRequest | null,
): string | null => {
  if (!changeRequest) {
    return null;
  }

  return JSON.stringify(changeRequest);
};

export default function ChangeRequestDialog({
  attendance,
  updateAttendance,
  staff,
}: ChangeRequestDialogProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [comment, setComment] = useState<string | undefined>(undefined);
  const [closedChangeRequestSignature, setClosedChangeRequestSignature] =
    useState<string | null>(null);

  const { open: hasPendingChangeRequest, changeRequest } =
    getActiveChangeRequest(attendance);
  const changeRequestSignature = useMemo(
    () => getChangeRequestSignature(changeRequest),
    [changeRequest],
  );
  const open =
    hasPendingChangeRequest &&
    changeRequestSignature !== null &&
    changeRequestSignature !== closedChangeRequestSignature;

  const handleClose = useCallback(() => {
    setClosedChangeRequestSignature(changeRequestSignature);
  }, [changeRequestSignature]);

  const workDate = useMemo(() => {
    if (!attendance) {
      return "";
    }

    const { workDate } = attendance;
    if (!dayjs(workDate).isValid()) {
      return "";
    }

    return dayjs(workDate).format(AttendanceDate.DisplayFormat);
  }, [attendance]);

  const handleReject = useCallback(() => {
    void handleRejectChangeRequest(attendance, updateAttendance, comment)
      .then(async (updatedAttendance) => {
        if (!staff || !updatedAttendance) {
          throw new Error(MESSAGE_CODE.E00002);
        }

        try {
          await new GenericMailSender(
            staff,
            updatedAttendance,
          ).rejectChangeRequest(comment);
        } catch (mailError) {
          logger.error(
            "Failed to send rejection notification mail:",
            mailError,
          );
        }

        dispatch(
          pushNotification({
            tone: "success",
            message: MESSAGE_CODE.S04007,
          }),
        );
        handleClose();
      })
      .catch(() =>
        dispatch(
          pushNotification({
            tone: "error",
            message: MESSAGE_CODE.E04007,
          }),
        ),
      );

    handleClose();
  }, [attendance, comment, dispatch, handleClose, staff, updateAttendance]);

  const handleApprove = useCallback(() => {
    void handleApproveChangeRequest(attendance, updateAttendance, comment)
      .then(async (updatedAttendance) => {
        if (!staff || !updatedAttendance) {
          throw new Error(MESSAGE_CODE.E00002);
        }

        try {
          await new GenericMailSender(
            staff,
            updatedAttendance,
          ).approveChangeRequest(comment);
        } catch (mailError) {
          logger.error(
            "Failed to send approval notification mail:",
            mailError,
          );
        }

        dispatch(
          pushNotification({
            tone: "success",
            message: "勤怠情報の変更リクエストを承認しました",
            description: updatedAttendance.workDate
              ? `${updatedAttendance.workDate} の勤怠情報の変更リクエストが承認されました`
              : undefined,
          }),
        );
        navigate(`/admin/staff/${updatedAttendance.staffId}/attendance`);
        handleClose();
      })
      .catch(() =>
        dispatch(
          pushNotification({
            tone: "error",
            message: MESSAGE_CODE.E04006,
          }),
        ),
      );
  }, [
    attendance,
    comment,
    dispatch,
    handleClose,
    navigate,
    staff,
    updateAttendance,
  ]);

  if (!attendance || !changeRequest) {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      title={`変更リクエスト(勤務日: ${workDate})`}
      actions={
        <>
          <AppButton variant="ghost" onClick={handleClose}>
            閉じる
          </AppButton>
          <AppButton variant="solid" tone="danger" onClick={handleReject}>
            却下
          </AppButton>
          <AppButton variant="solid" onClick={handleApprove}>
            承認
          </AppButton>
        </>
      }
    >
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
          <AppTextField
            fullWidth
            multiline
            disabled
            minRows={3}
            value={changeRequest.staffComment || "コメントはありません"}
          />
        </Stack>
        <Stack direction="column" spacing={1}>
          <Typography variant="body1">【スタッフへのコメント】</Typography>
          <AppTextField
            label="コメント"
            fullWidth
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Stack>
      </Stack>
    </AppDialog>
  );
}
