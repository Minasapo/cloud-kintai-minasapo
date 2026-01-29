import dayjs from "dayjs";

import { formatISOToTime, parseTimeToISO } from "@/shared/lib/time";

/**
 * 勤怠管理における時刻データを統一的に扱うクラス
 *
 * 時刻は以下の形式で統一されます：
 * - 内部保持：ISO 8601 形式（例：2024-12-25T09:00:00+09:00）
 * - UI表示：HH:mm 形式（例：09:00）
 * - API送信：ISO 8601 形式
 *
 * このクラスを使用することで、時刻形式の変換を一元管理し、
 * 形式ミスを防ぐことができます。
 *
 * 使用例：
 * ```typescript
 * // HH:mm形式で初期化
 * const time = new AttendanceTime("09:00", "2024-12-25");
 *
 * // API送信用（ISO 8601形式）
 * const isoString = time.toAPI(); // "2024-12-25T09:00:00+09:00"
 *
 * // UI表示用（HH:mm形式）
 * const display = time.toDisplay(); // "09:00"
 * ```
 */
export class AttendanceTime {
  static None = "--:--";

  private isoValue: string;

  /**
   * HH:mm形式の時刻とYYYY-MM-DD形式の日付から初期化
   *
   * @param hhMm HH:mm形式の時刻（例：09:00）
   * @param baseDate YYYY-MM-DD形式の日付（例：2024-12-25）
   * @throws Error HH:mmまたはbaseDate形式が不正な場合
   */
  constructor(hhMm: string, baseDate: string) {
    // 形式検証
    if (!/^\d{2}:\d{2}$/.test(hhMm)) {
      throw new Error(`Invalid time format: "${hhMm}". Expected HH:mm format.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate)) {
      throw new Error(
        `Invalid date format: "${baseDate}". Expected YYYY-MM-DD format.`
      );
    }

    // ISO 8601形式に変換
    this.isoValue = parseTimeToISO(hhMm, baseDate);

    // 変換結果の妥当性チェック
    if (!dayjs(this.isoValue).isValid()) {
      throw new Error(
        `Failed to convert time: "${hhMm}" with date "${baseDate}"`
      );
    }
  }

  /**
   * ISO 8601形式の文字列から直接初期化
   * （他のシステムからのデータを取り込む場合に使用）
   *
   * @param isoString ISO 8601形式の文字列
   * @throws Error ISO形式が不正な場合
   */
  static fromISO(isoString: string): AttendanceTime {
    if (!dayjs(isoString).isValid()) {
      throw new Error(`Invalid ISO 8601 format: "${isoString}"`);
    }

    const instance = Object.create(AttendanceTime.prototype);
    instance.isoValue = isoString;
    return instance;
  }

  /**
   * API送信用の形式を取得
   * @returns ISO 8601形式の文字列
   */
  toAPI(): string {
    return this.isoValue;
  }

  /**
   * UI表示用の形式を取得
   * @returns HH:mm形式の文字列
   */
  toDisplay(): string {
    return formatISOToTime(this.isoValue);
  }

  /**
   * dayjs インスタンスを取得（カスタム処理が必要な場合）
   * @returns dayjs インスタンス
   */
  toDayjs(): dayjs.Dayjs {
    return dayjs(this.isoValue);
  }

  /**
   * ISO形式の文字列を取得
   * @returns ISO 8601形式の文字列
   */
  toISO(): string {
    return this.isoValue;
  }

  /**
   * デバッグ用の文字列表現
   * @returns HH:mm (ISO)の形式
   */
  toString(): string {
    return `${this.toDisplay()} (${this.isoValue})`;
  }
}
