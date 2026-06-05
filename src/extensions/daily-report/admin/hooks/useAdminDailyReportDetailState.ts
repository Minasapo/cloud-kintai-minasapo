import { AuthContext } from "@app/providers/auth/AuthContext";
import {
  logDailyReportCommentAdd,
  logDailyReportReactionUpdate,
} from "@entities/operation-log/model/dailyReportOperationLog";
import useCognitoUser from "@entities/staff/model/useCognitoUser";
import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { sendDailyReportCommentNotification } from "@extensions/daily-report/features/lib/sendDailyReportCommentNotification";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { getDailyReport } from "@shared/api/graphql/documents/queries";
import type {
  DailyReportComment,
  DailyReportReaction,
  GetDailyReportQuery,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import type { GraphQLResult } from "aws-amplify/api";
import {
  type Dispatch,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  type AdminDailyReport,
  mapDailyReport,
  normalizeComments,
  normalizeReactions,
  type ReactionType,
} from "../data";
import {
  addDailyReportComment,
  buildDailyReportBeforeSnapshot,
  updateDailyReportReaction,
} from "../services/dailyReportInteractionService";
import { useCurrentStaff } from "../useCurrentStaff";

const logger = createLogger("AdminDailyReportDetail");

type State = {
  report: AdminDailyReport | null;
  isLoading: boolean;
  loadError: string | null;
  reactionEntries: DailyReportReaction[] | null;
  commentEntries: DailyReportComment[] | null;
  commentInput: string;
  actionError: string | null;
  isSavingReaction: boolean;
  isSavingComment: boolean;
};

type Action =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      report: AdminDailyReport;
      reactionEntries: DailyReportReaction[];
      commentEntries: DailyReportComment[];
    }
  | { type: "FETCH_ERROR"; error: string; clearReport: boolean }
  | { type: "SET_COMMENT_INPUT"; value: string }
  | { type: "CLEAR_ACTION_ERROR" }
  | { type: "SET_ACTION_ERROR"; error: string }
  | { type: "REACTION_START" }
  | {
      type: "REACTION_SUCCESS";
      report: AdminDailyReport;
      reactionEntries: DailyReportReaction[];
      commentEntries: DailyReportComment[];
    }
  | { type: "REACTION_ERROR"; error: string }
  | { type: "COMMENT_START" }
  | {
      type: "COMMENT_SUCCESS";
      report: AdminDailyReport;
      reactionEntries: DailyReportReaction[];
      commentEntries: DailyReportComment[];
    }
  | { type: "COMMENT_ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, loadError: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        report: action.report,
        reactionEntries: action.reactionEntries,
        commentEntries: action.commentEntries,
        commentInput: "",
        isLoading: false,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        loadError: action.error,
        report: action.clearReport ? null : state.report,
        reactionEntries: null,
        commentEntries: null,
        isLoading: false,
      };
    case "SET_COMMENT_INPUT":
      return { ...state, commentInput: action.value };
    case "CLEAR_ACTION_ERROR":
      return { ...state, actionError: null };
    case "SET_ACTION_ERROR":
      return { ...state, actionError: action.error };
    case "REACTION_START":
      return { ...state, isSavingReaction: true, actionError: null };
    case "REACTION_SUCCESS":
      return {
        ...state,
        report: action.report,
        reactionEntries: action.reactionEntries,
        commentEntries: action.commentEntries,
        isSavingReaction: false,
      };
    case "REACTION_ERROR":
      return {
        ...state,
        isSavingReaction: false,
        actionError: action.error,
      };
    case "COMMENT_START":
      return { ...state, isSavingComment: true, actionError: null };
    case "COMMENT_SUCCESS":
      return {
        ...state,
        report: action.report,
        reactionEntries: action.reactionEntries,
        commentEntries: action.commentEntries,
        commentInput: "",
        isSavingComment: false,
      };
    case "COMMENT_ERROR":
      return {
        ...state,
        isSavingComment: false,
        actionError: action.error,
      };
  }
}

type ReportInteractionDeps = {
  state: State;
  dispatch: Dispatch<Action>;
  currentStaffId: string | null;
  currentStaffName: string;
  isResolvingCurrentStaff: boolean;
  buildStaffName: (staffId: string) => string;
  staffs: StaffType[];
};

function useReportInteractions({
  state,
  dispatch,
  currentStaffId,
  currentStaffName,
  isResolvingCurrentStaff,
  buildStaffName,
  staffs,
}: ReportInteractionDeps) {
  const handleToggleReaction = async (type: ReactionType) => {
      if (!state.report) return;
      if (!state.reactionEntries) {
        dispatch({
          type: "SET_ACTION_ERROR",
          error:
            "リアクション情報の取得中です。少し待ってから再度お試しください。",
        });
        return;
      }
      if (!currentStaffId || isResolvingCurrentStaff) {
        dispatch({
          type: "SET_ACTION_ERROR",
          error:
            "スタッフ情報が取得できないため、リアクションを登録できません。",
        });
        return;
      }
      if (state.isSavingReaction) return;

      dispatch({ type: "REACTION_START" });

      try {
        const beforeReport = buildDailyReportBeforeSnapshot(
          state.report,
          state.reactionEntries,
          state.commentEntries,
        );
        const { updated, operation } = await updateDailyReportReaction({
          report: state.report,
          reactionEntries: state.reactionEntries,
          currentStaffId,
          type,
        });

        await logDailyReportReactionUpdate({
          actorStaffId: currentStaffId,
          before: beforeReport,
          after: updated,
          operation,
          reactionType: type,
        });

        dispatch({
          type: "REACTION_SUCCESS",
          report: mapDailyReport(updated, buildStaffName(updated.staffId)),
          reactionEntries: normalizeReactions(updated.reactions),
          commentEntries: normalizeComments(updated.comments),
        });
      } catch (error) {
        dispatch({
          type: "REACTION_ERROR",
          error:
            error instanceof Error
              ? error.message
              : "リアクションの登録に失敗しました。",
        });
      }
  };

  const handleSubmitComment = async () => {
    const body = state.commentInput.trim();
    if (!body || !state.report) return;
    if (!state.commentEntries) {
      dispatch({
        type: "SET_ACTION_ERROR",
        error:
          "コメント情報の取得中です。少し待ってから再度お試しください。",
      });
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      dispatch({
        type: "SET_ACTION_ERROR",
        error: "スタッフ情報が取得できないため、コメントを登録できません。",
      });
      return;
    }
    if (state.isSavingComment) return;

    dispatch({ type: "COMMENT_START" });

    try {
      const beforeReport = buildDailyReportBeforeSnapshot(
        state.report,
        state.reactionEntries,
        state.commentEntries,
      );
      const { updated, addedComment } = await addDailyReportComment({
        report: state.report,
        commentEntries: state.commentEntries,
        currentStaffId,
        currentStaffName,
        body,
      });

      try {
        await sendDailyReportCommentNotification({
          staffs,
          report: updated,
          commentAuthorName: currentStaffName,
          commentBody: body,
        });
      } catch (mailError) {
        logger.error("Failed to send daily report comment notification:", mailError);
      }

      await logDailyReportCommentAdd({
        actorStaffId: currentStaffId,
        before: beforeReport,
        after: updated,
        comment: addedComment,
      });

      dispatch({
        type: "COMMENT_SUCCESS",
        report: mapDailyReport(updated, buildStaffName(updated.staffId)),
        reactionEntries: normalizeReactions(updated.reactions),
        commentEntries: normalizeComments(updated.comments),
      });
    } catch (error) {
      dispatch({
        type: "COMMENT_ERROR",
        error:
          error instanceof Error
            ? error.message
            : "コメントの登録に失敗しました。",
      });
    }
  };

  return { handleToggleReaction, handleSubmitComment };
}

export function useAdminDailyReportDetailState(
  id: string | undefined,
  initialReport: AdminDailyReport | null,
) {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: isStaffLoading } = useStaffs({ isAuthenticated });
  const { cognitoUser } = useCognitoUser();
  const {
    currentStaffId,
    currentStaffName,
    isResolving: isResolvingCurrentStaff,
  } = useCurrentStaff(cognitoUser);

  const stateReportId = initialReport?.id ?? null;

  const [state, dispatch] = useReducer(reducer, {
    report: initialReport,
    isLoading: !initialReport,
    loadError: null,
    reactionEntries: null,
    commentEntries: null,
    commentInput: "",
    actionError: null,
    isSavingReaction: false,
    isSavingComment: false,
  });

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

  // Derive report with up-to-date author from staffs list (eliminates author-update useEffect)
  const report = useMemo(
    () =>
      state.report
        ? { ...state.report, author: buildStaffName(state.report.staffId) }
        : null,
    [state.report, buildStaffName],
  );

  const reactions = useMemo(() => report?.reactions ?? [], [report]);
  const comments = useMemo(() => report?.comments ?? [], [report]);

  const selectedReactions = useMemo(() => {
    if (!state.reactionEntries || !currentStaffId) return [];
    return state.reactionEntries
      .filter((entry) => entry.staffId === currentStaffId)
      .map((entry) => entry.type as ReactionType);
  }, [state.reactionEntries, currentStaffId]);

  const fetchReport = useCallback(async () => {
    if (!id) return;
    dispatch({ type: "FETCH_START" });
    try {
      const response = (await graphqlClient.graphql({
        query: getDailyReport,
        variables: { id },
        authMode: "userPool",
      })) as GraphQLResult<GetDailyReportQuery>;

      if (response.errors?.length) {
        throw new Error(response.errors.map((err) => err.message).join("\n"));
      }

      const record = response.data?.getDailyReport;
      if (!record) throw new Error("日報が見つかりませんでした。");

      dispatch({
        type: "FETCH_SUCCESS",
        report: mapDailyReport(record, buildStaffName(record.staffId)),
        reactionEntries: normalizeReactions(record.reactions),
        commentEntries: normalizeComments(record.comments),
      });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        error:
          error instanceof Error ? error.message : "日報の取得に失敗しました。",
        clearReport: !stateReportId,
      });
    }
  }, [buildStaffName, id, stateReportId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const { handleToggleReaction, handleSubmitComment } = useReportInteractions({
    state,
    dispatch,
    currentStaffId,
    currentStaffName,
    isResolvingCurrentStaff,
    buildStaffName,
    staffs,
  });

  const chipsDisabled = useMemo(
    () =>
      !state.reactionEntries ||
      !currentStaffId ||
      state.isSavingReaction ||
      isResolvingCurrentStaff,
    [
      state.reactionEntries,
      currentStaffId,
      state.isSavingReaction,
      isResolvingCurrentStaff,
    ],
  );

  const isCommentDisabled = useMemo(
    () =>
      !state.commentInput.trim() ||
      !currentStaffId ||
      !state.commentEntries ||
      state.isSavingComment ||
      isResolvingCurrentStaff,
    [
      state.commentInput,
      currentStaffId,
      state.commentEntries,
      state.isSavingComment,
      isResolvingCurrentStaff,
    ],
  );

  const shouldShowLoading = !report && (state.isLoading || isStaffLoading);

  return {
    report,
    reactions,
    comments,
    selectedReactions,
    commentInput: state.commentInput,
    actionError: state.actionError,
    loadError: state.loadError,
    reactionEntries: state.reactionEntries,
    commentEntries: state.commentEntries,
    isResolvingCurrentStaff,
    chipsDisabled,
    isCommentDisabled,
    shouldShowLoading,
    handleToggleReaction,
    handleSubmitComment,
    setCommentInput: (value: string) =>
      dispatch({ type: "SET_COMMENT_INPUT", value }),
    clearActionError: () => dispatch({ type: "CLEAR_ACTION_ERROR" }),
  };
}
