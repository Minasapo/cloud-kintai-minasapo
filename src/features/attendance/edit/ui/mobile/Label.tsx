import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type LabelVariant = "body1" | "body2" | "inherit";

interface LabelProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  variant?: LabelVariant;
  sx?: CSSProperties;
}

export function Label({
  children,
  className,
  style,
  sx,
  ...rest
}: LabelProps) {
  return (
    <p
      className={["m-0 pb-2 font-bold", className].filter(Boolean).join(" ")}
      style={{ ...sx, ...style }}
      {...rest}
    >
      {children}
    </p>
  );
}
