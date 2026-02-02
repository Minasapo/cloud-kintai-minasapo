import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  CreateEventCalendarInput,
  EventCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { EventCalendarMessage } from "@/shared/lib/message/EventCalendarMessage";
import { MessageStatus } from "@/shared/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

type Inputs = {
  eventDate: string;
  name: string;
  description: string;
};

const defaultValues: Inputs = {
  eventDate: "",
  name: "",
  description: "",
};

export default function EventCalendarCopy({
  eventCalendar,
  createEventCalendar,
}: {
  eventCalendar: EventCalendar;
  createEventCalendar: (
    input: CreateEventCalendarInput
  ) => Promise<void | EventCalendar>;
}) {
  const dispatch = useAppDispatchV2();
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    // prefill the form when opening
    setValue("eventDate", eventCalendar.eventDate ?? "");
    setValue("name", eventCalendar.name ?? "");
    setValue("description", eventCalendar.description ?? "");
  }, [open, eventCalendar, setValue]);

  const handleClose = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (data: Inputs) => {
    const eventCalendarMessage = EventCalendarMessage();
    const { description, ...rest } = data;
    const input: CreateEventCalendarInput = {
      ...rest,
      description: description || undefined,
    };
    
    await createEventCalendar(input)
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            eventCalendarMessage.create(MessageStatus.SUCCESS)
          )
        );
        reset(defaultValues);
        setOpen(false);
      })
      .catch(() =>
        dispatch(
          setSnackbarError(eventCalendarMessage.create(MessageStatus.ERROR))
        )
      );
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>イベントをコピー</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              コピー元のイベント情報が入力されています。必要に応じて変更してください。
            </DialogContentText>
            <Controller
              name="eventDate"
              control={control}
              rules={{ required: "日付は必須項目です。" }}
              render={({ field, fieldState }) => {
                const { ref, value, onChange, name, onBlur, ...rest } = field;
                return (
                  <DatePicker
                    {...rest}
                    label="日付"
                    format={AttendanceDate.DisplayFormat}
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      onChange(
                        date ? date.format(AttendanceDate.DataFormat) : ""
                      )
                    }
                    slotProps={{
                      textField: {
                        required: true,
                        inputRef: ref,
                        name,
                        onBlur,
                        error: Boolean(fieldState.error),
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                );
              }}
            />
            <TextField
              label="イベント名"
              required
              {...register("name", {
                required: true,
              })}
            />
            <TextField
              label="詳細 (任意)"
              multiline
              rows={3}
              {...register("description")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button
            disabled={!isValid || !isDirty || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            コピーして作成
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
