import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { SectionTitle } from "./Heading";

type HeadlineProps = {
  as?: "h1" | "h2" | "h3" | "div" | "span";
  borderColor?: string;
  children: ReactNode;
  className?: string;
  color?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "color" | "style">;

export const Headline = ({
  as = "h2",
  borderColor,
  children,
  className,
  color,
  style,
  ...rest
}: HeadlineProps) => {
  return (
    <SectionTitle
      as={as}
      borderColor={borderColor}
      className={className}
      color={color}
      style={style}
      {...rest}
    >
      {children}
    </SectionTitle>
  );
};
