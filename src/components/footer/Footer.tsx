import FooterView from "@shared/ui/footer/Footer";
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

  return <FooterView themeColor={themeColor || DEFAULT_THEME_COLOR} />;
}
