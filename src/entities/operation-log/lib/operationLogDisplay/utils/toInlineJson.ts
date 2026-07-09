/**
 * 値をインラインのJSON文字列に変換します。
 * 値がオブジェクトでない場合、nullである場合、または文字列化に失敗した場合は null を返します。
 * 結果のJSON文字列が空であるか、空のオブジェクトを表す場合は null を返します。
 *
 * @param value - JSONに変換する値。
 * @returns JSON文字列表現、または null。
 */
export const toInlineJson = (value: unknown): string | null => {
  if (value === null || typeof value !== "object") {
    return null;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized && serialized !== "{}"
      ? serialized
      : (serialized ?? null);
  } catch {
    return null;
  }
};
