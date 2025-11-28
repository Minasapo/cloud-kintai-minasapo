import { Box, Button, Stack, styled } from "@mui/material";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

import StaffIcon from "./StaffIcon";

export const SignOutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.logout.contrastText,
  backgroundColor: theme.palette.logout.main,
  border: `3px solid ${theme.palette.logout.main}`,
  whiteSpace: "nowrap",
  paddingLeft: "1rem",
  paddingRight: "1rem",
  "&:hover": {
    color: theme.palette.logout.main,
    backgroundColor: theme.palette.logout.contrastText,
  },
}));

export const SignInButton = styled(Button)(({ theme }) => ({
  color: theme.palette.login.contrastText,
  backgroundColor: theme.palette.login.main,
  whiteSpace: "nowrap",
  paddingLeft: "1rem",
  paddingRight: "1rem",
  "&:hover": {
    color: theme.palette.login.main,
    backgroundColor: theme.palette.login.contrastText,
  },
}));

const RESPONSIVE_DISPLAY = {
  xs: "none",
  md: "block",
} as const;

export function SignInOutButton() {
  const { signOut, signIn, cognitoUser, authStatus } = useContext(AuthContext);

  const isAuthenticated = authStatus === "authenticated";

  if (authStatus === "configuring") {
    return null;
  }

  return (
    <Box sx={{ display: RESPONSIVE_DISPLAY }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {isAuthenticated ? (
          <>
            <SignOutButton onClick={signOut}>ログアウト</SignOutButton>
            {cognitoUser && <StaffIcon name={cognitoUser.familyName} />}
          </>
        ) : (
          <SignInButton onClick={signIn}>ログイン</SignInButton>
        )}
      </Stack>
    </Box>
  );
}
