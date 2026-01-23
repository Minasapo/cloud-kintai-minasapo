import React, { useCallback, useReducer } from "react";

import {
  PanelConfig,
  SplitViewContextValue,
  SplitViewMode,
  SplitViewState,
} from "../types/splitView.types";
import { SplitViewContext } from "./SplitViewContext";

const INITIAL_STATE: SplitViewState = {
  mode: "single",
  leftPanel: null,
  rightPanel: null,
  dividerPosition: 50,
};

type Action =
  | { type: "SET_MODE"; payload: SplitViewMode }
  | { type: "SET_LEFT_PANEL"; payload: PanelConfig | null }
  | { type: "SET_RIGHT_PANEL"; payload: PanelConfig | null }
  | { type: "SET_DIVIDER_POSITION"; payload: number }
  | { type: "RESET" };

const reducer = (state: SplitViewState, action: Action): SplitViewState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_LEFT_PANEL":
      return { ...state, leftPanel: action.payload };
    case "SET_RIGHT_PANEL":
      return { ...state, rightPanel: action.payload };
    case "SET_DIVIDER_POSITION":
      return { ...state, dividerPosition: action.payload };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
};

interface SplitViewProviderProps {
  children: React.ReactNode;
}

/**
 * SplitViewProvider
 * SplitView の状態を管理する Provider コンポーネント
 * デフォルトはシングルモード
 */
export const SplitViewProvider: React.FC<SplitViewProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setMode = useCallback((mode: SplitViewMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const enableSplitMode = useCallback(() => {
    dispatch({ type: "SET_MODE", payload: "split" });
  }, []);

  const disableSplitMode = useCallback(() => {
    dispatch({ type: "SET_MODE", payload: "single" });
  }, []);

  const setLeftPanel = useCallback((panel: PanelConfig | null) => {
    dispatch({ type: "SET_LEFT_PANEL", payload: panel });
  }, []);

  const setRightPanel = useCallback((panel: PanelConfig | null) => {
    dispatch({ type: "SET_RIGHT_PANEL", payload: panel });
  }, []);

  const setDividerPosition = useCallback((position: number) => {
    dispatch({ type: "SET_DIVIDER_POSITION", payload: position });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: SplitViewContextValue = {
    state,
    setMode,
    enableSplitMode,
    disableSplitMode,
    setLeftPanel,
    setRightPanel,
    setDividerPosition,
    reset,
  };

  return (
    <SplitViewContext.Provider value={value}>
      {children}
    </SplitViewContext.Provider>
  );
};
