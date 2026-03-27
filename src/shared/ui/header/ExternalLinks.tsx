import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { predefinedIcons } from "@/shared/config/icons";
import { designTokenVar } from "@/shared/designSystem";

export type ExternalLinkItem = {
  label: string;
  url: string;
  enabled: boolean;
  icon: string;
  isPersonal?: boolean;
};

export interface ExternalLinksProps {
  links: ExternalLinkItem[];
  staffName: string;
}

const ACTION_ICON_COLOR = designTokenVar(
  "component.headerActions.iconColor",
  "#45574F",
);
const ACTION_ICON_SIZE = designTokenVar(
  "component.headerActions.iconSize",
  "40px",
);
const ACTION_ICON_SIZE_SM = designTokenVar(
  "component.headerActions.iconSizeSm",
  "28px",
);
const ACTION_ICON_HOVER_BG = designTokenVar(
  "component.headerActions.iconHoverBackground",
  "rgba(15, 168, 94, 0.1)",
);
const ACTION_BUTTON_BORDER = designTokenVar(
  "component.headerActions.buttonBorder",
  "rgba(20, 76, 44, 0.12)",
);
const ACTION_BUTTON_BG = designTokenVar(
  "component.headerActions.buttonBackground",
  "rgba(255, 255, 255, 0.78)",
);
const ACTION_BUTTON_TEXT = designTokenVar(
  "component.headerActions.buttonText",
  "#45574F",
);
const POPPER_WIDTH = designTokenVar(
  "component.headerActions.popoverWidth",
  "420px",
);
const POPPER_MIN_WIDTH = designTokenVar(
  "component.headerActions.popoverMinWidth",
  "280px",
);
const POPPER_MAX_HEIGHT = designTokenVar(
  "component.headerActions.popoverMaxHeight",
  "560px",
);
const POPPER_PADDING = designTokenVar(
  "component.headerActions.popoverPadding",
  "16px",
);
const POPPER_GAP = designTokenVar("component.headerActions.popoverGap", "16px");
const POPPER_RADIUS = designTokenVar(
  "component.headerActions.popoverRadius",
  "16px",
);
const POPPER_SURFACE = designTokenVar(
  "component.headerActions.popoverSurface",
  "#FFFFFF",
);
const POPPER_SURFACE_ALT = designTokenVar(
  "component.headerActions.popoverSurfaceAlt",
  "#FFFFFF",
);
const POPPER_SHADOW = designTokenVar(
  "component.headerActions.popoverShadow",
  "0 28px 56px rgba(15, 23, 42, 0.28)",
);
const GRID_GAP = designTokenVar("component.headerActions.gridGap", "8px");
const GRID_ITEM_PADDING = designTokenVar(
  "component.headerActions.gridItemPadding",
  "8px",
);
const GRID_HOVER_BACKGROUND = designTokenVar(
  "component.headerActions.gridHoverBackground",
  "#EAF7F0",
);
const GRID_ITEM_RADIUS = designTokenVar("radius.sm", "8px");
const GRID_ICON_SURFACE = designTokenVar(
  "component.headerActions.iconSurface",
  "#DFF1E7",
);
const GRID_ITEM_BORDER = designTokenVar(
  "component.headerActions.gridItemBorder",
  "1px solid #BCD7C7",
);
const EMPTY_STATE_COLOR = designTokenVar(
  "component.headerActions.emptyStateColor",
  "#7D9288",
);
const SECTION_TITLE_FONT_WEIGHT = designTokenVar(
  "component.headerActions.sectionTitle.fontWeight",
  "700",
);
const SECTION_TITLE_LETTER_SPACING = designTokenVar(
  "component.headerActions.sectionTitle.letterSpacing",
  "0.5px",
);
const SECTION_TITLE_MARGIN_BOTTOM = designTokenVar(
  "component.headerActions.sectionTitle.marginBottom",
  "8px",
);
const SECTION_DIVIDER = designTokenVar(
  "component.headerActions.sectionDivider",
  "#C1D9CB",
);
const INTERACTION_TRANSITION_DURATION = designTokenVar(
  "component.headerActions.interaction.transitionDuration",
  "160ms",
);
const INTERACTION_TRANSITION_EASING = designTokenVar(
  "component.headerActions.interaction.transitionEasing",
  "ease",
);

function AppsGlyph({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px] sm:h-7 sm:w-7"
      fill="currentColor"
      style={{ color }}
    >
      <circle cx="6" cy="6" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="12" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

const iconMap = new Map(
  predefinedIcons.map((icon) => [icon.value, icon.component]),
);

function LinksSection({
  title,
  links,
  staffName,
  useGenericIcon = false,
}: {
  title: string;
  links: ExternalLinkItem[];
  staffName: string;
  useGenericIcon?: boolean;
}) {
  return (
    <div>
      <div
        className="mb-[var(--section-title-margin-bottom)] flex items-center gap-1 border-b pb-3"
        style={
          {
            "--section-title-margin-bottom": SECTION_TITLE_MARGIN_BOTTOM,
            borderColor: SECTION_DIVIDER,
          } as CSSProperties & Record<`--${string}`, string>
        }
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
        <p
          className="m-0 text-sm text-slate-900"
          style={{
            fontWeight: SECTION_TITLE_FONT_WEIGHT,
            letterSpacing: SECTION_TITLE_LETTER_SPACING,
          }}
        >
          {title}
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-[var(--grid-gap)] sm:grid-cols-4"
        style={
          {
            "--grid-gap": GRID_GAP,
          } as CSSProperties & Record<`--${string}`, string>
        }
      >
        {links.map((link, index) => (
          <LinkGridItem
            key={`${link.url}-${index}`}
            url={link.url}
            title={link.label}
            iconType={useGenericIcon ? "LinkIcons" : link.icon}
            staffName={staffName}
          />
        ))}
      </div>
    </div>
  );
}

function LinkGridItem({
  url,
  title,
  iconType,
  staffName,
}: {
  url: string;
  title: string;
  iconType: string;
  staffName: string;
}) {
  const iconComponent = iconMap.get(iconType) || iconMap.get("LinkIcons");
  const processedUrl = url.replace("{staffName}", staffName);

  return (
    <a
      href={processedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-inherit no-underline"
    >
      <div
        className="flex min-h-[72px] flex-col items-start gap-1 rounded-[var(--grid-item-radius)] border bg-white p-[var(--grid-item-padding)] transition hover:-translate-y-px"
        style={
          {
            "--grid-item-padding": GRID_ITEM_PADDING,
            "--grid-item-radius": GRID_ITEM_RADIUS,
            border: GRID_ITEM_BORDER,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
            transition: `background-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}, transform ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}, border-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}`,
          } as CSSProperties & Record<`--${string}`, string>
        }
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = GRID_HOVER_BACKGROUND;
          event.currentTarget.style.borderColor = "rgba(20, 76, 44, 0.28)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = "#FFFFFF";
          event.currentTarget.style.borderColor = "";
        }}
      >
        <span
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[8px] text-emerald-800"
          style={{ backgroundColor: GRID_ICON_SURFACE }}
        >
          {iconComponent}
        </span>
        <span
          className="text-[0.7rem] font-semibold leading-[1.2] text-slate-900"
          style={{ wordBreak: "break-word" }}
        >
          {title}
        </span>
      </div>
    </a>
  );
}

const ExternalLinks = ({ links, staffName }: ExternalLinksProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonVars = {
    "--external-links-button-size": ACTION_ICON_SIZE,
    "--external-links-button-size-sm": ACTION_ICON_SIZE_SM,
  } as CSSProperties & Record<`--${string}`, string>;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const { companyLinks, personalLinks } = useMemo(() => {
    const company: ExternalLinkItem[] = [];
    const personal: ExternalLinkItem[] = [];

    links.forEach((link) => {
      if (link.isPersonal) {
        personal.push(link);
      } else {
        company.push(link);
      }
    });

    return { companyLinks: company, personalLinks: personal };
  }, [links]);

  return (
    <div ref={rootRef} className="relative" style={buttonVars}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={open ? "external-links-popup" : undefined}
        aria-label="external links"
        className="inline-flex h-[var(--external-links-button-size-sm)] min-w-[var(--external-links-button-size-sm)] items-center justify-center gap-2 rounded-full border px-2 py-0 text-[color:var(--external-links-button-text)] shadow-none transition sm:h-[var(--external-links-button-size)] sm:min-w-[var(--external-links-button-size)] sm:px-3"
        style={
          {
            "--external-links-button-text": ACTION_BUTTON_TEXT,
            borderColor: ACTION_BUTTON_BORDER,
            backgroundColor: open ? ACTION_ICON_HOVER_BG : ACTION_BUTTON_BG,
          } as CSSProperties & Record<`--${string}`, string>
        }
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = ACTION_ICON_HOVER_BG;
          event.currentTarget.style.borderColor = "rgba(20, 76, 44, 0.2)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = open
            ? ACTION_ICON_HOVER_BG
            : ACTION_BUTTON_BG;
          event.currentTarget.style.borderColor = ACTION_BUTTON_BORDER;
        }}
      >
        <AppsGlyph color={ACTION_ICON_COLOR} />
      </button>

      {open ? (
        <div
          id="external-links-popup"
          className="absolute right-0 top-full z-50 mt-3 w-[min(calc(100vw-16px),var(--popper-width))] min-w-[var(--popper-min-width)] max-w-[var(--popper-width)] overflow-hidden rounded-[var(--popper-radius)] border bg-white shadow-[var(--popper-shadow)]"
          style={
            {
              "--popper-width": POPPER_WIDTH,
              "--popper-min-width": POPPER_MIN_WIDTH,
              "--popper-radius": POPPER_RADIUS,
              "--popper-shadow": POPPER_SHADOW,
              borderColor: "rgba(15, 23, 42, 0.18)",
              background: `linear-gradient(180deg, ${POPPER_SURFACE_ALT} 0%, ${POPPER_SURFACE} 100%)`,
              boxShadow:
                "0 28px 56px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9) inset",
            } as CSSProperties & Record<`--${string}`, string>
          }
        >
          <div
            className="flex max-h-[var(--popper-max-height)] flex-col gap-[var(--popper-gap)] overflow-hidden p-[var(--popper-padding)]"
            style={
              {
                "--popper-max-height": POPPER_MAX_HEIGHT,
                "--popper-gap": POPPER_GAP,
                "--popper-padding": POPPER_PADDING,
              } as CSSProperties & Record<`--${string}`, string>
            }
          >
            <div className="overflow-y-auto pr-2">
              <div className="space-y-[var(--popper-gap)]">
                {companyLinks.length > 0 ? (
                  <LinksSection
                    title="共通"
                    links={companyLinks}
                    staffName={staffName}
                  />
                ) : null}
                {personalLinks.length > 0 ? (
                  <LinksSection
                    title="プライベート"
                    links={personalLinks}
                    staffName={staffName}
                    useGenericIcon
                  />
                ) : null}
                {companyLinks.length === 0 && personalLinks.length === 0 ? (
                  <p
                    className="m-0 text-center text-sm"
                    style={{ color: EMPTY_STATE_COLOR }}
                  >
                    表示できるリンクがありません
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExternalLinks;
