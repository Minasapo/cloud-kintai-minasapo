import type { CSSProperties, ReactNode } from "react";

import {
  ACTION_CARD_CLASS_NAME,
  ACTION_CARD_HELPER_CLASS_NAME,
  ACTION_CARD_ICON_WRAPPER_CLASS_NAME,
  ACTION_CARD_LABEL_CLASS_NAME,
  ACTION_CARD_TONE_CLASS_NAME,
} from "./buttonStyles";

export interface ActionCardButtonProps {
  className?: string;
  style: CSSProperties & Record<`--${string}`, string>;
  type?: "button" | "submit" | "reset";
  size?: "default" | "compact";
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
  label: ReactNode;
  helper?: ReactNode;
  icon: ReactNode;
}

export default function ActionCardButton({
  className,
  style,
  type = "button",
  size = "default",
  disabled = false,
  onClick,
  testId,
  label,
  helper,
  icon,
}: ActionCardButtonProps) {
  const sizeClassName =
    size === "compact"
      ? "min-h-[74px] rounded-[1rem] px-3 py-2.5 md:min-h-[88px] md:rounded-[1.1rem] md:px-4 md:py-3"
      : null;

  return (
    <button
      type={type}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={[
        ACTION_CARD_CLASS_NAME,
        ACTION_CARD_TONE_CLASS_NAME,
        "disabled:[&_.action-card-helper]:text-[color:var(--action-card-disabled-muted)]",
        sizeClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <span className="relative flex items-center justify-between gap-2 md:gap-3">
        <span className="max-w-[11rem]">
          <span className={ACTION_CARD_LABEL_CLASS_NAME}>{label}</span>
          {helper ? (
            <span
              className={["action-card-helper", ACTION_CARD_HELPER_CLASS_NAME].join(" ")}
            >
              {helper}
            </span>
          ) : null}
        </span>
        <span className={ACTION_CARD_ICON_WRAPPER_CLASS_NAME}>{icon}</span>
      </span>
    </button>
  );
}
