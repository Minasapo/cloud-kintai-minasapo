import {
  type CloseDatePeriod,
  getEffectiveDateRange,
} from "@entities/attendance/lib/aggregationDateRange";
import dayjs from "dayjs";

export const resolveAggregationDateRange = (
  month: dayjs.Dayjs,
  closeDates: CloseDatePeriod[],
): { start: dayjs.Dayjs; end: dayjs.Dayjs } =>
  getEffectiveDateRange(month, closeDates);
