import { Container, Stack } from "@mui/material";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

import DesktopMenu from "./DesktopMenu";
import { ExternalLinks } from "./ExternalLinks/ExternalLinks";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { SignInOutButton } from "./SignInOutButton";

// styled-componentsはSignInOutButton.tsxで管理

export default function Header() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const [pathName, setPathName] = useState("/register");

  useEffect(() => {
    const name =
      window.location.pathname === "/" ? "/register" : window.location.pathname;
    setPathName(name);
  }, []); // location変更時に再実行したい場合はpopstateイベントを利用

  return (
    <header>
      <Container maxWidth="xl" sx={{ p: 0, backgroundColor: "#0FA85E" }}>
        <Stack
          direction="row"
          alignItems="center"
          color="white"
          sx={{ p: 1, height: "50px", boxSizing: "border-box" }}
          spacing={{ xs: 0, md: 2 }}
        >
          <Logo />
          <DesktopMenu pathName={pathName} />
          {!isCognitoUserRole(StaffRole.OPERATOR) && (
            <ExternalLinks pathName={pathName} />
          )}
          <MobileMenu pathName={pathName} />
          <SignInOutButton pathName={pathName} />
        </Stack>
      </Container>
    </header>
  );
}
