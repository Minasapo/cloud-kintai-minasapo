import dayjs from "dayjs";

/**
 * 現在時刻をISO文字列で返します（秒とミリ秒は0に設定されます）。
 * @returns 秒とミリ秒が0の現在時刻のISO文字列
 */
export function getNowISOStringWithZeroSeconds() {
  return dayjs().second(0).millisecond(0).toISOString();
}
