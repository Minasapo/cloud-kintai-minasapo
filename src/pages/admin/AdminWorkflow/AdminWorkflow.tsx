import { AuthContext } from "@app/providers/auth/AuthContext";
import useAppConfig from "@entities/app-config/model/useAppConfig";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { useSplitView } from "@features/splitView";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import { useIsMobile } from "@shared/lib/hooks/useIsMobile";
import { AppButton } from "@shared/ui/button";
import { type ComponentType,useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import WorkflowDetailPanel from "./components/WorkflowDetailPanel";
import WorkflowDialogsSection from "./components/WorkflowDialogsSection";
import WorkflowFiltersBar from "./components/WorkflowFiltersBar";
import WorkflowListBody from "./components/WorkflowListBody";
import WorkflowPageHeader from "./components/WorkflowPageHeader";
import WorkflowPaginationBar from "./components/WorkflowPaginationBar";

const STATUS_EXCLUDED_FROM_DEFAULT: WorkflowStatus[] = [
  WorkflowStatus.CANCELLED,
  WorkflowStatus.APPROVED,
];

export default function AdminWorkflow() {
  const isMobile = useIsMobile();
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { workflows, loading, error } = useWorkflows({
    isAuthenticated,
  });
  const { config, getAbsentEnabled, getWorkflowCategoryOrder } = useAppConfig();
  const {
    staffs,
    loading: staffLoading,
    error: staffError,
  } = useStaffs({ isAuthenticated });
  const { enableSplitMode, setRightPanel } = useSplitView();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilterOverride, setStatusFilterOverride] = useState<
    WorkflowStatus[] | null
  >(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null,
  );

  const categories = useMemo(
    () =>
      getWorkflowCategoryOrder()
        .filter((item) => item.enabled)
        .filter(
          (item) =>
            item.category !== WorkflowCategory.ABSENCE || getAbsentEnabled(),
        ),
    [config, getAbsentEnabled, getWorkflowCategoryOrder],
  );

  const statuses = Array.from(
    new Set(
      (workflows || []).map((workflow) => workflow.status).filter(Boolean),
    ),
  ) as WorkflowStatus[];

  const defaultStatusFilter = useMemo(
    () =>
      statuses.filter(
        (status) => !STATUS_EXCLUDED_FROM_DEFAULT.includes(status),
      ),
    [statuses],
  );
  const statusFilter = statusFilterOverride ?? defaultStatusFilter;

  const filteredWorkflows = (workflows || []).filter((workflow) => {
    if (categoryFilter && workflow.category !== categoryFilter) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(workflow.status)) {
      return false;
    }
    return true;
  });

  const sortedWorkflows = filteredWorkflows.toSorted((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const workflowsById = new Map(
    sortedWorkflows.map((workflow) => [workflow.id, workflow]),
  );

  const staffNamesById = useMemo(
    () =>
      new Map(
        staffs.map((staff) => [
          staff.id,
          `${staff.familyName || ""}${staff.givenName || ""}` || "不明",
        ]),
      ),
    [staffs],
  );

  const filteredWorkflowIds = sortedWorkflows.map((workflow) => workflow.id);

  const rowsPerPageOptions = isMobile ? [10] : [10, 25, 50];
  const activeRowsPerPage = rowsPerPageOptions.includes(rowsPerPage)
    ? rowsPerPage
    : rowsPerPageOptions[0];
  const totalPages = Math.max(
    1,
    Math.ceil(sortedWorkflows.length / activeRowsPerPage),
  );
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedWorkflows = sortedWorkflows.slice(
    currentPage * activeRowsPerPage,
    currentPage * activeRowsPerPage + activeRowsPerPage,
  );

  const createWorkflowPanelComponent = useCallback(
    (workflowId: string): ComponentType<{ panelId: string }> => {
      const WorkflowPanel = () => (
        <WorkflowDetailPanel workflowId={workflowId} />
      );
      WorkflowPanel.displayName = `WorkflowPanel_${workflowId}`;
      return WorkflowPanel;
    },
    [],
  );

  const handleOpenInRightPanel = (workflowId: string) => {
    const workflow = workflowsById.get(workflowId);
    enableSplitMode();
    setRightPanel({
      id: `workflow-${workflowId}`,
      title: `申請内容 - ${workflow?.createdAt?.split("T")[0] ?? workflowId}`,
      component: createWorkflowPanelComponent(workflowId),
    });
  };

  const handleOpenCarousel = () => {
    if (filteredWorkflowIds.length === 0) return;
    setSelectedWorkflowId(filteredWorkflowIds[0]);
    setIsCarouselOpen(true);
  };

  const toggleStatusFilter = (status: WorkflowStatus) => {
    setStatusFilterOverride((current) => {
      const base = current ?? defaultStatusFilter;
      if (base.includes(status)) {
        return base.filter((item) => item !== status);
      }
      return [...base, status];
    });
    setPage(0);
  };

  if (loading || staffLoading) {
    return (
      <div className="w-full">
        <div className="h-1 w-full overflow-hidden bg-slate-200">
          <div className="h-full w-1/3 animate-pulse bg-emerald-600" />
        </div>
      </div>
    );
  }

  if (error || staffError) {
    return (
      <p className="px-4 py-6 text-sm text-rose-700">
        データ取得中に問題が発生しました。管理者に連絡してください。
      </p>
    );
  }

  return (
    <div className="h-full w-full px-3 pt-2 sm:px-4 lg:px-6">
      <div className="space-y-4">
        <WorkflowPageHeader
          onOpenSettings={() => setIsSettingsDialogOpen(true)}
        />

        <WorkflowFiltersBar
          categoryFilter={categoryFilter}
          onCategoryChange={(value) => {
            setCategoryFilter(value);
            setPage(0);
          }}
          categories={categories}
          statuses={statuses}
          statusFilter={statusFilter}
          onToggleStatus={toggleStatusFilter}
          onClearStatus={() => {
            setStatusFilterOverride([]);
            setPage(0);
          }}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {filteredWorkflows.length} 件の申請
            </p>
            <AppButton
              onClick={handleOpenCarousel}
              disabled={filteredWorkflowIds.length === 0}
              className="min-w-0"
            >
              まとめて確認
            </AppButton>
          </div>

          {paginatedWorkflows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              条件に一致する申請はありません。
            </p>
          ) : (
            <WorkflowListBody
              paginatedWorkflows={paginatedWorkflows}
              isMobile={isMobile}
              staffs={staffs}
              navigate={navigate}
              onOpenInRightPanel={handleOpenInRightPanel}
            />
          )}

          <WorkflowPaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            activeRowsPerPage={activeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
            onPrevPage={() => setPage(Math.max(0, currentPage - 1))}
            onNextPage={() =>
              setPage(Math.min(totalPages - 1, currentPage + 1))
            }
          />
        </section>

        <WorkflowDialogsSection
          isCarouselOpen={isCarouselOpen}
          selectedWorkflowId={selectedWorkflowId}
          onCloseCarousel={() => {
            setIsCarouselOpen(false);
            setSelectedWorkflowId(null);
          }}
          filteredWorkflowIds={filteredWorkflowIds}
          workflowsById={workflowsById}
          staffNamesById={staffNamesById}
          onOpenInRightPanel={handleOpenInRightPanel}
          isSettingsDialogOpen={isSettingsDialogOpen}
          onCloseSettings={() => setIsSettingsDialogOpen(false)}
        />
      </div>
    </div>
  );
}
