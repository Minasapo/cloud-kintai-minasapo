import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { CloseDate, CreateCloseDateInput } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@/entities/calendar/api/calendarApi";
import { AttendanceDate } from "@/lib/AttendanceDate";

import { useAppDispatchV2 } from "../../../app/hooks";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";

type BulkFormValues = {
  startMonth: dayjs.Dayjs | null;
  closingDay: number | null;
  monthCount: number | null;
  adjustDirection: "previous" | "next";
  considerWeekend: boolean;
  considerHolidayCalendar: boolean;
  considerCompanyHolidayCalendar: boolean;
};

type PreviewItem = {
  closeMonth: dayjs.Dayjs;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  baseEndDate: dayjs.Dayjs;
  adjustmentReason?: string;
  isDuplicate: boolean;
};

type Props = {
  existingCloseDates: CloseDate[];
  createCloseDate: (input: CreateCloseDateInput) => Promise<void>;
};

const defaultValues: BulkFormValues = {
  startMonth: dayjs().startOf("month"),
  closingDay: 31,
  monthCount: 6,
  adjustDirection: "previous",
  considerWeekend: true,
  considerHolidayCalendar: true,
  considerCompanyHolidayCalendar: true,
};

export default function JobTermBulkRegister({
  existingCloseDates,
  createCloseDate,
}: Props) {
  const dispatch = useAppDispatchV2();
  const [submitting, setSubmitting] = useState(false);

  const { data: holidayCalendars = [], isLoading: loadingHoliday } =
    useGetHolidayCalendarsQuery();
  const { data: companyHolidayCalendars = [], isLoading: loadingCompany } =
    useGetCompanyHolidayCalendarsQuery();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
    setValue,
  } = useForm<BulkFormValues>({
    mode: "onChange",
    defaultValues,
  });

  const startMonth = watch("startMonth");
  const closingDay = watch("closingDay");
  const monthCount = watch("monthCount");
  const adjustDirection = watch("adjustDirection");
  const considerWeekend = watch("considerWeekend");
  const considerHolidayCalendar = watch("considerHolidayCalendar");
  const considerCompanyHolidayCalendar = watch(
    "considerCompanyHolidayCalendar"
  );

  const holidaySet = useMemo(() => {
    const dates = holidayCalendars.map((item) =>
      dayjs(item.holidayDate).format(AttendanceDate.DataFormat)
    );
    return new Set(dates);
  }, [holidayCalendars]);

  const companyHolidaySet = useMemo(() => {
    const dates = companyHolidayCalendars.map((item) =>
      dayjs(item.holidayDate).format(AttendanceDate.DataFormat)
    );
    return new Set(dates);
  }, [companyHolidayCalendars]);

  const isNonWorkingDay = useCallback(
    (date: dayjs.Dayjs) => {
      const reasons: string[] = [];
      if (considerWeekend) {
        const day = date.day();
        if (day === 0 || day === 6) {
          reasons.push("土日");
        }
      }

      const key = date.format(AttendanceDate.DataFormat);

      if (considerHolidayCalendar && holidaySet.has(key)) {
        reasons.push("休日カレンダー");
      }

      if (considerCompanyHolidayCalendar && companyHolidaySet.has(key)) {
        reasons.push("会社休日カレンダー");
      }

      return reasons;
    },
    [
      considerCompanyHolidayCalendar,
      considerHolidayCalendar,
      considerWeekend,
      companyHolidaySet,
      holidaySet,
    ]
  );

  const adjustCloseDate = useCallback(
    (target: dayjs.Dayjs) => {
      let current = target;
      let lastReasons: string[] = [];
      let steps = 0;

      while (true) {
        const reasons = isNonWorkingDay(current);
        if (reasons.length === 0) break;
        lastReasons = reasons;
        current =
          adjustDirection === "previous"
            ? current.subtract(1, "day")
            : current.add(1, "day");
        steps += 1;
        if (steps > 90) break; // safety guard
      }

      return { adjusted: current, lastReasons };
    },
    [adjustDirection, isNonWorkingDay]
  );

  const previewItems = useMemo<PreviewItem[]>(() => {
    if (!startMonth || !closingDay || !monthCount) return [];

    const startOfMonth = startMonth.startOf("month");
    const existingMonthKeys = new Set(
      existingCloseDates.map((closeDate) =>
        dayjs(closeDate.closeDate).format("YYYY-MM")
      )
    );

    return Array.from({ length: monthCount }).map((_, index) => {
      const closeMonth = startOfMonth.add(index, "month");
      const endDay = Math.min(closingDay, closeMonth.daysInMonth());
      const baseEndDate = closeMonth.date(endDay);
      const { adjusted: endDate, lastReasons } = adjustCloseDate(baseEndDate);
      const startDate = endDate.subtract(1, "month").add(1, "day");
      const isDuplicate = existingMonthKeys.has(closeMonth.format("YYYY-MM"));
      const adjustmentReason = endDate.isSame(baseEndDate, "day")
        ? undefined
        : `${lastReasons.join("・")}のため${
            adjustDirection === "previous" ? "前倒し" : "後ろ倒し"
          }`;

      return {
        closeMonth,
        startDate,
        endDate,
        baseEndDate,
        adjustmentReason,
        isDuplicate,
      };
    });
  }, [
    startMonth,
    closingDay,
    monthCount,
    existingCloseDates,
    adjustCloseDate,
    adjustDirection,
  ]);

  const creatableItems = previewItems.filter((item) => !item.isDuplicate);

  const onSubmit = handleSubmit(async () => {
    if (creatableItems.length === 0) {
      dispatch(
        setSnackbarError("登録可能な月がありません。すでに登録済みです。")
      );
      return;
    }

    setSubmitting(true);
    try {
      for (const item of creatableItems) {
        await createCloseDate({
          closeDate: item.closeMonth.toISOString(),
          startDate: item.startDate.toISOString(),
          endDate: item.endDate.toISOString(),
        });
      }

      dispatch(
        setSnackbarSuccess(
          `${creatableItems.length}件の集計対象月を登録しました`
        )
      );
    } catch (e) {
      dispatch(setSnackbarError("集計対象月の登録に失敗しました"));
    } finally {
      setSubmitting(false);
    }
  });

  const disableSubmit = submitting || !isValid || creatableItems.length === 0;

  return (
    <Stack spacing={2} sx={{ border: 1, borderColor: "divider", p: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="h6">締め日指定でまとめて登録</Typography>
        <Typography variant="body2" color="text.secondary">
          締め日が存在しない月は月末を締め日として扱います。既に登録済みの月はスキップ対象として表示します。
        </Typography>
        <Typography variant="body2" color="text.secondary">
          土日・休日カレンダー・会社休日カレンダーに該当する場合は、指定方向にずらして締め日を決定します。
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Controller
          name="startMonth"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <DatePicker
              {...field}
              views={["year", "month"]}
              label="開始月"
              format="YYYY/MM"
              slotProps={{
                textField: {
                  size: "small",
                  error: !!fieldState.error,
                  helperText: fieldState.error ? "必須項目です" : undefined,
                },
              }}
              onChange={(value) =>
                field.onChange(value?.startOf("month") ?? null)
              }
            />
          )}
        />

        <Controller
          name="closingDay"
          control={control}
          rules={{ required: true, min: 1, max: 31 }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="締め日"
              size="small"
              inputProps={{ min: 1, max: 31 }}
              error={!!fieldState.error}
              helperText={
                fieldState.error ? "1〜31で入力してください" : undefined
              }
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? null : Number(value));
              }}
            />
          )}
        />

        <Controller
          name="monthCount"
          control={control}
          rules={{ required: true, min: 1, max: 12 }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="number"
              label="登録月数"
              size="small"
              inputProps={{ min: 1, max: 12 }}
              error={!!fieldState.error}
              helperText={
                fieldState.error ? "1〜12で入力してください" : undefined
              }
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? null : Number(value));
              }}
            />
          )}
        />
      </Stack>

      <Stack spacing={1.5}>
        <FormLabel>非稼働日の調整</FormLabel>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <RadioGroup
            row
            value={adjustDirection}
            onChange={(e) =>
              setValue(
                "adjustDirection",
                e.target.value as "previous" | "next",
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }
          >
            <FormControlLabel
              value="previous"
              control={<Radio />}
              label="前倒し（直近の稼働日）"
            />
            <FormControlLabel
              value="next"
              control={<Radio />}
              label="後ろ倒し（次の稼働日）"
            />
          </RadioGroup>

          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={considerWeekend}
                  onChange={(e) =>
                    setValue("considerWeekend", e.target.checked, {
                      shouldDirty: true,
                    })
                  }
                />
              }
              label="土日を考慮"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={considerHolidayCalendar}
                  onChange={(e) =>
                    setValue("considerHolidayCalendar", e.target.checked, {
                      shouldDirty: true,
                    })
                  }
                />
              }
              label="休日カレンダーを考慮"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={considerCompanyHolidayCalendar}
                  onChange={(e) =>
                    setValue(
                      "considerCompanyHolidayCalendar",
                      e.target.checked,
                      {
                        shouldDirty: true,
                      }
                    )
                  }
                />
              }
              label="会社休日カレンダーを考慮"
            />
          </FormGroup>
        </Stack>
        {(loadingHoliday || loadingCompany) && (
          <Typography variant="body2" color="text.secondary">
            休日カレンダー情報を読み込み中です…
          </Typography>
        )}
      </Stack>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          登録内容プレビュー
        </Typography>
        {previewItems.length === 0 ? (
          <Typography color="text.secondary">
            条件を入力するとプレビューが表示されます。
          </Typography>
        ) : (
          <Stack spacing={1}>
            {previewItems.map((item) => (
              <Alert
                key={item.closeMonth.format("YYYY-MM")}
                severity={item.isDuplicate ? "info" : "success"}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Box sx={{ minWidth: 120 }}>
                    {item.closeMonth.format("YYYY年M月")}
                    {item.isDuplicate ? " (登録済み)" : ""}
                  </Box>
                  <Box>
                    {item.startDate.format(AttendanceDate.DisplayFormat)} 〜{" "}
                    {item.endDate.format(AttendanceDate.DisplayFormat)}
                    {item.baseEndDate.isSame(item.endDate, "day") ? null : (
                      <Typography
                        component="span"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        (元の締め日{" "}
                        {item.baseEndDate.format(AttendanceDate.DisplayFormat)}{" "}
                        → 調整後)
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ color: "text.secondary" }}>
                    {item.adjustmentReason}
                  </Box>
                </Stack>
              </Alert>
            ))}
          </Stack>
        )}
      </Box>

      <Box>
        <Button variant="contained" onClick={onSubmit} disabled={disableSubmit}>
          まとめて登録
        </Button>
      </Box>
    </Stack>
  );
}
