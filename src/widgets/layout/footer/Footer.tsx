import FooterView from "@shared/ui/footer/Footer";
import { useContext, useMemo } from "react";

import { resolveThemeColor } from "@/constants/theme";
import { AppConfigContext } from "@/context/AppConfigContext";

export default function Footer() {
  const { getThemeColor } = useContext(AppConfigContext);
  const themeColor = useMemo(
    () =>
      resolveThemeColor(
        typeof getThemeColor === "function" ? getThemeColor() : undefined
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <FooterView themeColor={themeColor} />;
}
