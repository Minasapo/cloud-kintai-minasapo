import {
  logDailyReportCommentAdd,
  logDailyReportReactionUpdate,
} from "@entities/operation-log/model/dailyReportOperationLog";
import { sendDailyReportCommentNotification } from "@extensions/daily-report/features/lib/sendDailyReportCommentNotification";
import { createLogger } from "@shared/lib/logger";
import { useEffect, useState } from "react";

import { mapDailyReport, normalizeComments, normalizeReactions } from "../data";
import {
  addDailyReportComment,
  buildDailyReportBeforeSnapshot,
  updateDailyReportReaction,
} from "../services/dailyReportInteractionService";
import type { DailyReportCarouselInteractionDeps } from "./useDailyReportCarouselState";

const logger = createLogger("DailyReportCarousel");

export function useDailyReportCarouselInteractions({
  report,
  reactionEntries,
  commentEntries,
  setReport,
  setReactionEntries,
  setCommentEntries,
  currentStaffId,
  currentStaffName,
  isResolvingCurrentStaff,
  staffs,
  buildStaffName,
}: DailyReportCarouselInteractionDeps) {
  const [commentInput, setCommentInput] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingReaction, setIsSavingReaction] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    setCommentInput("");
  }, [report]);

  const handleToggleReaction = async (
    type: Parameters<typeof updateDailyReportReaction>[0]["type"],
  ) => {
    if (!report) return;
    if (!reactionEntries) {
      setActionError("リアクション情報の取得中です。少し待ってから再度お試しください。");
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError("スタッフ情報が取得できないため、リアクションを登録できません。");
      return;
    }
    if (isSavingReaction) return;

    setIsSavingReaction(true);
    setActionError(null);

    try {
      const beforeReport = buildDailyReportBeforeSnapshot(
        report,
        reactionEntries,
        commentEntries,
      );
      const { updated, operation } = await updateDailyReportReaction({
        report,
        reactionEntries,
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

      setReactionEntries(normalizeReactions(updated.reactions));
      setCommentEntries(normalizeComments(updated.comments));
      setReport(mapDailyReport(updated, buildStaffName(updated.staffId)));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "リアクションの登録に失敗しました。",
      );
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleSubmitComment = async () => {
    const body = commentInput.trim();
    if (!body) return;
    if (!report) return;
    if (!commentEntries) {
      setActionError("コメント情報の取得中です。少し待ってから再度お試しください。");
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError("スタッフ情報が取得できないため、コメントを登録できません。");
      return;
    }
    if (isSavingComment) return;

    setIsSavingComment(true);
    setActionError(null);

    try {
      const beforeReport = buildDailyReportBeforeSnapshot(
        report,
        reactionEntries,
        commentEntries,
      );
      const { updated, addedComment } = await addDailyReportComment({
        report,
        commentEntries,
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

      setReactionEntries(normalizeReactions(updated.reactions));
      setCommentEntries(normalizeComments(updated.comments));
      setReport(mapDailyReport(updated, buildStaffName(updated.staffId)));
      setCommentInput("");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "コメントの登録に失敗しました。",
      );
    } finally {
      setIsSavingComment(false);
    }
  };

  const chipsDisabled =
    !reactionEntries ||
    !currentStaffId ||
    isSavingReaction ||
    isResolvingCurrentStaff;
  const isCommentDisabled =
    !commentInput.trim() ||
    !currentStaffId ||
    !commentEntries ||
    isSavingComment ||
    isResolvingCurrentStaff;

  return {
    commentInput,
    actionError,
    chipsDisabled,
    isCommentDisabled,
    handleToggleReaction,
    handleSubmitComment,
    setCommentInput,
    clearActionError: () => setActionError(null),
  };
}
