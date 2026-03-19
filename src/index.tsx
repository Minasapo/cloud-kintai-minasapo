import "./index.css";
import "./tailwind.css";
import "@/shared/lib/dayjs-locale";

import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { bootstrapDesignSystem } from "@/shared/designSystem";

import { store } from "./app/store";
import config from "./aws-exports";
import reportWebVitals from "./reportWebVitals";
import router from "./router";
import RouterFallback from "./shared/ui/feedback/RouterFallback";
import vocabularies from "./vocabularies";

Amplify.configure(config);

I18n.putVocabularies(vocabularies);
I18n.setLanguage("ja");

bootstrapDesignSystem();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Authenticator.Provider>
        <RouterProvider router={router} fallbackElement={<RouterFallback />} />
      </Authenticator.Provider>
    </Provider>
  </React.StrictMode>,
);

reportWebVitals();
