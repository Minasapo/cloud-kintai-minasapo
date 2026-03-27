import type {
  CSSProperties,
  HTMLAttributes,
} from "react";
import { forwardRef } from "react";

import { designTokenVar } from "@/shared/designSystem";

type PageSectionElement = "section" | "div" | "form" | "article" | "main";

type PageSectionSx = CSSProperties & {
  px?: CSSProperties["paddingLeft"];
  py?: CSSProperties["paddingTop"];
};

type PageSectionProps = HTMLAttributes<HTMLElement> & {
  variant?: "surface" | "plain";
  layoutVariant?: "dashboard" | "detail";
  component?: PageSectionElement;
  sx?: PageSectionSx;
};

const VARIANT_FALLBACKS = {
  dashboard: {
    paddingX: { xs: "16px", md: "32px" },
    paddingY: "16px",
    gap: "12px",
    radius: "12px",
    background: "#FFFFFF",
    shadow: "0 12px 24px rgba(17, 24, 39, 0.06)",
  },
  detail: {
    paddingX: { xs: "12px", md: "24px" },
    paddingY: "12px",
    gap: "8px",
    radius: "8px",
    background: "#F3F8F4",
    shadow: "0 8px 20px rgba(17, 24, 39, 0.05)",
  },
} as const;

export default forwardRef<HTMLDivElement, PageSectionProps>(
  function PageSection(
    {
      children,
      variant = "surface",
      layoutVariant = "dashboard",
      component = "section",
      sx,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const variantFallback =
      VARIANT_FALLBACKS[layoutVariant] ?? VARIANT_FALLBACKS.dashboard;
    const variantPath = `component.pageSection.variants.${layoutVariant}`;
    const SECTION_PADDING_X = {
      xs: designTokenVar(
        `${variantPath}.paddingX.xs`,
        variantFallback.paddingX.xs
      ),
      md: designTokenVar(
        `${variantPath}.paddingX.md`,
        variantFallback.paddingX.md
      ),
    };
    const SECTION_PADDING_Y = designTokenVar(
      `${variantPath}.paddingY`,
      variantFallback.paddingY
    );
    const SECTION_GAP = designTokenVar(
      `${variantPath}.gap`,
      variantFallback.gap
    );
    const SECTION_RADIUS = designTokenVar(
      `${variantPath}.radius`,
      variantFallback.radius
    );
    const SECTION_BACKGROUND = designTokenVar(
      `${variantPath}.background`,
      variantFallback.background
    );
    const SECTION_SHADOW = designTokenVar(
      `${variantPath}.shadow`,
      variantFallback.shadow
    );
    const surfaceStyles =
      variant === "surface"
        ? {
            backgroundColor: SECTION_BACKGROUND,
            borderRadius: SECTION_RADIUS,
            boxShadow: SECTION_SHADOW,
          }
        : {};
    const sectionStyle: CSSProperties = {
      ...surfaceStyles,
    };
    const sectionCssVars = sectionStyle as CSSProperties &
      Record<string, string>;
    sectionCssVars["--section-padding-x-xs"] = SECTION_PADDING_X.xs;
    sectionCssVars["--section-padding-x-md"] = SECTION_PADDING_X.md;
    sectionCssVars["--section-padding-y"] = SECTION_PADDING_Y;
    sectionCssVars["--section-gap"] = SECTION_GAP;
    const sxStyle: CSSProperties = {
      ...sx,
      paddingLeft: sx?.px ?? sx?.paddingLeft,
      paddingRight: sx?.px ?? sx?.paddingRight,
      paddingTop: sx?.py ?? sx?.paddingTop,
      paddingBottom: sx?.py ?? sx?.paddingBottom,
    };
    const mergedClassName = [
      "flex flex-col px-[var(--section-padding-x-xs)] py-[var(--section-padding-y)] gap-[var(--section-gap)] md:px-[var(--section-padding-x-md)]",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const mergedStyle = { ...sectionStyle, ...sxStyle, ...style };

    if (component === "form") {
      return (
        <form
          ref={ref as never}
          className={mergedClassName}
          style={mergedStyle}
          {...(rest as HTMLAttributes<HTMLFormElement>)}
        >
          {children}
        </form>
      );
    }

    if (component === "div") {
      return (
        <div
          ref={ref as never}
          className={mergedClassName}
          style={mergedStyle}
          {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      );
    }

    if (component === "article") {
      return (
        <article
          ref={ref as never}
          className={mergedClassName}
          style={mergedStyle}
          {...(rest as HTMLAttributes<HTMLElement>)}
        >
          {children}
        </article>
      );
    }

    if (component === "main") {
      return (
        <main
          ref={ref as never}
          className={mergedClassName}
          style={mergedStyle}
          {...(rest as HTMLAttributes<HTMLElement>)}
        >
          {children}
        </main>
      );
    }

    return (
      <section
        ref={ref as never}
        className={mergedClassName}
        style={mergedStyle}
        {...(rest as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </section>
    );
  }
);
