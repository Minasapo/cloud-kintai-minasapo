import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type ReactNode, useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { designTokenVar, getDesignTokens } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

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
  const groupContainerTokens = tokens.component.groupContainer;
  const panelSpacingVar = designTokenVar(
    "component.adminPanel.sectionSpacing",
    `${panelSpacing}px`
  );
  const PANEL_HALF_GAP = `calc(${panelSpacingVar} / 2)`;
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
  const accentWidthVar = designTokenVar(
    "component.groupContainer.accentWidth",
    `${groupContainerTokens.accentWidth}px`
  );
  const titleSpacingVar = designTokenVar("spacing.sm", "8px");

  return (
    <PageSection
      variant="surface"
      layoutVariant="detail"
      sx={{
        gap: PANEL_HALF_GAP,
        border: `1px solid ${dividerColorVar}`,
        borderLeft: `${accentWidthVar} solid ${brandAccentVar}`,
        backgroundColor: surfaceColorVar,
        boxShadow: "none",
        px: panelSpacingVar,
        py: panelSpacingVar,
      }}
    >
      <Stack spacing={0} sx={{ gap: PANEL_HALF_GAP }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: titleSpacingVar }}
        >
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
        <Box sx={{ pt: PANEL_HALF_GAP }}>{children}</Box>
      </Stack>
    </PageSection>
  );
}
