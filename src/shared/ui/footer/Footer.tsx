import { Box, Typography } from "@mui/material";

import { designTokenVar } from "@/shared/designSystem";

interface FooterProps {
  themeColor?: string;
}

const FOOTER_BACKGROUND = designTokenVar(
  "component.footer.background",
  "#0B6D53"
);
const FOOTER_TEXT = designTokenVar("component.footer.textColor", "#FFFFFF");
const FOOTER_DIVIDER = designTokenVar(
  "component.footer.dividerColor",
  "#D9E2DD"
);
const FOOTER_PADDING_X = designTokenVar("component.footer.paddingX", "16px");
const FOOTER_PADDING_Y = designTokenVar("component.footer.paddingY", "12px");

const Footer = ({ themeColor }: FooterProps) => (
  <Box
    component="footer"
    role="contentinfo"
    sx={{
      backgroundColor: themeColor ?? FOOTER_BACKGROUND,
      color: FOOTER_TEXT,
      borderTop: `1px solid ${FOOTER_DIVIDER}`,
    }}
  >
    <Box
      textAlign="center"
      sx={{
        py: FOOTER_PADDING_Y,
        px: FOOTER_PADDING_X,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        © 2025 Virtual Tech Japan Inc.
      </Typography>
    </Box>
  </Box>
);

export default Footer;
