import styles from "./DateRangeField.module.scss";
import FilterTrigger from "./FilterTrigger";
import FloatingPanel from "./FloatingPanel";
import type { DateFilterKey } from "./workflowListFiltersShared";

type DateRangeFieldProps = {
  displayValue: string;
  open: boolean;
  onOpenToggle: () => void;
  onClose: () => void;
  fromValue: string | undefined;
  toValue: string | undefined;
  onChange: (key: DateFilterKey, value: string) => void;
  fromKey: "applicationFrom" | "createdFrom";
  toKey: "applicationTo" | "createdTo";
  onClear: () => void;
};

type DateInputFieldProps = {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
};

function DateInputField({ label, value, onChange }: DateInputFieldProps) {
  return (
    <label className={styles.dateField}>
      <span className={styles.dateFieldLabel}>{label}</span>
      <div className={styles.dateInputWrap}>
        <input
          type="date"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className={styles.dateInput}
        />
      </div>
    </label>
  );
}

export default function DateRangeField({
  displayValue,
  open,
  onOpenToggle,
  onClose,
  fromValue,
  toValue,
  onChange,
  fromKey,
  toKey,
  onClear,
}: DateRangeFieldProps) {
  return (
    <div className={styles.root}>
      <FilterTrigger
        label={displayValue}
        isOpen={open}
        onClick={onOpenToggle}
      />
      <FloatingPanel open={open}>
        <div className={styles.panelContent}>
          <DateInputField
            label="From"
            value={fromValue}
            onChange={(value) => onChange(fromKey, value)}
          />
          <DateInputField
            label="To"
            value={toValue}
            onChange={(value) => onChange(toKey, value)}
          />
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClear}
              className={styles.clearButton}
            >
              クリア
            </button>
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
