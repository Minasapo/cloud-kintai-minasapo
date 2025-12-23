import AppsIcon from "@mui/icons-material/Apps";
import {
  Box,
  Grid,
  IconButton,
  Link,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useTheme } from "@mui/material/styles";
import { MouseEvent, useMemo, useState } from "react";

import { predefinedIcons } from "@/constants/icons";
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
  "#FFFFFF"
);
const ACTION_ICON_SIZE = designTokenVar(
  "component.headerActions.iconSize",
  "40px"
);
const ACTION_ICON_HOVER_BG = designTokenVar(
  "component.headerActions.iconHoverBackground",
  "rgba(255, 255, 255, 0.16)"
);
const POPPER_WIDTH = designTokenVar(
  "component.headerActions.popoverWidth",
  "320px"
);
const POPPER_HEIGHT = designTokenVar(
  "component.headerActions.popoverHeight",
  "400px"
);
const POPPER_PADDING = designTokenVar(
  "component.headerActions.popoverPadding",
  "16px"
);
const POPPER_GAP = designTokenVar("component.headerActions.popoverGap", "16px");
const POPPER_BORDER_WIDTH = designTokenVar(
  "component.headerActions.popoverBorderWidth",
  "4px"
);
const POPPER_BORDER_COLOR = designTokenVar(
  "component.headerActions.popoverBorderColor",
  "#0FA85E"
);
const GRID_GAP = designTokenVar("component.headerActions.gridGap", "8px");
const GRID_ITEM_PADDING = designTokenVar(
  "component.headerActions.gridItemPadding",
  "8px"
);
const GRID_HOVER_BACKGROUND = designTokenVar(
  "component.headerActions.gridHoverBackground",
  "#EDF1EF"
);
const GRID_ITEM_RADIUS = designTokenVar("radius.sm", "8px");
const EMPTY_STATE_COLOR = designTokenVar(
  "component.headerActions.emptyStateColor",
  "#7D9288"
);
const SECTION_TITLE_FONT_WEIGHT = designTokenVar(
  "component.headerActions.sectionTitle.fontWeight",
  "700"
);
const SECTION_TITLE_LETTER_SPACING = designTokenVar(
  "component.headerActions.sectionTitle.letterSpacing",
  "0.5px"
);
const SECTION_TITLE_MARGIN_BOTTOM = designTokenVar(
  "component.headerActions.sectionTitle.marginBottom",
  "8px"
);
const INTERACTION_TRANSITION_DURATION = designTokenVar(
  "component.headerActions.interaction.transitionDuration",
  "160ms"
);
const INTERACTION_TRANSITION_EASING = designTokenVar(
  "component.headerActions.interaction.transitionEasing",
  "ease"
);

const ExternalLinks = ({ links, staffName }: ExternalLinksProps) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobileSize = useMediaQuery(theme.breakpoints.down("md"));

  const open = Boolean(anchor);
  const id = open ? "external-links-popup" : undefined;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchor(null);
  };

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
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <IconButton
          onClick={handleClick}
          sx={{
            color: ACTION_ICON_COLOR,
            width: ACTION_ICON_SIZE,
            height: ACTION_ICON_SIZE,
            borderRadius: "50%",
            transition: `background-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}`,
            "&:hover": {
              backgroundColor: ACTION_ICON_HOVER_BG,
            },
          }}
        >
          <AppsIcon />
        </IconButton>
        <Popper
          id={id}
          open={open}
          anchorEl={anchor}
          placement={isMobileSize ? "bottom-end" : "bottom"}
        >
          <Paper
            elevation={3}
            sx={{
              width: POPPER_WIDTH,
              height: POPPER_HEIGHT,
              m: 2,
              p: POPPER_PADDING,
              border: `${POPPER_BORDER_WIDTH} solid ${POPPER_BORDER_COLOR}`,
              display: "flex",
              flexDirection: "column",
              gap: POPPER_GAP,
            }}
          >
            <Box sx={{ overflowY: "auto", pr: 1 }}>
              <Stack sx={{ gap: POPPER_GAP }}>
                {companyLinks.length > 0 && (
                  <LinksSection
                    title="共通"
                    links={companyLinks}
                    staffName={staffName}
                  />
                )}
                {personalLinks.length > 0 && (
                  <LinksSection
                    title="プライベート"
                    links={personalLinks}
                    staffName={staffName}
                  />
                )}
                {companyLinks.length === 0 && personalLinks.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: EMPTY_STATE_COLOR }}
                    textAlign="center"
                  >
                    表示できるリンクがありません
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

interface LinksSectionProps {
  title: string;
  links: ExternalLinkItem[];
  staffName: string;
}

const LinksSection = ({ title, links, staffName }: LinksSectionProps) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: SECTION_TITLE_FONT_WEIGHT,
          letterSpacing: SECTION_TITLE_LETTER_SPACING,
          marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
        }}
      >
        {title}
      </Typography>
      <Grid
        container
        sx={{
          columnGap: GRID_GAP,
          rowGap: GRID_GAP,
        }}
      >
        {links.map((link, index) => (
          <LinkGridItem
            key={`${link.url}-${index}`}
            url={link.url}
            title={link.label}
            iconType={link.icon}
            staffName={staffName}
          />
        ))}
      </Grid>
    </Box>
  );
};

interface LinkGridItemProps {
  url: string;
  title: string;
  iconType: string;
  staffName: string;
}

const iconMap = new Map(
  predefinedIcons.map((icon) => [icon.value, icon.component])
);

const LinkGridItem = ({
  url,
  title,
  iconType,
  staffName,
}: LinkGridItemProps) => {
  const iconComponent = iconMap.get(iconType) || iconMap.get("LinkIcons");
  const processedUrl = url.replace("{staffName}", staffName);
  return (
    <Grid item xs={4}>
      <Link
        href={processedUrl}
        target="_blank"
        color="inherit"
        underline="none"
      >
        <Stack
          direction="column"
          alignItems="center"
          sx={{
            gap: GRID_GAP,
            padding: GRID_ITEM_PADDING,
            borderRadius: GRID_ITEM_RADIUS,
            transition: `background-color ${INTERACTION_TRANSITION_DURATION} ${INTERACTION_TRANSITION_EASING}`,
            "&:hover": {
              backgroundColor: GRID_HOVER_BACKGROUND,
            },
          }}
        >
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            {iconComponent}
          </Box>
          <Typography variant="caption">{title}</Typography>
        </Stack>
      </Link>
    </Grid>
  );
};

export default ExternalLinks;
