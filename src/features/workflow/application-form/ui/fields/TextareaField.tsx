import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";

import styles from "../WorkflowTypeFields.module.scss";

type Props = {
  config: WorkflowFieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function TextareaField({
  config,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <textarea
          className={[styles.textarea, error ? styles.inputError : ""].join(
            " ",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={6}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
