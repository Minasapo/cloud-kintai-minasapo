import { Box, Typography } from "@mui/material";

import { designTokenVar } from "@/shared/designSystem";

interface FooterProps {
  themeColor?: string;
}

const FOOTER_BACKGROUND = designTokenVar(
  "color.brand.secondary.base",
  "#0B6D53"
);
const FOOTER_TEXT = designTokenVar(
  "color.brand.secondary.contrastText",
  "#FFFFFF"
);
const FOOTER_DIVIDER = designTokenVar("color.neutral.200", "#D9E2DD");

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
        py: 1.5,
        px: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        © 2025 Virtual Tech Japan Inc.
      </Typography>
    </Box>
  </Box>
);

export default Footer;
