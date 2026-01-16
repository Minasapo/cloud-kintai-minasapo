import dayjs from "dayjs";
import { z } from "zod";

export type TimeRangeShape = {
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
};

export type TimeRangeMessages = {
  incomplete: string;
  range: string;
};

/**
 * 共通の時間帯バリデーションを付与した Zod スキーマを生成します。
 * 開始・終了は片方のみの入力も許可し、両方入力されている場合のみ「終了時刻が開始より後」をチェックします。
 * 休憩中や時間単位休暇の利用中など、部分的な入力状態を許容します。
 */
export const createTimeRangeValidator = <T extends Partial<TimeRangeShape>>(
  schema: z.ZodType<T, z.ZodTypeDef, T>,
  messages: TimeRangeMessages
) =>
  schema.superRefine((value, ctx) => {
    const hasStart = Boolean(value.startTime);
    const hasEnd = Boolean(value.endTime);

    // 両方入力されている場合のみ、開始 < 終了をチェック
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
