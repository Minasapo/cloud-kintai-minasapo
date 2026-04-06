import type { ReactNode } from "react";

type SettingsIconName =
  | "menu"
  | "chevron-down"
  | "chevron-up"
  | "chevron-right"
  | "plus"
  | "delete"
  | "edit"
  | "reset"
  | "arrow-up"
  | "arrow-down"
  | "train"
  | "holiday"
  | "expense"
  | "link";

type SettingsIconProps = {
  name: SettingsIconName;
  className?: string;
  title?: string;
};

const baseClassName = "inline-block h-5 w-5 shrink-0";

function wrapPath(title: string | undefined, children: ReactNode) {
  return (
    <svg
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClassName}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export default function SettingsIcon({
  name,
  className,
  title,
}: SettingsIconProps) {
  const icon = (() => {
    switch (name) {
      case "menu":
        return wrapPath(title, (
          <>
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </>
        ));
      case "chevron-down":
        return wrapPath(title, <path d="m6 9 6 6 6-6" />);
      case "chevron-up":
        return wrapPath(title, <path d="m18 15-6-6-6 6" />);
      case "chevron-right":
        return wrapPath(title, <path d="m9 6 6 6-6 6" />);
      case "plus":
        return wrapPath(title, (
          <>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </>
        ));
      case "delete":
        return wrapPath(title, (
          <>
            <path d="M4 7h16" />
            <path d="m9 7 .5-2h5L15 7" />
            <path d="M8 7v11" />
            <path d="M16 7v11" />
            <path d="M6 7l1 13h10l1-13" />
          </>
        ));
      case "edit":
        return wrapPath(title, (
          <>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </>
        ));
      case "reset":
        return wrapPath(title, (
          <>
            <path d="M3 11a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </>
        ));
      case "arrow-up":
        return wrapPath(title, (
          <>
            <path d="m12 5-5 5" />
            <path d="m12 5 5 5" />
            <path d="M12 5v14" />
          </>
        ));
      case "arrow-down":
        return wrapPath(title, (
          <>
            <path d="m7 14 5 5" />
            <path d="m17 14-5 5" />
            <path d="M12 5v14" />
          </>
        ));
      case "train":
        return wrapPath(title, (
          <>
            <rect x="7" y="3" width="10" height="13" rx="2" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
            <path d="m9 19-2 2" />
            <path d="m15 19 2 2" />
          </>
        ));
      case "holiday":
        return wrapPath(title, (
          <>
            <path d="M12 3c4.4 0 8 2.8 8 6.2 0 2.9-2.4 5.4-5.6 6L15 21l-3-3-3 3 .6-5.6C6.4 14.6 4 12.1 4 9.2 4 5.8 7.6 3 12 3Z" />
          </>
        ));
      case "expense":
        return wrapPath(title, (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 2-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-.9 2.5-2" />
            <path d="M12 6.5v11" />
          </>
        ));
      case "link":
        return wrapPath(title, (
          <>
            <path d="M10 14 8 16a3 3 0 1 1-4-4l3-3a3 3 0 0 1 4 0" />
            <path d="m14 10 2-2a3 3 0 1 1 4 4l-3 3a3 3 0 0 1-4 0" />
            <path d="M9 15 15 9" />
          </>
        ));
    }
  })();

  return <span className={[baseClassName, className].filter(Boolean).join(" ")}>{icon}</span>;
}
