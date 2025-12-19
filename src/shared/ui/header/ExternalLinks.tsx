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
        <IconButton onClick={handleClick}>
          <AppsIcon sx={{ color: "white" }} />
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
              width: "300px",
              height: "400px",
              m: 2,
              p: 2,
              border: `5px solid ${theme.palette.primary.main}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ overflowY: "auto", pr: 1 }}>
              <Stack spacing={2}>
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
                    color="text.secondary"
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
          fontWeight: 700,
          letterSpacing: 0.5,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={1}>
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
          spacing={0}
          alignItems="center"
          sx={{
            p: 1,
            "&:hover": {
              backgroundColor: "#f0f0f0",
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
