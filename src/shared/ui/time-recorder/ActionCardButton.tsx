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
  size?: "default" | "compact" | "slim";
  shape?: "card" | "circle";
  layout?: "split" | "center";
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
  label: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
}

export default function ActionCardButton({
  className,
  style,
  type = "button",
  size = "default",
  shape = "card",
  layout,
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
      : size === "slim"
        ? "min-h-[52px] rounded-[1rem] px-3 py-1.5 md:min-h-[62px] md:rounded-[1.1rem] md:px-4 md:py-2"
        : null;
  const shapeClassName =
    shape === "circle"
      ? "!mx-auto !h-[116px] !w-[116px] !min-h-0 !rounded-full !px-0 !py-0 md:!h-[136px] md:!w-[136px]"
      : null;
  const resolvedLayout = layout ?? (icon ? "split" : "center");
  const contentClassName =
    resolvedLayout === "center"
      ? "relative flex h-full items-center justify-center text-center"
      : "relative flex items-center justify-between gap-2 md:gap-3";
  const labelWrapperClassName = resolvedLayout === "center" ? "w-full px-2" : "max-w-[11rem]";

  return (
    <button
      type={type}
      data-testid={testId}
      data-action-card-size={size}
      data-action-card-shape={shape}
      data-action-card-layout={resolvedLayout}
      disabled={disabled}
      onClick={onClick}
      className={[
        ACTION_CARD_CLASS_NAME,
        ACTION_CARD_TONE_CLASS_NAME,
        "disabled:[&_.action-card-helper]:text-[color:var(--action-card-disabled-muted)]",
        sizeClassName,
        shapeClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/20" />
      <span className={contentClassName}>
        <span className={labelWrapperClassName}>
          <span className={ACTION_CARD_LABEL_CLASS_NAME}>{label}</span>
          {helper ? (
            <span
              className={["action-card-helper", ACTION_CARD_HELPER_CLASS_NAME].join(" ")}
            >
              {helper}
            </span>
          ) : null}
        </span>
        {icon ? (
          <span
            className={["action-card-icon", ACTION_CARD_ICON_WRAPPER_CLASS_NAME].join(" ")}
          >
            {icon}
          </span>
        ) : null}
      </span>
    </button>
  );
}
