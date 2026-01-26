import dayjs from "dayjs";

/**
 * 現在時刻をISO文字列で返します（秒とミリ秒は0に設定されます）。
 * @returns 秒とミリ秒が0の現在時刻のISO文字列
 */
export function getNowISOStringWithZeroSeconds() {
  return dayjs().second(0).millisecond(0).toISOString();
}

export function calcTotalRestTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);
  return diff;
}

export function calcTotalWorkTime(
  startTime: string | null | undefined,
  endTime: string | null | undefined
) {
  if (!startTime) return 0;

  const now = dayjs();
  const diff = dayjs(endTime || now).diff(dayjs(startTime), "hour", true);

  return diff;
}
