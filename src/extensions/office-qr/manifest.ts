import { createLazyRoute } from "@/router/lazyRoute";

import type { ExtensionManifest } from "../_types";

const OfficeHomeRoute = createLazyRoute(
  () => import("./pages/home/OfficeHomePage"),
);
const OfficeLayoutRoute = createLazyRoute(
  () => import("./pages/layout/OfficeLayoutPage"),
);
const OfficeQrRoute = createLazyRoute(() => import("./pages/qr/OfficeQrPage"));
const OfficeQrRegisterRoute = createLazyRoute(
  () => import("./pages/qr-register/OfficeQrRegisterPage"),
);
const NotFoundRoute = createLazyRoute(() => import("@/pages/NotFound"));

export const officeQrManifest: ExtensionManifest = {
  name: "office-qr",
  isEnabled: (derived) => !!derived?.officeMode,
  routes: [
    {
      path: "office",
      lazy: OfficeLayoutRoute,
      children: [
        {
          index: true,
          lazy: OfficeHomeRoute,
        },
        {
          path: "qr",
          lazy: OfficeQrRoute,
        },
        {
          path: "qr/register",
          lazy: OfficeQrRegisterRoute,
        },
        {
          path: "*",
          lazy: NotFoundRoute,
        },
      ],
    },
  ],
};
