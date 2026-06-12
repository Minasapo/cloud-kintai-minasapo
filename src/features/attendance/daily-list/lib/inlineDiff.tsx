import { Box } from "@mui/material";
import React from "react";

const diffWrapperSx = { whiteSpace: "pre-wrap" } as const;
const diffHighlightSx = {
  backgroundColor: "rgba(255, 87, 34, 0.22)",
  borderRadius: 0.5,
  px: 0.5,
} as const;

export function renderInlineDiff(
  base: string,
  target: string,
): React.ReactNode {
  if (base === target) {
    return target || "-";
  }

  const a = base ?? "";
  const b = target ?? "";
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const sameStart = b.slice(0, prefix);
  const diffMid = b.slice(prefix, b.length - suffix);
  const sameEnd = b.slice(b.length - suffix);

  return (
    <Box component="span" sx={diffWrapperSx}>
      {sameStart}
      {diffMid ? (
        <Box component="span" sx={diffHighlightSx}>
          {diffMid || " "}
        </Box>
      ) : null}
      {sameEnd}
    </Box>
  );
}
