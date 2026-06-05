import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { dailyReportsByStaffId } from "@shared/api/graphql/documents/queries";
import type { DailyReportsByStaffIdQuery } from "@shared/api/graphql/types";
import { DailyReportStatus } from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { useEffect } from "react";

const QUERY_LIMIT = 1;
const FETCH_FAILED = "日報の取得に失敗しました。";

const extractErrorMessage = (errors: readonly { message: string }[]): string =>
  errors.map((err) => err.message).join("\n");

type UseQuickDailyReportLoadParams = {
  staffId: string | null | undefined;
  date: string;
  setReportId: React.Dispatch<React.SetStateAction<string | null>>;
  setReportVersion: React.Dispatch<React.SetStateAction<number | null>>;
  setReportUpdatedAt: React.Dispatch<React.SetStateAction<string | null>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setSavedContent: React.Dispatch<React.SetStateAction<string>>;
  setReportStatus: React.Dispatch<
    React.SetStateAction<DailyReportStatus | null>
  >;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useQuickDailyReportLoad({
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
}: UseQuickDailyReportLoadParams) {
  useEffect(() => {
    if (!staffId) {
      setReportId(null);
      setReportVersion(null);
      setReportUpdatedAt(null);
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
            (item): item is NonNullable<typeof item> => Boolean(item),
          )[0] ?? null;
        if (!mounted) return;
        if (report) {
          const nextContent = report.content ?? "";
          setReportId(report.id);
          setReportVersion(report.version ?? null);
          setReportUpdatedAt(report.updatedAt ?? report.createdAt ?? null);
          setContent(nextContent);
          setSavedContent(nextContent);
          setReportStatus(report.status as DailyReportStatus);
        } else {
          setReportId(null);
          setReportVersion(null);
          setReportUpdatedAt(null);
          setContent("");
          setSavedContent("");
          setReportStatus(null);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : FETCH_FAILED);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, date]);
}
