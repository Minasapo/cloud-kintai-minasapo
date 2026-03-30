import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  ButtonBase,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  getAdminSettingsNavigationGroups,
} from "@/features/admin/layout/model/adminSettingsNavigation";

const SettingsCard = memo(function SettingsCard({
  title,
  description,
  path,
  ctaLabel,
}: {
  title: string;
  description: string;
  path: string;
  ctaLabel: string;
}) {
  return (
    <ButtonBase
      component={RouterLink}
      to={path}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "stretch",
        textAlign: "left",
        borderRadius: "24px",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          minHeight: 196,
          borderRadius: "24px",
          border: "1px solid rgba(226,232,240,0.9)",
          bgcolor: "#ffffff",
          p: 3,
          boxShadow: "0 18px 42px -34px rgba(15,23,42,0.45)",
          transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 28px 54px -34px rgba(15,23,42,0.4)",
            borderColor: "rgba(16,185,129,0.38)",
          },
        }}
      >
        <Stack spacing={1}>
          <Typography
            component="h3"
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ color: "#475569", lineHeight: 1.7 }}>
            {description}
          </Typography>
        </Stack>
        <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            sx={{
              color: "#059669",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            {ctaLabel}
          </Typography>
          <ChevronRightIcon sx={{ color: "#059669", fontSize: 20 }} />
        </Box>
      </Stack>
    </ButtonBase>
  );
});

export default function AdminSettingsTop() {
  const groups = getAdminSettingsNavigationGroups();

  return (
    <Stack spacing={4}>
      {groups.map((group) => (
        <Stack key={group.key} spacing={2.5}>
          <Stack spacing={1.25}>
            <Chip
              label={group.title}
              sx={{
                alignSelf: "flex-start",
                bgcolor: "rgba(15,23,42,0.06)",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.35rem", md: "1.55rem" },
                fontWeight: 700,
                color: "#020617",
                letterSpacing: "-0.02em",
              }}
            >
              {group.title}
            </Typography>
            <Typography sx={{ color: "#64748b", lineHeight: 1.8, maxWidth: "72ch" }}>
              {group.description}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {group.items.map((item) => (
              <SettingsCard key={item.path} {...item} />
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
