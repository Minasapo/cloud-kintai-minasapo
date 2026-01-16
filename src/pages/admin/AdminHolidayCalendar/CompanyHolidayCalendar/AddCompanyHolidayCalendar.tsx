import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Stack, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker } from "@mui/x-date-pickers";
import {
  CompanyHolidayCalendar,
  CreateCompanyHolidayCalendarInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { CompanyHolidayCalenderMessage } from "@/lib/message/CompanyHolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";

import { useAppDispatchV2 } from "../../../../app/hooks";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../../lib/reducers/snackbarReducer";
import {
  buildHolidayDateRange,
  HolidayDateRangeError,
  MAX_HOLIDAY_RANGE_DAYS,
} from "../HolidayCalendar/utils/buildHolidayDateRange";

type Inputs = {
  startDate: string;
  endDate: string;
  name: string;
};

const defaultValues: Inputs = {
  startDate: "",
  endDate: "",
  name: "",
};

export default function AddCompanyHolidayCalendar({
  createCompanyHolidayCalendar,
  bulkCreateCompanyHolidayCalendar,
}: {
  createCompanyHolidayCalendar: (
    input: CreateCompanyHolidayCalendarInput
  ) => Promise<CompanyHolidayCalendar>;
  bulkCreateCompanyHolidayCalendar: (
    inputs: CreateCompanyHolidayCalendarInput[]
  ) => Promise<CompanyHolidayCalendar[]>;
}) {
  const dispatch = useAppDispatchV2();

  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const startDateValue = watch("startDate");

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async ({ startDate, endDate, name }: Inputs) => {
    const companyHolidayCalenderMessage = new CompanyHolidayCalenderMessage();
    const isRangeSubmission = Boolean(endDate);

    try {
      if (isRangeSubmission) {
        const range = buildHolidayDateRange(startDate, endDate);
        const inputs = range.map((holidayDate) => ({ holidayDate, name }));
        await bulkCreateCompanyHolidayCalendar(inputs);
        const successMessage = `${companyHolidayCalenderMessage.getCategoryName()}を${
          range.length
        }件作成しました`;
        dispatch(setSnackbarSuccess(successMessage));
      } else {
        const [holidayDate] = buildHolidayDateRange(startDate);
        await createCompanyHolidayCalendar({ holidayDate, name });
        dispatch(
          setSnackbarSuccess(
            companyHolidayCalenderMessage.create(MessageStatus.SUCCESS)
          )
        );
      }

      reset(defaultValues);
      setOpen(false);
    } catch (error) {
      if (error instanceof HolidayDateRangeError) {
        dispatch(setSnackbarError(error.message));
        return;
      }

      dispatch(
        setSnackbarError(
          companyHolidayCalenderMessage.create(MessageStatus.ERROR)
        )
      );
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddCircleOutlineOutlinedIcon />}
        onClick={() => {
          setOpen(true);
        }}
      >
        休日を追加
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          reset(defaultValues);
          handleClose();
        }}
      >
        <DialogTitle>会社休日を追加</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              休日としたい日付と休日名を入力してください。
            </DialogContentText>
            <DialogContentText>
              {`開始日のみ入力した場合は単日登録、終了日を指定すると開始日から終了日までをまとめて登録します（最大${MAX_HOLIDAY_RANGE_DAYS}日）。`}
            </DialogContentText>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "開始日は必須項目です。" }}
              render={({ field, fieldState }) => {
                const { ref, value, onChange, name, onBlur, ...rest } = field;
                return (
                  <DatePicker
                    {...rest}
                    label="開始日"
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
            <Controller
              name="endDate"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value) {
                    return true;
                  }

                  if (!startDateValue) {
                    return "開始日を先に入力してください。";
                  }

                  const start = dayjs(
                    startDateValue,
                    AttendanceDate.DataFormat,
                    true
                  );
                  const end = dayjs(value, AttendanceDate.DataFormat, true);

                  if (!start.isValid()) {
                    return "開始日はYYYY-MM-DD形式で入力してください。";
                  }

                  if (!end.isValid()) {
                    return "終了日はYYYY-MM-DD形式で入力してください。";
                  }

                  if (end.isBefore(start)) {
                    return "終了日は開始日以降の日付を指定してください。";
                  }

                  return true;
                },
              }}
              render={({ field, fieldState }) => {
                const { ref, value, onChange, name, onBlur, ...rest } = field;
                return (
                  <DatePicker
                    {...rest}
                    label="終了日 (任意)"
                    format={AttendanceDate.DisplayFormat}
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      onChange(
                        date ? date.format(AttendanceDate.DataFormat) : ""
                      )
                    }
                    slotProps={{
                      textField: {
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
              label="休日名"
              required
              {...register("name", {
                required: true,
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              reset(defaultValues);
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
