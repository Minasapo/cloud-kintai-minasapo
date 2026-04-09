import clsx from "clsx";
import type { ComponentPropsWithoutRef, JSX } from "react";

import styles from "./styles.module.css";

type Props = ComponentPropsWithoutRef<"blockquote">;

export default function Blockquote({ className, ...props }: Props): JSX.Element {
  return <blockquote {...props} className={clsx(styles.callout, className)} />;
}
