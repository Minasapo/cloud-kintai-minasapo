import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { PageTitle } from "./Heading";

type TitleProps = {
  borderColor?: string;
  color?: string;
  children?: ReactNode;
  className?: string;
  component?: "h1" | "h2" | "h3" | "div" | "span";
  style?: CSSProperties;
  sx?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "color" | "children">;

const Title = ({
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
    <PageTitle
      as={component}
      borderColor={borderColor}
      className={className}
      color={color}
      style={{
        ...sx,
        ...style,
      }}
      {...rest}
    >
      {children}
    </PageTitle>
  );
};

Title.displayName = "Title";

export default Title;
