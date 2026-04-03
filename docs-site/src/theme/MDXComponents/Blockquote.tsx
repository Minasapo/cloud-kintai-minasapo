import clsx from "clsx";
import type { ComponentPropsWithoutRef, JSX } from "react";

type Props = ComponentPropsWithoutRef<"blockquote">;

export default function Blockquote({ className, ...props }: Props): JSX.Element {
  return <blockquote {...props} className={clsx("docs-callout", className)} />;
}
