import { Box, Link } from "@mui/material";

import LogoImage from "@/images/logo.png";
import { designTokenVar } from "@/shared/designSystem";

const HEADER_LOGO_MAX_HEIGHT = designTokenVar(
  "component.headerBar.logoMaxHeight",
  "32px"
);

const Logo = () => (
  <Box
    sx={{
      height: HEADER_LOGO_MAX_HEIGHT,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: {
        xs: 1,
        md: 0,
      },
    }}
  >
    <Link
      href="/"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: HEADER_LOGO_MAX_HEIGHT,
      }}
    >
      <img
        src={LogoImage}
        alt="クラウド勤怠のロゴ"
        style={{
          height: HEADER_LOGO_MAX_HEIGHT,
          maxHeight: HEADER_LOGO_MAX_HEIGHT,
          width: "auto",
          display: "block",
        }}
      />
    </Link>
  </Box>
);

export default Logo;
