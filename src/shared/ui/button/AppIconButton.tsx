import CircularProgress from "@mui/material/CircularProgress";
import MuiIconButton from "@mui/material/IconButton";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { IconButtonSize, IconButtonTone } from "./types";

export type AppIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  tone?: IconButtonTone;
  size?: IconButtonSize;
  active?: boolean;
  loading?: boolean;
  tooltip?: ReactNode;
  className?: string;
  children: ReactNode;
  "aria-label": string;
};

const toneMap: Record<IconButtonTone, "primary" | "error" | "neutral"> = {
  neutral: "neutral",
  primary: "primary",
  danger: "error",
};

const sizeMap: Record<IconButtonSize, "small" | "medium"> = {
  sm: "small",
  md: "medium",
};

export default function AppIconButton({
  tone = "neutral",
  size = "md",
  active = false,
  loading = false,
  disabled = false,
  tooltip,
  className,
  children,
  ...rest
}: AppIconButtonProps) {
  const resolvedDisabled = disabled || loading;
  const muiColor = toneMap[tone];
  const muiSize = sizeMap[size];

  const button = (
    <MuiIconButton
      {...(rest as object)}
      color={muiColor}
      size={muiSize}
      disabled={resolvedDisabled}
      className={className}
      sx={active ? { opacity: 1, filter: "brightness(0.85)" } : undefined}
    >
      {loading ? (
        <CircularProgress size={16} color="inherit" thickness={5} />
      ) : (
        children
      )}
    </MuiIconButton>
  );

  if (!tooltip) return button;

  return (
    <span className="relative inline-flex group/app-icon-tooltip">
      {button}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/app-icon-tooltip:opacity-100 group-focus-within/app-icon-tooltip:opacity-100"
      >
        {tooltip}
      </span>
    </span>
  );
}
