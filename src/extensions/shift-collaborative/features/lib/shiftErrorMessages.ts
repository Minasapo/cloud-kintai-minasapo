import type { GraphQLBaseQueryError } from "@shared/api/graphql/graphqlBaseQuery";

type ConnectionState = "connected" | "disconnected" | "error";

interface ShiftErrorResult {
  message: string;
  connection: ConnectionState;
}

/**
 * エラーオブジェクトからユーザー向けメッセージと接続状態を導出する純粋関数
 */
export function buildShiftErrorMessage(err: unknown): ShiftErrorResult {
  const fallback = "シフトデータの処理に失敗しました";

  if (!err || typeof err !== "object") {
    return { message: fallback, connection: "error" };
  }

  const baseMessage =
    "message" in err && typeof err.message === "string"
      ? err.message
      : fallback;

  const details =
    "details" in err && err.details
      ? (err.details as GraphQLBaseQueryError["details"])
      : undefined;

  const normalizedMessage = baseMessage.toLowerCase();
  const isUnauthorized =
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("not authorized") ||
    normalizedMessage.includes("forbidden");
  const isValidation =
    normalizedMessage.includes("validation") ||
    normalizedMessage.includes("invalid");
  const isNetwork =
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("timeout") ||
    (typeof details === "object" && details && "statusCode" in details);
  const isVersionConflict =
    normalizedMessage.includes("conditionalcheckfailed") ||
    normalizedMessage.includes("conditional check failed") ||
    normalizedMessage.includes("the conditional request failed");

  if (isVersionConflict) {
    return {
      message:
        "他のユーザーがシフトを更新しています。画面を再読み込みしてください。",
      connection: "error",
    };
  }

  if (isUnauthorized) {
    return { message: "権限がありません。", connection: "error" };
  }

  if (isValidation) {
    return { message: "入力内容に誤りがあります。", connection: "error" };
  }

  if (isNetwork) {
    return {
      message: "ネットワークエラーが発生しました。",
      connection: "disconnected",
    };
  }

  return { message: baseMessage, connection: "error" };
}
