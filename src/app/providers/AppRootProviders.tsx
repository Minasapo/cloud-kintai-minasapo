import { store } from "@app/store";
import { Authenticator } from "@aws-amplify/ui-react";
import {
  collectExtensionProviders,
  extensionManifests,
} from "@extensions/index";
import { SplitViewProvider } from "@features/splitView/context/SplitViewProvider";
import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { AppConfigProvider } from "./app-config/AppConfigProvider";
import { AppRuntimeProvider } from "./AppRuntimeProvider";
import { SessionProvider } from "./session/SessionProvider";

const extensionProviders = collectExtensionProviders(extensionManifests);

function composeExtensionProviders(children: ReactNode): ReactNode {
  return extensionProviders.reduceRight<ReactNode>(
    (acc, ProviderComponent) => (
      <ProviderComponent>{acc}</ProviderComponent>
    ),
    children,
  );
}

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
              <SplitViewProvider>
                {composeExtensionProviders(children)}
              </SplitViewProvider>
            </AppRuntimeProvider>
          </AppConfigProvider>
        </SessionProvider>
      </Authenticator.Provider>
    </Provider>
  );
}
