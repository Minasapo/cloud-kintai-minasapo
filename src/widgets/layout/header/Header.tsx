import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import Logo from "@shared/ui/logo/Logo";
import { useContext, useMemo } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { resolveThemeColor } from "@/shared/config/theme";
import { designTokenVar } from "@/shared/designSystem";
import HeaderBar from "@/shared/ui/header/HeaderBar";

import DesktopMenu from "./DesktopMenu";
import { ExternalLinks } from "./ExternalLinks/ExternalLinks";
import MobileMenu from "./MobileMenu";
import { SignInOutButton } from "./SignInOutButton";

export default function Header() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getThemeColor } = useContext(AppConfigContext);

  const pathName =
    window.location.pathname === "/" ? "/register" : window.location.pathname;

  const resolvedThemeColor = useMemo(
    () =>
      resolveThemeColor(
        typeof getThemeColor === "function" ? getThemeColor() : undefined
      ),
    [getThemeColor]
  );
  const headerThemeColor = designTokenVar(
    "color.brand.primary.base",
    resolvedThemeColor
  );

  const showExternalLinks = !isCognitoUserRole(StaffRole.OPERATOR);

  return (
    <HeaderBar
      themeColor={headerThemeColor}
      logo={<Logo />}
      desktopMenu={<DesktopMenu pathName={pathName} />}
      externalLinks={showExternalLinks ? <ExternalLinks /> : null}
      mobileMenu={<MobileMenu pathName={pathName} />}
      signInOutButton={<SignInOutButton />}
    />
  );
}
