import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { Unstable_Popup as BasePopup } from "@mui/base/Unstable_Popup";
import AppsIcon from "@mui/icons-material/Apps";
import { Box, Grid, IconButton, Paper, useMediaQuery } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";

import { theme } from "../../../lib/theme";
import { LinkGridItem } from "./LinkGridItem";

export function ExternalLinks() {
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const { getLinks } = useContext(AppConfigContext);

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [links, setLinks] = useState<
    { label: string; url: string; enabled: boolean; icon: string }[]
  >([]);

  const isMobileSize = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setLinks(getLinks);
  }, [getLinks]);

  if (authStatus !== "authenticated" || !cognitoUser) {
    return null;
  }

  const { familyName, givenName } = cognitoUser;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
  };

  const open = Boolean(anchor);
  const id = open ? "external-links-popup" : undefined;

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
                  key={index}
                  url={link.url}
                  title={link.label}
                  iconType={link.icon}
                  staffName={`${familyName} ${givenName}`}
                />
              ))}
            </Grid>
          </Paper>
        </BasePopup>
      </Box>
    </ClickAwayListener>
  );
}
