import { isInvalidObjectPlaceholder } from "./isInvalidObjectPlaceholder";
import { toInlineJson } from "./toInlineJson";

/**
 * 操作ログのインライン値を表示用にフォーマットする。
 *
 * @param value フォーマット対象の値
 * @returns フォーマットされた文字列。表示できない場合は null を返す。
 */
export const formatOperationLogInlineValue = (
  value: unknown,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0 || isInvalidObjectPlaceholder(trimmed)) {
      return null;
    }
    return trimmed;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return toInlineJson(value);
};
