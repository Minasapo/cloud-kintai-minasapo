import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  Avatar,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";

import { shouldTruncateWorkflowMessage } from "../model/workflowCommentUtils";
import type { WorkflowCommentMessage } from "../types";

type Props = {
  title?: string;
  messages: WorkflowCommentMessage[];
  staffs: StaffType[];
  currentStaff?: StaffType;
  expandedMessages: Record<string, boolean>;
  onToggle: (id: string) => void;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  formatSender: (sender?: string) => string;
};

const INITIAL_VISIBLE_COUNT = 30;
const LOAD_MORE_COUNT = 20;
const TOP_THRESHOLD_PX = 32;
const BOTTOM_STICK_THRESHOLD_PX = 64;

export default function WorkflowCommentThread({
  title = "コメント",
  messages,
  staffs,
  currentStaff,
  expandedMessages,
  onToggle,
  input,
  setInput,
  onSend,
  sending,
  formatSender,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const prependAnchorHeightRef = useRef<number | null>(null);

  const visibleMessages = useMemo(() => {
    const start = Math.max(messages.length - visibleCount, 0);
    return messages.slice(start);
  }, [messages, visibleCount]);

  const hasOlderMessages = visibleMessages.length < messages.length;

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (prependAnchorHeightRef.current !== null) {
      const heightDiff =
        container.scrollHeight - prependAnchorHeightRef.current;
      container.scrollTop += heightDiff;
      prependAnchorHeightRef.current = null;
      return;
    }

    if (stickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleMessages]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom <= BOTTOM_STICK_THRESHOLD_PX;

    if (
      container.scrollTop <= TOP_THRESHOLD_PX &&
      hasOlderMessages &&
      prependAnchorHeightRef.current === null
    ) {
      prependAnchorHeightRef.current = container.scrollHeight;
      setVisibleCount((prev) =>
        Math.min(prev + LOAD_MORE_COUNT, messages.length),
      );
    }
  };

  return (
    <Box sx={{ mt: { xs: 2, sm: 0 } }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Paper
        variant="outlined"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          p: 2,
          maxHeight: PANEL_HEIGHTS.SCROLLABLE_MAX,
          overflow: "auto",
          bgcolor: "background.paper",
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
            const expanded = Boolean(expandedMessages[m.id]);
            const long = shouldTruncateWorkflowMessage(m.text, expanded);

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
                      onClick={() => onToggle(m.id)}
                      sx={{ mt: 0.5 }}
                    >
                      {expanded ? "折りたたむ" : "もっと見る"}
                    </Button>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          placeholder="メッセージを入力..."
          helperText="Command+Enterで送信"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={sending}
          sx={{
            bgcolor: "background.paper",
            "& .MuiInputBase-root": {
              bgcolor: "background.paper",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={onSend}
                  disabled={sending || !input.trim()}
                  sx={{ textTransform: "none", minWidth: 64 }}
                >
                  送信
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
