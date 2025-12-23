import {
  Autocomplete,
  Box,
  Button,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { CloseDate } from "@shared/api/graphql/types";
// Title removed per admin UI simplification
import dayjs from "dayjs";
import { lazy, Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import PageLoader from "@/shared/ui/feedback/PageLoader";
import { AttendanceDate } from "@/lib/AttendanceDate";

import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import useCloseDates from "../../../hooks/useCloseDates/useCloseDates";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";
import { defaultValues, Inputs } from "./common";
import EditJobTermInputDialog from "./EditJobTermInputDialog";

const JobTermTable = lazy(() => import("./JobTermTable"));

export default function JobTerm() {
  const dispatch = useAppDispatchV2();
  const candidateCloseDates = Array.from(Array(12).keys()).map((i) => {
    const date = dayjs().add(i, "month").date(1);
    return date;
  });

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

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
    reset,
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = (data: Inputs) => {
    if (!data.closeDate || !data.startDate || !data.endDate) {
      throw new Error("Please fill in all fields.");
    }

    void createCloseDate({
      closeDate: data.closeDate.toISOString(),
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
    }).then(() => {
      reset(defaultValues);
    });
  };

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
        <Box>
          <Stack spacing={2}>
            <Box>
              <Controller
                name="closeDate"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    options={candidateCloseDates}
                    value={value}
                    getOptionLabel={(option) => option.format("YYYY/MM")}
                    onChange={(_, v) => {
                      if (!v) return;
                      onChange(v);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="集計対象月" size="small" />
                    )}
                  />
                )}
              />
            </Box>
            <Box>
              <Stack spacing={2} direction="row" alignItems="center">
                <Box>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker
                        label="開始日"
                        format={AttendanceDate.DisplayFormat}
                        slotProps={{
                          textField: { size: "small" },
                        }}
                        {...field}
                      />
                    )}
                  />
                </Box>
                <Box>〜</Box>
                <Box>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker
                        label="終了日"
                        format={AttendanceDate.DisplayFormat}
                        slotProps={{
                          textField: { size: "small" },
                        }}
                        {...field}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </Box>
            <Box>
              <Button
                variant="contained"
                disabled={!isDirty || !isValid || isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                追加
              </Button>
            </Box>
          </Stack>
        </Box>
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
