import { Box, Typography } from "@mui/material";
import { useContext, useMemo } from "react";

import { DEFAULT_THEME_COLOR } from "@/constants/theme";
import { AppConfigContext } from "@/context/AppConfigContext";

export default function Footer() {
  const { getThemeColor } = useContext(AppConfigContext);
  const themeColor = useMemo(
    () =>
      typeof getThemeColor === "function"
        ? getThemeColor()
        : DEFAULT_THEME_COLOR,
    [getThemeColor]
  );

  return (
    <footer
      style={{
        backgroundColor: themeColor || DEFAULT_THEME_COLOR,
      }}
    >
      <Box textAlign="center" sx={{ p: 1 }}>
        <Typography
          sx={{
            variant: "body2",
            color: "white",
          }}
        >
          © 2025 Virtual Tech Japan Inc.
        </Typography>
      </Box>
    </footer>
  );
}
