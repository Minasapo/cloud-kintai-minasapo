import { useAppDispatchV2 } from "@app/hooks";
import handleApproveChangeRequest from "@features/attendance/edit/ChangeRequestDialog/handleApproveChangeRequest";
import {
  Attendance,
  AttendanceChangeRequest,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import { StaffType } from "@/hooks/useStaffs/useStaffs";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { GenericMailSender } from "@/lib/mail/GenericMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

export type UseAdminAttendanceChangeRequestsParams = {
  staffId?: string;
  staff: Staff | undefined | null;
  staffForMail: StaffType | null;
  pendingAttendances: Attendance[];
  refetchAttendances: () => Promise<unknown>;
  updateAttendance: (input: UpdateAttendanceInput) => Promise<Attendance>;
};

export const useAdminAttendanceChangeRequests = ({
  staffId,
  staff,
  staffForMail,
  pendingAttendances,
  refetchAttendances,
  updateAttendance,
}: UseAdminAttendanceChangeRequestsParams) => {
  const dispatch = useAppDispatchV2();
  const [quickViewAttendance, setQuickViewAttendance] =
    useState<Attendance | null>(null);
  const [quickViewChangeRequest, setQuickViewChangeRequest] =
    useState<AttendanceChangeRequest | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>(
    []
  );
  const [bulkApproving, setBulkApproving] = useState(false);

  const getPendingChangeRequest = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getFirstUnapproved();
  }, []);

  const handleOpenQuickView = useCallback(
    (attendance: Attendance) => {
      const pendingRequest = getPendingChangeRequest(attendance);
      if (!pendingRequest) return;

      setQuickViewAttendance(attendance);
      setQuickViewChangeRequest(pendingRequest);
      setQuickViewOpen(true);
    },
    [getPendingChangeRequest]
  );

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewAttendance(null);
    setQuickViewChangeRequest(null);
  }, []);

  const isAttendanceSelected = useCallback(
    (attendanceId: string) => selectedAttendanceIds.includes(attendanceId),
    [selectedAttendanceIds]
  );

  const toggleAttendanceSelection = useCallback((attendanceId: string) => {
    setSelectedAttendanceIds((prev) => {
      if (prev.includes(attendanceId)) {
        return prev.filter((id) => id !== attendanceId);
      }
      return [...prev, attendanceId];
    });
  }, []);

  const toggleSelectAllPending = useCallback(() => {
    if (pendingAttendances.length === 0) return;
    setSelectedAttendanceIds((prev) => {
      if (prev.length === pendingAttendances.length) {
        return [];
      }
      return pendingAttendances.map((attendance) => attendance.id);
    });
  }, [pendingAttendances]);

  useEffect(() => {
    setSelectedAttendanceIds((prev) =>
      prev.filter((id) =>
        pendingAttendances.some((attendance) => attendance.id === id)
      )
    );
  }, [pendingAttendances]);

  const handleBulkApprove = useCallback(async () => {
    if (
      selectedAttendanceIds.length === 0 ||
      !staffId ||
      !staff ||
      !staffForMail
    ) {
      return;
    }

    const targetAttendances = pendingAttendances.filter((attendance) =>
      selectedAttendanceIds.includes(attendance.id)
    );
    if (targetAttendances.length === 0) return;

    let mailErrorOccurred = false;
    setBulkApproving(true);
    try {
      for (const attendance of targetAttendances) {
        // eslint-disable-next-line no-await-in-loop
        const updatedAttendance = await handleApproveChangeRequest(
          attendance,
          (input: UpdateAttendanceInput) => updateAttendance(input),
          undefined
        );

        try {
          new GenericMailSender(
            staffForMail,
            updatedAttendance
          ).approveChangeRequest(undefined);
        } catch (mailError) {
          console.error(
            "Failed to send approval notification mail:",
            mailError
          );
          mailErrorOccurred = true;
        }

        // eslint-disable-next-line no-await-in-loop
        await createOperationLogData({
          staffId: staffForMail.id,
          action: "approve_change_request",
          resource: "attendance",
          resourceId: updatedAttendance.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workDate: updatedAttendance.workDate,
            applicantStaffId: updatedAttendance.staffId,
            result: "approved",
            comment: null,
            bulk: true,
          }),
        }).catch((error) => {
          console.error("Failed to create operation log:", error);
        });
      }

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S04006));
      setSelectedAttendanceIds([]);
      await refetchAttendances();
      if (mailErrorOccurred) {
        dispatch(setSnackbarError(MESSAGE_CODE.E00002));
      }
    } catch (error) {
      console.error("Bulk approve failed", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E04006));
    } finally {
      setBulkApproving(false);
    }
  }, [
    selectedAttendanceIds,
    staffId,
    staff,
    staffForMail,
    pendingAttendances,
    updateAttendance,
    refetchAttendances,
    dispatch,
  ]);

  const canBulkApprove = useMemo(() => Boolean(staffForMail), [staffForMail]);

  return {
    quickViewAttendance,
    quickViewChangeRequest,
    quickViewOpen,
    handleOpenQuickView,
    handleCloseQuickView,
    selectedAttendanceIds,
    isAttendanceSelected,
    toggleAttendanceSelection,
    toggleSelectAllPending,
    bulkApproving,
    canBulkApprove,
    handleBulkApprove,
  } as const;
};
