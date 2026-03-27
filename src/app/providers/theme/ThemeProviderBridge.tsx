import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { createAppTheme } from "@/shared/lib/theme";

type ThemeProviderBridgeProps = {
  children: ReactNode;
};

export function ThemeProviderBridge({ children }: ThemeProviderBridgeProps) {
  const { derived } = useContext(AppConfigContext);
  const appTheme = useMemo(
    () => createAppTheme(derived?.themeColor),
    [derived?.themeColor],
  );

  return (
    <ThemeContextProvider>
      <ThemeProvider theme={appTheme}>{children}</ThemeProvider>
    </ThemeContextProvider>
  );
}
