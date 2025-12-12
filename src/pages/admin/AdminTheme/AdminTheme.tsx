import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  ButtonBase,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import Title from "@shared/ui/typography/Title";
import { useContext, useEffect, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { resolveThemeColor } from "@/constants/theme";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E15001, S15001 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

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
    (color) => color.toLowerCase() !== DEFAULT_BRAND_COLOR.toLowerCase()
  ),
];

const presetPalette = paletteCandidates
  .filter((color) => !isDarkColor(color))
  .slice(0, 20);
const TILE_SIZE = 44;
const MAX_TILES_PER_ROW = 10;

export default function AdminTheme() {
  const dispatch = useAppDispatchV2();
  const { getThemeColor, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [colorCode, setColorCode] = useState(DEFAULT_BRAND_COLOR);
  const [currentColor, setCurrentColor] = useState(DEFAULT_BRAND_COLOR);
  const [customMode, setCustomMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const isValidHex = useMemo(
    () => /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(colorCode),
    [colorCode]
  );

  useEffect(() => {
    const themeColor = resolveThemeColor(
      getThemeColor ? getThemeColor() : undefined
    );
    if (!themeColor) return;
    setColorCode(themeColor);
    setCurrentColor(themeColor);
    const matchesPreset = presetPalette.some(
      (color) => color.toLowerCase() === themeColor.toLowerCase()
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
      dispatch(setSnackbarError(E15001));
      return;
    }

    const payloadColor = normalizeColor(colorCode);
    if (!payloadColor) {
      dispatch(setSnackbarError(E15001));
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
      dispatch(setSnackbarSuccess(S15001));
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError(E15001));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Title>テーマ</Title>
      <Typography>
        テーマを選択すると、ヘッダーとフッターの配色が変更されます。
      </Typography>
      <Stack spacing={1}>
        <Typography variant="subtitle2">テーマ</Typography>
        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_SIZE}px, 1fr))`,
            maxWidth: `${
              MAX_TILES_PER_ROW * TILE_SIZE + (MAX_TILES_PER_ROW - 1) * 8
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
                  borderColor: isSelected ? "primary.main" : "rgba(0,0,0,0.12)",
                  backgroundColor: color,
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(25,118,210,0.3)"
                    : "none",
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
              borderColor: customMode ? "primary.main" : "rgba(0,0,0,0.26)",
              color: customMode ? "primary.main" : "text.secondary",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="その他のカラーコードを入力"
          >
            <AddIcon />
          </ButtonBase>
        </Box>
      </Stack>
      {customMode && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">カラーコードを直接指定</Typography>
          <TextField
            size="small"
            label="#RRGGBB"
            value={colorCode}
            onChange={(e) => handleHexInput(e.target.value)}
            error={!isValidHex}
            helperText={
              isValidHex ? "" : "正しい16進数カラーコードを入力してください"
            }
          />
        </Stack>
      )}
      <Stack spacing={1}>
        <Typography variant="subtitle2">プレビュー</Typography>
        <Box
          sx={{
            width: 160,
            height: 80,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: isValidHex ? colorCode : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color={isValidHex ? "#fff" : "text.secondary"}>
            {isValidHex ? colorCode.toUpperCase() : "色を選択"}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isValidHex || saving || !isDirty}
        >
          {saving ? "保存中..." : "保存"}
        </Button>
      </Stack>
    </Stack>
  );
}
