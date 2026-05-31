import type { ExtensionManifest } from "./_types";

/**
 * Central registry of installed extensions. Add an extension by importing its
 * manifest below and pushing it into the array. See
 * `docs/EXTENSION_ARCHITECTURE.md` for the contract a manifest must satisfy.
 *
 * Phase 1: the registry is intentionally empty. Phase 2+ migrations append
 * manifests here while removing the corresponding hard-coded core registrations
 * (routes, menu items, RTK Query slices, providers).
 */
export const extensionManifests: ReadonlyArray<ExtensionManifest> = [];

export type { ExtensionManifest } from "./_types";
export {
  collectExtensionAdminRoutes,
  collectExtensionMenuItems,
  collectExtensionProviders,
  collectExtensionRoutes,
  collectExtensionRtkApis,
  getActiveExtensions,
} from "./registry";
