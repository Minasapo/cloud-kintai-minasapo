import { useGetWorkflowTemplatesQuery } from "@entities/workflow-template/api/workflowTemplateApi";
import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";

import styles from "../WorkflowTypeFields.module.scss";

const ORGANIZATION_ID = "default";

type Props = {
  config: WorkflowFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** テンプレート適用時に他フィールドへ書き込む */
  onSetField?: (key: string, value: unknown) => void;
  /** テンプレート内容を書き込むフィールドキー */
  titleFieldKey?: string;
  contentFieldKey?: string;
  currentTitle?: string;
  currentContent?: string;
};

export function TemplateSelectField({
  config,
  value,
  onChange,
  disabled,
  onSetField,
  titleFieldKey = "title",
  contentFieldKey = "content",
  currentTitle = "",
  currentContent = "",
}: Props) {
  const { data: templates = [] } = useGetWorkflowTemplatesQuery({
    organizationId: ORGANIZATION_ID,
  });

  const handleApply = () => {
    if (!value) return;
    const template = templates.find((t) => t.id === value);
    if (!template) return;

    const hasExisting =
      currentTitle.trim().length > 0 || currentContent.trim().length > 0;
    const confirmMessage = hasExisting
      ? "現在入力しているタイトル・詳細をテンプレート内容で上書きします。よろしいですか？"
      : "テンプレートを適用しますか？";
    if (!window.confirm(confirmMessage)) return;

    onSetField?.(titleFieldKey, template.title);
    onSetField?.(contentFieldKey, template.content);
  };

  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <div className={styles.inlineGroup}>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            >
              <option value="">テンプレートを選択</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className={styles.selectIcon} aria-hidden="true">
              ▼
            </span>
          </div>
          <button
            type="button"
            className={styles.applyButton}
            onClick={handleApply}
            disabled={disabled || !value}
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}
