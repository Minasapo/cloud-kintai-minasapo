import {
  useDeleteAttendanceMutation,
  useLazyGetAttendanceByIdQuery,
} from "@entities/attendance/api/attendanceApi";
import { DuplicateAttendanceDaily } from "@entities/attendance/model/useAttendanceDaily";
import { Attendance } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

import { buildConfirmFieldRows } from "../lib/duplicateConfirmFieldRows";
import { useDuplicateSelectionModel } from "./useDuplicateSelectionModel";

const logger = createLogger("useDuplicateConfirmState");

type UseDuplicateConfirmStateParams = {
  dispatch: ReturnType<typeof useDispatch>;
  duplicates: DuplicateAttendanceDaily[];
  staffNameMap: Record<string, string>;
  triggerGetAttendanceById: ReturnType<typeof useLazyGetAttendanceByIdQuery>[0];
  deleteAttendance: ReturnType<typeof useDeleteAttendanceMutation>[0];
  resetToRecordMode: () => void;
  resetSelection: () => void;
  selectedRecordIndex: number | null;
};

type UseDuplicateAttendanceManagerStateParams = {
  duplicates: DuplicateAttendanceDaily[];
  staffNameMap: Record<string, string>;
};

function useDuplicateConfirmState({
  dispatch,
  duplicates,
  staffNameMap,
  triggerGetAttendanceById,
  deleteAttendance,
  resetToRecordMode,
  resetSelection,
  selectedRecordIndex,
}: UseDuplicateConfirmStateParams) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetStaffId, setConfirmTargetStaffId] = useState<
    string | null
  >(null);
  const [confirmTargetName, setConfirmTargetName] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmRecords, setConfirmRecords] = useState<Attendance[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

  const handleOpenConfirm = useCallback(
    async (staffId: string) => {
      resetToRecordMode();
      setConfirmTargetStaffId(staffId);
      setConfirmTargetName(staffNameMap[staffId] ?? staffId);
      setConfirmOpen(true);
      setConfirmLoading(true);

      const targetIds = duplicates
        .filter((duplicate) => duplicate.staffId === staffId)
        .flatMap((duplicate) => duplicate.ids);
      const uniqueIds = Array.from(new Set(targetIds)).filter(Boolean);

      try {
        const records = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const response = await triggerGetAttendanceById({ id }).unwrap();
              return response ?? null;
            } catch (error) {
              logger.error("Failed to fetch attendance", error);
              return null;
            }
          }),
        );

        const validRecords = records
          .filter((record): record is Attendance => Boolean(record))
          .toSorted((a, b) => {
            const aTime = dayjs(
              `${a.workDate} ${a.startTime || "00:00"}`,
            ).valueOf();
            const bTime = dayjs(
              `${b.workDate} ${b.startTime || "00:00"}`,
            ).valueOf();
            return aTime - bTime;
          });
        setConfirmRecords(validRecords);
      } catch (error) {
        logger.error("Failed to handle duplicate attendance", error);
        dispatch(
          pushNotification({
            tone: "error",
            message: MESSAGE_CODE.E00001,
          }),
        );
      } finally {
        setConfirmLoading(false);
      }
    },
    [
      dispatch,
      duplicates,
      resetToRecordMode,
      staffNameMap,
      triggerGetAttendanceById,
    ],
  );

  const handleOpenConfirmClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const staffId = event.currentTarget.dataset.staffId;
      if (staffId) {
        void handleOpenConfirm(staffId);
      }
    },
    [handleOpenConfirm],
  );

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);
    setConfirmRecords([]);
    resetSelection();
  }, [resetSelection]);

  const handleRequestDeleteDuplicates = useCallback(() => {
    if (selectedRecordIndex === null) {
      return;
    }

    const toDelete = confirmRecords
      .filter((_, index) => index !== selectedRecordIndex)
      .map((record) => record.id)
      .filter(Boolean) as string[];

    if (toDelete.length === 0) {
      return;
    }

    setDeleteTargetIds(toDelete);
    setDeleteConfirmOpen(true);
  }, [confirmRecords, selectedRecordIndex]);

  const handleCancelDeleteDuplicates = useCallback(() => {
    setDeleteConfirmOpen(false);
    setDeleteTargetIds([]);
  }, []);

  const handleDeleteDuplicates = useCallback(async () => {
    if (selectedRecordIndex === null || deleteTargetIds.length === 0) {
      return;
    }

    const selected = confirmRecords[selectedRecordIndex];
    setDeleteConfirmOpen(false);
    setDeleteTargetIds([]);

    setConfirmLoading(true);
    try {
      for (const id of deleteTargetIds) {
        try {
          await deleteAttendance({ id }).unwrap();
        } catch (error) {
          logger.error("Failed to delete attendance:", id, error);
          dispatch(
            pushNotification({
              tone: "error",
              message: MESSAGE_CODE.E00001,
            }),
          );
        }
      }

      setConfirmRecords(selected ? [selected] : []);
      dispatch(
        pushNotification({
          tone: "success",
          message: `選択したデータのみ残しました（残件数: ${selected ? 1 : 0}）`,
        }),
      );
    } finally {
      setConfirmLoading(false);
    }
  }, [
    confirmRecords,
    deleteAttendance,
    deleteTargetIds,
    dispatch,
    selectedRecordIndex,
  ]);

  const deleteConfirmMessage = useMemo(() => {
    if (deleteTargetIds.length === 0) {
      return "";
    }

    return `選択したデータのみを残し、他の重複レコードを削除します。対象件数: ${deleteTargetIds.length}\n削除対象ID: ${deleteTargetIds.join(", ")}\nこの操作は取り消せません。実行しますか？`;
  }, [deleteTargetIds]);

  return {
    confirmOpen,
    confirmTargetStaffId,
    confirmTargetName,
    confirmLoading,
    confirmRecords,
    handleOpenConfirmClick,
    handleCloseConfirm,
    handleRequestDeleteDuplicates,
    handleCancelDeleteDuplicates,
    handleDeleteDuplicates,
    deleteConfirmOpen,
    deleteConfirmMessage,
  };
}

export function useDuplicateAttendanceManagerState({
  duplicates,
  staffNameMap,
}: UseDuplicateAttendanceManagerStateParams) {
  const dispatch = useDispatch();
  const [triggerGetAttendanceById] = useLazyGetAttendanceByIdQuery();
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const confirmFieldRows = useMemo(() => buildConfirmFieldRows(), []);
  const {
    selectionMode,
    selectedRecordIndex,
    fieldSelections,
    resetSelection,
    resetToRecordMode,
    handleChangeSelectionMode,
    handleSelectRecord,
    handleSelectField,
  } = useDuplicateSelectionModel({
    fieldLabels: confirmFieldRows.map((row) => row.label),
  });

  const {
    confirmOpen,
    confirmTargetStaffId,
    confirmTargetName,
    confirmLoading,
    confirmRecords,
    handleOpenConfirmClick,
    handleCloseConfirm,
    handleRequestDeleteDuplicates,
    handleCancelDeleteDuplicates,
    handleDeleteDuplicates,
    deleteConfirmOpen,
    deleteConfirmMessage,
  } = useDuplicateConfirmState({
    dispatch,
    duplicates,
    staffNameMap,
    triggerGetAttendanceById,
    deleteAttendance,
    resetToRecordMode,
    resetSelection,
    selectedRecordIndex,
  });

  return {
    confirmFieldRows,
    selectionMode,
    selectedRecordIndex,
    fieldSelections,
    handleChangeSelectionMode,
    handleSelectRecord,
    handleSelectField,
    confirmOpen,
    confirmTargetStaffId,
    confirmTargetName,
    confirmLoading,
    confirmRecords,
    handleOpenConfirmClick,
    handleCloseConfirm,
    handleRequestDeleteDuplicates,
    handleCancelDeleteDuplicates,
    handleDeleteDuplicates,
    deleteConfirmOpen,
    deleteConfirmMessage,
  };
}
