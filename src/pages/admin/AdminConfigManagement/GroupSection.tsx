import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type ReactNode, useContext, useMemo } from "react";

import { DESIGN_TOKENS } from "@/shared/designSystem";
import { AppConfigContext } from "@/context/AppConfigContext";

type Props = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export default function GroupSection({
  title,
  description,
  actions,
  children,
}: Props) {
  const { getThemeTokens } = useContext(AppConfigContext);
  const tokens = useMemo(
    () =>
      typeof getThemeTokens === "function" ? getThemeTokens() : DESIGN_TOKENS,
    [getThemeTokens]
  );
  const adminPanelTokens = tokens.component.adminPanel;
  const panelSpacing = adminPanelTokens.sectionSpacing;
  const dividerColor = adminPanelTokens.dividerColor;
  const brandAccent = tokens.color.brand.primary.base;
  const surfaceColor = adminPanelTokens.surface;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: panelSpacing,
        borderColor: dividerColor,
        borderLeft: `6px solid ${brandAccent}`,
        backgroundColor: surfaceColor,
      }}
    >
      <Stack spacing={0} sx={{ gap: panelSpacing / 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h6"
            sx={{ color: tokens.color.brand.primary.dark ?? brandAccent }}
          >
            {title}
          </Typography>
          {actions && <Box>{actions}</Box>}
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <Divider sx={{ borderColor: dividerColor }} />
        <Box sx={{ pt: panelSpacing / 2 }}>{children}</Box>
      </Stack>
    </Paper>
  );
}
