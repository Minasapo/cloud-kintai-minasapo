import { Box, Stack } from "@mui/material";

import { SplitModeToggle } from "@/features/splitView";

type ActiveMenuInfoProps = {
  primaryLabel: string;
  description?: string | null;
  ctaLabel?: string | null;
  isMobile: boolean;
  splitMode: "single" | "split";
  onToggleSplitMode: () => void;
};

/**
 * 現在アクティブなメニュー項目の情報を表示するコンポーネント。
 * カテゴリ名・説明・スプリットモード切替を含みます。
 */
export function ActiveMenuInfo({
  primaryLabel,
  description,
  ctaLabel,
  isMobile,
  splitMode,
  onToggleSplitMode,
}: ActiveMenuInfoProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{
        width: "100%",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.6)",
        bgcolor: "rgba(255,255,255,0.78)",
        px: { xs: 1.5, md: 2 },
        py: 1.5,
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Box
          sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#0f766e",
          }}
        >
          現在のカテゴリ
        </Box>
        <Box sx={{ fontSize: "1rem", fontWeight: 700, color: "#020617" }}>
          {primaryLabel}
        </Box>
        {description ? (
          <Box sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.92rem" }}>
            {description}
          </Box>
        ) : null}
        {ctaLabel ? (
          <Box
            sx={{
              mt: 0.35,
              width: "fit-content",
              borderRadius: "999px",
              border: "1px solid rgba(16,185,129,0.35)",
              bgcolor: "rgba(236,253,245,0.9)",
              px: 1.1,
              py: 0.35,
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "#047857",
            }}
          >
            {ctaLabel}
          </Box>
        ) : null}
      </Stack>
      {!isMobile && (
        <SplitModeToggle mode={splitMode} onToggle={onToggleSplitMode} />
      )}
    </Stack>
  );
}
