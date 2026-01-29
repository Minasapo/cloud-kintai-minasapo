// ログの action コード -> 日本語ラベルのマッピング
// ここに新しいコードを追加すれば、表示ラベルを統一して管理できます。
export const OPERATION_LOG_LABELS: Record<string, string> = {
  // 勤怠関連
  clock_in: "出勤",
  clock_out: "退勤",
  start_break: "休憩開始",
  end_break: "休憩終了",
  // 既存の別コード表記に対応
  rest_start: "休憩開始",
  rest_end: "休憩終了",

  // 編集リクエスト
  submit_change_request: "編集リクエストを送信",
  approve_change_request: "編集リクエストを承認",
  reject_change_request: "編集リクエストを却下",

  // スタッフ操作
  create_staff: "スタッフ作成",
  update_staff: "スタッフ更新",
  delete_staff: "スタッフ削除",

  // ドキュメント/ファイル
  upload_document: "ドキュメントをアップロード",
  delete_document: "ドキュメントを削除",

  // その他（必要に応じて追加してください）
};

/**
 * action コードを受け取り、日本語ラベルを返すヘルパー
 * - 未定義のコードは入力のまま返す（または null/空なら '-' を返す）
 */
export function getOperationLogLabel(code?: string | null): string {
  if (!code) return "-";
  return OPERATION_LOG_LABELS[code] ?? code;
}
