import dayjs from "dayjs";
import { z } from "zod";

export type TimeRangeShape = {
  startTime: string | null;
  endTime: string | null;
};

export type TimeRangeMessages = {
  incomplete: string;
  range: string;
};

/**
 * 共通の時間帯バリデーションを付与した Zod スキーマを生成します。
 * 個別フィールドで重複していた「開始/終了の両入力チェック」と「終了時刻が開始より後」判定を集約します。
 */
export const createTimeRangeValidator = <T extends TimeRangeShape>(
  schema: z.ZodType<T>,
  messages: TimeRangeMessages
) =>
  schema.superRefine((value, ctx) => {
    const hasStart = Boolean(value.startTime);
    const hasEnd = Boolean(value.endTime);

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: messages.incomplete,
        path: [hasStart ? "endTime" : "startTime"],
      });
      return;
    }

    if (
      hasStart &&
      hasEnd &&
      !dayjs(value.endTime).isAfter(dayjs(value.startTime))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: messages.range,
        path: ["endTime"],
      });
    }
  });
