import {
  createContext,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  useWorkflowListViewModel,
  type WorkflowListViewModel,
} from "@/features/workflow/list/useWorkflowListViewModel";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";

import type { WorkflowListFiltersHandle } from "../components/WorkflowListFilters";
import useCompactLayout from "../hooks/useCompactLayout";
import {
  buildStatusSummary,
  buildWorkflowDetailPath,
  resolveWorkflowKey,
  type WorkflowStatusSummary,
} from "../lib/workflowListUtils";

type WorkflowListPageData = Pick<
  WorkflowListViewModel,
  | "isAuthenticated"
  | "currentStaffId"
  | "loading"
  | "error"
  | "filteredItems"
  | "filters"
  | "anyFilterActive"
> & {
  statusSummary: WorkflowStatusSummary;
  isCompact: boolean;
};

type WorkflowListPageActions = Pick<
  WorkflowListViewModel,
  "setFilter" | "clearFilters"
> & {
  onClearFilters: () => void;
  onCreateClick: () => void;
  onCardClick: (row: WorkflowListItem) => void;
  resolveWorkflowKey: typeof resolveWorkflowKey;
};

type WorkflowListPageUi = {
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: Dispatch<SetStateAction<boolean>>;
  filterRowRef: RefObject<WorkflowListFiltersHandle | null>;
};

type WorkflowListPageContextValue = {
  data: WorkflowListPageData;
  actions: WorkflowListPageActions;
  ui: WorkflowListPageUi;
};

const WorkflowListPageContext =
  createContext<WorkflowListPageContextValue | null>(null);

export function WorkflowListPageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const isCompact = useCompactLayout();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterRowRef = useRef<WorkflowListFiltersHandle>(null);

  const viewModel: WorkflowListViewModel = useWorkflowListViewModel();
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
  } = viewModel;

  const onCardClick = useCallback(
    (row: WorkflowListItem) => {
      navigate(buildWorkflowDetailPath(row));
    },
    [navigate],
  );

  const onCreateClick = useCallback(() => {
    navigate("/workflow/new");
  }, [navigate]);

  const onClearFilters = useCallback(() => {
    clearFilters();
    filterRowRef.current?.closeAllPopovers();
    setMobileFiltersOpen(false);
  }, [clearFilters]);

  const statusSummary = useMemo(
    () => buildStatusSummary(filteredItems),
    [filteredItems],
  );

  const value = useMemo<WorkflowListPageContextValue>(
    () => ({
      data: {
        isAuthenticated,
        currentStaffId,
        loading,
        error,
        filteredItems,
        filters,
        anyFilterActive,
        statusSummary,
        isCompact,
      },
      actions: {
        setFilter,
        clearFilters,
        onClearFilters,
        onCreateClick,
        onCardClick,
        resolveWorkflowKey,
      },
      ui: {
        mobileFiltersOpen,
        setMobileFiltersOpen,
        filterRowRef,
      },
    }),
    [
      anyFilterActive,
      clearFilters,
      currentStaffId,
      error,
      filteredItems,
      filters,
      isAuthenticated,
      isCompact,
      loading,
      mobileFiltersOpen,
      onCardClick,
      onClearFilters,
      onCreateClick,
      setFilter,
      statusSummary,
    ],
  );

  return (
    <WorkflowListPageContext.Provider value={value}>
      {children}
    </WorkflowListPageContext.Provider>
  );
}

export function useWorkflowListPageContext() {
  const context = useContext(WorkflowListPageContext);

  if (!context) {
    throw new Error(
      "useWorkflowListPageContext must be used within WorkflowListPageProvider",
    );
  }

  return context;
}

export function useWorkflowListData() {
  return useWorkflowListPageContext().data;
}

export function useWorkflowListActions() {
  return useWorkflowListPageContext().actions;
}

export function useWorkflowListUi() {
  return useWorkflowListPageContext().ui;
}
