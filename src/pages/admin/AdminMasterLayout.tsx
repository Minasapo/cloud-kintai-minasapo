import "./AdminMasterLayout.scss";

import React, { memo, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import type { AdminSettingsCategoryKey } from "@/features/admin/layout/model/adminSettingsNavigation";
import {
  findAdminSettingsItemByPath,
  getAdminSettingsNavigationGroups,
  resolveAdminSettingsCategory,
} from "@/features/admin/layout/model/adminSettingsNavigation";
import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";

const MASTER_MENU_GROUPS = getAdminSettingsNavigationGroups();

const createCategoryOpenState = (activeCategoryKey: AdminSettingsCategoryKey | null) =>
  Object.fromEntries(
    MASTER_MENU_GROUPS.map((group) => [group.key, group.key === activeCategoryKey]),
  ) as Record<AdminSettingsCategoryKey, boolean>;

const useIsDesktopNavigation = () => {
  const getMatch = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(min-width: 768px)").matches;

  const [isDesktop, setIsDesktop] = React.useState(getMatch);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isDesktop;
};

const SettingsContextHeader = memo(function SettingsContextHeader() {
  const location = useLocation();
  const currentItem = findAdminSettingsItemByPath(location.pathname);
  const currentCategory = resolveAdminSettingsCategory(location.pathname);

  if (!currentItem || !currentCategory) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.15rem]">
          設定
        </h1>
        <p className="m-0 max-w-[72ch] text-slate-500">
          業務ごとに設定を整理しています。カテゴリから必要な項目を選んで詳細を確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
        {currentCategory.title}
      </span>
      <h1 className="m-0 text-[1.8rem] font-bold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-[2.1rem]">
        {currentItem.title}
      </h1>
      <p className="m-0 max-w-[72ch] text-slate-500">{currentItem.description}</p>
    </div>
  );
});

const MasterLayoutContent = memo(function MasterLayoutContent() {
  return (
    <div className="min-w-0 flex-1">
      <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:px-6 md:py-6">
        <SettingsContextHeader />
        <div>
          <Outlet />
        </div>
      </section>
    </div>
  );
});

type MasterLayoutNavigationProps = {
  isDesktop?: boolean;
  onNavigateComplete: () => void;
};

const MasterLayoutNavigation = memo(function MasterLayoutNavigation({
  isDesktop = false,
  onNavigateComplete,
}: MasterLayoutNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeCategoryKey = resolveAdminSettingsCategory(location.pathname)?.key ?? null;
  const [openGroups, setOpenGroups] = React.useState<Record<AdminSettingsCategoryKey, boolean>>(
    () => createCategoryOpenState(activeCategoryKey),
  );

  const menuBoxList = useMemo(
    () =>
      MASTER_MENU_GROUPS.map((group) => {
        const isOpen = openGroups[group.key] || activeCategoryKey === group.key;
        const isActiveGroup = activeCategoryKey === group.key;

        return (
          <div key={group.key} className="border-b border-slate-100 last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              className={[
                "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors",
                isActiveGroup ? "bg-emerald-50/60" : "hover:bg-slate-50",
              ].join(" ")}
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.key]: !current[group.key],
                }))
              }
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{group.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-500">{group.description}</div>
              </div>
              <SettingsIcon
                name={isOpen ? "chevron-up" : "chevron-down"}
                className="mt-1 text-slate-500"
              />
            </button>
            <div
              className={[
                "admin-master-layout__group-content",
                isOpen ? "admin-master-layout__group-content--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="admin-master-layout__group-content-inner">
                <div className="flex flex-col gap-1 px-2 py-2">
                  {isOpen
                    ? group.items.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          className={[
                            "mx-1 flex flex-col rounded-2xl px-4 py-3 text-left transition-colors",
                            location.pathname === item.path
                              ? "bg-emerald-100/70 text-slate-950"
                              : "text-slate-700 hover:bg-slate-50",
                          ].join(" ")}
                          onClick={() => {
                            navigate(item.path);
                            if (!isDesktop) {
                              onNavigateComplete();
                            }
                          }}
                        >
                          <span className="font-medium">{item.title}</span>
                          <span className="mt-1 text-sm leading-6 text-slate-500">
                            {item.description}
                          </span>
                        </button>
                      ))
                    : null}
                </div>
              </div>
            </div>
          </div>
        );
      }),
    [activeCategoryKey, isDesktop, location.pathname, navigate, onNavigateComplete, openGroups],
  );

  return (
    <nav
      className="flex h-full w-[260px] flex-col rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.35)]"
      aria-label="設定ナビゲーション"
    >
      <div className="px-4 pb-2 pt-3 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-slate-500">
        設定
      </div>
      <div>{menuBoxList}</div>
    </nav>
  );
});

export default function AdminMasterLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isDesktop = useIsDesktopNavigation();

  return (
    <div className="admin-master-layout relative mx-auto max-w-[1360px] px-4 pb-4 pt-2 sm:px-6">
      {!isDesktop ? (
        <>
          <button
            type="button"
            aria-label="menu"
            onClick={() => setMobileOpen(true)}
            className="absolute left-4 top-3 z-30 inline-flex rounded-full border border-slate-300 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <SettingsIcon name="menu" />
          </button>

          {mobileOpen ? (
            <>
              <div
                className="admin-master-layout__mobile-backdrop admin-master-layout__mobile-backdrop--open"
                onClick={() => setMobileOpen(false)}
              />

              <div className="admin-master-layout__mobile-nav admin-master-layout__mobile-nav--open">
                <div className="h-full bg-transparent p-3">
                  <MasterLayoutNavigation onNavigateComplete={() => setMobileOpen(false)} />
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      <div className="flex h-full flex-row gap-4 pt-4">
        {isDesktop ? (
          <div>
            <MasterLayoutNavigation
              isDesktop
              onNavigateComplete={() => setMobileOpen(false)}
            />
          </div>
        ) : null}
        <div className={isDesktop ? "" : "pt-6"}>
          <MasterLayoutContent />
        </div>
      </div>
    </div>
  );
}
