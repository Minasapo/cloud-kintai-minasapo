import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { Unstable_Popup as BasePopup } from "@mui/base/Unstable_Popup";
import AppsIcon from "@mui/icons-material/Apps";
import {
  Box,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

import { predefinedIcons } from "@/constants/icons";

export type ExternalLinkItem = {
  label: string;
  url: string;
  enabled: boolean;
  icon: string;
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchor(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <IconButton onClick={handleClick}>
          <AppsIcon
            sx={{
              color: "white",
            }}
          />
        </IconButton>
        <BasePopup
          id={id}
          open={open}
          anchor={anchor}
          placement={(() => (isMobileSize ? "bottom-end" : "bottom"))()}
        >
          <Paper
            elevation={3}
            sx={{
              width: "300px",
              height: "400px",
              m: 2,
              p: 2,
              border: `5px solid ${theme.palette.primary.main}`,
            }}
          >
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
          </Paper>
        </BasePopup>
      </Box>
    </ClickAwayListener>
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
  const iconComponent = iconMap.get(iconType) || iconMap.get("LinkIcon");
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
          {iconComponent}
          <Typography variant="caption">{title}</Typography>
        </Stack>
      </Link>
    </Grid>
  );
};

export default ExternalLinks;
