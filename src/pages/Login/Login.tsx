import "@aws-amplify/ui-react/styles.css";
import "./styles.scss";

import { Authenticator } from "@aws-amplify/ui-react";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import logo from "./logo_large.png";

export default function Login() {
  const { authStatus, cognitoUser } = useContext(AuthContext);
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

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-0 sm:pt-10">
      <div className="hidden sm:block">
        <img src={logo} height={200} alt="GARAKU" />
      </div>
      <Authenticator hideSignUp>
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
                  className="inline-flex w-fit items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
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
