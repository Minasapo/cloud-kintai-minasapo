import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";
import { AppTextField } from "@shared/ui/form";

import styles from "../WorkflowTypeFields.module.scss";

export type DateRangeValue = { start: string; end: string };

type Props = {
  config: WorkflowFieldConfig;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  error?: string;
  disabled?: boolean;
};

export function DateRangeField({
  config,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const handleStartDateChange = (nextStart: string) => {
    const shouldSyncEnd = value.end === "" || value.end === value.start;
    onChange({
      start: nextStart,
      end: shouldSyncEnd ? nextStart : value.end,
    });
  };

  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <div className={styles.inlineGroup}>
          <AppTextField
            type="date"
            size="small"
            error={Boolean(error)}
            sx={{ maxWidth: 200 }}
            value={value.start}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
          />
          <span className={styles.dateSeparator}>-</span>
          <AppTextField
            type="date"
            size="small"
            error={Boolean(error)}
            sx={{ maxWidth: 200 }}
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            disabled={disabled}
          />
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}
