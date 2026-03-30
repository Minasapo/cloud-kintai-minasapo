import { Stack, Typography } from "@mui/material";
import { memo,ReactNode } from "react";

interface AdminHeaderProps {
  children?: ReactNode;
}

const AdminHeader = ({ children }: AdminHeaderProps) => (
  <Stack
    spacing={2}
    component="header"
    sx={{
      borderRadius: "28px",
      border: "1px solid rgba(16,185,129,0.15)",
      background:
        "linear-gradient(135deg, rgba(247,252,248,0.98) 0%, rgba(236,253,245,0.92) 58%, rgba(255,255,255,0.98) 100%)",
      p: { xs: 2, md: 2.5 },
      boxShadow: "0 28px 60px -42px rgba(15,23,42,0.35)",
    }}
  >
    <Typography
      component="h1"
      sx={{
        m: 0,
        fontSize: { xs: "1.85rem", md: "2.2rem" },
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "#020617",
      }}
    >
      設定
    </Typography>
    <Typography sx={{ color: "#64748b", lineHeight: 1.9 }}>
      設定カテゴリを整理しながら、必要な詳細画面へ移動できます。
    </Typography>
    {children}
  </Stack>
);

export default memo(AdminHeader);
