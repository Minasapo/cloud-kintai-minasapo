/**
 * SplitView 機能の型定義
 */

/**
 * パネルの設定
 */
export interface PanelConfig {
  id: string;
  title: string;
  component?: React.ComponentType<{ panelId: string }>;
  route?: string;
}

/**
 * SplitView のモード
 * - 'single': シングルビューモード（デフォルト）
 * - 'split': 左右2分割モード
 */
export type SplitViewMode = 'single' | 'split';

/**
 * SplitView の状態
 */
export interface SplitViewState {
  mode: SplitViewMode;
  leftPanel: PanelConfig | null;
  rightPanel: PanelConfig | null;
  dividerPosition: number; // 0-100 のパーセンテージ
}

/**
 * SplitViewContext の値
 */
export interface SplitViewContextValue {
  state: SplitViewState;
  setMode: (mode: SplitViewMode) => void;
  setLeftPanel: (panel: PanelConfig | null) => void;
  setRightPanel: (panel: PanelConfig | null) => void;
  setDividerPosition: (position: number) => void;
  reset: () => void;
}
