import { Authenticator } from "@aws-amplify/ui-react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { store } from "@/app/store";
import { SplitViewProvider } from "@/features/splitView/context/SplitViewProvider";

import { AppConfigProvider } from "./app-config/AppConfigProvider";
import { AppRuntimeProvider } from "./AppRuntimeProvider";
import { SessionProvider } from "./session/SessionProvider";

type AppRootProvidersProps = {
  children: ReactNode;
};

export default function AppRootProviders({ children }: AppRootProvidersProps) {
  return (
    <Provider store={store}>
      <Authenticator.Provider>
        <SessionProvider>
          <AppConfigProvider>
            <AppRuntimeProvider>
              <SplitViewProvider>{children}</SplitViewProvider>
            </AppRuntimeProvider>
          </AppConfigProvider>
        </SessionProvider>
      </Authenticator.Provider>
    </Provider>
  );
}
