/**
 * 値が "[object Type]" のような形式の無効なオブジェクトプレースホルダーであるかどうかを判定します。
 *
 * @param value - 判定対象の文字列
 * @returns 無効なオブジェクトプレースホルダーである場合は true、それ以外は false
 */
export const isInvalidObjectPlaceholder = (value: string): boolean => {
  return /^\[object\s+[^\]]+\]$/i.test(value.trim());
};
