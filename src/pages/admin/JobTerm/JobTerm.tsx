import useCloseDates from "@entities/attendance/model/useCloseDates";
import { LinearProgress, Stack, Typography } from "@mui/material";
import { CloseDate } from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import dayjs from "dayjs";
import { lazy, Suspense, useMemo, useState } from "react";

import PageLoader from "@/shared/ui/feedback/PageLoader";

import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";
import EditJobTermInputDialog from "./EditJobTermInputDialog";
import JobTermBulkRegister from "./JobTermBulkRegister";

const JobTermTable = lazy(() => import("./JobTermTable"));

export default function JobTerm() {
  const dispatch = useAppDispatchV2();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<CloseDate | null>(null);

  const {
    closeDates,
    loading: closeDateLoading,
    error: closeDateError,
    createCloseDate,
    updateCloseDate,
    deleteCloseDate,
  } = useCloseDates();

  const candidateCloseDates = useMemo(() => {
    const upcoming = Array.from(Array(12).keys()).map((i) =>
      dayjs().add(i, "month").startOf("month")
    );
    const existing = closeDates.map((item) =>
      dayjs(item.closeDate).startOf("month")
    );

    const merged = [...upcoming, ...existing];
    const uniqueByMonth = merged.reduce<dayjs.Dayjs[]>((acc, current) => {
      const exists = acc.some((item) => item.isSame(current, "month"));
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueByMonth.sort((a, b) => a.valueOf() - b.valueOf());
  }, [closeDates]);

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
        <Suspense fallback={<PageLoader />}>
          <JobTermTable
            rows={closeDates}
            onEdit={(row) => {
              setEditRow(row);
              setEditDialogOpen(true);
            }}
            onDelete={(row) => {
              // eslint-disable-next-line no-alert
              const result = window.confirm(
                "本当に削除しますか？この操作は取り消せません。"
              );
              if (!result) return;

              deleteCloseDate({ id: row.id })
                .then(() => dispatch(setSnackbarSuccess(MESSAGE_CODE.S09004)))
                .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E09004)));
            }}
          />
        </Suspense>
      </Stack>
      <EditJobTermInputDialog
        targetData={editRow}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        candidateCloseDates={candidateCloseDates}
        updateCloseDate={updateCloseDate}
      />
    </>
  );
}
