import {
  ADMIN_SPLIT_PANEL_OPTIONS,
  buildAdminSplitPanelConfig,
} from "@features/admin/layout/model/adminSplitPanelRegistry";
import { resolveActiveMenuHref } from "@features/admin/layout/model/resolveActiveMenuHref";
import type {
  AdminHeaderMenuItem,
  UseHeaderMenuResult,
} from "@features/admin/layout/model/useHeaderMenu";
import useHeaderMenu from "@features/admin/layout/model/useHeaderMenu";
import { useSplitView } from "@features/splitView";
import { useIsMobile } from "@shared/lib/hooks/useIsMobile";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface UseAdminLayoutContentResult {
  menuItems: UseHeaderMenuResult;
  activeMenuHref: string;
  activeMenuItem: AdminHeaderMenuItem | null;
  currentPath: string;
  isMobile: boolean;
  isMobileRailOpen: boolean;
  splitMode: "single" | "split" | "triple";
  isSplitMode: boolean;
  isTripleMode: boolean;
  splitPanelPosition: "left" | "right";
  splitPanelConfig: ReturnType<typeof buildAdminSplitPanelConfig>;
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  selectedMiddleScreen: string;
  selectedRightScreen: string;
  MiddlePanelComponent?: React.ComponentType<{ panelId: string }>;
  RightPanelComponent?: React.ComponentType<{ panelId: string }>;
  handleSelect: (itemHref: string) => void;
  handleToggleMobileRail: () => void;
  handleToggleSplitMode: () => void;
  handleCloseMiddlePanel: () => void;
  handleCloseRightPanel: () => void;
  handleMiddleScreenChange: (screenValue: string) => void;
  handleRightScreenChange: (screenValue: string) => void;
}

export function useAdminLayoutContent(): UseAdminLayoutContentResult {
  const menuItems = useHeaderMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    setMode,
    enableSplitMode,
    enableTripleMode,
    disableSplitMode,
    setLeftPanel,
    setRightPanel,
  } = useSplitView();
  const isMobile = useIsMobile();
  const [isMobileRailOpen, setIsMobileRailOpen] = useState(false);

  const handleSelect = useCallback(
    (itemHref: string) => {
      if (location.pathname === itemHref) {
        return;
      }
      navigate(itemHref);
      setIsMobileRailOpen(false);
    },
    [location.pathname, navigate],
  );

  const activeMenuHref = useMemo(
    () => resolveActiveMenuHref({ currentPath: location.pathname, menuItems }),
    [location.pathname, menuItems],
  );

  const activeMenuItem = useMemo(
    () => menuItems.find((item) => item.href === activeMenuHref) ?? null,
    [activeMenuHref, menuItems],
  );

  const ensureRightPanel = useCallback(() => {
    if (state.rightPanel) {
      return;
    }

    const fallbackValue = ADMIN_SPLIT_PANEL_OPTIONS[0]?.value;
    if (!fallbackValue) {
      return;
    }

    const fallback = buildAdminSplitPanelConfig(fallbackValue);
    if (fallback) {
      setRightPanel(fallback);
    }
  }, [setRightPanel, state.rightPanel]);

  const ensureMiddlePanel = useCallback(() => {
    if (state.leftPanel) {
      return;
    }

    const fallbackValue = ADMIN_SPLIT_PANEL_OPTIONS[1]?.value;
    if (!fallbackValue) {
      return;
    }

    const fallback = buildAdminSplitPanelConfig(fallbackValue);
    if (fallback) {
      setLeftPanel(fallback);
    }
  }, [setLeftPanel, state.leftPanel]);

  const handleToggleSplitMode = useCallback(() => {
    if (isMobile) {
      if (state.mode === "single") {
        ensureRightPanel();
        enableSplitMode();
      } else {
        disableSplitMode();
        setLeftPanel(null);
        setRightPanel(null);
      }
      return;
    }

    if (state.mode === "single") {
      ensureRightPanel();
      enableSplitMode();
      return;
    }

    if (state.mode === "split") {
      ensureRightPanel();
      ensureMiddlePanel();
      enableTripleMode();
      return;
    }

    disableSplitMode();
    setLeftPanel(null);
    setRightPanel(null);
  }, [
    isMobile,
    state.mode,
    ensureRightPanel,
    enableSplitMode,
    ensureMiddlePanel,
    enableTripleMode,
    disableSplitMode,
    setLeftPanel,
    setRightPanel,
  ]);

  const handleCloseMiddlePanel = useCallback(() => {
    setLeftPanel(null);
    if (state.mode === "triple") {
      setMode("split");
    }
  }, [setLeftPanel, state.mode, setMode]);

  const handleCloseRightPanel = useCallback(() => {
    if (state.mode === "triple") {
      if (state.leftPanel) {
        setRightPanel(state.leftPanel);
      }
      setLeftPanel(null);
      setMode("split");
      return;
    }

    disableSplitMode();
    setRightPanel(null);
  }, [
    state.mode,
    state.leftPanel,
    setRightPanel,
    setLeftPanel,
    setMode,
    disableSplitMode,
  ]);

  const handleMiddleScreenChange = useCallback(
    (screenValue: string) => {
      const panel = buildAdminSplitPanelConfig(screenValue);
      if (!panel) {
        return;
      }
      setLeftPanel(panel);
    },
    [setLeftPanel],
  );

  const handleRightScreenChange = useCallback(
    (screenValue: string) => {
      const panel = buildAdminSplitPanelConfig(screenValue);
      if (!panel) {
        return;
      }
      setRightPanel(panel);
    },
    [setRightPanel],
  );

  const selectedMiddleScreen = useMemo(
    () => state.leftPanel?.id ?? "",
    [state.leftPanel],
  );
  const selectedRightScreen = useMemo(
    () => state.rightPanel?.id ?? "",
    [state.rightPanel],
  );

  const isSplitMode = state.mode === "split";
  const isTripleMode = state.mode === "triple";
  const MiddlePanelComponent = state.leftPanel?.component;
  const RightPanelComponent = state.rightPanel?.component;
  const splitPanelPosition = useMemo<"left" | "right">(() => {
    if (state.leftPanel && !state.rightPanel) {
      return "left";
    }

    return "right";
  }, [state.leftPanel, state.rightPanel]);

  const splitPanelConfig = useMemo(() => {
    if (splitPanelPosition === "left") {
      return state.leftPanel;
    }

    return state.rightPanel;
  }, [splitPanelPosition, state.leftPanel, state.rightPanel]);

  const handleToggleMobileRail = useCallback(() => {
    setIsMobileRailOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isMobile) return undefined;
    const timeoutId = window.setTimeout(() => setIsMobileRailOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isMobile]);

  useEffect(() => {
    if (isTripleMode) {
      ensureRightPanel();
      ensureMiddlePanel();
    }
  }, [isTripleMode, ensureRightPanel, ensureMiddlePanel]);

  useEffect(() => {
    if (!isSplitMode) {
      return;
    }

    if (!state.leftPanel && !state.rightPanel) {
      ensureRightPanel();
    }
  }, [ensureRightPanel, isSplitMode, state.leftPanel, state.rightPanel]);

  useEffect(() => {
    if (isMobile && state.mode === "triple") {
      setMode("split");
      setLeftPanel(null);
    }
  }, [isMobile, state.mode, setMode, setLeftPanel]);

  return {
    menuItems,
    activeMenuHref,
    activeMenuItem,
    currentPath: location.pathname,
    isMobile,
    isMobileRailOpen,
    splitMode: state.mode,
    isSplitMode,
    isTripleMode,
    splitPanelPosition,
    splitPanelConfig,
    middlePanelTitle: state.leftPanel?.title,
    rightPanelTitle: state.rightPanel?.title,
    selectedMiddleScreen,
    selectedRightScreen,
    MiddlePanelComponent,
    RightPanelComponent,
    handleSelect,
    handleToggleMobileRail,
    handleToggleSplitMode,
    handleCloseMiddlePanel,
    handleCloseRightPanel,
    handleMiddleScreenChange,
    handleRightScreenChange,
  };
}
