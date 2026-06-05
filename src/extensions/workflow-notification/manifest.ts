import { createLazyRoute } from "@/router/lazyRoute";

import type { ExtensionManifest } from "../_types";

const WorkflowNotificationsRoute = createLazyRoute(
  () => import("./pages/WorkflowNotificationsPage"),
);

export const workflowNotificationManifest: ExtensionManifest = {
  name: "workflow-notification",
  isEnabled: (derived) => !!derived?.workflowNotificationEnabled,
  routes: [
    {
      path: "notifications",
      lazy: WorkflowNotificationsRoute,
    },
  ],
};
