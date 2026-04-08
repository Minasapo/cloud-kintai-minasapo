import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Heading, type HeadingAppearance } from "./Heading";

type HeadlineProps = {
  as?: "h1" | "h2" | "h3" | "div" | "span";
  appearance?: HeadingAppearance;
  borderColor?: string;
  children: ReactNode;
  className?: string;
  color?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "color" | "style">;

export const Headline = ({
  as = "h2",
  appearance = "standard",
  borderColor,
  children,
  className,
  color,
  style,
  ...rest
}: HeadlineProps) => {
  return (
    <Heading
      as={as}
      appearance={appearance}
      borderColor={borderColor}
      className={className}
      color={color}
      style={style}
      level="section"
      {...rest}
    >
      {children}
    </Heading>
  );
};
