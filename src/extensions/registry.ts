import type { RegisteredRtkApi } from "@app/apis";
import type { AppConfigDerived } from "@entities/app-config/model/AppConfigContext";

import type {
  ExtensionManifest,
  ExtensionMenuItemDescriptor,
  ExtensionProvider,
  ExtensionRouteDescriptor,
} from "./_types";

/**
 * Returns the subset of manifests whose `isEnabled` predicate is satisfied by
 * the supplied derived AppConfig. Manifests without an `isEnabled` predicate
 * are always returned.
 *
 * Note: this is intentionally pure and synchronous so it can be invoked from
 * router/store bootstrap code as well as from React render paths.
 */
export function getActiveExtensions(
  manifests: ReadonlyArray<ExtensionManifest>,
  derived: AppConfigDerived | undefined,
): ExtensionManifest[] {
  return manifests.filter((manifest) => {
    if (!manifest.isEnabled) return true;
    try {
      return Boolean(manifest.isEnabled(derived));
    } catch {
      return false;
    }
  });
}

/** Aggregate the `routes` contributions across every manifest. */
export function collectExtensionRoutes(
  manifests: ReadonlyArray<ExtensionManifest>,
): ExtensionRouteDescriptor[] {
  return manifests.flatMap((m) => m.routes ?? []);
}

/** Aggregate the `adminRoutes` contributions across every manifest. */
export function collectExtensionAdminRoutes(
  manifests: ReadonlyArray<ExtensionManifest>,
): ExtensionRouteDescriptor[] {
  return manifests.flatMap((m) => m.adminRoutes ?? []);
}

/** Aggregate the `rtkApis` contributions across every manifest. */
export function collectExtensionRtkApis(
  manifests: ReadonlyArray<ExtensionManifest>,
): RegisteredRtkApi[] {
  return manifests.flatMap((m) => m.rtkApis ?? []);
}

/** Aggregate the `providers` contributions across every manifest. */
export function collectExtensionProviders(
  manifests: ReadonlyArray<ExtensionManifest>,
): ExtensionProvider[] {
  return manifests.flatMap((m) => m.providers ?? []);
}

/** Aggregate the `menuItems` contributions across every manifest. */
export function collectExtensionMenuItems(
  manifests: ReadonlyArray<ExtensionManifest>,
): ExtensionMenuItemDescriptor[] {
  return manifests.flatMap((m) => m.menuItems ?? []);
}
