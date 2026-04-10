import type { ComponentPropsWithoutRef, JSX } from "react";

import styles from "./styles.module.css";

type Props = ComponentPropsWithoutRef<"table">;

export default function Table(props: Props): JSX.Element {
  return (
    <div
      className={styles.tableWrapper}
      role="region"
      aria-label="表は横にスクロールできます"
    >
      <table {...props} className={styles.table} />
    </div>
  );
}
