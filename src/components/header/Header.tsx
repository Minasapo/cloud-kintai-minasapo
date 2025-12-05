import { Container, Stack } from "@mui/material";
import Logo from "@shared/ui/logo/Logo";
import { useContext, useEffect, useMemo, useState } from "react";

import { DEFAULT_THEME_COLOR } from "@/constants/theme";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

import DesktopMenu from "./DesktopMenu";
import { ExternalLinks } from "./ExternalLinks/ExternalLinks";
import MobileMenu from "./MobileMenu";
import { SignInOutButton } from "./SignInOutButton";

export default function Header() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const { getThemeColor } = useContext(AppConfigContext);
  const [pathName, setPathName] = useState("/register");

  const themeColor = useMemo(
    () =>
      typeof getThemeColor === "function"
        ? getThemeColor()
        : DEFAULT_THEME_COLOR,
    [getThemeColor]
  );

  useEffect(() => {
    const name =
      window.location.pathname === "/" ? "/register" : window.location.pathname;
    setPathName(name);
  }, []); // location変更時に再実行したい場合はpopstateイベントを利用

  return (
    <header>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ p: 0, backgroundColor: themeColor || DEFAULT_THEME_COLOR }}
      >
        <Container sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            color="white"
            sx={{ p: 1, height: "50px", boxSizing: "border-box" }}
            spacing={{ xs: 0, md: 2 }}
          >
            <Logo />
            <DesktopMenu pathName={pathName} />
            {!isCognitoUserRole(StaffRole.OPERATOR) && <ExternalLinks />}
            <MobileMenu pathName={pathName} />
            <SignInOutButton />
          </Stack>
        </Container>
      </Container>
    </header>
  );
}
