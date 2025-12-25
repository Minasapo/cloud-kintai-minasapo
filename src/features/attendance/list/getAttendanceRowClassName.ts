import type { SxProps, Theme } from "@mui/material/styles";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { CompanyHoliday } from "@/lib/CompanyHoliday";
import { DayOfWeek, DayOfWeekString } from "@/lib/DayOfWeek";
import { Holiday } from "@/lib/Holiday";
import { designTokenVar } from "@/shared/designSystem";

export type AttendanceRowVariant = "default" | "today" | "saturday" | "sunday";

export const attendanceRowVariantStyles: Record<
  AttendanceRowVariant,
  SxProps<Theme>
> = {
  default: {
    backgroundColor: designTokenVar("color.neutral.0", "#FFFFFF"),
  },
  today: {
    backgroundColor: designTokenVar(
      "color.feedback.warning.surface",
      "#FFF7EA"
    ),
    "& td, & th": {
      fontWeight: designTokenVar("typography.fontWeight.bold", "600"),
    },
  },
  saturday: {
    backgroundColor: designTokenVar("color.feedback.info.surface", "#EDF2FC"),
  },
  sunday: {
    backgroundColor: designTokenVar("color.feedback.danger.surface", "#FDECEC"),
  },
};

export const getAttendanceRowVariant = (
  attendance: Attendance,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
): AttendanceRowVariant => {
  const { workDate } = attendance;
  const today = dayjs().format(AttendanceDate.DataFormat);
  if (workDate === today) {
    return "today";
  }

  const isHoliday = new Holiday(holidayCalendars, workDate).isHoliday();
  const isCompanyHoliday = new CompanyHoliday(
    companyHolidayCalendars,
    workDate
  ).isHoliday();

  if (isHoliday || isCompanyHoliday) {
    return "sunday";
  }

  const dayOfWeek = new DayOfWeek(holidayCalendars).getLabel(workDate);
  switch (dayOfWeek) {
    case DayOfWeekString.Sat:
      return "saturday";
    case DayOfWeekString.Sun:
    case DayOfWeekString.Holiday:
      return "sunday";
    default:
      return "default";
  }
};

/**
 * @deprecated Prefer `getAttendanceRowVariant` and `attendanceRowVariantStyles`.
 */
export const getAttendanceRowClassName = (
  attendance: Attendance,
  holidayCalendars: HolidayCalendar[],
  companyHolidayCalendars: CompanyHolidayCalendar[]
) => {
  const variant = getAttendanceRowVariant(
    attendance,
    holidayCalendars,
    companyHolidayCalendars
  );
  switch (variant) {
    case "today":
      return "table-row--today";
    case "saturday":
      return "table-row--saturday";
    case "sunday":
      return "table-row--sunday";
    default:
      return "table-row--default";
  }
};
