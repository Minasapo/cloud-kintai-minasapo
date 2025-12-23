import { Box, Button, Stack, styled } from "@mui/material";
import StaffIcon from "@shared/ui/icon/StaffIcon";

import { designTokenVar } from "@/shared/designSystem";

const SIGN_BUTTON_GAP = designTokenVar("component.headerSignButton.gap", "8px");
const SIGN_BUTTON_PADDING_X = designTokenVar(
  "component.headerSignButton.paddingX",
  "20px"
);
const SIGN_BUTTON_RADIUS = designTokenVar(
  "component.headerSignButton.borderRadius",
  "8px"
);
const SIGN_BUTTON_FONT_WEIGHT = designTokenVar(
  "component.headerSignButton.fontWeight",
  "500"
);

const baseButtonStyles = {
  whiteSpace: "nowrap",
  paddingInline: SIGN_BUTTON_PADDING_X,
  paddingLeft: SIGN_BUTTON_PADDING_X,
  paddingRight: SIGN_BUTTON_PADDING_X,
  borderRadius: SIGN_BUTTON_RADIUS,
  fontWeight: SIGN_BUTTON_FONT_WEIGHT,
};

const SignOutButton = styled(Button)(({ theme }) => ({
  ...baseButtonStyles,
  color: theme.palette.logout.contrastText,
  backgroundColor: theme.palette.logout.main,
  border: `3px solid ${theme.palette.logout.main}`,
  "&:hover": {
    color: theme.palette.logout.main,
    backgroundColor: theme.palette.logout.contrastText,
  },
}));

const SignInButton = styled(Button)(({ theme }) => ({
  ...baseButtonStyles,
  color: theme.palette.login.contrastText,
  backgroundColor: theme.palette.login.main,
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
      <Stack
        direction="row"
        alignItems="center"
        sx={{ columnGap: SIGN_BUTTON_GAP, rowGap: SIGN_BUTTON_GAP }}
      >
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
