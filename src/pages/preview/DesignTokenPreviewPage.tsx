import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useMemo, useState } from "react";

import { resolveThemeColor } from "@/shared/config/theme";
import { createAppTheme } from "@/shared/lib/theme";
import { DESIGN_TOKENS, getDesignTokens } from "@/shared/designSystem";

const COLOR_PRESETS = [
  "#0FA85E",
  "#006C5B",
  "#0B6D53",
  "#1EAA6A",
  "#3C7EDB",
  "#D7443E",
  "#F5B700",
  "#2ACEDB",
];

const HEX_PATTERN = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

const normalizeInput = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#")
    ? trimmed.toUpperCase()
    : `#${trimmed.toUpperCase()}`;
};

const isDarkHex = (value: string) => {
  const hex = value.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 128;
};

const getChipTextColor = (value: string) =>
  isDarkHex(value) ? "#FFF" : "#1E1F24";

const Swatch = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={1} alignItems="flex-start">
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        height: 60,
        backgroundColor: value,
        boxShadow: "0 12px 24px rgba(17, 24, 39, 0.12)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    />
    <Stack spacing={0.5}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  </Stack>
);

const PreviewCard = () => (
  <Card elevation={6} sx={{ borderRadius: 3, backdropFilter: "blur(4px)" }}>
    <CardContent>
      <Stack spacing={2}>
        <Typography variant="h6">アクセシビリティの散歩</Typography>
        <Typography variant="body2" color="text.secondary">
          ブランドカラーを切り替えると、コンポーネントの `palette.primary` /
          `success` / `warning`
          などがどのように再計算されるかを即時に確認できます。
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained">Primary</Button>
          <Button variant="outlined" color="secondary">
            Secondary
          </Button>
          <Button variant="contained" color="success">
            Success
          </Button>
          <Button variant="contained" color="warning">
            Warning
          </Button>
          <Button variant="contained" color="info">
            Info
          </Button>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const DesignTokenPreviewPage = () => {
  const [inputValue, setInputValue] = useState<string>(
    DESIGN_TOKENS.color.brand.primary.base
  );
  const normalizedInput = normalizeInput(inputValue);
  const isValidHex =
    normalizedInput === "" || HEX_PATTERN.test(normalizedInput);
  const previewPrimary = resolveThemeColor(
    isValidHex ? normalizedInput : undefined
  );

  const tokens = useMemo(
    () =>
      getDesignTokens(
        isValidHex && normalizedInput
          ? { brandPrimary: normalizedInput }
          : { brandPrimary: previewPrimary }
      ),
    [isValidHex, normalizedInput, previewPrimary]
  );

  const previewTheme = useMemo(
    () => createAppTheme(isValidHex ? normalizedInput : undefined),
    [isValidHex, normalizedInput]
  );

  const handlePresetSelect = (value: string) => {
    setInputValue(value);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        py: 6,
        px: { xs: 2, md: 6 },
        background: `radial-gradient(circle at 20% 20%, rgba(15,168,94,0.15), transparent 45%),
          radial-gradient(circle at 80% 0%, rgba(42,206,219,0.18), transparent 35%),
          #f7faf8`,
      }}
    >
      <Stack spacing={4} maxWidth={960} mx="auto">
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Phase5 / Token Playground
          </Typography>
          <Typography variant="h4">ブランドカラー プレビュー</Typography>
          <Typography variant="body1" color="text.secondary">
            getDesignTokens({"{"} brandPrimary {"}"}) と resolveThemeColor()
            の出力をリアルタイムで表示し、 各派生色と MUI Theme
            の動きを検証できます。
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <TextField
            label="#RRGGBB"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            helperText={
              isValidHex ? "" : "16進数カラーコードを入力してください"
            }
            error={!isValidHex}
            size="small"
            sx={{ maxWidth: 240 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
            {COLOR_PRESETS.map((color) => (
              <Chip
                key={color}
                label={color}
                onClick={() => handlePresetSelect(color)}
                clickable
                sx={{
                  backgroundColor: color,
                  color: getChipTextColor(color),
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              />
            ))}
          </Stack>
        </Stack>

        <ThemeProvider theme={previewTheme}>
          <Stack spacing={3}>
            <PreviewCard />
            <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Swatch
                  label="Primary / Base"
                  value={tokens.color.brand.primary.base}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Swatch
                  label="Primary / Light"
                  value={tokens.color.brand.primary.light}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Swatch
                  label="Primary / Dark"
                  value={tokens.color.brand.primary.dark}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Swatch
                  label="Primary / Surface"
                  value={tokens.color.brand.primary.surface}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Swatch
                  label="Secondary"
                  value={tokens.color.brand.secondary.base}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Swatch label="Accent" value={tokens.color.brand.accent.base} />
              </Grid>
            </Grid>
          </Stack>
        </ThemeProvider>

        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "white",
            p: 3,
            boxShadow: "0 20px 60px rgba(30,42,37,0.12)",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            現在のトークン概要
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Focus Ring
              </Typography>
              <Typography variant="subtitle2">
                {tokens.color.brand.primary.focusRing}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Typography / Font
              </Typography>
              <Typography variant="subtitle2">
                {tokens.typography.fontFamily}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Radius / md
              </Typography>
              <Typography variant="subtitle2">{tokens.radius.md}px</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Spacing / unit
              </Typography>
              <Typography variant="subtitle2">
                {tokens.spacing.unit}px
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default DesignTokenPreviewPage;
