import type {
  ChangeEventHandler,
  CSSProperties,
  InputHTMLAttributes,
} from "react";

type DirectSwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "disabled" | "onChange" | "type"
> & {
  checked?: boolean;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const DirectSwitch = ({
  checked = false,
  disabled = false,
  onChange,
  className,
  ...restInputProps
}: DirectSwitchProps) => {
  const trackClassName = checked
    ? "bg-[linear-gradient(135deg,#0FA85E_0%,#0B6D53_100%)]"
    : "bg-slate-300";
  const thumbStyle: CSSProperties = {
    left: checked ? "calc(100% - 1.75rem)" : "0.25rem",
  };

  return (
    <span className="relative inline-flex h-8 w-14 shrink-0 items-center">
      <input
        type="checkbox"
        role="switch"
        className={`peer sr-only ${className ?? ""}`.trim()}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...restInputProps}
      />
      <span
        className={`pointer-events-none absolute inset-0 rounded-full border border-white/40 shadow-[inset_0_1px_2px_rgba(15,23,42,0.18)] transition duration-200 ${trackClassName} ${disabled ? "cursor-not-allowed opacity-60" : ""}`.trim()}
      />
      <span
        className="pointer-events-none absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.25)] transition-[left] duration-200"
        style={thumbStyle}
      />
    </span>
  );
};

export default DirectSwitch;
