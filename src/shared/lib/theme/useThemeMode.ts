/**
 * @file useThemeMode.ts
 * @description テーマモードを管理するカスタムフック
 */

import {
  type ThemeMode,
  useThemeContext,
} from "@app/providers/theme/ThemeContext";
import { useEffect } from "react";

const THEME_MODE_STORAGE_KEY = "app-theme-mode";

function isThemeMode(value: string): value is ThemeMode {
  return value === "light" || value === "auto";
}

/**
 * テーマモード（light/auto）を管理するフック
 *
 * @returns {Object} テーマモード管理オブジェクト
 * @example
 * ```tsx
 * const { mode, setMode } = useThemeMode();
 * ```
 */
export function useThemeMode() {
  const { mode, setMode } = useThemeContext();

  // LocalStorage からの復元（SSR 対応）
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (!savedMode) {
        return;
      }

      if (!isThemeMode(savedMode)) {
        localStorage.removeItem(THEME_MODE_STORAGE_KEY);
        return;
      }

      if (savedMode !== mode) {
        setMode(savedMode);
      }
    } catch {
      // LocalStorage が利用不可の場合
    }
  }, [mode, setMode]);

  return { mode, setMode, isHydrated: true };
}
