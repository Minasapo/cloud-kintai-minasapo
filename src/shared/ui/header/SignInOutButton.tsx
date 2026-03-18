import StaffIcon from "@shared/ui/icon/StaffIcon";
import { CSSProperties } from "react";

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
const LOGIN_BUTTON_BG = designTokenVar("color.brand.primary.base", "#0FA85E");
const LOGIN_BUTTON_TEXT = designTokenVar(
  "color.brand.primary.contrastText",
  "#FFFFFF"
);
const LOGOUT_BUTTON_BG = designTokenVar("color.feedback.danger.base", "#D7443E");
const LOGOUT_BUTTON_TEXT = designTokenVar(
  "color.brand.primary.contrastText",
  "#FFFFFF"
);
const SIGN_BUTTON_TEXT = designTokenVar(
  "component.headerSignButton.textColor",
  "#1E2A25",
);

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
  const signButtonVars: CSSProperties & Record<`--${string}`, string> = {
    "--sign-button-gap": SIGN_BUTTON_GAP,
    "--sign-button-padding-x": SIGN_BUTTON_PADDING_X,
    "--sign-button-radius": SIGN_BUTTON_RADIUS,
    "--sign-button-font-weight": SIGN_BUTTON_FONT_WEIGHT,
    "--login-button-bg": LOGIN_BUTTON_BG,
    "--login-button-text": LOGIN_BUTTON_TEXT,
    "--logout-button-bg": LOGOUT_BUTTON_BG,
    "--logout-button-text": LOGOUT_BUTTON_TEXT,
    "--sign-button-text": SIGN_BUTTON_TEXT,
  };
  const buttonClassName =
    "whitespace-nowrap rounded-[var(--sign-button-radius)] border-[3px] px-[var(--sign-button-padding-x)] py-2 font-[var(--sign-button-font-weight)] text-[color:var(--sign-button-text)] transition-[color,background-color,border-color] duration-150 ease-in-out";

  if (isConfiguring) {
    return null;
  }

  return (
    <div className="block" style={signButtonVars}>
      <div className="flex items-center gap-[var(--sign-button-gap)]">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={onSignOut}
              className={`${buttonClassName} border-[var(--logout-button-bg)] bg-[var(--logout-button-bg)] text-[color:var(--logout-button-text)] hover:bg-transparent hover:text-[color:var(--logout-button-bg)]`}
            >
              ログアウト
            </button>
            {staffName && <StaffIcon name={staffName} />}
          </>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className={`${buttonClassName} border-[var(--login-button-bg)] bg-[var(--login-button-bg)] text-[color:var(--login-button-text)] hover:bg-transparent hover:text-[color:var(--login-button-bg)]`}
          >
            ログイン
          </button>
        )}
      </div>
    </div>
  );
};

export default SignInOutButton;
