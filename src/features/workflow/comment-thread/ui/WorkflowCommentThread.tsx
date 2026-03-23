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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 0.5,
          fontWeight: 700,
          color: "#020617",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 2, color: "#64748b" }}
      >
        申請に関するやり取りをこの場で記録します。
      </Typography>
      <Paper
        variant="outlined"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          p: 2.5,
          maxHeight: { xs: 360, sm: PANEL_HEIGHTS.SCROLLABLE_MAX },
          overflow: "auto",
          bgcolor: "#f8fafc",
          borderColor: "rgba(148, 163, 184, 0.22)",
          borderRadius: "20px",
          minWidth: 0,
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
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: isMine ? "row-reverse" : "row",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    gap: 1.25,
                    mb: 0.5,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: avatarBg,
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {avatarText}
                  </Avatar>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: isMine ? "row-reverse" : "row" },
                      alignItems: { xs: isMine ? "flex-end" : "flex-start", sm: "center" },
                      gap: { xs: 0.25, sm: 1 },
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {m.time}
                    </Typography>
                  </Box>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: isMine ? "#19b985" : "#ffffff",
                    color: isMine ? "#ffffff" : "#0f172a",
                    p: 1.5,
                    borderRadius: 3,
                    maxWidth: { xs: "100%", sm: "90%" },
                    minWidth: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    border: isMine ? "1px solid rgba(6, 95, 70, 0.28)" : "1px solid rgba(148, 163, 184, 0.2)",
                    boxShadow: isMine
                      ? "0 16px 30px -28px rgba(5, 150, 105, 0.5)"
                      : "0 16px 30px -28px rgba(15, 23, 42, 0.28)",
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
                      sx={{ mt: 0.5, color: isMine ? "#ffffff" : "#0f766e" }}
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

      <Box
        sx={{
          mt: 1,
          display: "flex",
          gap: 1.25,
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
              onSend();
            }
          }}
          disabled={sending}
          sx={{
            bgcolor: "transparent",
            "& .MuiInputBase-root": {
              bgcolor: "#ffffff",
              borderRadius: "18px",
            },
            "& .MuiFormHelperText-root": {
              marginLeft: "4px",
              color: "#64748b",
            },
          }}
          InputProps={
            isMobile
              ? undefined
              : {
                  endAdornment: (
                    <InputAdornment position="end">
                      <button
                        type="button"
                        onClick={onSend}
                        disabled={sending || !input.trim()}
                        className="inline-flex min-w-[88px] items-center justify-center rounded-full border border-emerald-700/55 bg-[#19b985] px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(5,150,105,0.55)] transition hover:bg-[#17ab7b] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                      >
                        送信
                      </button>
                    </InputAdornment>
                  ),
                }
          }
        />
        {isMobile && (
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !input.trim()}
            className="inline-flex w-full items-center justify-center rounded-full border border-emerald-700/55 bg-[#19b985] px-6 py-3 text-base font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(5,150,105,0.55)] transition hover:bg-[#17ab7b] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            送信
          </button>
        )}
      </Box>
    </Box>
  );
}
