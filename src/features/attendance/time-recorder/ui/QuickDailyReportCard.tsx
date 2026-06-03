import { DailyReportStatus } from "@shared/api/graphql/types";
import QuickDailyReportCardView from "@shared/ui/time-recorder/QuickDailyReportCard";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { useQuickDailyReportAutoSave } from "./useQuickDailyReportAutoSave";
import { useQuickDailyReportLoad } from "./useQuickDailyReportLoad";
import { useQuickDailyReportSave } from "./useQuickDailyReportSave";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

interface QuickDailyReportCardProps {
  staffId: string | null | undefined;
  date: string;
}

export default function QuickDailyReportCard({
  staffId,
  date,
}: QuickDailyReportCardProps) {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportVersion, setReportVersion] = useState<number | null>(null);
  const [reportUpdatedAt, setReportUpdatedAt] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<DailyReportStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const defaultTitle = useMemo(() => `${date}の日報`, [date]);
  const hasStaff = Boolean(staffId);
  const isEditable = hasStaff && !isLoading;
  const isDirty = content !== savedContent;
  const contentPanelId = useMemo(() => `quick-daily-report-${date}`, [date]);

  const { isSaving, handleSave } = useQuickDailyReportSave({
    staffId,
    content,
    savedContent,
    reportId,
    reportUpdatedAt,
    reportStatus,
    reportVersion,
    date,
    defaultTitle,
    dispatch,
    setSavedContent,
    setContent,
    setReportId,
    setReportVersion,
    setReportUpdatedAt,
    setReportStatus,
    setError,
    setLastSavedAt,
  });

  useUnsavedChangesGuard(isSaving || isDirty);

  useQuickDailyReportLoad({
    staffId,
    date,
    setReportId,
    setReportVersion,
    setReportUpdatedAt,
    setContent,
    setSavedContent,
    setReportStatus,
    setIsLoading,
    setError,
  });

  useEffect(() => {
    if (error) {
      const timeoutId = window.setTimeout(() => {
        setIsOpen(true);
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [error]);

  useEffect(() => {
    if (!staffId) {
      const timeoutId = window.setTimeout(() => {
        setIsDialogOpen(false);
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [staffId]);

  useQuickDailyReportAutoSave({
    staffId,
    content,
    savedContent,
    handleSave,
  });

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDialogOpen = () => {
    if (!staffId) return;
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <QuickDailyReportCardView
      date={date}
      reportId={reportId}
      content={content}
      isOpen={isOpen}
      isDialogOpen={isDialogOpen}
      isLoading={isLoading}
      isEditable={isEditable}
      isSaving={isSaving}
      hasStaff={hasStaff}
      error={error}
      lastSavedAt={lastSavedAt}
      contentPanelId={contentPanelId}
      isSubmitted={reportStatus === DailyReportStatus.SUBMITTED}
      onToggle={handleToggle}
      onDialogOpen={handleDialogOpen}
      onDialogClose={handleDialogClose}
      onSave={() => void handleSave(true, true)}
      onContentChange={(value) => setContent(value)}
    />
  );
}
