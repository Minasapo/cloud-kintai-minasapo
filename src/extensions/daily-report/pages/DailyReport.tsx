import "./styles.scss";

import {
  DailyReportCalendar,
} from "@extensions/daily-report/features";
import { useAppNotification } from "@shared/lib/useAppNotification";
import {
  DashboardInnerSurface,
  PageContent,
  PageSection,
} from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import { type Dayjs } from "dayjs";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AlertBox,
  CreateReportSection,
  EditActionSection,
  HeroSection,
  LoadingSection,
  NoReportSection,
  Panel,
  ReportDetailSection,
  ReportSummaryHeader,
  VStack,
} from "./dailyReportComponents";
import { useDailyReportData } from "./hooks/useDailyReportData";
import { useDailyReportPageActions } from "./hooks/useDailyReportPageActions";
import { useDailyReportSelectionTransition } from "./hooks/useDailyReportSelectionTransition";
import { useDailyReportUrlSync } from "./hooks/useDailyReportUrlSync";

const DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_AUTHOR_NAME = "スタッフ";

export default function DailyReport() {
  const { notify } = useAppNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isHeroDescriptionExpanded, setIsHeroDescriptionExpanded] = useState(false);

  const {
    authorName, staffId, staffs, reports, setReports, requestError, setRequestError, isInitialViewPending,
  } = useDailyReportData(DEFAULT_AUTHOR_NAME);
  const resolvedAuthorName = authorName || DEFAULT_AUTHOR_NAME;

  const {
    createForm, editDraft, editingReportId, selectedReportId, actionError,
    isSubmitting, isUpdating, isAutoSaving,
    createFormLastSavedAt, editDraftLastSavedAt,
    reportsByDate, reportedDateSet,
    canSubmit, canEditSubmit,
    selectedReport, isCreateMode, isSelectedReportSubmitted,
    setSelectedReportId, setEditingReportId, setEditDraft,
    setEditDraftSavedState, setEditDraftLastSavedAt, setActionError,
    handleCalendarDateSelected, handleCreateChange, handleEditChange,
    handleCancelEdit, handleClearCreateForm,
    handleSaveCreateDraft, handleSubmitCreateReport, handleStartCreate,
    handleSaveEditedDraft, handleSubmitEditedReport, handleEditSelectedReport,
    initializeCreateFormForDate,
  } = useDailyReportPageActions({
    notify, staffId, staffs, reports, setReports, resolvedAuthorName, authorName,
  });

  const { calendarDate, syncCalendarDateToUrl } = useDailyReportUrlSync({
    dateFormat: DATE_FORMAT,
    searchParams,
    setSearchParams,
    onInitialize: initializeCreateFormForDate,
  });

  const handleCalendarChange = (value: Dayjs | null) => {
    if (!value) return;
    const { dateKey } = syncCalendarDateToUrl(value);
    handleCalendarDateSelected(dateKey);
  };

  useDailyReportSelectionTransition({
    calendarDate,
    reports,
    reportsByDate,
    selectedReportId,
    isAutoSaving,
    setSelectedReportId,
    setEditingReportId,
    setEditDraft,
    setEditDraftSavedState,
    setEditDraftLastSavedAt,
    setActionError,
  });

  return (
    <Page title="日報" width="full" showDefaultHeader={false}>
      <PageContent width="content">
        <PageSection
          layoutVariant="dashboard"
          variant="plain"
          className="daily-report-section"
        >
          <VStack className="daily-report-page">
            <HeroSection
              isDescriptionExpanded={isHeroDescriptionExpanded}
              onToggleDescription={() =>
                setIsHeroDescriptionExpanded((current) => !current)
              }
            />

            {requestError && (
              <AlertBox tone="error" onClose={() => setRequestError(null)}>
                {requestError}
              </AlertBox>
            )}

            <div className="daily-report-grid">
              <div className="daily-report-sidebar">
                <Panel className="dr-panel--calendar">
                  <VStack className="dr-gap-1">
                    <div>
                      <p className="daily-report-calendar-label">日付を選択</p>
                    </div>
                    <DashboardInnerSurface>
                      <DailyReportCalendar
                        value={calendarDate}
                        onChange={handleCalendarChange}
                        reportedDateSet={reportedDateSet}
                      />
                    </DashboardInnerSurface>
                  </VStack>
                </Panel>
              </div>

              <div>
                <Panel className="dr-panel--detail">
                  <VStack className="daily-report-card-body">
                    <ReportSummaryHeader calendarDate={calendarDate} />

                    {actionError && (
                      <AlertBox tone="error" onClose={() => setActionError(null)}>
                        {actionError}
                      </AlertBox>
                    )}

                    {isInitialViewPending ? (
                      <LoadingSection />
                    ) : isCreateMode ? (
                      <CreateReportSection
                        createForm={createForm}
                        createFormLastSavedAt={createFormLastSavedAt}
                        canSubmit={canSubmit}
                        isSubmitting={isSubmitting}
                        onChange={handleCreateChange}
                        onClear={handleClearCreateForm}
                        onSaveDraft={handleSaveCreateDraft}
                        onSubmit={handleSubmitCreateReport}
                      />
                    ) : selectedReportId ? (
                      selectedReport ? (
                        <ReportDetailSection
                          report={selectedReport}
                          isEditing={
                            editingReportId === selectedReport.id &&
                            Boolean(editDraft)
                          }
                          editDraft={editDraft}
                          isSelectedReportSubmitted={isSelectedReportSubmitted}
                          editDraftLastSavedAt={editDraftLastSavedAt}
                          onEditChange={handleEditChange}
                        />
                      ) : (
                        <p className="dr-not-found-message">
                          選択中の日報が見つかりません。
                        </p>
                      )
                    ) : (
                      <NoReportSection
                        onCreate={() =>
                          handleStartCreate(calendarDate.format(DATE_FORMAT))
                        }
                      />
                    )}

                    {!isCreateMode && selectedReportId && (
                      <EditActionSection
                        isEditing={Boolean(editingReportId && editDraft)}
                        canEditSubmit={canEditSubmit}
                        isUpdating={isUpdating}
                        isSelectedReportSubmitted={isSelectedReportSubmitted}
                        onSaveDraft={handleSaveEditedDraft}
                        onSubmit={handleSubmitEditedReport}
                        onCancel={handleCancelEdit}
                        onEdit={handleEditSelectedReport}
                      />
                    )}
                  </VStack>
                </Panel>
              </div>
            </div>
          </VStack>
        </PageSection>
      </PageContent>
    </Page>
  );
}
