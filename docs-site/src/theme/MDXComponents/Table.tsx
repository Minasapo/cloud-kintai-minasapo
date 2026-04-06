import type { ComponentPropsWithoutRef, JSX } from "react";

type Props = ComponentPropsWithoutRef<"table">;

export default function Table(props: Props): JSX.Element {
  return (
    <div
      className="docs-table-wrapper"
      role="region"
      aria-label="表は横にスクロールできます"
    >
      <table {...props} />
    </div>
  );
}
