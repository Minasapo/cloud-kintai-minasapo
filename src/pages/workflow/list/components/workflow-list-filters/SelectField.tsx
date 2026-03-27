import type { ReactNode } from "react";

import styles from "./SelectField.module.scss";

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

export default function SelectField({
  value,
  onChange,
  children,
}: SelectFieldProps) {
  return (
    <div className={styles.selectFieldWrap}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.selectField}
      >
        {children}
      </select>
      <span className={styles.selectFieldIcon} aria-hidden="true">
        ▼
      </span>
    </div>
  );
}
