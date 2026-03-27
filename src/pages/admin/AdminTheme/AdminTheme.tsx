import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  ButtonBase,
  TextField,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useMemo, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { E15001, S15001 } from "@/errors";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { resolveThemeColor } from "@/shared/config/theme";

const basePalette = [
  "#1976d2",
  "#1e88e5",
  "#2196f3",
  "#64b5f6",
  "#4dd0e1",
  "#00acc1",
  "#26c6da",
  "#43a047",
  "#66bb6a",
  "#7cb342",
  "#9ccc65",
  "#c0ca33",
  "#f9a825",
  "#ffb300",
  "#ffca28",
  "#ffb74d",
  "#ffa726",
  "#fb8c00",
  "#f4511e",
  "#ef5350",
  "#ec407a",
  "#ab47bc",
  "#ba68c8",
  "#9575cd",
  "#5c6bc0",
  "#42a5f5",
];

const isDarkColor = (color: string) => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 110;
};

const DEFAULT_BRAND_COLOR = resolveThemeColor();

const paletteCandidates = [
  DEFAULT_BRAND_COLOR,
  ...basePalette.filter(
    (color) => color.toLowerCase() !== DEFAULT_BRAND_COLOR.toLowerCase(),
  ),
];

const presetPalette = paletteCandidates
  .filter((color) => !isDarkColor(color))
  .slice(0, 20);
const TILE_SIZE = 44;
const MAX_TILES_PER_ROW = 10;

export default function AdminTheme() {
  const { notify } = useLocalNotification();
  const {
    getThemeColor,
    getConfigId,
    saveConfig,
    fetchConfig,
    getThemeTokens,
  } = useContext(AppConfigContext);
  const [colorCode, setColorCode] = useState(DEFAULT_BRAND_COLOR);
  const [currentColor, setCurrentColor] = useState(DEFAULT_BRAND_COLOR);
  const [customMode, setCustomMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const isValidHex = useMemo(
    () => /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(colorCode),
    [colorCode],
  );
  const themeTokens = getThemeTokens();
  const adminPanelTokens = themeTokens.component.adminPanel;
  const panelSpacing = adminPanelTokens.sectionSpacing;

  useEffect(() => {
    const themeColor =
      typeof getThemeColor === "function"
        ? getThemeColor()
        : DEFAULT_BRAND_COLOR;
    if (!themeColor) return;
    setColorCode(themeColor);
    setCurrentColor(themeColor);
    const matchesPreset = presetPalette.some(
      (color) => color.toLowerCase() === themeColor.toLowerCase(),
    );
    setCustomMode(!matchesPreset);
  }, [getThemeColor]);

  const normalizeColor = (value: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const formatted = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return formatted.toUpperCase();
  };

  const normalizedColorCode = normalizeColor(colorCode);
  const normalizedCurrentColor = normalizeColor(currentColor);
  const isDirty =
    normalizedColorCode !== "" &&
    normalizedColorCode !== normalizedCurrentColor;
  const previewTokens = useMemo(
    () => (isValidHex ? getThemeTokens(normalizedColorCode) : themeTokens),
    [isValidHex, normalizedColorCode, themeTokens, getThemeTokens],
  );
  const previewPanelTokens = previewTokens.component.adminPanel;
  const previewPanelDividerColor = previewPanelTokens.dividerColor;
  const previewPanelSurface = previewPanelTokens.surface;
  const brandPrimary = previewTokens.color.brand.primary.base;
  const focusRingColor = previewTokens.color.brand.primary.focusRing;
  const paletteTileGap = panelSpacing / 2;

  const handleHexInput = (value: string) => {
    if (!value) {
      setColorCode("");
      return;
    }
    setColorCode(value.startsWith("#") ? value : `#${value}`);
  };

  const handlePresetSelect = (color: string) => {
    setColorCode(color.toUpperCase());
    setCustomMode(false);
  };

  const handleSave = async () => {
    if (!isValidHex) {
      void notify("エラー", {
        body: E15001,
        mode: "await-interaction",
        priority: "high",
      });
      return;
    }

    const payloadColor = normalizeColor(colorCode);
    if (!payloadColor) {
      void notify("エラー", {
        body: E15001,
        mode: "await-interaction",
        priority: "high",
      });
      return;
    }

    setSaving(true);
    try {
      const id = getConfigId();
      if (id) {
        await saveConfig({
          id,
          themeColor: payloadColor,
        } as UpdateAppConfigInput);
      } else {
        await saveConfig({
          name: "default",
          themeColor: payloadColor,
        } as CreateAppConfigInput);
      }
      await fetchConfig();
      setCurrentColor(payloadColor);
      void notify(S15001, { mode: "auto-close" });
    } catch (error) {
      console.error(error);
      void notify("エラー", {
        body: E15001,
        mode: "await-interaction",
        priority: "high",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSettingsLayout title="テーマ" description="テーマを選択すると、ヘッダーとフッターの配色が変更されます。">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-800">テーマカラー</h3>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_SIZE}px, 1fr))`,
                maxWidth: `${
                  MAX_TILES_PER_ROW * TILE_SIZE +
                  (MAX_TILES_PER_ROW - 1) * paletteTileGap
                }px`,
              }}
            >
              {presetPalette.map((color) => {
                const isSelected =
                  normalizedColorCode !== "" &&
                  normalizedColorCode === normalizeColor(color);
                return (
                  <ButtonBase
                    key={color}
                    onClick={() => handlePresetSelect(color)}
                    sx={{
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      borderRadius: 1,
                      border: "2px solid",
                      borderColor: isSelected
                        ? brandPrimary
                        : previewPanelDividerColor,
                      backgroundColor: color,
                      boxShadow: isSelected
                        ? `0 0 0 2px ${focusRingColor}`
                        : "none",
                      transition: "box-shadow 120ms ease",
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: `0 0 0 3px ${focusRingColor}`,
                      },
                    }}
                    aria-label={`テーマカラー ${color}`}
                  />
                );
              })}
              <ButtonBase
                onClick={() => setCustomMode(true)}
                sx={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 1,
                  border: "2px dashed",
                  borderColor: customMode
                    ? brandPrimary
                    : previewPanelDividerColor,
                  color: customMode ? brandPrimary : "text.secondary",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: `0 0 0 3px ${focusRingColor}`,
                  },
                }}
                aria-label="その他のカラーコードを入力"
              >
                <AddIcon />
              </ButtonBase>
            </div>
          </div>

          {customMode && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                カラーコードを直接指定
              </h3>
              <TextField
                size="small"
                label="#RRGGBB"
                value={colorCode}
                onChange={(e) => handleHexInput(e.target.value)}
                error={!isValidHex}
                helperText={
                  isValidHex ? "" : "正しい16進数カラーコードを入力してください"
                }
                sx={{
                  maxWidth: 240,
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    boxShadow: `0 0 0 3px ${focusRingColor}`,
                    borderRadius: 1,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: brandPrimary,
                  },
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-slate-800">プレビュー</h3>
            <div
              className="p-4 rounded-lg border max-w-sm flex flex-col gap-2"
              style={{
                borderColor: previewPanelDividerColor,
                backgroundColor: previewPanelSurface,
              }}
            >
              <h4 className="text-base font-medium text-slate-800">
                管理パネルプレビュー
              </h4>
              <p className="text-xs text-slate-500 pb-2 border-b" style={{ borderColor: previewPanelDividerColor }}>
                選択したカラーがフォーカスリングやボタンにどう反映されるかを確認できます。
              </p>
              <Button
                variant="contained"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  backgroundColor: brandPrimary,
                  color: previewTokens.color.brand.primary.contrastText,
                  boxShadow: "none",
                  mt: 1,
                  "&:hover": {
                    backgroundColor: previewTokens.color.brand.primary.dark,
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: `0 0 0 3px ${focusRingColor}`,
                  },
                }}
              >
                プライマリボタン
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              onClick={handleSave}
              disabled={!isValidHex || saving || !isDirty}
              type="button"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
