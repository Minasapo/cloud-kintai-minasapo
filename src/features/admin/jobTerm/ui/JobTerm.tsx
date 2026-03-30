import useCloseDates from "@entities/attendance/model/useCloseDates";
import { CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react";

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
  <div className="flex flex-col gap-3">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="h-[42px] animate-pulse rounded-lg bg-slate-200" />
    ))}
  </div>
);

const JobTermDescription = memo(function JobTermDescription() {
  return (
    <p className="text-sm text-slate-600">
      月ごとに勤怠を締める日付を指定します。
      <br />
      こちらで集計対象月を作成するとファイル出力時に選択して簡単に日付入力ができるようになります。
    </p>
  );
});

const JobTermDialogs = memo(function JobTermDialogs({
  editTarget,
  deleteTarget,
  candidateCloseDates,
  updateCloseDate,
  onCloseEdit,
  onConfirmDelete,
  onCancelDelete,
}: {
  editTarget: CloseDate | null;
  deleteTarget: CloseDate | null;
  candidateCloseDates: dayjs.Dayjs[];
  updateCloseDate: ReturnType<typeof useCloseDates>["updateCloseDate"];
  onCloseEdit: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <>
      <EditJobTermInputDialog
        targetData={editTarget}
        open={editTarget !== null}
        onClose={onCloseEdit}
        candidateCloseDates={candidateCloseDates}
        updateCloseDate={updateCloseDate}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        message="本当に削除しますか？この操作は取り消せません。"
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
});

const JobTermTableSection = memo(function JobTermTableSection({
  closeDates,
  onEdit,
  onDelete,
}: {
  closeDates: CloseDate[];
  onEdit: (row: CloseDate) => void;
  onDelete: (row: CloseDate) => void;
}) {
  return (
    <Suspense fallback={<JobTermTableSkeleton />}>
      <JobTermTable rows={closeDates} onEdit={onEdit} onDelete={onDelete} />
    </Suspense>
  );
});

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
    return (
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
        <div className="h-full w-1/3 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  if (closeDateError) {
    return (
      <p className="text-sm text-slate-600">
        データ取得中に問題が発生しました。管理者に連絡してください。
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <JobTermDescription />
        <JobTermBulkRegister
          existingCloseDates={closeDates}
          createCloseDate={createCloseDate}
        />
        <JobTermTableSection
          closeDates={closeDates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <JobTermDialogs
        editTarget={editTarget}
        deleteTarget={deleteTarget}
        candidateCloseDates={candidateCloseDates}
        updateCloseDate={updateCloseDate}
        onCloseEdit={() => setEditTarget(null)}
        onConfirmDelete={() => {
          void handleDeleteConfirm();
        }}
        onCancelDelete={() => setDeleteTarget(null)}
      />
    </>
  );
}
