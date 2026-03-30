import "./AdminMasterLayout.scss";

import React, { memo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  findAdminSettingsItemByPath,
  getAdminSettingsNavigationGroups,
  resolveAdminSettingsCategory,
} from "@/features/admin/layout/model/adminSettingsNavigation";
import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";

const MASTER_MENU_GROUPS = getAdminSettingsNavigationGroups();

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
    <div className="w-full max-w-[960px] pr-4 sm:pr-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-6 md:py-6">
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
  const activePath = location.pathname;

  return (
    <nav
      className="flex w-[220px] flex-col rounded-lg border border-slate-100 bg-white py-2"
      aria-label="設定ナビゲーション"
    >
      <div className="px-3 pb-2 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-400">
        設定
      </div>
      {MASTER_MENU_GROUPS.map((group) => (
        <div key={group.key}>
          <div className="px-3 pb-1 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {group.title}
          </div>
          {group.items.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={[
                  "flex w-full items-center border-l-2 bg-transparent px-3 py-1.5 text-left text-[0.875rem] transition-colors focus:outline-none",
                  isActive
                    ? "border-emerald-500 font-medium text-emerald-700"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-900",
                ].join(" ")}
                onClick={() => {
                  navigate(item.path);
                  if (!isDesktop) {
                    onNavigateComplete();
                  }
                }}
              >
                {item.title}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
});

export default function AdminMasterLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isDesktop = useIsDesktopNavigation();

  return (
    <div className="admin-master-layout relative w-full pb-4 pt-2">
      {!isDesktop ? (
        <>
          <button
            type="button"
            aria-label="menu"
            onClick={() => setMobileOpen(true)}
            className="absolute left-0 top-3 z-30 inline-flex rounded-full border border-slate-300 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
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
        <div className={isDesktop ? "flex-1 min-w-0" : "flex-1 min-w-0 pt-6"}>
          <MasterLayoutContent />
        </div>
      </div>
    </div>
  );
}
