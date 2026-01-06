import Logo from "@shared/ui/logo/Logo";
import { useContext, useEffect, useMemo, useState } from "react";

import { resolveThemeColor } from "@/constants/theme";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";
import HeaderBar from "@/shared/ui/header/HeaderBar";
import { designTokenVar } from "@/shared/designSystem";

import DesktopMenu from "./DesktopMenu";
import { ExternalLinks } from "./ExternalLinks/ExternalLinks";
import MobileMenu from "./MobileMenu";
import { SignInOutButton } from "./SignInOutButton";

export default function Header() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getThemeColor } = useContext(AppConfigContext);
  const [pathName, setPathName] = useState("/register");

  const resolvedThemeColor = useMemo(
    () =>
      resolveThemeColor(
        typeof getThemeColor === "function" ? getThemeColor() : undefined
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const headerThemeColor = designTokenVar(
    "color.brand.primary.base",
    resolvedThemeColor
  );

  useEffect(() => {
    const name =
      window.location.pathname === "/" ? "/register" : window.location.pathname;
    setPathName(name);
  }, []); // location変更時に再実行したい場合はpopstateイベントを利用

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
