import { ReactNode } from "react";

type AttendanceEditPageHeaderProps = {
  title?: string;
  description?: string;
  breadcrumb?: ReactNode;
  variant?: "desktop" | "mobile";
};

const containerClassNameByVariant = {
  desktop:
    "rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5",
  mobile:
    "rounded-[24px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-2.5 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)]",
} as const;

const titleClassNameByVariant = {
  desktop:
    "m-0 text-[1.85rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950 md:text-[2.2rem]",
  mobile: "m-0 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950",
} as const;

const descriptionClassNameByVariant = {
  desktop: "max-w-[760px] leading-8 text-slate-500",
  mobile: "leading-8 text-slate-500",
} as const;

export function AttendanceEditPageHeader({
  title = "勤怠編集",
  description,
  breadcrumb,
  variant = "desktop",
}: AttendanceEditPageHeaderProps) {
  return (
    <div className={containerClassNameByVariant[variant]}>
      <div className="flex flex-col gap-1.5">
        {breadcrumb}
        <h1 className={titleClassNameByVariant[variant]}>{title}</h1>
        {description ? (
          <p className={descriptionClassNameByVariant[variant]}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}
