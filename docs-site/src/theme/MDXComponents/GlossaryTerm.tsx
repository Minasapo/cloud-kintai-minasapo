import type { ComponentPropsWithoutRef, JSX, MouseEventHandler } from "react";
import { useEffect, useId, useRef, useState } from "react";

type GlossaryTermProps = ComponentPropsWithoutRef<"abbr"> & {
  description: string;
};

export default function GlossaryTerm({
  description,
  className,
  children,
  ...props
}: GlossaryTermProps): JSX.Element {
  const { onBlur, onClick, onKeyDown, tabIndex, ...abbrProps } = props;
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const classes = ["docs-glossary-term", className].filter(Boolean).join(" ");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const handleClick: MouseEventHandler<HTMLElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const shouldToggleByTap =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches;

    if (shouldToggleByTap) {
      setIsOpen((current) => !current);
    }
  };

  return (
    <span
      ref={wrapperRef}
      className="docs-glossary-term-wrapper"
      data-open={isOpen ? "true" : "false"}
    >
      <abbr
        className={classes}
        aria-describedby={tooltipId}
        tabIndex={tabIndex ?? 0}
        {...abbrProps}
        onBlur={(event) => {
          onBlur?.(event);
          setIsOpen(false);
        }}
        onClick={handleClick}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        {children}
      </abbr>
      <span id={tooltipId} role="tooltip" className="docs-glossary-tooltip">
        {description}
      </span>
    </span>
  );
}
