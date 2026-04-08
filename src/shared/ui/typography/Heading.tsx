import { designTokenVar } from "@shared/designSystem";
import clsx from "clsx";
import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

type HeadingElement = "h1" | "h2" | "h3" | "div" | "span";
type HeadingTone = "page" | "section" | "subsection";

type BaseHeadingProps = {
  as?: HeadingElement;
  borderColor?: string;
  children: ReactNode;
  className?: string;
  color?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "color" | "style">;

type HeadingProps = BaseHeadingProps & {
  tone: HeadingTone;
};

const DEFAULT_HEADING_TAGS: Record<HeadingTone, HeadingElement> = {
  page: "h1",
  section: "h2",
  subsection: "h3",
};

const buildResponsiveFontSize = (tone: HeadingTone) =>
  `clamp(${designTokenVar(`component.heading.${tone}.fontSizeMobile`, "16px")}, 2.6vw, ${designTokenVar(`component.heading.${tone}.fontSizeDesktop`, "18px")})`;

const buildHeadingStyle = (
  tone: HeadingTone,
  color?: string,
  borderColor?: string,
): CSSProperties => {
  const textColor =
    color ?? designTokenVar(`component.heading.${tone}.textColor`, "#1E2A25");
  const resolvedBorderColor =
    borderColor ??
    designTokenVar(`component.heading.${tone}.accentColor`, "#0FA85E");

  const baseStyle: CSSProperties = {
    margin: 0,
    maxWidth: "100%",
    color: textColor,
    fontSize: buildResponsiveFontSize(tone),
    fontWeight: designTokenVar(`component.heading.${tone}.fontWeight`, "600"),
    lineHeight: designTokenVar(
      `component.heading.${tone}.lineHeight`,
      tone === "page" ? "1.2" : "1.4",
    ),
    letterSpacing: designTokenVar(
      `component.heading.${tone}.letterSpacing`,
      tone === "page" ? "-0.03em" : tone === "section" ? "-0.02em" : "-0.01em",
    ),
    overflowWrap: "anywhere",
  };

  if (tone === "subsection") {
    return baseStyle;
  }

  const borderWidth = designTokenVar(
    `component.heading.${tone}.borderWidth`,
    tone === "page" ? "5px" : "4px",
  );
  const paddingLeft = designTokenVar(
    `component.heading.${tone}.paddingLeft`,
    "8px",
  );

  return {
    ...baseStyle,
    display: "inline-block",
    paddingLeft,
    borderLeft: `${borderWidth} solid ${resolvedBorderColor}`,
    borderBottom: `${borderWidth} solid ${resolvedBorderColor}`,
  };
};

export const Heading = ({
  as,
  borderColor,
  children,
  className,
  color,
  style,
  tone,
  ...rest
}: HeadingProps) => {
  const Component = as ?? DEFAULT_HEADING_TAGS[tone];

  return (
    <Component
      className={clsx(className)}
      style={{
        ...buildHeadingStyle(tone, color, borderColor),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const PageTitle = (props: BaseHeadingProps) => (
  <Heading tone="page" {...props} />
);

export const SectionTitle = (props: BaseHeadingProps) => (
  <Heading tone="section" {...props} />
);

export const SubsectionTitle = (props: BaseHeadingProps) => (
  <Heading tone="subsection" {...props} />
);
