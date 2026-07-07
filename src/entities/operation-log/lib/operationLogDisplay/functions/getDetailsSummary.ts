import { parseOperationLogJsonLike } from "../../../model/operationLogLegacyCompatibility";

/**
 * 操作ログの詳細からサマリーを取得します。
 *
 * @param details - 操作ログの詳細オブジェクト（JSON形式またはオブジェクト）
 * @returns 解析されたサマリー。解析できない場合やサマリーが存在しない場合は undefined を返します。
 */
export const getDetailsSummary = (details?: unknown): unknown => {
  const parsed = parseOperationLogJsonLike(details);

  if (!parsed || typeof parsed !== "object" || !("summary" in parsed)) {
    return undefined;
  }

  return (parsed as { summary?: unknown }).summary;
};
