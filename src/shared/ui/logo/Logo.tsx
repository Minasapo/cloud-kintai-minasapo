import { Box, Link } from "@mui/material";

import LogoImage from "@/images/logo.png";

const Logo = () => (
  <Box
    sx={{
      height: 1,
      justifyContent: "center",
      alignItems: "center",
      flexGrow: {
        xs: 1,
        md: 0,
      },
    }}
  >
    <Link href="/">
      <img src={LogoImage} alt="クラウド勤怠のロゴ" style={{ height: "100%" }} />
    </Link>
  </Box>
);

export default Logo;
