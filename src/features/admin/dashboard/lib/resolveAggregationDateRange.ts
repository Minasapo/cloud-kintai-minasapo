import dayjs from "dayjs";

import {
  type CloseDatePeriod,
  getEffectiveDateRange,
} from "@/features/attendance/list/ui/attendanceListUtils";

export const resolveAggregationDateRange = (
  month: dayjs.Dayjs,
  closeDates: CloseDatePeriod[],
): { start: dayjs.Dayjs; end: dayjs.Dayjs } =>
  getEffectiveDateRange(month, closeDates);
