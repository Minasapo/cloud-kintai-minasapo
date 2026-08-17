import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { SxProps, Theme } from "@mui/material/styles";
import type {
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

import type { ButtonSize, ButtonTone, ButtonVariant } from "./types";

type CommonProps = {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  children: ReactNode;
};

type ButtonElementProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> & {
    as?: "button";
  };

type LabelElementProps = CommonProps &
  Omit<LabelHTMLAttributes<HTMLLabelElement>, keyof CommonProps | "color"> & {
    as: "label";
  };

export type AppButtonProps = ButtonElementProps | LabelElementProps;

const baseButtonSx: SxProps<Theme> = {
  fontFamily: "var(--ds-typography-font-family)",
  textTransform: "none",
};

const resolveSx = (sx?: SxProps<Theme>): SxProps<Theme> => {
  if (Array.isArray(sx)) {
    return [baseButtonSx, ...sx] as SxProps<Theme>;
  }

  if (sx) {
    return [baseButtonSx, sx] as SxProps<Theme>;
  }

  return baseButtonSx;
};

const variantMap: Record<ButtonVariant, "contained" | "outlined" | "text"> = {
  solid: "contained",
  outline: "outlined",
  ghost: "text",
};

const toneMap: Record<
  ButtonTone,
  "primary" | "secondary" | "error" | "neutral"
> = {
  primary: "primary",
  secondary: "secondary",
  danger: "error",
  neutral: "neutral",
};

const sizeMap: Record<ButtonSize, "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

const LoadingIcon = () => (
  <CircularProgress size={14} color="inherit" thickness={5} />
);

export default function AppButton(props: AppButtonProps) {
  const {
    as = "button",
    variant = "solid",
    tone = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    disabled = false,
    className,
    sx,
    children,
    ...rest
  } = props;

  const resolvedDisabled = disabled || loading;
  const muiVariant = variantMap[variant];
  const muiColor = toneMap[tone];
  const muiSize = sizeMap[size];
  const resolvedStartIcon = loading ? <LoadingIcon /> : startIcon;

  if (as === "label") {
    const { onClick, ...labelRest } = rest as Omit<
      LabelElementProps,
      keyof CommonProps | "as"
    >;

    return (
      <Button
        {...(labelRest as object)}
        component="label"
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        fullWidth={fullWidth}
        disabled={resolvedDisabled}
        startIcon={resolvedStartIcon}
        endIcon={endIcon}
        className={className}
        sx={resolveSx(sx)}
        onClick={(event) => {
          if (resolvedDisabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClick?.(event as unknown as MouseEvent<HTMLLabelElement>);
        }}
      >
        {children}
      </Button>
    );
  }

  const buttonRest = rest as Omit<ButtonElementProps, keyof CommonProps | "as">;

  return (
    <Button
      {...(buttonRest as object)}
      type={buttonRest.type ?? "button"}
      variant={muiVariant}
      color={muiColor}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={resolvedDisabled}
      startIcon={resolvedStartIcon}
      endIcon={endIcon}
      className={className}
      sx={resolveSx(sx)}
    >
      {children}
    </Button>
  );
}
