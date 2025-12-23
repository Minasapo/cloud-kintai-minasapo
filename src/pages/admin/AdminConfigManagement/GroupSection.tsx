import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type ReactNode, useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { designTokenVar, getDesignTokens } from "@/shared/designSystem";

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
      typeof getThemeTokens === "function"
        ? getThemeTokens()
        : getDesignTokens(),
    [getThemeTokens]
  );
  const adminPanelTokens = tokens.component.adminPanel;
  const panelSpacing = adminPanelTokens.sectionSpacing;
  const dividerColor = adminPanelTokens.dividerColor;
  const brandAccent = tokens.color.brand.primary.base;
  const surfaceColor = adminPanelTokens.surface;
  const dividerColorVar = designTokenVar(
    "component.adminPanel.dividerColor",
    dividerColor
  );
  const brandAccentVar = designTokenVar(
    "color.brand.primary.base",
    brandAccent
  );
  const surfaceColorVar = designTokenVar(
    "component.adminPanel.surface",
    surfaceColor
  );
  const titleColorVar = designTokenVar(
    "color.brand.primary.dark",
    tokens.color.brand.primary.dark ?? brandAccent
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: panelSpacing,
        borderColor: dividerColorVar,
        borderLeft: `6px solid ${brandAccentVar}`,
        backgroundColor: surfaceColorVar,
      }}
    >
      <Stack spacing={0} sx={{ gap: panelSpacing / 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: titleColorVar }}>
            {title}
          </Typography>
          {actions && <Box>{actions}</Box>}
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <Divider sx={{ borderColor: dividerColorVar }} />
        <Box sx={{ pt: panelSpacing / 2 }}>{children}</Box>
      </Stack>
    </Paper>
  );
}
