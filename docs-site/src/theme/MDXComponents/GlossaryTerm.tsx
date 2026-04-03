import type { ComponentPropsWithoutRef, JSX } from "react";

type GlossaryTermProps = ComponentPropsWithoutRef<"abbr"> & {
  description: string;
};

export default function GlossaryTerm({
  description,
  className,
  children,
  ...props
}: GlossaryTermProps): JSX.Element {
  const classes = ["docs-glossary-term", className].filter(Boolean).join(" ");

  return (
    <abbr className={classes} title={description} {...props}>
      {children}
    </abbr>
  );
}
