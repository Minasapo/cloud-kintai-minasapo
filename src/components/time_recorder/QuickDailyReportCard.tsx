import {
  createDailyReport,
  updateDailyReport,
} from "@shared/api/graphql/documents/mutations";
import { dailyReportsByStaffId } from "@shared/api/graphql/documents/queries";
import type {
  CreateDailyReportMutation,
  DailyReportsByStaffIdQuery,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import { DailyReportStatus } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import QuickDailyReportCardView from "@/shared/ui/time-recorder/QuickDailyReportCard";

interface QuickDailyReportCardProps {
  staffId: string | null | undefined;
  date: string;
}

const AUTO_SAVE_DELAY = 3000; // 3秒後に自動保存

export default function QuickDailyReportCard({
  staffId,
  date,
}: QuickDailyReportCardProps) {
  const dispatch = useAppDispatchV2();
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultTitle = useMemo(() => `${date}の日報`, [date]);
  const hasStaff = Boolean(staffId);
  const isEditable = hasStaff && !isLoading;
  const isDirty = content !== savedContent;
  const contentPanelId = useMemo(() => `quick-daily-report-${date}`, [date]);

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving || isDirty) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaving, isDirty]);

  useEffect(() => {
    if (!staffId) {
      setReportId(null);
      setContent("");
      setSavedContent("");
      setIsLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        const response = (await graphqlClient.graphql({
          query: dailyReportsByStaffId,
          variables: {
            staffId,
            reportDate: { eq: date },
            limit: 1,
          },
          authMode: "userPool",
        })) as GraphQLResult<DailyReportsByStaffIdQuery>;

        if (!mounted) return;

        if (response.errors?.length) {
          throw new Error(response.errors.map((err) => err.message).join("\n"));
        }

        const report =
          response.data?.dailyReportsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => Boolean(item)
          )[0] ?? null;

        if (!mounted) return;

        if (report) {
          const nextContent = report.content ?? "";
          setReportId(report.id);
          setContent(nextContent);
          setSavedContent(nextContent);
        } else {
          setReportId(null);
          setContent("");
          setSavedContent("");
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "日報の取得に失敗しました。"
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [staffId, date]);

  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  useEffect(() => {
    if (!staffId) {
      setIsDialogOpen(false);
    }
  }, [staffId]);

  const handleSave = useCallback(
    async (showNotification = true) => {
      if (!staffId || content === savedContent) return;

      setIsSaving(true);
      setError(null);

      try {
        if (reportId) {
          const response = (await graphqlClient.graphql({
            query: updateDailyReport,
            variables: {
              input: {
                id: reportId,
                content,
                updatedAt: new Date().toISOString(),
              },
            },
            authMode: "userPool",
          })) as GraphQLResult<UpdateDailyReportMutation>;

          if (response.errors?.length) {
            throw new Error(
              response.errors.map((err) => err.message).join("\n")
            );
          }

          const updatedContent =
            response.data?.updateDailyReport?.content ?? content;
          setSavedContent(updatedContent);
          setContent(updatedContent);
        } else {
          const response = (await graphqlClient.graphql({
            query: createDailyReport,
            variables: {
              input: {
                staffId,
                reportDate: date,
                title: defaultTitle,
                content,
                status: DailyReportStatus.DRAFT,
                updatedAt: new Date().toISOString(),
                reactions: [],
                comments: [],
              },
            },
            authMode: "userPool",
          })) as GraphQLResult<CreateDailyReportMutation>;

          if (response.errors?.length) {
            throw new Error(
              response.errors.map((err) => err.message).join("\n")
            );
          }

          const created = response.data?.createDailyReport;
          const nextContent = created?.content ?? content;
          setReportId(created?.id ?? null);
          setSavedContent(nextContent);
          setContent(nextContent);
        }

        setLastSavedAt(dayjs().format("HH:mm:ss"));
        if (showNotification) {
          dispatch(setSnackbarSuccess("日報を保存しました"));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "日報の保存に失敗しました。";
        setError(message);
        if (showNotification) {
          dispatch(setSnackbarError("日報の保存に失敗しました"));
        }
      } finally {
        setIsSaving(false);
      }
    },
    [staffId, content, savedContent, reportId, date, defaultTitle, dispatch]
  );

  // 自動保存
  useEffect(() => {
    // タイマーをクリア
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 内容が変更され、保存が必要な場合のみタイマーをセット
    if (staffId && content !== savedContent && content.trim() !== "") {
      autoSaveTimerRef.current = setTimeout(() => {
        void handleSave(false); // 自動保存時は通知を表示しない
      }, AUTO_SAVE_DELAY);
    }

    // クリーンアップ
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, savedContent, staffId, handleSave]);

  const handleClear = () => {
    setContent(savedContent);
    setError(null);
  };

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
      isDirty={isDirty}
      isSaving={isSaving}
      hasStaff={hasStaff}
      error={error}
      lastSavedAt={lastSavedAt}
      contentPanelId={contentPanelId}
      onToggle={handleToggle}
      onDialogOpen={handleDialogOpen}
      onDialogClose={handleDialogClose}
      onClear={handleClear}
      onSave={() => void handleSave(true)}
      onContentChange={(value) => setContent(value)}
    />
  );
}
