import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";
import {
  predefinedIcons,
  type PredefinedIconValue,
} from "@shared/config/icons";
import { designTokenVar } from "@shared/designSystem";
import { AppIconButton } from "@shared/ui/button";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  personalLinksFetchError?: boolean;
}

const ACTION_ICON_COLOR = designTokenVar(
  "component.headerActions.iconColor",
  "rgb(69 87 79)",
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
  "rgb(69 87 79)",
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
  "6px",
);
const POPPER_SURFACE = designTokenVar(
  "component.headerActions.popoverSurface",
  "rgb(255 255 255)",
);
const POPPER_SURFACE_ALT = designTokenVar(
  "component.headerActions.popoverSurfaceAlt",
  "rgb(255 255 255)",
);
const GRID_GAP = designTokenVar("component.headerActions.gridGap", "8px");
const GRID_ITEM_PADDING = designTokenVar(
  "component.headerActions.gridItemPadding",
  "8px",
);
const GRID_HOVER_BACKGROUND = designTokenVar(
  "component.headerActions.gridHoverBackground",
  "rgb(234 247 240)",
);
const GRID_ITEM_RADIUS = designTokenVar("radius.sm", "2px");
const GRID_ICON_SURFACE = designTokenVar(
  "component.headerActions.iconSurface",
  "rgb(223 241 231)",
);
const GRID_ITEM_BORDER = designTokenVar(
  "component.headerActions.gridItemBorder",
  "1px solid rgb(188 215 199)",
);
const EMPTY_STATE_COLOR = designTokenVar(
  "component.headerActions.emptyStateColor",
  "rgb(125 146 136)",
);
const PERSONAL_LINK_ERROR_COLOR = designTokenVar(
  "component.headerActions.personalLinkErrorColor",
  "rgb(180 35 24)",
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
  "rgb(193 217 203)",
);
const INTERACTION_TRANSITION_DURATION = designTokenVar(
  "component.headerActions.interaction.transitionDuration",
  "160ms",
);
const INTERACTION_TRANSITION_EASING = designTokenVar(
  "component.headerActions.interaction.transitionEasing",
  "ease",
);

const iconMap = new Map<PredefinedIconValue, JSX.Element>(
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
    <Box component="section">
      <Box
        sx={{
          mb: SECTION_TITLE_MARGIN_BOTTOM,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: 1,
          borderColor: SECTION_DIVIDER,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            height: 8,
            width: 8,
            flexShrink: 0,
            borderRadius: 9999,
            bgcolor: "emerald.600",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            m: 0,
            color: "slate.900",
            fontWeight: SECTION_TITLE_FONT_WEIGHT,
            letterSpacing: SECTION_TITLE_LETTER_SPACING,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: GRID_GAP,
          "@media (min-width: 640px)": {
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          },
        }}
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
      </Box>
    </Box>
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
  const normalizedIconType = predefinedIcons.some(
    (icon) => icon.value === iconType,
  )
    ? (iconType as PredefinedIconValue)
    : "LinkIcons";
  const iconComponent =
    iconMap.get(normalizedIconType) || iconMap.get("LinkIcons");
  const processedUrl = url.replace("{staffName}", staffName);

  return (
    <ButtonBase
      component="a"
      href={processedUrl}
      target="_blank"
      rel="noopener noreferrer"
      disableRipple
      sx={{
        minHeight: 72,
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: 1,
        border: GRID_ITEM_BORDER,
        borderRadius: GRID_ITEM_RADIUS,
        bgcolor: "common.white",
        p: GRID_ITEM_PADDING,
        textAlign: "left",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        color: "inherit",
        transition: `background-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}, transform ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}, border-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}`,
        "&:hover": {
          bgcolor: GRID_HOVER_BACKGROUND,
          borderColor: "rgba(20, 76, 44, 0.28)",
          transform: "translateY(-1px)",
        },
        "&:focus-visible": {
          outline: "2px solid rgba(15, 168, 94, 0.45)",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          height: 26,
          width: 26,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          bgcolor: GRID_ICON_SURFACE,
          color: "emerald.800",
        }}
      >
        {iconComponent}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          lineHeight: 1.2,
          color: "slate.900",
          wordBreak: "break-word",
        }}
      >
        {title}
      </Typography>
    </ButtonBase>
  );
}

const ExternalLinks = ({
  links,
  staffName,
  personalLinksFetchError = false,
}: ExternalLinksProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
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
        setAnchorEl(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAnchorEl(null);
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
    <Box ref={rootRef} sx={{ position: "relative" }} style={buttonVars}>
      <AppIconButton
        onClick={(event) => {
          setAnchorEl((current) => (current ? null : event.currentTarget));
        }}
        aria-expanded={open}
        aria-controls={open ? "external-links-popup" : undefined}
        aria-label="external links"
        tone="neutral"
        className="inline-flex h-[var(--external-links-button-size-sm)] min-w-[var(--external-links-button-size-sm)] items-center justify-center gap-2 rounded-full border px-2 py-0 text-[color:var(--external-links-button-text)] shadow-none transition sm:h-[var(--external-links-button-size)] sm:min-w-[var(--external-links-button-size)] sm:px-3"
        style={
          {
            "--external-links-button-text": ACTION_BUTTON_TEXT,
            borderColor: ACTION_BUTTON_BORDER,
            backgroundColor: open ? ACTION_ICON_HOVER_BG : ACTION_BUTTON_BG,
            padding: 0,
          } as CSSProperties & Record<`--${string}`, string>
        }
      >
        <AppsRoundedIcon
          className="h-[22px] w-[22px] sm:h-7 sm:w-7"
          sx={{ color: ACTION_ICON_COLOR }}
        />
      </AppIconButton>

      {open ? (
        <Paper
          id="external-links-popup"
          elevation={0}
          sx={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 12px)",
            zIndex: 50,
            width: `min(calc(100vw - 16px), ${POPPER_WIDTH})`,
            minWidth: POPPER_MIN_WIDTH,
            maxWidth: POPPER_WIDTH,
            overflow: "hidden",
            border: "1px solid rgba(15, 23, 42, 0.18)",
            borderRadius: POPPER_RADIUS,
            background: `linear-gradient(180deg, ${POPPER_SURFACE_ALT} 0%, ${POPPER_SURFACE} 100%)`,
            boxShadow:
              "0 28px 56px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9) inset",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              maxHeight: POPPER_MAX_HEIGHT,
              flexDirection: "column",
              gap: POPPER_GAP,
              overflow: "hidden",
              p: POPPER_PADDING,
              bgcolor: "transparent",
            }}
          >
            <Box sx={{ overflowY: "auto", pr: 0.5 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: POPPER_GAP,
                }}
              >
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
                {personalLinksFetchError ? (
                  <Typography
                    variant="body2"
                    sx={{ m: 0, color: PERSONAL_LINK_ERROR_COLOR }}
                  >
                    プライベートリンクの取得に失敗しました
                  </Typography>
                ) : null}
                {companyLinks.length === 0 && personalLinks.length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ m: 0, textAlign: "center", color: EMPTY_STATE_COLOR }}
                  >
                    表示できるリンクがありません
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
};

export default ExternalLinks;
