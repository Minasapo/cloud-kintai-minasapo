import type { ComponentPropsWithoutRef, JSX } from "react";

type Props = ComponentPropsWithoutRef<"pre">;

export default function Pre(props: Props): JSX.Element {
  return (
    <div className="docs-code-frame" role="region" aria-label="コードブロック">
      <pre {...props} />
    </div>
  );
}
