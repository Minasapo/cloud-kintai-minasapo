import { useContext } from "react";
import { SplitViewContext } from "../context/SplitViewContext";
import { SplitViewContextValue } from "../types/splitView.types";

/**
 * useSplitView フック
 * SplitViewContext の値を取得する
 *
 * @throws Error if used outside SplitViewProvider
 * @returns SplitViewContextValue
 */
export const useSplitView = (): SplitViewContextValue => {
  const context = useContext(SplitViewContext);
  if (!context) {
    throw new Error("useSplitView must be used within a SplitViewProvider");
  }
  return context;
};
