/**
 * SplitView 機能のエクスポート
 */

export { PanelContainer } from "./components/PanelContainer";
export { PanelHeader } from "./components/PanelHeader";
export { SplitModeToggle } from "./components/SplitModeToggle";
export { SplitViewContext } from "./context/SplitViewContext";
export { SplitViewProvider } from "./context/SplitViewProvider";
export { useSplitView } from "./hooks/useSplitView";
export type {
  PanelConfig,
  SplitViewContextValue,
  SplitViewMode,
  SplitViewState,
} from "./types/splitView.types";
