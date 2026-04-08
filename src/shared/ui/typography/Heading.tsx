import { designTokenVar } from "@shared/designSystem";
import clsx from "clsx";
import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

type HeadingElement = "h1" | "h2" | "h3" | "div" | "span";
export type HeadingLevel = "page" | "section" | "subsection";
export type HeadingAppearance = "hero" | "standard" | "quiet";
type HeadingTone = HeadingLevel;

export type BaseHeadingProps = {
  as?: HeadingElement;
  appearance?: HeadingAppearance;
  borderColor?: string;
  children: ReactNode;
  className?: string;
  color?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "color" | "style">;

export type HeadingProps = BaseHeadingProps & {
  level?: HeadingLevel;
  tone?: HeadingTone;
};

const DEFAULT_HEADING_TAGS: Record<HeadingLevel, HeadingElement> = {
  page: "h1",
  section: "h2",
  subsection: "h3",
};

const DEFAULT_APPEARANCE_BY_LEVEL: Record<HeadingLevel, HeadingAppearance> = {
  page: "hero",
  section: "standard",
  subsection: "quiet",
};

const getHeadingLevelToken = (
  level: HeadingLevel,
  key: string,
  fallback: string,
) =>
  designTokenVar(
    `component.heading.level.${level}.${key}`,
    designTokenVar(`component.heading.${level}.${key}`, fallback),
  );

const getHeadingAppearanceToken = (
  appearance: HeadingAppearance,
  key: string,
  fallback: string,
) => designTokenVar(`component.heading.appearance.${appearance}.${key}`, fallback);

const buildResponsiveFontSize = (level: HeadingLevel) =>
  `clamp(${getHeadingLevelToken(level, "fontSizeMobile", "16px")}, 2.6vw, ${getHeadingLevelToken(level, "fontSizeDesktop", "18px")})`;

const buildHeadingStyle = (
  level: HeadingLevel,
  appearance: HeadingAppearance,
  color?: string,
  _borderColor?: string,
): CSSProperties => {
  const textColor =
    color ?? getHeadingLevelToken(level, "textColor", "#1E2A25");
  const maxWidth = getHeadingAppearanceToken(
    appearance,
    "maxWidth",
    appearance === "hero" ? "24ch" : "100%",
  );

  const baseStyle: CSSProperties = {
    margin: 0,
    maxWidth,
    color: textColor,
    fontSize: buildResponsiveFontSize(level),
    fontWeight: getHeadingLevelToken(level, "fontWeight", "600"),
    lineHeight: getHeadingLevelToken(
      level,
      "lineHeight",
      level === "page" ? "1.2" : "1.4",
    ),
    letterSpacing: getHeadingLevelToken(
      level,
      "letterSpacing",
      level === "page"
        ? "-0.03em"
        : level === "section"
          ? "-0.02em"
          : "-0.01em",
    ),
    overflowWrap: "anywhere",
  };

  return baseStyle;
};

export const Heading = ({
  as,
  appearance,
  borderColor,
  children,
  className,
  color,
  level,
  style,
  tone,
  ...rest
}: HeadingProps) => {
  const resolvedLevel = level ?? tone ?? "section";
  const resolvedAppearance =
    appearance ?? DEFAULT_APPEARANCE_BY_LEVEL[resolvedLevel];
  const Component = as ?? DEFAULT_HEADING_TAGS[resolvedLevel];

  return (
    <Component
      className={clsx(className)}
      style={{
        ...buildHeadingStyle(
          resolvedLevel,
          resolvedAppearance,
          color,
          borderColor,
        ),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const PageTitle = (props: BaseHeadingProps) => (
  <Heading level="page" {...props} />
);

export const SectionTitle = (props: BaseHeadingProps) => (
  <Heading level="section" {...props} />
);

export const SubsectionTitle = (props: BaseHeadingProps) => (
  <Heading level="subsection" {...props} />
);
