import type { CSSProperties, ReactNode } from "react";

export interface MobileMenuItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface MobileMenuProps {
  menuItems: MobileMenuItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hide?: boolean;
  iconColor?: string;
}

function MenuGlyph({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 sm:h-8 sm:w-8"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

const MenuList = ({
  menuItems,
  onClose,
}: {
  menuItems: MobileMenuItem[];
  onClose: () => void;
}) => (
  <div
    className="w-[250px]"
    role="presentation"
    onKeyDown={(event) => {
      if (event.key === "Escape") {
        onClose();
      }
    }}
  >
    <ul className="m-0 list-none p-0">
      {menuItems.map((item, index) => (
        <li key={`${item.label}-${index}`} className="m-0">
          <button
            type="button"
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={[
              "flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              item.className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={item.style}
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-slate-500">
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
          {item.divider ? <div className="h-px bg-slate-200" /> : null}
        </li>
      ))}
    </ul>
    <div className="h-px bg-slate-200" />
  </div>
);

const MobileMenu = ({
  menuItems,
  isOpen,
  onOpen,
  onClose,
  hide = false,
  iconColor = "#45574F",
}: MobileMenuProps) => {
  if (hide) {
    return null;
  }

  return (
    <div className="text-right lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="menu"
        aria-expanded={isOpen}
        className="inline-flex appearance-none rounded-full border-0 bg-transparent p-[2px] shadow-none transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-[6px]"
      >
        <MenuGlyph color={iconColor} />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40"
          onClick={onClose}
          role="presentation"
        >
          <aside
            className="ml-auto h-full w-[250px] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="mobile navigation"
          >
            <MenuList menuItems={menuItems} onClose={onClose} />
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default MobileMenu;
