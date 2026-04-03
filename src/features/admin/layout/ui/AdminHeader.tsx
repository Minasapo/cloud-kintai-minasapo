import { Stack, Typography } from "@mui/material";
import { memo, ReactNode } from "react";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

const DEFAULT_TITLE = "Admin Control Deck";
const DEFAULT_SUBTITLE =
  "業務全体を俯瞰しながら、優先度の高い管理タスクへすばやく移動できます。";

const AdminHeader = ({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  children,
}: AdminHeaderProps) => (
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
      {title}
    </Typography>
    <Typography sx={{ color: "#64748b", lineHeight: 1.9 }}>
      {subtitle}
    </Typography>
    {children}
  </Stack>
);

export default memo(AdminHeader);
