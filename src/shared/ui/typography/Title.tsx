import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

type TitleProps = {
  borderColor?: string;
  color?: string;
  children?: ReactNode;
  className?: string;
  component?: "h1" | "h2" | "h3" | "div" | "span";
  style?: CSSProperties;
  sx?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "color" | "children">;

const TITLE_ACCENT_COLOR = designTokenVar(
  "component.title.accentColor",
  "#0FA85E"
);
const TITLE_BORDER_WIDTH = designTokenVar("component.title.borderWidth", "5px");
const TITLE_PADDING_LEFT = designTokenVar("component.title.paddingLeft", "8px");
const TITLE_TEXT_COLOR = designTokenVar("component.title.textColor", "#0FA85E");

const Title = ({
  children,
  borderColor,
  color = TITLE_TEXT_COLOR,
  sx,
  className,
  style,
  component = "h1",
  ...rest
}: TitleProps) => {
  const resolvedBorderColor = borderColor ?? color ?? TITLE_ACCENT_COLOR;
  const Component = component;

  return (
    <Component
      className={className}
      style={{
        margin: 0,
        paddingLeft: TITLE_PADDING_LEFT,
        borderBottom: `solid ${TITLE_BORDER_WIDTH} ${resolvedBorderColor}`,
        color,
        fontSize: "clamp(1.5rem, 2vw, 2rem)",
        fontWeight: 700,
        lineHeight: 1.3,
        ...sx,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

Title.displayName = "Title";

export default Title;
