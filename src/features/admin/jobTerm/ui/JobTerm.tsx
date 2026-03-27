import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  Box,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { CloseDate } from "@shared/api/graphql/types";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { buildCandidateCloseDates } from "@/features/admin/jobTerm/lib/common";
import EditJobTermInputDialog from "@/features/admin/jobTerm/ui/EditJobTermInputDialog";
import JobTermBulkRegister from "@/features/admin/jobTerm/ui/JobTermBulkRegister";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";
import ConfirmDialog from "@/shared/ui/feedback/ConfirmDialog";

const JobTermTable = lazy(
  () => import("@/features/admin/jobTerm/ui/JobTermTable"),
);

const JobTermTableSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <Skeleton key={i} variant="rounded" height={42} />
    ))}
  </Box>
);

export default function JobTerm() {
  const dispatch = useAppDispatchV2();
  const [editTarget, setEditTarget] = useState<CloseDate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CloseDate | null>(null);

  const {
    closeDates,
    loading: closeDateLoading,
    error: closeDateError,
    createCloseDate,
    updateCloseDate,
    deleteCloseDate,
  } = useCloseDates();

  const candidateCloseDates = useMemo(
    () => buildCandidateCloseDates(closeDates),
    [closeDates],
  );

  const handleEdit = useCallback((row: CloseDate) => {
    setEditTarget(row);
  }, []);

  const handleDelete = useCallback((row: CloseDate) => {
    setDeleteTarget(row);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteTarget(null);
    try {
      await deleteCloseDate({ id: deleteTarget.id });
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S09004));
    } catch {
      dispatch(setSnackbarError(MESSAGE_CODE.E09004));
    }
  }, [deleteTarget, deleteCloseDate, dispatch]);

  if (closeDateLoading) {
    return <LinearProgress />;
  }

  if (closeDateError) {
    return (
      <Typography variant="body1">
        データ取得中に問題が発生しました。管理者に連絡してください。
      </Typography>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        <Typography>
          月ごとに勤怠を締める日付を指定します。
          <br />
          こちらで集計対象月を作成するとファイル出力時に選択して簡単に日付入力ができるようになります。
        </Typography>
        <JobTermBulkRegister
          existingCloseDates={closeDates}
          createCloseDate={createCloseDate}
        />
        <Suspense fallback={<JobTermTableSkeleton />}>
          <JobTermTable
            rows={closeDates}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Suspense>
      </Stack>
      <EditJobTermInputDialog
        targetData={editTarget}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        candidateCloseDates={candidateCloseDates}
        updateCloseDate={updateCloseDate}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        message="本当に削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
