import { logDailyReportMutation } from "@entities/operation-log/model/dailyReportOperationLog";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getGraphQLErrorMessage,
  getNextVersion,
} from "@shared/api/graphql/concurrency";
import {
  createDailyReport,
  updateDailyReport,
} from "@shared/api/graphql/documents/mutations";
import type {
  CreateDailyReportMutation,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import { DailyReportStatus } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

const TIME_FORMAT = "HH:mm:ss";

const ERROR_MESSAGES = {
  SAVE_FAILED: "日報の保存に失敗しました。",
  SAVE_SUCCESS: "日報を保存しました",
} as const;

const extractErrorMessage = (errors: readonly { message: string }[]): string =>
  errors.map((err) => err.message).join("\n");

type UseSaveParams = {
  staffId: string | null | undefined;
  content: string;
  savedContent: string;
  reportId: string | null;
  reportUpdatedAt: string | null;
  reportStatus: DailyReportStatus | null;
  reportVersion: number | null;
  date: string;
  defaultTitle: string;
  dispatch: ReturnType<typeof useDispatch>;
  setSavedContent: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setReportId: React.Dispatch<React.SetStateAction<string | null>>;
  setReportVersion: React.Dispatch<React.SetStateAction<number | null>>;
  setReportUpdatedAt: React.Dispatch<React.SetStateAction<string | null>>;
  setReportStatus: React.Dispatch<
    React.SetStateAction<DailyReportStatus | null>
  >;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLastSavedAt: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useQuickDailyReportSave({
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
}: UseSaveParams) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(
    async (showNotification = true, isManualSave = false) => {
      if (!staffId) return;
      if (!isManualSave && content === savedContent) return;
      setIsSaving(true);
      setError(null);
      const status = isManualSave
        ? DailyReportStatus.SUBMITTED
        : reportStatus === DailyReportStatus.SUBMITTED
          ? DailyReportStatus.SUBMITTED
          : DailyReportStatus.DRAFT;
      try {
        if (reportId) {
          const beforeReport = {
            id: reportId,
            staffId,
            reportDate: date,
            title: defaultTitle,
            content: savedContent,
            status: reportStatus ?? DailyReportStatus.DRAFT,
            updatedAt: reportUpdatedAt,
            version: reportVersion,
          };
          const response = (await graphqlClient.graphql({
            query: updateDailyReport,
            variables: {
              condition: buildVersionOrUpdatedAtCondition(
                reportVersion,
                reportUpdatedAt,
              ),
              input: {
                id: reportId,
                content,
                status,
                updatedAt: new Date().toISOString(),
                version: getNextVersion(reportVersion),
              },
            },
            authMode: "userPool",
          })) as GraphQLResult<UpdateDailyReportMutation>;
          if (response.errors?.length) {
            throw new Error(
              getGraphQLErrorMessage(
                response.errors,
                ERROR_MESSAGES.SAVE_FAILED,
              ),
            );
          }
          const updatedReport = response.data?.updateDailyReport;
          if (updatedReport && showNotification) {
            await logDailyReportMutation({
              actorStaffId: staffId,
              before: beforeReport,
              after: updatedReport,
              action:
                status === DailyReportStatus.SUBMITTED ? "submit" : "update",
            });
          }
          const updatedContent = updatedReport?.content ?? content;
          setSavedContent(updatedContent);
          setContent(updatedContent);
          setReportStatus(status);
          setReportVersion(updatedReport?.version ?? reportVersion);
          setReportUpdatedAt(updatedReport?.updatedAt ?? reportUpdatedAt);
        } else {
          const response = (await graphqlClient.graphql({
            query: createDailyReport,
            variables: {
              input: {
                staffId,
                reportDate: date,
                title: defaultTitle,
                content,
                status,
                updatedAt: new Date().toISOString(),
                version: 1,
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
          if (created && showNotification) {
            await logDailyReportMutation({
              actorStaffId: staffId,
              before: null,
              after: created,
              action:
                status === DailyReportStatus.SUBMITTED ? "submit" : "create",
            });
          }
          const nextContent = created?.content ?? content;
          setReportId(created?.id ?? null);
          setReportVersion(created?.version ?? 1);
          setReportUpdatedAt(created?.updatedAt ?? new Date().toISOString());
          setSavedContent(nextContent);
          setContent(nextContent);
          setReportStatus(status);
        }
        setLastSavedAt(dayjs().format(TIME_FORMAT));
        if (showNotification) {
          dispatch(
            pushNotification({
              tone: "success",
              message: ERROR_MESSAGES.SAVE_SUCCESS,
            }),
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.SAVE_FAILED;
        setError(message);
        if (showNotification) {
          dispatch(
            pushNotification({
              tone: "error",
              message: "日報の保存に失敗しました",
            }),
          );
        }
      } finally {
        setIsSaving(false);
      }
    },
    [
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
    ],
  );

  return { isSaving, handleSave };
}
