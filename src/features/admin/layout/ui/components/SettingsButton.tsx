import { AppButton } from "@shared/ui/button";

import type { SettingsButtonProps } from "../types";

export function SettingsButton({
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  onClick,
  children,
  className,
  style,
  sx,
}: SettingsButtonProps) {
  const toneByVariant: Record<
    "primary" | "secondary" | "danger",
    "primary" | "secondary" | "danger"
  > = {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
  };

  return (
    <AppButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      tone={toneByVariant[variant]}
      variant={variant === "secondary" ? "outline" : "solid"}
      size={size}
      className={className}
      style={style}
      sx={sx}
    >
      {children}
    </AppButton>
  );
}