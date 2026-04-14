import type { WorkflowFieldConfig } from "@features/workflow/config/workflowTypeConfig";
import { TimeInput } from "@shared/ui/TimeInput";

import styles from "../WorkflowTypeFields.module.scss";

export type TimeRangeValue = { start: string | null; end: string | null };

type Props = {
  config: WorkflowFieldConfig;
  value: TimeRangeValue;
  onChange: (value: TimeRangeValue) => void;
  /** 時刻の基準日 (YYYY-MM-DD)。省略時は今日 */
  baseDate?: string;
  error?: string;
  disabled?: boolean;
};

const toTimeRangeValue = (v: unknown): TimeRangeValue => {
  if (v !== null && v !== undefined && typeof v === "object" && "start" in v) {
    return v as TimeRangeValue;
  }
  return { start: null, end: null };
};

export function TimeRangeField({
  config,
  value: valueProp,
  onChange,
  baseDate,
  error,
  disabled,
}: Props) {
  const value = toTimeRangeValue(valueProp);
  const resolvedBaseDate = baseDate ?? new Date().toISOString().slice(0, 10);
  return (
    <div className={styles.formRow}>
      <div className={styles.formLabel}>{config.label}</div>
      <div className={styles.formField}>
        <div className={styles.timeFieldGroup}>
          <div className={styles.timeInputGroup}>
            <TimeInput
              value={value.start}
              onChange={(v) => onChange({ ...value, start: v })}
              baseDate={resolvedBaseDate}
              size="small"
              error={Boolean(error)}
              disabled={disabled}
              sx={{ width: "148px", maxWidth: "100%" }}
            />
            <span className={styles.timeSeparator}>〜</span>
            <TimeInput
              value={value.end}
              onChange={(v) => onChange({ ...value, end: v })}
              baseDate={resolvedBaseDate}
              size="small"
              error={Boolean(error)}
              disabled={disabled}
              sx={{ width: "148px", maxWidth: "100%" }}
            />
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
