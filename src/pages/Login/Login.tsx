import "@aws-amplify/ui-react/styles.css";
import "./styles.scss";

import { Authenticator } from "@aws-amplify/ui-react";
import { signIn } from "aws-amplify/auth";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useSession } from "@/app/providers/session/useSession";

import logo from "./logo_large.png";

const readSignInCredentials = (input: unknown) => {
  if (!input || typeof input !== "object") {
    return null;
  }

  const values = input as { username?: unknown; password?: unknown };
  if (
    typeof values.username !== "string" ||
    typeof values.password !== "string"
  ) {
    return null;
  }

  return {
    username: values.username,
    password: values.password,
  };
};

const parseAuthError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return {
      name: "UnknownError",
      message: "Unknown authentication error",
      details: undefined,
    };
  }

  const authError = error as {
    name?: unknown;
    message?: unknown;
    cause?: unknown;
  };

  return {
    name:
      typeof authError.name === "string" ? authError.name : "UnknownAuthError",
    message:
      typeof authError.message === "string"
        ? authError.message
        : "Authentication failed",
    details: authError.cause,
  };
};

export default function Login() {
  const { authStatus, cognitoUser } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const from = (location.state?.from as string) || "/";

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!cognitoUser?.id) return;

    if (!cognitoUser.emailVerified) return;

    navigate(from, { replace: true });
  }, [authStatus, navigate, from, cognitoUser]);

  const services = useMemo(
    () => ({
      async handleSignIn(input: unknown) {
        const credentials = readSignInCredentials(input);

        if (!credentials) {
          throw new Error("Sign in credentials are invalid");
        }

        try {
          return await signIn(credentials);
        } catch (error) {
          if (import.meta.env.DEV) {
            const parsedError = parseAuthError(error);
            console.error("[Auth] Sign in failed", {
              ...parsedError,
              username: credentials.username,
            });
          }
          throw error;
        }
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-0 sm:pt-10">
      <div className="hidden sm:block">
        <img src={logo} height={200} alt="GARAKU" />
      </div>
      <Authenticator hideSignUp services={services}>
        {({ signOut }) => {
          if (signOut) {
            return (
              <div className="flex flex-col gap-4">
                <p className="m-0 text-base leading-7 text-slate-900">
                  画面が切り替わらない場合は、再度、ログインしてください。
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex w-fit appearance-none items-center justify-center rounded-md border-0 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                >
                  ログアウト
                </button>
              </div>
            );
          }

          return (
            <p className="m-0 text-base leading-7 text-slate-900">
              画面が切り替わらない場合は、ブラウザを再読み込みしてください。
            </p>
          );
        }}
      </Authenticator>
    </div>
  );
}
