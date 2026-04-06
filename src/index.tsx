import "./index.css";
import "./tailwind.css";
import "@/shared/lib/dayjs-locale";

import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import AppRootProviders from "@/app/providers/AppRootProviders";
import { bootstrapDesignSystem } from "@/shared/designSystem";

import config from "./aws-exports";
import reportWebVitals from "./reportWebVitals";
import router from "./router";
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
    <AppRootProviders>
      <RouterProvider router={router} />
    </AppRootProviders>
  </React.StrictMode>,
);

reportWebVitals();
