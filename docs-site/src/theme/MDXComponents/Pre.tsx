import type { ComponentPropsWithoutRef, JSX } from "react";

import styles from "./styles.module.css";

type Props = ComponentPropsWithoutRef<"pre">;

export default function Pre(props: Props): JSX.Element {
  return (
    <div className={styles.codeFrame} role="region" aria-label="コードブロック">
      <pre {...props} />
    </div>
  );
}
