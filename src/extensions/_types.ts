import type { RegisteredRtkApi } from "@app/apis";
import type { AppConfigDerived } from "@entities/app-config/model/AppConfigContext";
import type { ComponentType, ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

/**
 * Predicate that decides whether an extension is active for the current
 * runtime. Receives the resolved AppConfig derived state (may be undefined
 * before the config is loaded). When omitted, the extension is always active.
 */
export type ExtensionEnabledPredicate = (
  derived: AppConfigDerived | undefined,
) => boolean;

/**
 * A route contributed by an extension. Uses the standard react-router
 * `RouteObject` shape so manifests can directly leverage `createLazyRoute`.
 */
export type ExtensionRouteDescriptor = RouteObject;

/**
 * A navigation menu item contributed by an extension. The visibility filter is
 * evaluated alongside the user's role / config flags by `NavigationMenu`.
 */
export type ExtensionMenuItemDescriptor = {
  label: string;
  href: string;
  icon?: ReactNode;
  /**
   * Roles allowed to see this menu item. When omitted defaults to all
   * authenticated staff roles (ADMIN, STAFF_ADMIN, STAFF).
   */
  roles?: ReadonlyArray<"ADMIN" | "STAFF_ADMIN" | "STAFF" | "OPERATOR">;
  /**
   * Optional additional predicate. Receives the same derived config the
   * extension's `isEnabled` saw plus the current role context.
   */
  isVisible?: (ctx: {
    derived: AppConfigDerived | undefined;
    isAdmin: boolean;
  }) => boolean;
};

export type ExtensionProvider = ComponentType<{ children: ReactNode }>;

/**
 * Static manifest describing what an extension contributes to the core shell.
 * Extensions live under `src/extensions/<name>/` and register themselves by
 * being added to `src/extensions/index.ts`.
 */
export type ExtensionManifest = {
  /** Unique extension identifier (kebab-case). */
  name: string;
  /** Optional gating predicate. When falsy the extension contributes nothing. */
  isEnabled?: ExtensionEnabledPredicate;
  /** Top-level routes mounted under `Layout` (parent `/`). */
  routes?: ExtensionRouteDescriptor[];
  /** Routes mounted under the admin layout (parent `/admin`). */
  adminRoutes?: ExtensionRouteDescriptor[];
  /** Navigation menu contributions (desktop / mobile menu). */
  menuItems?: ExtensionMenuItemDescriptor[];
  /**
   * React Providers wrapped around the application tree. Composed in the
   * order they appear, innermost last.
   */
  providers?: ExtensionProvider[];
  /** RTK Query slices to register with the root store. */
  rtkApis?: RegisteredRtkApi[];
};
