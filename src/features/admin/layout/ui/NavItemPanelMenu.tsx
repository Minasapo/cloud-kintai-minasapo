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
import ConfirmDialog from "@/shared/ui/feedback/ConfirmDialog";

interface NavItemPanelMenuProps {
  href: string;
  label: string;
  className?: string;
  sx?: SxProps<Theme>;
}

type PanelSide = "left" | "right";

const NavItemPanelMenu = ({
  href,
  label,
  className,
  sx,
}: NavItemPanelMenuProps) => {
  const { state, enableSplitMode, setLeftPanel, setRightPanel } =
    useSplitView();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [pendingSide, setPendingSide] = useState<PanelSide | null>(null);

  const panelOption = useMemo(
    () => getAdminSplitPanelOptionByRoute(href),
    [href],
  );
  const hasPanelTarget = Boolean(panelOption);
  const isMenuOpen = Boolean(anchorEl);
  const hasOpenedPanel = Boolean(state.leftPanel || state.rightPanel);
  const isConfirmOpen = pendingSide !== null;

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const applyOpen = useCallback(
    (side: PanelSide) => {
      if (!panelOption) {
        return;
      }

      const panelConfig = buildAdminSplitPanelConfig(panelOption.value);
      if (!panelConfig) {
        return;
      }

      if (side === "right") {
        setLeftPanel(null);
        setRightPanel(panelConfig);
      } else {
        setRightPanel(null);
        setLeftPanel(panelConfig);
      }

      enableSplitMode();
      handleMenuClose();
    },
    [
      enableSplitMode,
      handleMenuClose,
      panelOption,
      setLeftPanel,
      setRightPanel,
    ],
  );

  const requestOpen = useCallback(
    (side: PanelSide) => {
      if (!panelOption) {
        return;
      }

      handleMenuClose();

      if (hasOpenedPanel) {
        setPendingSide(side);
        return;
      }

      applyOpen(side);
    },
    [applyOpen, handleMenuClose, hasOpenedPanel, panelOption],
  );

  const handleOpenRight = useCallback(() => {
    requestOpen("right");
  }, [requestOpen]);

  const handleOpenLeft = useCallback(() => {
    requestOpen("left");
  }, [requestOpen]);

  const handleConfirmCancel = useCallback(() => {
    setPendingSide(null);
  }, []);

  const handleConfirmOpen = useCallback(() => {
    if (!pendingSide) {
      return;
    }

    applyOpen(pendingSide);
    setPendingSide(null);
  }, [applyOpen, pendingSide]);

  const confirmMessage = useMemo(() => {
    if (!pendingSide) {
      return "";
    }

    const sideLabel = pendingSide === "left" ? "左" : "右";
    return `現在開いているパネルを閉じて、${sideLabel}に開きますか？`;
  }, [pendingSide]);

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
      <ConfirmDialog
        open={isConfirmOpen}
        title="パネルを切り替えますか"
        message={confirmMessage}
        confirmLabel="開く"
        cancelLabel="キャンセル"
        onConfirm={handleConfirmOpen}
        onCancel={handleConfirmCancel}
      />
    </>
  );
};

export default memo(NavItemPanelMenu);
