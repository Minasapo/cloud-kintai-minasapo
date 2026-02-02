import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  CreateEventCalendarInput,
  EventCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { EventCalendarMessage } from "@/shared/lib/message/EventCalendarMessage";
import { MessageStatus } from "@/shared/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

export function CSVFilePicker({
  bulkCreateEventCalendar,
}: {
  bulkCreateEventCalendar: (
    inputs: CreateEventCalendarInput[],
  ) => Promise<EventCalendar[]>;
}) {
  const dispatch = useAppDispatchV2();

  const [open, setOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState<CreateEventCalendarInput[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (): Promise<boolean> => {
    if (isSubmitting) return false;
    if (uploadedData.length === 0) return false;

    // eslint-disable-next-line no-alert
    const result = window.confirm(
      `以下の${uploadedData.length}件のデータを登録しますか？`,
    );
    if (!result) return false;

    const eventCalendarMessage = EventCalendarMessage();
    setIsSubmitting(true);
    try {
      await bulkCreateEventCalendar(uploadedData);
      dispatch(setSnackbarSuccess(eventCalendarMessage.create(MessageStatus.SUCCESS)));
      return true;
    } catch {
      dispatch(setSnackbarError(eventCalendarMessage.create(MessageStatus.ERROR)));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileUploadIcon />}
        onClick={handleClickOpen}
      >
        ファイルからまとめて追加
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const isSucceeded = await onSubmit();
            if (isSucceeded) {
              handleClose();
            }
          },
        }}
      >
        <DialogTitle>ファイルからまとめて追加</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={1}>
            <Typography variant="body1">
              CSVファイル形式: eventDate (YYYY-MM-DD), name, description (任意)
            </Typography>
            <Typography variant="body1">
              例: 2026-04-01,花見,桜を見る会
            </Typography>
            <Typography variant="body1">
              ファイルを選択してください。
            </Typography>
            <FileInput setUploadedData={setUploadedData} />
            <Typography variant="body1">
              ファイルを選択したら、登録ボタンを押してください。
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting || uploadedData.length === 0}>
            {isSubmitting ? "登録中..." : "登録"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function FileInput({
  setUploadedData,
}: {
  setUploadedData: React.Dispatch<
    React.SetStateAction<CreateEventCalendarInput[]>
  >;
}) {
  const [name, setName] = useState<string | undefined>();

  return (
    <Box>
      <Button component="label" variant="outlined">
        ファイルを選択
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={(event) => {
            // ファイル名を設定
            const file = event.target.files?.item(0);
            if (!file) return;

            setName(file.name);

            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = () => {
              const csv = reader.result as string;
              const lines = csv.split(/\r\n|\n/);
              const data = lines.map((line) => line.split(","));

              const requestCalendars = data
                .slice(1) // skip header
                .filter((row) => row[0] !== "")
                .map((row) => {
                  const eventDate = dayjs(row[0].trim());
                  if (!eventDate.isValid()) {
                    return null;
                  }

                  return {
                    eventDate: eventDate.format(AttendanceDate.DataFormat),
                    name: String(row[1]?.trim() || ""),
                    description: row[2]?.trim() || undefined,
                  } as CreateEventCalendarInput;
                })
                .filter(
                  (item): item is CreateEventCalendarInput => item !== null,
                );

              setUploadedData(requestCalendars);
            };
          }}
        />
      </Button>
      <Typography>{name}</Typography>
    </Box>
  );
}
