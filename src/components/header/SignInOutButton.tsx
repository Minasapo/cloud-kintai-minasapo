import { Box, Button, Stack, styled } from "@mui/material";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

import StaffIcon from "./StaffIcon";

// Styled Components
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

interface SignInOutButtonProps {
  pathName: string;
}

// 定数の定義
const RESPONSIVE_DISPLAY = {
  xs: "none",
  md: "block",
} as const;

const LOGIN_PAGE_PATH = "/login" as const;

/**
 * ログイン・ログアウトボタンコンポーネント
 * ログイン状態に応じて適切なボタンを表示し、スタッフアイコンも表示する
 */
export function SignInOutButton({ pathName }: SignInOutButtonProps) {
  const { signOut, signIn, cognitoUser } = useContext(AuthContext);

  // ログインページでは表示しない
  if (pathName === LOGIN_PAGE_PATH) return null;

  const isAuthenticated = Boolean(cognitoUser?.id);

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    signIn();
  };

  return (
    <Box sx={{ display: RESPONSIVE_DISPLAY }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {isAuthenticated ? (
          <SignOutButton onClick={handleSignOut}>ログアウト</SignOutButton>
        ) : (
          <SignInButton onClick={handleSignIn}>ログイン</SignInButton>
        )}

        {cognitoUser && <StaffIcon name={cognitoUser.familyName} />}
      </Stack>
    </Box>
  );
}
