import { logDailyReportMutation } from "@entities/operation-log/model/dailyReportOperationLog";
import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { sendDailyReportSubmissionNotification } from "@extensions/daily-report/features/lib/sendDailyReportSubmissionNotification";
import { DailyReportStatus } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildDefaultTitle,
  emptyForm,
  formatDateInput,
  mapDailyReport,
  sortReports,
} from "../dailyReportHelpers";
import type { DailyReportForm, DailyReportItem, EditableStatus } from "../dailyReportTypes";
import {
  createDailyReportRecord,
  updateDailyReportRecord,
} from "../services/dailyReportMutations";
import { useDailyReportAutoSave } from "./useDailyReportAutoSave";

const logger = createLogger("DailyReportPageActions");

const AUTO_SAVE_DELAY = 1000;

type NotifyFn = ReturnType<typeof useAppNotification>["notify"];

type SubmitCreateParams = {
  createForm: DailyReportForm;
  staffId: string;
  resolvedAuthorName: string;
  createdReportIdRef: MutableRefObject<string | null>;
  reportsById: Map<string, DailyReportItem>;
  status: EditableStatus;
  showNotification: boolean;
  notify: NotifyFn;
  staffs: StaffType[];
  setActionError: Dispatch<SetStateAction<string | null>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsAutoSaving: Dispatch<SetStateAction<boolean>>;
  setCreateFormLastSavedAt: Dispatch<SetStateAction<string | null>>;
  setCreateFormSavedState: Dispatch<SetStateAction<DailyReportForm>>;
  setSelectedReportId: Dispatch<SetStateAction<string | "create" | null>>;
  setCreateForm: Dispatch<SetStateAction<DailyReportForm>>;
  setReports: Dispatch<SetStateAction<DailyReportItem[]>>;
};

async function executeCreateSubmit({
  createForm, staffId, resolvedAuthorName, createdReportIdRef, reportsById,
  status, showNotification, notify, staffs,
  setActionError, setIsSubmitting, setIsAutoSaving, setCreateFormLastSavedAt,
  setCreateFormSavedState, setSelectedReportId, setCreateForm, setReports,
}: SubmitCreateParams): Promise<void> {
  const resolvedAuthor = (createForm.author || resolvedAuthorName).trim() || resolvedAuthorName;
  const applyResult = (mappedId: string, shouldClearCreatedReportId: boolean) => {
    setCreateFormLastSavedAt(new Date().toISOString());
    setCreateFormSavedState(createForm);
    if (showNotification) {
      setSelectedReportId(mappedId);
      if (shouldClearCreatedReportId) createdReportIdRef.current = null;
      const resetDate = formatDateInput(new Date());
      setCreateForm(() => emptyForm(resetDate, resolvedAuthorName));
    } else {
      setSelectedReportId("create");
    }
  };
  try {
    if (createdReportIdRef.current) {
      const beforeReport = reportsById.get(createdReportIdRef.current) ?? null;
      const target = reportsById.get(createdReportIdRef.current);
      const concurrencyState = { version: target?.version, updatedAt: target?.updatedAt };
      const updated = await updateDailyReportRecord({
        id: createdReportIdRef.current,
        reportDate: createForm.date,
        title: createForm.title.trim(),
        content: createForm.content,
        status,
        concurrencyState,
      });
      if (showNotification && status === DailyReportStatus.SUBMITTED) {
        try {
          await sendDailyReportSubmissionNotification({ staffs, report: updated, fallbackAuthorName: resolvedAuthorName });
        } catch (mailError) {
          logger.error("Failed to send daily report submission notification:", mailError);
          notify({ title: "メール送信エラー", description: "管理者への通知メールの送信に失敗しました。", tone: "error", dedupeKey: "daily-report-mail-error" });
        }
      }
      if (showNotification) {
        await logDailyReportMutation({ actorStaffId: staffId, before: beforeReport, after: updated, action: status === DailyReportStatus.SUBMITTED ? "submit" : "update" });
      }
      const mapped = mapDailyReport(updated, resolvedAuthor);
      setReports((prev) => sortReports([mapped, ...prev.filter((r) => r.id !== mapped.id)]));
      applyResult(mapped.id, true);
    } else {
      const created = await createDailyReportRecord({
        staffId,
        reportDate: createForm.date,
        title: createForm.title.trim(),
        content: createForm.content,
        status,
      });
      if (showNotification && status === DailyReportStatus.SUBMITTED) {
        try {
          await sendDailyReportSubmissionNotification({ staffs, report: created, fallbackAuthorName: resolvedAuthorName });
        } catch (mailError) {
          logger.error("Failed to send daily report submission notification:", mailError);
          notify({ title: "メール送信エラー", description: "管理者への通知メールの送信に失敗しました。", tone: "error", dedupeKey: "daily-report-mail-error" });
        }
      }
      if (showNotification) {
        await logDailyReportMutation({ actorStaffId: staffId, before: null, after: created, action: status === DailyReportStatus.SUBMITTED ? "submit" : "create" });
      }
      const mapped = mapDailyReport(created, resolvedAuthor);
      setReports((prev) => sortReports([mapped, ...prev.filter((r) => r.id !== mapped.id)]));
      if (!showNotification) createdReportIdRef.current = created.id;
      applyResult(mapped.id, false);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "日報の作成に失敗しました。";
    setActionError(errorMessage);
  } finally {
    setIsSubmitting(false);
    setIsAutoSaving(false);
  }
}

type SubmitEditParams = {
  editingReportId: string;
  editDraft: DailyReportForm;
  staffId: string | null | undefined;
  resolvedAuthorName: string;
  reportsById: Map<string, DailyReportItem>;
  status: EditableStatus;
  showNotification: boolean;
  notify: NotifyFn;
  staffs: StaffType[];
  setActionError: Dispatch<SetStateAction<string | null>>;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
  setIsAutoSaving: Dispatch<SetStateAction<boolean>>;
  setEditDraftLastSavedAt: Dispatch<SetStateAction<string | null>>;
  setEditDraftSavedState: Dispatch<SetStateAction<DailyReportForm | null>>;
  setEditingReportId: Dispatch<SetStateAction<string | null>>;
  setEditDraft: Dispatch<SetStateAction<DailyReportForm | null>>;
  setReports: Dispatch<SetStateAction<DailyReportItem[]>>;
};

async function executeEditSubmit({
  editingReportId, editDraft, staffId, resolvedAuthorName, reportsById,
  status, showNotification, notify, staffs,
  setActionError, setIsUpdating, setIsAutoSaving, setEditDraftLastSavedAt,
  setEditDraftSavedState, setEditingReportId, setEditDraft, setReports,
}: SubmitEditParams): Promise<void> {
  try {
    const beforeReport = reportsById.get(editingReportId) ?? null;
    const target = reportsById.get(editingReportId);
    const concurrencyState = { version: target?.version, updatedAt: target?.updatedAt };
    const updated = await updateDailyReportRecord({
      id: editingReportId,
      reportDate: editDraft.date,
      title: editDraft.title.trim(),
      content: editDraft.content,
      status,
      concurrencyState,
    });
    if (showNotification && status === DailyReportStatus.SUBMITTED) {
      try {
        await sendDailyReportSubmissionNotification({ staffs, report: updated, fallbackAuthorName: resolvedAuthorName });
      } catch (mailError) {
        logger.error("Failed to send daily report submission notification:", mailError);
        notify({ title: "メール送信エラー", description: "管理者への通知メールの送信に失敗しました。", tone: "error", dedupeKey: "daily-report-mail-error" });
      }
    }
    if (showNotification && staffId) {
      await logDailyReportMutation({ actorStaffId: staffId, before: beforeReport, after: updated, action: status === DailyReportStatus.SUBMITTED ? "submit" : "update" });
    }
    const mapped = mapDailyReport(updated, resolvedAuthorName);
    setReports((prev) => sortReports(prev.map((r) => (r.id === mapped.id ? mapped : r))));
    setEditDraftLastSavedAt(new Date().toISOString());
    setEditDraftSavedState(editDraft);
    if (showNotification && status === DailyReportStatus.SUBMITTED) {
      setEditingReportId(null);
      setEditDraft(null);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "日報の更新に失敗しました。";
    setActionError(errorMessage);
  } finally {
    setIsUpdating(false);
    setIsAutoSaving(false);
  }
}

export type UseDailyReportPageActionsParams = {
  notify: NotifyFn;
  staffId: string | null | undefined;
  staffs: StaffType[];
  reports: DailyReportItem[];
  setReports: Dispatch<SetStateAction<DailyReportItem[]>>;
  resolvedAuthorName: string;
  authorName: string | null | undefined;
};

export function useDailyReportPageActions({
  notify, staffId, staffs, reports, setReports, resolvedAuthorName, authorName,
}: UseDailyReportPageActionsParams) {
  const [createForm, setCreateForm] = useState<DailyReportForm>(() => emptyForm());
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DailyReportForm | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | "create" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [createFormLastSavedAt, setCreateFormLastSavedAt] = useState<string | null>(null);
  const [editDraftLastSavedAt, setEditDraftLastSavedAt] = useState<string | null>(null);
  const [createFormSavedState, setCreateFormSavedState] = useState<DailyReportForm>(() => emptyForm());
  const [editDraftSavedState, setEditDraftSavedState] = useState<DailyReportForm | null>(null);
  const createdReportIdRef = useRef<string | null>(null);

  const { dateMap: reportsByDate, dateSet: reportedDateSet, idMap: reportsById } = useMemo(() => {
    const dateMap = new Map<string, DailyReportItem>();
    const dateSet = new Set<string>();
    const idMap = new Map<string, DailyReportItem>();
    const effectiveReports = authorName
      ? reports.map((r) => (r.author === resolvedAuthorName ? r : { ...r, author: resolvedAuthorName }))
      : reports;
    effectiveReports.forEach((report) => {
      if (!dateMap.has(report.date)) dateMap.set(report.date, report);
      idMap.set(report.id, report);
      dateSet.add(report.date);
    });
    return { dateMap, dateSet, idMap };
  }, [reports, authorName, resolvedAuthorName]);

  const isCreateMode = selectedReportId === "create";
  const selectedReport = selectedReportId && selectedReportId !== "create" ? (reportsById.get(selectedReportId) ?? null) : null;
  const isSelectedReportSubmitted = selectedReport?.status === DailyReportStatus.SUBMITTED;
  const isCreateFormDirty = useMemo(() => JSON.stringify(createForm) !== JSON.stringify(createFormSavedState), [createForm, createFormSavedState]);
  const isEditDraftDirty = useMemo(() => Boolean(editDraft && JSON.stringify(editDraft) !== JSON.stringify(editDraftSavedState)), [editDraft, editDraftSavedState]);
  const canSubmit = Boolean(staffId && createForm.title.trim());
  const canEditSubmit = Boolean(editDraft && editDraft.title.trim());

  const effectiveCreateForm = useMemo<DailyReportForm>(() => {
    if (!authorName || createForm.author === resolvedAuthorName) return createForm;
    return { ...createForm, author: resolvedAuthorName };
  }, [createForm, authorName, resolvedAuthorName]);

  const handleCalendarDateSelected = useCallback((dateKey: string) => {
    const reportForDate = reportsByDate.get(dateKey);
    if (reportForDate) { setSelectedReportId(reportForDate.id); return; }
    setSelectedReportId(null);
    setCreateFormLastSavedAt(null);
    setCreateForm(emptyForm(dateKey, resolvedAuthorName));
    createdReportIdRef.current = null;
  }, [reportsByDate, resolvedAuthorName]);

  const handleCreateChange = useCallback((field: keyof DailyReportForm, value: string) => {
    setCreateForm((prev) => {
      if (field === "date") {
        const nextDefaultTitle = buildDefaultTitle(value);
        const prevDefaultTitle = buildDefaultTitle(prev.date);
        const shouldSyncTitle = prev.title.trim() === "" || prev.title === prevDefaultTitle;
        return { ...prev, date: value, title: shouldSyncTitle ? nextDefaultTitle : prev.title };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleEditChange = useCallback((field: keyof DailyReportForm, value: string) => {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const handleCreateSubmit = useCallback(async (status: EditableStatus, showNotification = true) => {
    if (!createForm.title.trim()) { setActionError("タイトルを入力してください。"); return; }
    if (!staffId) { setActionError("スタッフ情報が取得できないため日報を作成できません。"); return; }
    setIsSubmitting(true);
    setActionError(null);
    if (!showNotification) setIsAutoSaving(true);
    await executeCreateSubmit({
      createForm, staffId, resolvedAuthorName, createdReportIdRef, reportsById,
      status, showNotification, notify, staffs,
      setActionError, setIsSubmitting, setIsAutoSaving, setCreateFormLastSavedAt,
      setCreateFormSavedState, setSelectedReportId, setCreateForm, setReports,
    });
  }, [createForm, staffId, resolvedAuthorName, reportsById, notify, staffs, setReports]);

  const handleSaveEdit = useCallback(async (status: EditableStatus, showNotification = true) => {
    if (!editingReportId || !editDraft) return;
    if (!editDraft.title.trim()) { setActionError("タイトルを入力してください。"); return; }
    setIsUpdating(true);
    setActionError(null);
    if (!showNotification) setIsAutoSaving(true);
    await executeEditSubmit({
      editingReportId, editDraft, staffId, resolvedAuthorName, reportsById,
      status, showNotification, notify, staffs,
      setActionError, setIsUpdating, setIsAutoSaving, setEditDraftLastSavedAt,
      setEditDraftSavedState, setEditingReportId, setEditDraft, setReports,
    });
  }, [editingReportId, editDraft, staffId, resolvedAuthorName, reportsById, notify, staffs, setReports]);

  const handleStartEdit = useCallback((report: DailyReportItem) => {
    setActionError(null);
    setEditingReportId(report.id);
    const draft = { date: report.date, author: report.author || resolvedAuthorName, title: report.title, content: report.content };
    setEditDraft(draft);
    setEditDraftSavedState(draft);
    setEditDraftLastSavedAt(null);
  }, [resolvedAuthorName]);

  const handleCancelEdit = useCallback(() => { setEditingReportId(null); setEditDraft(null); setActionError(null); }, []);
  const handleClearCreateForm = useCallback(() => {
    setActionError(null);
    const newForm = emptyForm(undefined, resolvedAuthorName);
    setCreateForm(() => newForm);
    setCreateFormSavedState(newForm);
    setCreateFormLastSavedAt(null);
  }, [resolvedAuthorName]);
  const handleSaveCreateDraft = useCallback(() => { void handleCreateSubmit(DailyReportStatus.DRAFT, true); }, [handleCreateSubmit]);
  const handleSubmitCreateReport = useCallback(() => { void handleCreateSubmit(DailyReportStatus.SUBMITTED, true); }, [handleCreateSubmit]);
  const handleStartCreate = useCallback((dateStr: string) => {
    setSelectedReportId("create");
    setCreateForm(emptyForm(dateStr, resolvedAuthorName));
    createdReportIdRef.current = null;
  }, [resolvedAuthorName]);
  const handleSaveEditedDraft = useCallback(() => { void handleSaveEdit(DailyReportStatus.DRAFT, true); }, [handleSaveEdit]);
  const handleSubmitEditedReport = useCallback(() => { void handleSaveEdit(DailyReportStatus.SUBMITTED, true); }, [handleSaveEdit]);
  const handleEditSelectedReport = useCallback(() => { if (selectedReport) handleStartEdit(selectedReport); }, [selectedReport, handleStartEdit]);
  const initializeCreateFormForDate = useCallback((dateKey: string) => {
    setCreateForm((prev) => emptyForm(dateKey, prev.author || resolvedAuthorName));
  }, [resolvedAuthorName]);

  useDailyReportAutoSave({
    delay: AUTO_SAVE_DELAY,
    isCreateMode,
    createForm,
    isCreateFormDirty,
    onCreateDraftAutoSave: () => { void handleCreateSubmit(DailyReportStatus.DRAFT, false); },
    editingReportId,
    editDraft,
    isEditDraftDirty,
    isSelectedReportSubmitted,
    onEditDraftAutoSave: () => { void handleSaveEdit(DailyReportStatus.DRAFT, false); },
  });

  return {
    createForm: effectiveCreateForm, editDraft, editingReportId, selectedReportId, actionError,
    isSubmitting, isUpdating, isAutoSaving,
    createFormLastSavedAt, editDraftLastSavedAt,
    reportsByDate, reportsById, reportedDateSet,
    isCreateFormDirty, isEditDraftDirty, canSubmit, canEditSubmit,
    selectedReport, isCreateMode, isSelectedReportSubmitted,
    setSelectedReportId, setEditingReportId, setEditDraft,
    setEditDraftSavedState, setEditDraftLastSavedAt, setActionError,
    handleCalendarDateSelected, handleCreateChange, handleEditChange,
    handleStartEdit, handleCancelEdit, handleClearCreateForm,
    handleSaveCreateDraft, handleSubmitCreateReport, handleStartCreate,
    handleSaveEditedDraft, handleSubmitEditedReport, handleEditSelectedReport,
    initializeCreateFormForDate,
  };
}
