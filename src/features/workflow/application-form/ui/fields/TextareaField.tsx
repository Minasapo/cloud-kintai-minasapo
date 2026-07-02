import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";
import { AppTextField } from "@shared/ui/form";

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
        <AppTextField
          fullWidth
          multiline
          rows={6}
          size="small"
          error={Boolean(error)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
