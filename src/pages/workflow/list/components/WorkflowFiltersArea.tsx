import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { AppButton, AppIconButton } from "@shared/ui/button";
import { SectionTitle } from "@shared/ui/typography";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  useWorkflowListActions,
  useWorkflowListData,
  useWorkflowListUi,
} from "../context/WorkflowListPageContext";
import WorkflowClearFiltersAction from "./WorkflowClearFiltersAction";
import WorkflowListFiltersPanel from "./WorkflowListFiltersPanel";

export default function WorkflowFiltersArea() {
  const { anyFilterActive, filters } = useWorkflowListData();
  const { onClearFilters, setFilter } = useWorkflowListActions();
  const { filterRowRef } = useWorkflowListUi();
  const [dialogOpen, setDialogOpen] = useState(false);
  const titleId = useId();
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const dialogPanelRef = useRef<HTMLDivElement | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.category) {
      count += 1;
    }

    if (filters.applicationFrom || filters.applicationTo) {
      count += 1;
    }

    if (filters.status && filters.status.length > 0) {
      count += 1;
    }

    if (filters.createdFrom || filters.createdTo) {
      count += 1;
    }

    return count;
  }, [filters]);

  const closeDialog = () => {
    filterRowRef.current?.closeAllPopovers();
    setDialogOpen(false);
  };

  const focusFirstElementInDialog = () => {
    const panel = dialogPanelRef.current;
    if (!panel) {
      return;
    }

    const focusableElements = panel.querySelectorAll<HTMLElement>(
      [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    );

    focusableElements[0]?.focus();
  };

  const handleOpenDialog = (event: React.MouseEvent<HTMLElement>) => {
    triggerElementRef.current = event.currentTarget;
    setDialogOpen(true);
  };

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement as HTMLElement | null;

    focusFirstElementInDialog();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      (triggerElementRef.current ?? previouslyFocusedElement)?.focus();
    };
  }, [dialogOpen]);

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const panel = dialogPanelRef.current;
    if (!panel) {
      return;
    }

    const focusableElements = Array.from(
      panel.querySelectorAll<HTMLElement>(
        [
          "button:not([disabled])",
          "[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      ),
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  return (
    <>
      <section className="workflow-filter-toolbar">
        <div className="workflow-filter-toolbar__actions">
          <AppButton
            size="sm"
            onClick={handleOpenDialog}
            aria-haspopup="dialog"
            aria-expanded={dialogOpen}
            aria-controls={dialogOpen ? titleId : undefined}
            sx={{
              "--variant-containedColor": "#fff",
              "--variant-containedBg": "#19b985",
              backgroundColor: "#19b985",
              "&:hover": {
                "--variant-containedBg": "#17ab7b",
                backgroundColor: "#17ab7b",
              },
            }}
            startIcon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
          >
            <span>フィルター</span>
            {anyFilterActive ? (
              <span className="workflow-filter-trigger-button__badge">
                {activeFilterCount}
              </span>
            ) : null}
          </AppButton>
        </div>
      </section>

      {dialogOpen ? (
        <div
          className="workflow-filter-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={closeDialog}
        >
          <div
            className="workflow-filter-dialog__panel"
            onClick={(event) => event.stopPropagation()}
            ref={dialogPanelRef}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="workflow-filter-dialog__header">
              <div>
                <SectionTitle
                  id={titleId}
                  className="workflow-filter-dialog__title"
                >
                  申請一覧のフィルター
                </SectionTitle>
                <p className="workflow-filter-dialog__description">
                  種別、申請日、ステータス、作成日を組み合わせて一覧を整理できます。
                </p>
              </div>
              <AppIconButton
                onClick={closeDialog}
                className="workflow-filter-dialog__close"
                aria-label="フィルターダイアログを閉じる"
                tone="neutral"
              >
                <CloseRoundedIcon fontSize="inherit" />
              </AppIconButton>
            </div>

            <div className="workflow-filter-dialog__body">
              <WorkflowListFiltersPanel
                ref={filterRowRef}
                filters={filters}
                setFilter={setFilter}
              />
            </div>

            <div className="workflow-filter-dialog__footer">
              {anyFilterActive ? (
                <WorkflowClearFiltersAction onClearFilters={onClearFilters} />
              ) : (
                <span />
              )}
              <AppButton
                size="sm"
                onClick={closeDialog}
                sx={{
                  alignSelf: { xs: "flex-end", sm: "auto" },
                  "--variant-containedColor": "#fff",
                  "--variant-containedBg": "#19b985",
                  backgroundColor: "#19b985",
                  "&:hover": {
                    "--variant-containedBg": "#17ab7b",
                    backgroundColor: "#17ab7b",
                  },
                }}
              >
                一覧に反映
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
