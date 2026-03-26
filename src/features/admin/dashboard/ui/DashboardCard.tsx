import { Stack } from "@mui/material";
import { type SxProps, type Theme } from "@mui/material/styles";
import React from "react";

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
  "data-testid"?: string;
};

/**
 * ダッシュボードカードの共通ラッパー。
 * 角丸・ボーダー・影のスタイルを統一します。
 */
export function DashboardCard({
  children,
  className,
  sx,
  "data-testid": testId,
}: DashboardCardProps) {
  return (
    <Stack
      data-testid={testId}
      className={className}
      sx={{
        borderRadius: "12px",
        border: "1.5px solid rgba(148,163,184,0.42)",
        bgcolor: "#ffffff",
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.5, md: 1.25 },
        boxShadow: "0 14px 28px -24px rgba(15,23,42,0.45)",
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}
