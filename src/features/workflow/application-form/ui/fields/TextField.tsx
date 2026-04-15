import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";

import styles from "../WorkflowTypeFields.module.scss";

type Props = {
  config: WorkflowFieldConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function TextField({ config, value, onChange, error, disabled }: Props) {
  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <input
          className={[styles.input, error ? styles.inputError : ""].join(" ")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
