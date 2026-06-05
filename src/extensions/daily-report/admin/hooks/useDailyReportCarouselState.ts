import { AuthContext } from "@app/providers/auth/AuthContext";
import useCognitoUser from "@entities/staff/model/useCognitoUser";
import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { getDailyReport } from "@shared/api/graphql/documents/queries";
import type {
  DailyReportComment,
  DailyReportReaction,
  GetDailyReportQuery,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import type { GraphQLResult } from "aws-amplify/api";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  type AdminDailyReport,
  mapDailyReport,
  normalizeComments,
  normalizeReactions,
  type ReactionType,
} from "../data";
import { useCurrentStaff } from "../useCurrentStaff";

const logger = createLogger("DailyReportCarousel");

interface UseDailyReportCarouselStateParams {
  open: boolean;
  selectedReport: AdminDailyReport;
  filteredReports: AdminDailyReport[];
}

interface PreloadedReport {
  report: AdminDailyReport;
  reactionEntries: DailyReportReaction[];
  commentEntries: DailyReportComment[];
}

const PRELOAD_INTERVAL_MS = 100;

export function useDailyReportCarouselState({
  open,
  selectedReport,
  filteredReports,
}: UseDailyReportCarouselStateParams) {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: isStaffLoading } = useStaffs({ isAuthenticated });
  const { cognitoUser } = useCognitoUser();
  const [currentIndex, setCurrentIndex] = useState(
    filteredReports.findIndex((item) => item.id === selectedReport.id),
  );
  const [report, setReport] = useState<AdminDailyReport>(selectedReport);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preloadedReports, setPreloadedReports] = useState<
    Map<string, PreloadedReport>
  >(new Map());
  const [reactionEntries, setReactionEntries] = useState<
    DailyReportReaction[] | null
  >(null);
  const [commentEntries, setCommentEntries] = useState<
    DailyReportComment[] | null
  >(null);
  const {
    currentStaffId,
    currentStaffName,
    isResolving: isResolvingCurrentStaff,
  } = useCurrentStaff(cognitoUser);

  const buildStaffName = useCallback(
    (staffId: string) => {
      const staff = staffs.find((item) => item.id === staffId);
      if (!staff) return "スタッフ";
      const name = [staff.familyName, staff.givenName]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");
      return name || "スタッフ";
    },
    [staffs],
  );

  const currentReport = filteredReports[currentIndex];

  const fetchDailyReportById = useCallback(
    async (reportId: string): Promise<PreloadedReport> => {
      const response = (await graphqlClient.graphql({
        query: getDailyReport,
        variables: { id: reportId },
        authMode: "userPool",
      })) as GraphQLResult<GetDailyReportQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors.map((error) => error.message).join("\n"));
      }

      const record = response.data?.getDailyReport;
      if (!record) {
        throw new Error("日報が見つかりませんでした。");
      }

      const fetchedReactions = normalizeReactions(record.reactions);
      const fetchedComments = normalizeComments(record.comments);
      const mappedReport = mapDailyReport(record, buildStaffName(record.staffId));

      return {
        report: mappedReport,
        reactionEntries: fetchedReactions,
        commentEntries: fetchedComments,
      };
    },
    [buildStaffName],
  );

  const fetchCurrentReport = useCallback(async () => {
    if (!currentReport) return;

    const preloaded = preloadedReports.get(currentReport.id);
    if (preloaded) {
      setReport(preloaded.report);
      setReactionEntries(preloaded.reactionEntries);
      setCommentEntries(preloaded.commentEntries);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const fetched = await fetchDailyReportById(currentReport.id);
      setReport(fetched.report);
      setReactionEntries(fetched.reactionEntries);
      setCommentEntries(fetched.commentEntries);
      setPreloadedReports((prev) => new Map(prev).set(currentReport.id, fetched));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentReport, fetchDailyReportById, preloadedReports]);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(filteredReports.findIndex((item) => item.id === selectedReport.id));
    setPreloadedReports(new Map());
  }, [open, selectedReport.id, filteredReports]);

  useEffect(() => {
    void fetchCurrentReport();
  }, [fetchCurrentReport]);

  useEffect(() => {
    if (!open || filteredReports.length === 0) return;
    let mounted = true;

    const preloadReports = async () => {
      for (let index = 0; index < filteredReports.length; index += 1) {
        if (!mounted) break;
        const target = filteredReports[index];
        if (
          preloadedReports.has(target.id) ||
          target.id === currentReport?.id
        ) {
          continue;
        }
        try {
          const fetched = await fetchDailyReportById(target.id);
          if (!mounted) break;
          setPreloadedReports((prev) => new Map(prev).set(target.id, fetched));
          await new Promise((resolve) =>
            setTimeout(resolve, PRELOAD_INTERVAL_MS),
          );
        } catch (error) {
          logger.warn("Failed to preload daily report:", error);
        }
      }
    };

    void preloadReports();
    return () => {
      mounted = false;
    };
  }, [
    open,
    filteredReports,
    preloadedReports,
    currentReport,
    fetchDailyReportById,
  ]);

  const selectedReactions = useMemo(() => {
    if (!reactionEntries || !currentStaffId) return [];
    return reactionEntries
      .filter((entry) => entry.staffId === currentStaffId)
      .map((entry) => entry.type as ReactionType);
  }, [currentStaffId, reactionEntries]);

  const reactions = useMemo(() => report?.reactions ?? [], [report]);
  const comments = useMemo(() => report?.comments ?? [], [report]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < filteredReports.length - 1 ? prev + 1 : prev,
    );
  }, [filteredReports.length]);

  return {
    currentIndex,
    report,
    setReport,
    isLoading,
    loadError,
    isStaffLoading,
    reactionEntries,
    setReactionEntries,
    commentEntries,
    setCommentEntries,
    selectedReactions,
    reactions,
    comments,
    staffs,
    currentStaffId,
    currentStaffName,
    isResolvingCurrentStaff,
    buildStaffName,
    handlePrevious,
    handleNext,
  };
}

export type UseDailyReportCarouselState = ReturnType<
  typeof useDailyReportCarouselState
>;

export type DailyReportCarouselInteractionDeps = Pick<
  UseDailyReportCarouselState,
  | "report"
  | "reactionEntries"
  | "commentEntries"
  | "setReport"
  | "setReactionEntries"
  | "setCommentEntries"
  | "currentStaffId"
  | "currentStaffName"
  | "isResolvingCurrentStaff"
  | "staffs"
  | "buildStaffName"
>;

export type DailyReportCarouselStaffs = StaffType[];
