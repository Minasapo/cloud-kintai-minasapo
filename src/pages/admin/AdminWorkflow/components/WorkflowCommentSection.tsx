import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  GetWorkflowQuery,
  WorkflowComment,
  WorkflowCommentInput,
} from "@shared/api/graphql/types";
import { useEffect, useMemo, useState } from "react";

import { submitWorkflowComment } from "@/features/workflow/comment-thread/model/submitWorkflowComment";
import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type StaffLike = {
  id: string;
  cognitoUserId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  role?: string | null;
};

type CognitoUserLike = {
  id?: string | null;
  familyName?: string | null;
  givenName?: string | null;
};

type WorkflowCommentSectionProps = {
  workflow: WorkflowData | null;
  staffs: StaffLike[];
  cognitoUser?: CognitoUserLike | null;
  onWorkflowUpdated: (workflow: WorkflowData) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function WorkflowCommentSection({
  workflow,
  staffs,
  cognitoUser,
  onWorkflowUpdated,
  onSuccess,
  onError,
}: WorkflowCommentSectionProps) {
  const [messages, setMessages] = useState(
    [] as {
      id: string;
      sender: string;
      staffId?: string;
      text: string;
      time: string;
    }[],
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});

  const toggleExpanded = (id: string) =>
    setExpandedMessages((state) => ({ ...state, [id]: !state[id] }));

  const currentStaff = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((staff) => staff.cognitoUserId === cognitoUser.id);
  }, [cognitoUser, staffs]);

  const formatSender = (sender?: string) => {
    const value = sender ?? "";
    if (!value.trim()) return "システム";
    const low = value.trim().toLowerCase();
    if (low === "system" || low.startsWith("system") || low.includes("bot")) {
      return "システム";
    }
    return value;
  };

  const commentsToMessages = (
    comments?: Array<WorkflowComment | null> | null,
  ) => {
    if (!comments) {
      return [] as {
        id: string;
        sender: string;
        staffId?: string;
        text: string;
        time: string;
      }[];
    }

    return comments
      .filter((comment): comment is WorkflowComment => Boolean(comment))
      .map((comment) => {
        const staff = staffs.find((item) => item.id === comment.staffId);
        const sender = staff
          ? `${staff.familyName} ${staff.givenName}`
          : comment.staffId || "システム";
        const time = comment.createdAt
          ? new Date(comment.createdAt).toLocaleString()
          : "";

        return {
          id: comment.id || `c-${Date.now()}`,
          sender,
          staffId: comment.staffId,
          text: comment.text,
          time,
        };
      });
  };

  useEffect(() => {
    setMessages(commentsToMessages(workflow?.comments || []));
  }, [workflow, staffs]);

  const handleSend = async () => {
    if (sending || !input.trim() || !workflow?.id) return;

    const currentStaffLocal = cognitoUser?.id
      ? staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)
      : undefined;
    const senderDisplay = currentStaffLocal
      ? `${currentStaffLocal.familyName} ${currentStaffLocal.givenName}`
      : cognitoUser
        ? `${cognitoUser.familyName ?? ""} ${cognitoUser.givenName ?? ""}`.trim() ||
          "不明なユーザー"
        : "不明なユーザー";

    const newComment: WorkflowCommentInput = {
      id: `c-${Date.now()}`,
      staffId: currentStaffLocal?.id ?? cognitoUser?.id ?? "system",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const optimisticMessage = {
      id: newComment.id,
      sender: senderDisplay,
      staffId: newComment.staffId,
      text: newComment.text,
      time: new Date(newComment.createdAt).toLocaleString(),
    };

    setMessages((state) => [...state, optimisticMessage]);
    setInput("");
    setSending(true);

    try {
      const updated = await submitWorkflowComment({
        workflowId: workflow.id,
        newComment,
        actorStaffId: currentStaffLocal?.id ?? "system",
        actorDisplayName: senderDisplay,
        staffs,
      });
      onWorkflowUpdated(updated);
      setMessages(commentsToMessages(updated.comments || []));
      onSuccess("コメントを送信しました");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onError(message);
      setMessages((state) =>
        state.filter((messageItem) => messageItem.id !== optimisticMessage.id),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <WorkflowCommentThread
      messages={messages}
      staffs={staffs as StaffType[]}
      currentStaff={currentStaff as StaffType | undefined}
      expandedMessages={expandedMessages}
      onToggle={toggleExpanded}
      input={input}
      setInput={setInput}
      onSend={() => void handleSend()}
      sending={sending}
      formatSender={formatSender}
    />
  );
}
