import { CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";

export type Inputs = {
  closeDate: dayjs.Dayjs | null;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
};

export const defaultValues: Inputs = {
  closeDate: null,
  startDate: null,
  endDate: null,
};

export function buildCandidateCloseDates(closeDates: CloseDate[]): dayjs.Dayjs[] {
  const upcoming = Array.from({ length: 12 }, (_, i) =>
    dayjs().add(i, "month").startOf("month"),
  );
  const existing = closeDates.map((item) =>
    dayjs(item.closeDate).startOf("month"),
  );

  const uniqueByMonth = new Map<number, dayjs.Dayjs>();
  for (const date of [...upcoming, ...existing]) {
    const key = date.valueOf();
    if (!uniqueByMonth.has(key)) uniqueByMonth.set(key, date);
  }

  return [...uniqueByMonth.values()].toSorted((a, b) => a.valueOf() - b.valueOf());
}
