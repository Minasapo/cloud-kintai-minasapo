import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { Heading, type HeadingAppearance } from "./Heading";

type TitleProps = {
  appearance?: HeadingAppearance;
  borderColor?: string;
  color?: string;
  children?: ReactNode;
  className?: string;
  component?: "h1" | "h2" | "h3" | "div" | "span";
  style?: CSSProperties;
  sx?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "color" | "children">;

const Title = ({
  appearance = "hero",
  children,
  borderColor,
  color,
  sx,
  className,
  style,
  component = "h1",
  ...rest
}: TitleProps) => {
  return (
    <Heading
      as={component}
      appearance={appearance}
      borderColor={borderColor}
      className={className}
      color={color}
      level="page"
      style={{
        ...sx,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Heading>
  );
};

Title.displayName = "Title";

export default Title;
