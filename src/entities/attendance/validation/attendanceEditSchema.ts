import { createTimeRangeValidator } from "@entities/attendance/validation/validators";
import { SystemCommentInput } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { z, type ZodType } from "zod";

import { validationMessages } from "@/constants/validationMessages";
import {
  AttendanceEditInputs,
  HourlyPaidHolidayTimeInputs,
  RestInputs,
} from "@/pages/attendance/edit/common";

const isoDateTimeSchema = z
  .string({
    invalid_type_error: validationMessages.common.invalidDateTime,
  })
  .datetime({
    offset: true,
    message: validationMessages.common.invalidDateTime,
  });

const dateTimeField: ZodType<string | null> = z.union([
  isoDateTimeSchema,
  z.null(),
]);

const isoDateSchema = z
  .string({
    invalid_type_error: validationMessages.common.invalidDate,
  })
  .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), {
    message: validationMessages.common.invalidDate,
  });

const dateField: ZodType<string | null> = z.union([isoDateSchema, z.null()]);

const restIntervalSchema: ZodType<RestInputs> = createTimeRangeValidator(
  z.object({
    startTime: dateTimeField,
    endTime: dateTimeField,
  }),
  {
    incomplete: validationMessages.attendance.rest.incomplete,
    range: validationMessages.attendance.rest.range,
  }
);

const hourlyPaidHolidayTimeSchema: ZodType<HourlyPaidHolidayTimeInputs> =
  createTimeRangeValidator(
    z.object({
      startTime: dateTimeField,
      endTime: dateTimeField,
    }),
    {
      incomplete: validationMessages.attendance.hourlyPaidHoliday.incomplete,
      range: validationMessages.attendance.hourlyPaidHoliday.range,
    }
  );

const systemCommentSchema: ZodType<SystemCommentInput> = z.object({
  comment: z.string(),
  confirmed: z.boolean(),
  createdAt: isoDateTimeSchema,
});

export const attendanceEditSchema: ZodType<AttendanceEditInputs> = z
  .object({
    workDate: dateField.optional(),
    startTime: dateTimeField,
    endTime: dateTimeField,
    isDeemedHoliday: z.boolean().optional(),
    specialHolidayFlag: z.boolean().optional(),
    paidHolidayFlag: z.boolean(),
    absentFlag: z.boolean().optional(),
    hourlyPaidHolidayTimes: z.array(hourlyPaidHolidayTimeSchema).optional(),
    substituteHolidayDate: dateField,
    goDirectlyFlag: z.boolean(),
    returnDirectlyFlag: z.boolean(),
    remarks: z.union([z.string(), z.null()]),
    remarkTags: z.array(z.string()).optional(),
    rests: z.array(restIntervalSchema),
    staffComment: z.string().optional(),
    histories: z.any().optional(),
    changeRequests: z.any().optional(),
    systemComments: z.array(systemCommentSchema),
    revision: z.number().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 勤務時間の前後関係チェック（両方入力されている場合のみ）
    if (
      data.startTime &&
      data.endTime &&
      !dayjs(data.endTime).isAfter(dayjs(data.startTime))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationMessages.attendance.workTime.range,
        path: ["endTime"],
      });
    }

    if (
      data.substituteHolidayDate &&
      !dayjs(data.substituteHolidayDate, "YYYY-MM-DD", true).isValid()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationMessages.attendance.substituteHoliday.invalidDate,
        path: ["substituteHolidayDate"],
      });
    }

    // 振替休日指定時は勤務時間/休憩を入力不可とする（差し戻し防止）
    if (data.substituteHolidayDate) {
      const hasWorkTime = data.startTime || data.endTime;
      const hasRest = data.rests?.some(
        (rest) => rest?.startTime || rest?.endTime
      );
      if (hasWorkTime || hasRest) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            validationMessages.attendance.substituteHoliday.workTimeNotAllowed,
          path: hasWorkTime ? ["startTime"] : ["rests"],
        });
      }
    }
  });
