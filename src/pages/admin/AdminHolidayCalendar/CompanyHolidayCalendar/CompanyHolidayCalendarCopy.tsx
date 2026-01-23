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
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatchV2 } from "@/app/hooks";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { CompanyHolidayCalenderMessage } from "@/lib/message/CompanyHolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

type Inputs = {
  holidayDate: string;
  name: string;
};

const defaultValues: Inputs = {
  holidayDate: "",
  name: "",
};

export default function CompanyHolidayCalendarCopy({
  companyHolidayCalendar,
  createCompanyHolidayCalendar,
}: {
  companyHolidayCalendar: CompanyHolidayCalendar;
  createCompanyHolidayCalendar: (
    input: CreateCompanyHolidayCalendarInput
  ) => Promise<void | CompanyHolidayCalendar>;
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
    setValue("holidayDate", companyHolidayCalendar.holidayDate ?? "");
    setValue("name", companyHolidayCalendar.name ?? "");
  }, [open, companyHolidayCalendar, setValue]);

  const handleClose = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (data: Inputs) => {
    const companyHolidayCalenderMessage = new CompanyHolidayCalenderMessage();
    await createCompanyHolidayCalendar(data)
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            companyHolidayCalenderMessage.create(MessageStatus.SUCCESS)
          )
        );
        reset(defaultValues);
        setOpen(false);
      })
      .catch(() =>
        dispatch(
          setSnackbarError(
            companyHolidayCalenderMessage.create(MessageStatus.ERROR)
          )
        )
      );
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        <DialogTitle>会社休日をコピーして新規作成</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              コピー元の内容を編集してから登録してください。
            </DialogContentText>
            <Controller
              name="holidayDate"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DatePicker
                  label="日付"
                  format={AttendanceDate.DisplayFormat}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toISOString() ?? "")}
                  slotProps={{
                    textField: {
                      required: true,
                    },
                  }}
                />
              )}
            />
            <TextField
              label="休日名"
              required
              {...register("name", { required: true })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
          >
            キャンセル
          </Button>
          <Button
            disabled={!isValid || !isDirty || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            登録
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
