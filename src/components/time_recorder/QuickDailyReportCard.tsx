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

/**
 * 定数定義
 */
const AUTO_SAVE_DELAY = 1000; // 1秒後に自動保存
const TIME_FORMAT = "HH:mm:ss"; // 保存時刻の表示形式
const QUERY_LIMIT = 1; // 日報取得時のクエリ制限

/**
 * エラーメッセージ
 */
const ERROR_MESSAGES = {
  FETCH_FAILED: "日報の取得に失敗しました。",
  SAVE_FAILED: "日報の保存に失敗しました。",
  SAVE_SUCCESS: "日報を保存しました",
} as const;

/**
 * Props型定義
 */
interface QuickDailyReportCardProps {
  staffId: string | null | undefined;
  date: string;
}

/**
 * GraphQLレスポンスからエラーメッセージを抽出するヘルパー関数
 */
const extractErrorMessage = (
  errors: readonly { message: string }[]
): string => {
  return errors.map((err) => err.message).join("\n");
};

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

  /**
   * ページ離脱時の警告
   * 保存中または未保存の変更がある場合、ユーザーに確認を促す
   */
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

  /**
   * 日報データの初期読み込み
   * staffIdまたはdateが変更されたときに実行
   */
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
            limit: QUERY_LIMIT,
          },
          authMode: "userPool",
        })) as GraphQLResult<DailyReportsByStaffIdQuery>;

        if (!mounted) return;

        if (response.errors?.length) {
          throw new Error(extractErrorMessage(response.errors));
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
          // 既存の日報がない場合は空の状態にリセット
          setReportId(null);
          setContent("");
          setSavedContent("");
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : ERROR_MESSAGES.FETCH_FAILED
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

  /**
   * エラー発生時に自動的にカードを展開して表示
   */
  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  /**
   * staffIdがない場合はダイアログを閉じる
   */
  useEffect(() => {
    if (!staffId) {
      setIsDialogOpen(false);
    }
  }, [staffId]);

  /**
   * 日報の保存処理
   * @param showNotification - 保存完了時に通知を表示するかどうか
   */
  const handleSave = useCallback(
    async (showNotification = true) => {
      // 保存が不要な場合は早期リターン
      if (!staffId || content === savedContent) return;

      setIsSaving(true);
      setError(null);

      try {
        if (reportId) {
          // 既存の日報を更新
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
            throw new Error(extractErrorMessage(response.errors));
          }

          const updatedContent =
            response.data?.updateDailyReport?.content ?? content;
          setSavedContent(updatedContent);
          setContent(updatedContent);
        } else {
          // 新規日報を作成
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
            throw new Error(extractErrorMessage(response.errors));
          }

          const created = response.data?.createDailyReport;
          const nextContent = created?.content ?? content;
          setReportId(created?.id ?? null);
          setSavedContent(nextContent);
          setContent(nextContent);
        }

        // 保存時刻を記録
        setLastSavedAt(dayjs().format(TIME_FORMAT));
        if (showNotification) {
          dispatch(setSnackbarSuccess(ERROR_MESSAGES.SAVE_SUCCESS));
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

  /**
   * 自動保存機能
   * デバウンス処理により、入力停止後AUTO_SAVE_DELAY(3秒)経過後に自動保存
   */
  useEffect(() => {
    // 既存のタイマーをクリア（デバウンス処理）
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 保存条件: staffIdが存在、内容が変更されている、空ではない
    if (staffId && content !== savedContent && content.trim() !== "") {
      autoSaveTimerRef.current = setTimeout(() => {
        void handleSave(false); // 自動保存時は通知を表示しない
      }, AUTO_SAVE_DELAY);
    }

    // クリーンアップ: コンポーネントのアンマウント時やdependenciesの変更時
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, savedContent, staffId, handleSave]);

  /**
   * 入力内容をクリアして保存済みの状態に戻す
   */
  const handleClear = () => {
    setContent(savedContent);
    setError(null);
  };

  /**
   * カードの展開/折りたたみを切り替え
   */
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * 拡大表示ダイアログを開く
   */
  const handleDialogOpen = () => {
    if (!staffId) return;
    setIsDialogOpen(true);
  };

  /**
   * 拡大表示ダイアログを閉じる
   */
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
