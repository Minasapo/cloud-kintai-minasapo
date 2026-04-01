import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  type SxProps,
  type Theme,
} from "@mui/material";
import { memo, type MouseEvent, useCallback, useMemo, useState } from "react";

import {
  buildAdminSplitPanelConfig,
  getAdminSplitPanelOptionByRoute,
} from "@/features/admin/layout/model/adminSplitPanelRegistry";
import { useSplitView } from "@/features/splitView";
import { AppIconButton } from "@/shared/ui/button";

interface NavItemPanelMenuProps {
  href: string;
  label: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const NavItemPanelMenu = ({
  href,
  label,
  className,
  sx,
}: NavItemPanelMenuProps) => {
  const {
    state,
    enableSplitMode,
    enableTripleMode,
    setLeftPanel,
    setRightPanel,
  } = useSplitView();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const panelOption = useMemo(
    () => getAdminSplitPanelOptionByRoute(href),
    [href],
  );
  const hasPanelTarget = Boolean(panelOption);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOpenRight = useCallback(() => {
    if (!panelOption) {
      return;
    }

    const panelConfig = buildAdminSplitPanelConfig(panelOption.value);
    if (!panelConfig) {
      return;
    }

    setRightPanel(panelConfig);
    if (state.mode === "single") {
      enableSplitMode();
    }

    handleMenuClose();
  }, [
    enableSplitMode,
    handleMenuClose,
    panelOption,
    setRightPanel,
    state.mode,
  ]);

  const handleOpenLeft = useCallback(() => {
    if (!panelOption) {
      return;
    }

    const panelConfig = buildAdminSplitPanelConfig(panelOption.value);
    if (!panelConfig) {
      return;
    }

    setLeftPanel(panelConfig);
    if (state.mode !== "triple") {
      enableTripleMode();
    }

    handleMenuClose();
  }, [
    enableTripleMode,
    handleMenuClose,
    panelOption,
    setLeftPanel,
    state.mode,
  ]);

  return (
    <>
      <Box sx={sx}>
        <AppIconButton
          className={className}
          size="sm"
          onClick={handleMenuOpen}
          aria-label={`${label} の表示位置を選択`}
        >
          <MoreHorizIcon fontSize="small" />
        </AppIconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleOpenRight} disabled={!hasPanelTarget}>
          <ListItemIcon>R</ListItemIcon>
          <ListItemText>右で開く</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenLeft} disabled={!hasPanelTarget}>
          <ListItemIcon>L</ListItemIcon>
          <ListItemText>左で開く</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default memo(NavItemPanelMenu);
