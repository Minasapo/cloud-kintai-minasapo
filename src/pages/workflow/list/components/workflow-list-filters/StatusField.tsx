import { STATUS_LABELS } from "@/entities/workflow/lib/workflowLabels";

import FilterTrigger from "./FilterTrigger";
import FloatingPanel from "./FloatingPanel";
import styles from "./StatusField.module.scss";
import { STATUS_ALL_VALUE, STATUS_OPTIONS } from "./workflowListFiltersShared";

type StatusFieldProps = {
  value: string[];
  open: boolean;
  onOpenToggle: () => void;
  onClose: () => void;
  onToggle: (value: string) => void;
};

type StatusOptionRowProps = {
  checked: boolean;
  label: string;
  onChange: () => void;
};

function StatusOptionRow({
  checked,
  label,
  onChange,
}: StatusOptionRowProps) {
  return (
    <label
      className={[
        styles.optionRow,
        checked ? styles.optionRowSelected : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={styles.checkbox}
      />
      <span className={styles.optionLabel}>{label}</span>
    </label>
  );
}

function getDisplayValue(value: string[]) {
  if (value.length === 0) {
    return "すべて";
  }

  return value.map((status) => STATUS_LABELS[status] ?? String(status)).join("、");
}

export default function StatusField({
  value,
  open,
  onOpenToggle,
  onClose,
  onToggle,
}: StatusFieldProps) {
  const isAllSelected = value.length === 0;
  const displayValue = getDisplayValue(value);

  return (
    <div className={styles.root}>
      <FilterTrigger label={displayValue} isOpen={open} onClick={onOpenToggle} />
      <FloatingPanel open={open}>
        <div className={styles.panelContent}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>ステータス</p>
            <p className={styles.panelDescription}>対象の申請状態を絞り込みます</p>
          </div>
          <div className={styles.optionList}>
            <StatusOptionRow
              checked={isAllSelected}
              label="すべて"
              onChange={() => onToggle(STATUS_ALL_VALUE)}
            />
            {STATUS_OPTIONS.map((status) => (
              <StatusOptionRow
                key={status}
                checked={value.includes(status)}
                label={STATUS_LABELS[status] ?? String(status)}
                onChange={() => onToggle(status)}
              />
            ))}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
            >
              閉じる
            </button>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}
