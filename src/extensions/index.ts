import type { ExtensionManifest } from "./_types";
import { attendanceStatisticsManifest } from "./attendance-statistics/manifest";
import { workflowNotificationManifest } from "./workflow-notification/manifest";

/**
 * Central registry of installed extensions. Add an extension by importing its
 * manifest below and pushing it into the array. See
 * `docs/EXTENSION_ARCHITECTURE.md` for the contract a manifest must satisfy.
 */
export const extensionManifests: ReadonlyArray<ExtensionManifest> = [
  attendanceStatisticsManifest,
  workflowNotificationManifest,
];

export type { ExtensionManifest } from "./_types";
export {
  collectExtensionAdminRoutes,
  collectExtensionMenuItems,
  collectExtensionProviders,
  collectExtensionRoutes,
  collectExtensionRtkApis,
  getActiveExtensions,
} from "./registry";
