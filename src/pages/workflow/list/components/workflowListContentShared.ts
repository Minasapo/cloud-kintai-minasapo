export const EMPTY_VALUE = "-";
export const WORKFLOW_LIST_TITLE = "申請一覧";
export const WORKFLOW_LIST_DESCRIPTION =
  "種別、申請日、ステータス、作成日で確認できます。";
export const WORKFLOW_CLEAR_FILTERS_LABEL = "フィルターをクリア";
export const WORKFLOW_LIST_COLUMNS = [
  "種別",
  "申請日",
  "ステータス",
  "作成日",
] as const;

export const WORKFLOW_LIST_COLUMN_HEADER_IDS = WORKFLOW_LIST_COLUMNS.map(
  (_, index) => `workflow-list-column-${index}`,
) as readonly string[];

export const formatWorkflowDateValue = (value?: string) => value ?? EMPTY_VALUE;

export const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");
