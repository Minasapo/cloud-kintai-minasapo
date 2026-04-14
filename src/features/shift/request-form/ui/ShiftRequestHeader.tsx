import { Box, Typography } from "@mui/material";

export function ShiftRequestHeader() {
  return (
    <Box className="rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography
          sx={{
            margin: 0,
            fontSize: { xs: "1.85rem", md: "2.2rem" },
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#020617",
          }}
        >
          希望シフト
        </Typography>
        <Typography
          sx={{
            maxWidth: 760,
            color: "#64748b",
            lineHeight: 1.9,
          }}
        >
          出勤日、固定休、希望休をひとつの画面で整理できます。月ごとの希望を調整しながら保存してください。
        </Typography>
      </Box>
    </Box>
  );
}

