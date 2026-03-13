import { Box } from "@mui/material";

import LogoImage from "@/images/logo.png";
import { designTokenVar } from "@/shared/designSystem";
import Link from "@/shared/ui/link/Link";

const HEADER_LOGO_MAX_HEIGHT = designTokenVar(
  "component.headerBar.logoMaxHeight",
  "32px",
);

const Logo = () => (
  <Box
    sx={{
      height: { xs: "26px", sm: "28px", md: HEADER_LOGO_MAX_HEIGHT },
      maxWidth: { xs: "clamp(64px, 30vw, 180px)", sm: "220px", md: "none" },
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 0,
      overflow: "hidden",
    }}
  >
    <Link
      href="/"
      variant="inherit"
      color="inherit"
      underline="none"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: { xs: "26px", sm: "28px", md: HEADER_LOGO_MAX_HEIGHT },
        maxWidth: "100%",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
        },
      }}
    >
      <img
        src={LogoImage}
        alt="クラウド勤怠のロゴ"
        style={{
          height: "100%",
          maxHeight: "100%",
          maxWidth: "100%",
          width: "auto",
          display: "block",
          objectFit: "contain",
        }}
      />
    </Link>
  </Box>
);

export default Logo;
