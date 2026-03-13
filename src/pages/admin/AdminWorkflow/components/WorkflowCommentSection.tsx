import {
  Avatar,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GetWorkflowQuery,
  WorkflowComment,
  WorkflowCommentInput,
} from "@shared/api/graphql/types";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { submitWorkflowComment } from "@/features/workflow/comment-thread/model/submitWorkflowComment";
import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";

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

const INITIAL_VISIBLE_COUNT = 30;
const LOAD_MORE_COUNT = 20;
const TOP_THRESHOLD_PX = 32;
const BOTTOM_STICK_THRESHOLD_PX = 64;

export default function WorkflowCommentSection({
  workflow,
  staffs,
  cognitoUser,
  onWorkflowUpdated,
  onSuccess,
  onError,
}: WorkflowCommentSectionProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [prependAnchorHeight, setPrependAnchorHeight] = useState<number | null>(
    null,
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  const toggleExpanded = (id: string) =>
    setExpandedMessages((s) => ({ ...s, [id]: !s[id] }));

  const currentStaff = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((s) => s.cognitoUserId === cognitoUser.id);
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
      .filter((c): c is WorkflowComment => Boolean(c))
      .map((c) => {
        const staff = staffs.find((s) => s.id === c.staffId);
        const sender = staff
          ? `${staff.familyName} ${staff.givenName}`
          : c.staffId || "システム";
        const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : "";

        return {
          id: c.id || `c-${Date.now()}`,
          sender,
          staffId: c.staffId,
          text: c.text,
          time,
        };
      });
  };

  useEffect(() => {
    setMessages(commentsToMessages(workflow?.comments || []));
  }, [workflow, staffs]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setPrependAnchorHeight(null);
    stickToBottomRef.current = true;
  }, [workflow?.id]);

  const visibleMessages = useMemo(() => {
    const start = Math.max(messages.length - visibleCount, 0);
    return messages.slice(start);
  }, [messages, visibleCount]);

  const hasOlderMessages = visibleMessages.length < messages.length;

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (prependAnchorHeight !== null) {
      const heightDiff = container.scrollHeight - prependAnchorHeight;
      container.scrollTop += heightDiff;
      setPrependAnchorHeight(null);
      return;
    }

    if (stickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleMessages, prependAnchorHeight]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom <= BOTTOM_STICK_THRESHOLD_PX;

    if (
      container.scrollTop <= TOP_THRESHOLD_PX &&
      hasOlderMessages &&
      prependAnchorHeight === null
    ) {
      setPrependAnchorHeight(container.scrollHeight);
      setVisibleCount((prev) =>
        Math.min(prev + LOAD_MORE_COUNT, messages.length),
      );
    }
  };

  const handleSend = async () => {
    if (sending) return;
    if (!input.trim()) return;
    if (!workflow?.id) return;

    const currentStaffLocal = cognitoUser?.id
      ? staffs.find((s) => s.cognitoUserId === cognitoUser.id)
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

    const optimisticMsg = {
      id: newComment.id,
      sender: senderDisplay,
      staffId: newComment.staffId,
      text: newComment.text,
      time: new Date(newComment.createdAt).toLocaleString(),
    };

    setMessages((m) => [...m, optimisticMsg]);
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
      setMessages((m) => m.filter((mm) => mm.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const sendMessage = () => void handleSend();

  return (
    <Box sx={{ mt: { xs: 2, sm: 0 } }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        コメント
      </Typography>
      <Paper
        variant="outlined"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          p: 2,
          maxHeight: { xs: 360, sm: PANEL_HEIGHTS.SCROLLABLE_MAX },
          overflow: "auto",
        }}
      >
        <Stack spacing={2}>
          {visibleMessages.map((m) => {
            const displayName = formatSender(m.sender);
            const staff = m.staffId
              ? staffs.find((s) => s.id === m.staffId)
              : undefined;
            const avatarText = staff
              ? `${(staff.familyName || "").slice(0, 1)}${(
                  staff.givenName || ""
                ).slice(0, 1)}` || displayName.slice(0, 1)
              : displayName.slice(0, 1);
            const isSystem = m.staffId === "system";
            const isMine = Boolean(
              currentStaff && m.staffId === currentStaff.id,
            );
            const avatarBg = isSystem
              ? "grey.500"
              : isMine
                ? "primary.main"
                : "secondary.main";
            const long =
              (m.text.split("\n").length > 5 || m.text.length > 800) &&
              !expandedMessages[m.id];

            return (
              <Box
                key={m.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  {!isMine && (
                    <Avatar
                      sx={{
                        bgcolor: avatarBg,
                        width: 32,
                        height: 32,
                        fontSize: 12,
                      }}
                    >
                      {avatarText}
                    </Avatar>
                  )}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {displayName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {m.time}
                  </Typography>
                  {isMine && (
                    <Avatar
                      sx={{
                        bgcolor: avatarBg,
                        width: 32,
                        height: 32,
                        fontSize: 12,
                        ml: 1,
                      }}
                    >
                      {avatarText}
                    </Avatar>
                  )}
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: isMine ? "primary.main" : "grey.100",
                    color: isMine ? "common.white" : "text.primary",
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "90%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      display: long ? "-webkit-box" : "block",
                      WebkitLineClamp: long ? 5 : "none",
                      WebkitBoxOrient: long ? "vertical" : "initial",
                      overflow: long ? "hidden" : "visible",
                    }}
                  >
                    {m.text}
                  </Typography>
                  {long && (
                    <Button
                      size="small"
                      onClick={() => toggleExpanded(m.id)}
                      sx={{ mt: 0.5 }}
                    >
                      {expandedMessages[m.id] ? "折りたたむ" : "もっと見る"}
                    </Button>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
          flexDirection: "column",
        }}
      >
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          placeholder="メッセージを入力..."
          helperText="Cmd/Ctrl+Enterで送信"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={sending}
          InputProps={
            isMobile
              ? undefined
              : {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={sendMessage}
                        disabled={sending || !input.trim()}
                        sx={{ textTransform: "none", minWidth: 64 }}
                      >
                        送信
                      </Button>
                    </InputAdornment>
                  ),
                }
          }
        />
        {isMobile && (
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            sx={{ width: 1, textTransform: "none" }}
          >
            送信
          </Button>
        )}
      </Box>
    </Box>
  );
}
