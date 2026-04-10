/** YAML に記述できる標準フィールド種別 */
export type WorkflowFieldType =
  | "date"
  | "date_range"
  | "time"
  | "time_range"
  | "text"
  | "textarea"
  | "template_select";

/** 個別フィールドの設定 */
export type WorkflowFieldConfig = {
  key: string;
  type: WorkflowFieldType;
  label: string;
  required?: boolean;
  validation?: {
    /** date_range / time_range で start < end を強制 */
    startBeforeEnd?: boolean;
  };
};

/** ペイロード種別 */
export type WorkflowPayloadType = "overTimeDetails" | "custom";

/** ペイロードマッピング式 */
export type WorkflowPayloadMapping = Record<string, string>;

export type WorkflowPayloadConfig = {
  type: WorkflowPayloadType;
  mapping: WorkflowPayloadMapping;
};

/** 打刻修正のような enum 1つが UI 上で複数に分岐するサブタイプ */
export type WorkflowSubTypeConfig = {
  id: string;
  label: string;
  fields: WorkflowFieldConfig[];
  payload: WorkflowPayloadConfig;
};

/** ワークフロー種別ひとつ分の設定 */
export type WorkflowTypeConfig = {
  /** WorkflowCategory enum キー */
  id: string;
  label: string;
  /** フィールドを直接持つ場合 */
  fields?: WorkflowFieldConfig[];
  payload?: WorkflowPayloadConfig;
  /** サブタイプを持つ場合 (fields/payload は不要) */
  subTypes?: WorkflowSubTypeConfig[];
};

/** YAML ルートの形 */
export type WorkflowTypesYaml = {
  types: WorkflowTypeConfig[];
};

// ---------------------------------------------------------------------------
// ペイロードマッピング式で参照できる定数キー
// ---------------------------------------------------------------------------
export const WORKFLOW_PAYLOAD_CONSTANTS: Record<string, string> = {
  CLOCK_CORRECTION_CHECK_IN_LABEL: "打刻修正(出勤忘れ)",
  CLOCK_CORRECTION_CHECK_OUT_LABEL: "打刻修正(退勤忘れ)",
};
