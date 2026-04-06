import "./buttonStyles.scss";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import type { IconButtonSize, IconButtonTone } from "./types";

export type AppIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  tone?: IconButtonTone;
  size?: IconButtonSize;
  active?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
  "aria-label": string;
};

const joinClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

const sharedStyle: CSSProperties = {
  fontFamily: "var(--ds-typography-font-family)",
};

export default function AppIconButton({
  tone = "neutral",
  size = "md",
  active = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...rest
}: AppIconButtonProps) {
  const resolvedDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={rest.type ?? "button"}
      disabled={resolvedDisabled}
      className={joinClassNames("app-icon-button", className)}
      data-app-icon-button-tone={tone}
      data-app-icon-button-size={size}
      data-app-icon-button-active={String(active)}
      style={sharedStyle}
    >
      {loading ? (
        <span className="app-icon-button__spinner" aria-hidden="true" />
      ) : (
        <span className="app-icon-button__icon" aria-hidden="true">
          {children}
        </span>
      )}
    </button>
  );
}
