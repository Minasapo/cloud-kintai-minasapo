import rawYaml from "./workflow-types.yaml";
import type {
  WorkflowSubTypeConfig,
  WorkflowTypeConfig,
  WorkflowTypesYaml,
} from "./workflowTypeConfig";

// ---------------------------------------------------------------------------
// ランタイム検証（型アサーションの代替として最低限のガード）
// ---------------------------------------------------------------------------

const parseConfig = (raw: unknown): WorkflowTypesYaml => {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !Array.isArray((raw as Record<string, unknown>).types)
  ) {
    throw new Error("[workflowTypeLoader] workflow-types.yaml の形式が不正です");
  }
  return raw as WorkflowTypesYaml;
};

const config = parseConfig(rawYaml);

/** 全ワークフロー種別設定を返す */
export const getWorkflowTypeConfigs = (): WorkflowTypeConfig[] => config.types;

/**
 * label（UI 表示名）から対応する種別設定を取得する。
 * サブタイプのラベルにも対応。
 */
export const findWorkflowConfigByLabel = (
  label: string,
): WorkflowTypeConfig | WorkflowSubTypeConfig | undefined => {
  for (const type of config.types) {
    if (type.label === label) return type;
    if (type.subTypes) {
      const sub = type.subTypes.find((s) => s.label === label);
      if (sub) return sub;
    }
  }
  return undefined;
};

/**
 * label に対応するフィールド定義リストを取得する。
 * サブタイプのラベルにも対応。
 */
export const getFieldConfigsByLabel = (
  label: string,
) => findWorkflowConfigByLabel(label)?.fields ?? [];
