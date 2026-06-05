import { validationMessages } from "@shared/config/validationMessages";
import { isCompleteTime, parseTimeToISOOrNull } from "@shared/lib/time";
import dayjs, { Dayjs } from "dayjs";

export interface OvertimeCheckContext {
  /** AppConfig から取得した業務終了時刻（HH:mm 形式） */
  workEndTime: string | null;
  /** AppConfig から取得した残業チェック有効フラグ */
  overTimeCheckEnabled: boolean;
  /** 残業申請の終了時刻（HH:mm 形式）*/
  overtimeRequestEndTime: string | null;
  /** 残業申請が存在するか */
  hasOvertimeRequest: boolean;
}

export interface OvertimeCheckValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 勤務終了時刻に基づいて、残業チェックを実行する
 * @param endTime 退勤時刻
 * @param context 残業チェック用コンテキスト
 * @returns バリデーション結果
 */
export function validateOvertimeCheck(
  endTime: string | null | undefined,
  context: OvertimeCheckContext,
): OvertimeCheckValidationResult {
  // 残業チェックが無効な場合はスキップ
  if (!context.overTimeCheckEnabled) {
    return { isValid: true };
  }

  // 終了時刻が入力されていない場合はスキップ
  if (!endTime) {
    return { isValid: true };
  }

  // 業務終了時刻が設定されていない場合はスキップ
  if (!context.workEndTime) {
    return { isValid: true };
  }

  const endTimeDayjs = parseComparableTime(endTime);
  if (!endTimeDayjs) {
    return {
      isValid: false,
      errorMessage: validationMessages.common.invalidDateTime,
    };
  }

  const workEndTimeDayjs = parseComparableTime(context.workEndTime);
  if (!workEndTimeDayjs) {
    return {
      isValid: false,
      errorMessage: validationMessages.common.invalidDateTime,
    };
  }

  // 退勤時刻が業務終了時間を超えているかチェック
  if (endTimeDayjs.isAfter(workEndTimeDayjs)) {
    // 残業申請が存在するかチェック
    if (!context.hasOvertimeRequest) {
      return {
        isValid: false,
        errorMessage:
          validationMessages.attendance.overtime?.notRequested ||
          "業務終了時間を超過しています。残業申請が必要です。",
      };
    }

    // 残業申請の終了時刻が設定されている場合、超過チェック
    if (context.overtimeRequestEndTime) {
      const overtimeEndTimeDayjs = parseComparableTime(
        context.overtimeRequestEndTime,
      );
      if (!overtimeEndTimeDayjs) {
        return {
          isValid: false,
          errorMessage: validationMessages.common.invalidDateTime,
        };
      }

      if (endTimeDayjs.isAfter(overtimeEndTimeDayjs)) {
        return {
          isValid: false,
          errorMessage:
            validationMessages.attendance.overtime?.exceededApprovedTime ||
            "残業申請の終了時刻を超過しています。",
        };
      }
    }
  }

  return { isValid: true };
}

function parseComparableTime(timeStr: string | null | undefined): Dayjs | null {
  if (!timeStr) {
    return null;
  }

  if (isCompleteTime(timeStr)) {
    const isoTime = parseTimeToISOOrNull(timeStr, "2000-01-01");
    return isoTime ? dayjs(isoTime) : null;
  }

  const parsed = dayjs(timeStr);
  return parsed.isValid() ? parsed : null;
}

/**
 * ISO 8601 形式の日時から HH:mm を抽出
 * HH:mm 形式の場合そのまま返す
 * @param isoDateTime ISO 8601 形式の日時または HH:mm 形式の文字列
 * @returns HH:mm 形式の文字列、パース失敗時は null
 */
export function extractTimeFromISO(isoDateTime: string | null): string | null {
  if (!isoDateTime) {
    return null;
  }

  // HH:mm 形式の場合はそのまま返す
  if (/^\d{2}:\d{2}$/.test(isoDateTime)) {
    return isoDateTime;
  }

  try {
    const parsed = dayjs(isoDateTime);
    if (!parsed.isValid()) {
      return null;
    }
    return parsed.format("HH:mm");
  } catch {
    return null;
  }
}
