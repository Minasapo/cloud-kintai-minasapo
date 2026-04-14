import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";
import { TimeInput } from "@shared/ui/TimeInput";

import styles from "../WorkflowTypeFields.module.scss";

type Props = {
  config: WorkflowFieldConfig;
  value: string | null;
  onChange: (value: string | null) => void;
  /** 時刻の基準日 (YYYY-MM-DD)。省略時は今日 */
  baseDate?: string;
  error?: string;
  disabled?: boolean;
};

export function TimeField({
  config,
  value,
  onChange,
  baseDate,
  error,
  disabled,
}: Props) {
  const resolvedBaseDate = baseDate ?? new Date().toISOString().slice(0, 10);
  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <TimeInput
          value={value}
          onChange={onChange}
          baseDate={resolvedBaseDate}
          size="small"
          error={Boolean(error)}
          helperText={error}
          disabled={disabled}
          sx={{ maxWidth: 160 }}
        />
      </div>
    </div>
  );
}
