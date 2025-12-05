import { Box, Button, Stack, styled } from "@mui/material";
import StaffIcon from "@shared/ui/icon/StaffIcon";

const SignOutButton = styled(Button)(({ theme }) => ({
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

const SignInButton = styled(Button)(({ theme }) => ({
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

export interface SignInOutButtonProps {
  isAuthenticated: boolean;
  isConfiguring?: boolean;
  staffName?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

const SignInOutButton = ({
  isAuthenticated,
  isConfiguring = false,
  staffName,
  onSignIn,
  onSignOut,
}: SignInOutButtonProps) => {
  if (isConfiguring) {
    return null;
  }

  return (
    <Box sx={{ display: RESPONSIVE_DISPLAY }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {isAuthenticated ? (
          <>
            <SignOutButton onClick={onSignOut}>ログアウト</SignOutButton>
            {staffName && <StaffIcon name={staffName} />}
          </>
        ) : (
          <SignInButton onClick={onSignIn}>ログイン</SignInButton>
        )}
      </Stack>
    </Box>
  );
};

export default SignInOutButton;
