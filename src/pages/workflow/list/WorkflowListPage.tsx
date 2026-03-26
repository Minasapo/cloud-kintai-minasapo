import { WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import Page from "@shared/ui/page/Page";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { STATUS_LABELS } from "@/entities/workflow/lib/workflowLabels";
import {
  useWorkflowListViewModel,
  type WorkflowListViewModel,
} from "@/features/workflow/list/useWorkflowListViewModel";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";
import { designTokenVar } from "@/shared/designSystem";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

import WorkflowListFilters, {
  type WorkflowListFiltersHandle,
  WorkflowListFiltersPanel,
} from "./components/WorkflowListFilters";

const CANCELLED_LABEL = STATUS_LABELS[WorkflowStatus.CANCELLED];

const LOADING_SECTION_MIN_HEIGHT = `calc(${designTokenVar(
  "spacing.xxl",
  "32px"
)} * 7.5)`;
const MOBILE_CARD_GAP = designTokenVar("spacing.md", "12px");
const MOBILE_META_GAP = designTokenVar("spacing.xs", "4px");

const formatWorkflowDateValue = (value?: string) => value ?? "-";

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.6rem] border border-emerald-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(248,255,251,0.94)_100%)] p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)] sm:p-5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const className = size === "sm" ? "h-4 w-4 border-2" : "h-6 w-6 border-[3px]";
  return (
    <span
      className={`inline-block animate-spin rounded-full border-emerald-600 border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

function InfoCard({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: React.ReactNode;
}) {
  const className =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : "border-sky-200 bg-sky-50 text-sky-900";

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-sm leading-6 ${className}`}>
      {children}
    </div>
  );
}

function LoadingOrEmptyState({
  loading,
  loadingPaddingClassName,
  emptyPaddingClassName,
}: {
  loading: boolean;
  loadingPaddingClassName: string;
  emptyPaddingClassName?: string;
}) {
  if (loading) {
    return (
      <div className={`flex justify-center ${loadingPaddingClassName}`}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={emptyPaddingClassName}>
      <InfoCard>該当するワークフローがありません。</InfoCard>
    </div>
  );
}

function MobileMetaBlock({ label, value, alignEnd = false }: { label: string; value: string; alignEnd?: boolean }) {
  return (
    <div className={`flex flex-col ${alignEnd ? "sm:items-end" : ""}`.trim()} style={{ gap: MOBILE_META_GAP }}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}

function MobileWorkflowCard({
  item,
  onClick,
}: {
  item: WorkflowListItem;
  onClick: (item: WorkflowListItem) => void;
}) {
  return (
    <button type="button" onClick={() => onClick(item)} className="w-full rounded-[16px] text-left">
      <div className="flex flex-col gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.28)] transition hover:border-emerald-200 hover:bg-emerald-50/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 break-words text-base font-semibold text-slate-900">
            {item.category || "-"}
          </div>
          <div className="max-w-full self-start sm:self-center">
            <StatusChip status={item.rawStatus || item.status || ""} />
          </div>
        </div>

        <MobileMetaBlock
          label="申請日"
          value={formatWorkflowDateValue(item.applicationDate)}
        />

        <div className="flex flex-col justify-between gap-2 sm:flex-row">
          <MobileMetaBlock label="作成日" value={item.createdAt || "-"} />
          <MobileMetaBlock label="ステータス" value={item.status || "-"} alignEnd />
        </div>
      </div>
    </button>
  );
}

function DesktopWorkflowRow({
  item,
  onClick,
}: {
  item: WorkflowListItem;
  onClick: (item: WorkflowListItem) => void;
}) {
  const isCancelled =
    item.rawStatus === WorkflowStatus.CANCELLED || item.status === CANCELLED_LABEL;

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={[
        "grid w-full grid-cols-[minmax(180px,1fr)_minmax(160px,0.9fr)_minmax(180px,0.9fr)_minmax(160px,0.9fr)] items-center gap-4 border-b border-slate-200/80 px-5 py-4 text-left transition last:border-b-0 hover:bg-emerald-50/40",
        isCancelled ? "text-slate-400" : "text-slate-900",
      ].join(" ")}
    >
      <div className="font-medium">{item.category || "-"}</div>
      <div>{formatWorkflowDateValue(item.applicationDate)}</div>
      <div>
        <StatusChip status={item.rawStatus || item.status || ""} />
      </div>
      <div>{item.createdAt || "-"}</div>
    </button>
  );
}

export default function WorkflowListPage() {
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const sync = (event?: MediaQueryListEvent) => {
      setIsCompact(event ? event.matches : mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const {
    isAuthenticated,
    currentStaffId,
    loading,
    error,
    filteredItems,
    filters,
    anyFilterActive,
    setFilter,
    clearFilters,
  }: WorkflowListViewModel = useWorkflowListViewModel();
  const filterRowRef = useRef<WorkflowListFiltersHandle>(null);

  const resolveWorkflowKey = useCallback((row: WorkflowListItem) => {
    return row.rawId ? row.rawId : `${row.name}-${row.createdAt}`;
  }, []);

  const handleCardClick = useCallback(
    (row: WorkflowListItem) => {
      navigate(`/workflow/${encodeURIComponent(resolveWorkflowKey(row))}`);
    },
    [navigate, resolveWorkflowKey]
  );

  const statusSummary = useMemo(() => {
    const counts = new Map<string, number>();
    filteredItems.forEach((item) => {
      const key = item.rawStatus || item.status || "UNKNOWN";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return {
      total: filteredItems.length,
      pending:
        counts.get(WorkflowStatus.SUBMITTED) ??
        counts.get(STATUS_LABELS[WorkflowStatus.SUBMITTED]) ??
        0,
      approved:
        counts.get(WorkflowStatus.APPROVED) ??
        counts.get(STATUS_LABELS[WorkflowStatus.APPROVED]) ??
        0,
    };
  }, [filteredItems]);

  if (!isAuthenticated) {
    return (
      <Page title="ワークフロー" maxWidth="lg" showDefaultHeader={false}>
        <PageSection layoutVariant="dashboard">
          <DashboardInnerSurface
            className="flex items-center justify-center"
            style={{ minHeight: LOADING_SECTION_MIN_HEIGHT }}
          >
            <Spinner />
          </DashboardInnerSurface>
        </PageSection>
      </Page>
    );
  }

  return (
    <Page title="ワークフロー" maxWidth="lg" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard" variant="plain" className="px-0 py-0 md:px-0">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <section className="rounded-[1.8rem] border border-emerald-100/80 bg-[linear-gradient(135deg,#f7fcf8_0%,#ecfdf5_58%,#ffffff_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 sm:text-[2.2rem]">
                  ワークフロー
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-[0.95rem]">
                  申請の一覧、状態確認、新規作成をひとつの画面で進められます。現在の申請状況を見ながら、必要な絞り込みや作成にすぐ移れます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/workflow/new")}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700/55 bg-[#19b985] px-7 py-3 text-base font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(5,150,105,0.55)] transition hover:bg-[#17ab7b]",
                  isCompact ? "w-full" : "w-auto whitespace-nowrap",
                ].join(" ")}
              >
                <span className="text-lg leading-none">+</span>
                {isCompact ? "新規" : "新規作成"}
              </button>
            </div>
          </section>

          {currentStaffId ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">全件数</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{statusSummary.total}</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">承認待ち</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-700">{statusSummary.pending}</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">承認済み</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">{statusSummary.approved}</p>
                </Surface>
              </div>

              {error && <InfoCard tone="error">{error}</InfoCard>}

              <Surface>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">申請一覧</p>
                      <p className="text-sm leading-6 text-slate-500">
                        種別、申請日、ステータス、作成日で確認できます。
                      </p>
                    </div>
                    {anyFilterActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          clearFilters();
                          filterRowRef.current?.closeAllPopovers();
                          setMobileFiltersOpen(false);
                        }}
                        className="inline-flex items-center gap-2 self-start rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <span className="text-base leading-none">×</span>
                        フィルターをクリア
                      </button>
                    ) : null}
                  </div>

                  {isCompact ? (
                    <div className="rounded-[1.4rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(252,255,253,0.98)_0%,rgba(244,252,247,0.94)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">フィルター</span>
                          {anyFilterActive && (
                            <span className="rounded-full bg-emerald-100 px-2 py-[2px] text-[12px] font-bold leading-5 text-emerald-700">
                              適用中
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">
                          {mobileFiltersOpen ? "▲" : "▼"}
                        </span>
                      </button>
                      {mobileFiltersOpen ? (
                        <div className="px-3 pb-3">
                          <WorkflowListFiltersPanel
                            ref={filterRowRef}
                            filters={filters}
                            setFilter={setFilter}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(252,255,253,0.98)_0%,rgba(244,252,247,0.94)_100%)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <table className="w-full table-fixed border-separate border-spacing-y-2" aria-hidden>
                        <thead>
                          <tr>
                            <th className="px-1 pb-0.5 text-left text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">種別</th>
                            <th className="px-1 pb-0.5 text-left text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">申請日</th>
                            <th className="px-1 pb-0.5 text-left text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">ステータス</th>
                            <th className="px-1 pb-0.5 text-left text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">作成日</th>
                            <th className="w-14" />
                          </tr>
                          <WorkflowListFilters
                            ref={filterRowRef}
                            filters={filters}
                            setFilter={setFilter}
                          />
                        </thead>
                      </table>
                    </div>
                  )}

                  {isCompact ? (
                    <div>
                      {loading || filteredItems.length === 0 ? (
                        <LoadingOrEmptyState loading={loading} loadingPaddingClassName="py-6" />
                      ) : (
                        <div className="flex flex-col" style={{ gap: MOBILE_CARD_GAP }}>
                          {filteredItems.map((item) => (
                            <MobileWorkflowCard
                              key={resolveWorkflowKey(item)}
                              item={item}
                              onClick={handleCardClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 overflow-hidden rounded-[24px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,253,249,0.94)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                      <div className="grid grid-cols-[minmax(180px,1fr)_minmax(160px,0.9fr)_minmax(180px,0.9fr)_minmax(160px,0.9fr)] border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(240,253,244,0.72)_0%,rgba(248,250,252,0.58)_100%)] px-5 py-3 text-[0.74rem] font-semibold tracking-[0.04em] text-slate-500">
                        <div>種別</div>
                        <div>申請日</div>
                        <div>ステータス</div>
                        <div>作成日</div>
                      </div>
                      {loading || filteredItems.length === 0 ? (
                        <LoadingOrEmptyState
                          loading={loading}
                          loadingPaddingClassName="py-10"
                          emptyPaddingClassName="px-5 py-8"
                        />
                      ) : (
                        <div>
                          {filteredItems.map((item) => (
                            <DesktopWorkflowRow
                              key={resolveWorkflowKey(item)}
                              item={item}
                              onClick={handleCardClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Surface>
            </>
          ) : (
            <Surface>
              <div className="flex justify-center py-4">
                {loading ? (
                  <Spinner />
                ) : (
                  <InfoCard>
                    ログイン中のアカウントに紐づくスタッフ情報が見つからないため、一覧を表示できません。
                    <br />
                    スタッフアカウントが未登録の場合は管理者にお問い合わせください。
                  </InfoCard>
                )}
              </div>
            </Surface>
          )}
        </div>
      </PageSection>
    </Page>
  );
}
