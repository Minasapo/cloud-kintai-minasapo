export const BUSINESS_TIME_ZONE = "Asia/Tokyo";
export const DEFAULT_BUSINESS_DAY_BOUNDARY_HOUR = 0;

type BusinessDateOptions = {
  timeZone?: string;
  dayBoundaryHour?: number;
};

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

const buildDateFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

const parseZonedDateParts = (date: Date, timeZone: string): ZonedDateParts => {
  const parts = buildDateFormatter(timeZone).formatToParts(date);
  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  const year = Number(lookup.get("year"));
  const month = Number(lookup.get("month"));
  const day = Number(lookup.get("day"));
  const hour = Number(lookup.get("hour"));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour)
  ) {
    throw new Error("Failed to resolve business date");
  }

  return { year, month, day, hour };
};

const toDateString = (year: number, month: number, day: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const shiftBackOneDay = (year: number, month: number, day: number) => {
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() - 1);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
};

const toDate = (occurredAt: string | Date) => {
  const parsed = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid occurredAt value: ${String(occurredAt)}`);
  }
  return parsed;
};

export function resolveBusinessWorkDate(
  occurredAt: string | Date,
  {
    timeZone = BUSINESS_TIME_ZONE,
    dayBoundaryHour = DEFAULT_BUSINESS_DAY_BOUNDARY_HOUR,
  }: BusinessDateOptions = {},
) {
  const date = toDate(occurredAt);
  const { year, month, day, hour } = parseZonedDateParts(date, timeZone);

  if (dayBoundaryHour > 0 && hour < dayBoundaryHour) {
    const shifted = shiftBackOneDay(year, month, day);
    return toDateString(shifted.year, shifted.month, shifted.day);
  }

  return toDateString(year, month, day);
}

export function resolveCurrentBusinessWorkDate(
  options: BusinessDateOptions = {},
) {
  return resolveBusinessWorkDate(new Date(), options);
}

