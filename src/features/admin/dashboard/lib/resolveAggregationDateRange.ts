import dayjs from "dayjs";

import {
  type CloseDatePeriod,
  getEffectiveDateRange,
} from "@/entities/attendance/lib/aggregationDateRange";

export const resolveAggregationDateRange = (
  month: dayjs.Dayjs,
  closeDates: CloseDatePeriod[],
): { start: dayjs.Dayjs; end: dayjs.Dayjs } =>
  getEffectiveDateRange(month, closeDates);
