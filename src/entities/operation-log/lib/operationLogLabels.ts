// ログの action コード -> 日本語ラベルのマッピング
// ここに新しいコードを追加すれば、表示ラベルを統一して管理できます。
export const OPERATION_LOG_LABELS: Record<string, string> = {
  // 勤怠関連
  "attendance.create": "勤怠作成",
  "attendance.update": "勤怠更新",
  "attendance.delete": "勤怠削除",
  "attendance.clock_in": "出勤",
  "attendance.clock_out": "退勤",
  "attendance.go_directly": "直行",
  "attendance.return_directly": "直帰",
  "attendance.rest_start": "休憩開始",
  "attendance.rest_end": "休憩終了",
  "attendance.request.submit": "編集リクエストを送信",
  "attendance.request.approve": "編集リクエストを承認",
  "attendance.request.reject": "編集リクエストを却下",
  "attendance.workflow.apply": "ワークフロー承認で勤怠反映",

  clock_in: "出勤",
  clock_out: "退勤",
  start_break: "休憩開始",
  end_break: "休憩終了",
  // 既存の別コード表記に対応
  rest_start: "休憩開始",
  rest_end: "休憩終了",

  // ワークフロー
  "workflow.approve": "ワークフロー承認",
  "workflow.reject": "ワークフロー却下",
  approve_workflow: "ワークフロー承認",
  reject_workflow: "ワークフロー却下",

  // スタッフ操作
  "staff.create": "スタッフ作成",
  "staff.update": "スタッフ更新",
  "staff.enable": "スタッフ有効化",
  "staff.disable": "スタッフ無効化",
  "staff.delete": "スタッフ削除",
  create_staff: "スタッフ作成",
  update_staff: "スタッフ更新",
  delete_staff: "スタッフ削除",

  // 設定
  "app_config.create": "設定作成",
  "app_config.update": "設定更新",

  // 日報
  "daily_report.create": "日報作成",
  "daily_report.update": "日報更新",
  "daily_report.submit": "日報提出",
  "daily_report.comment.add": "日報コメント追加",
  "daily_report.reaction.update": "日報リアクション更新",

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
