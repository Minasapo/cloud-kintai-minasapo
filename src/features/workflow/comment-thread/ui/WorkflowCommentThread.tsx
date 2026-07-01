import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { useWorkflowDetailContext } from "@features/workflow/detail-panel/model/WorkflowDetailContext";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, InputBase } from "@mui/material";
import { PANEL_HEIGHTS } from "@shared/config/uiDimensions";
import { AppAvatar } from "@shared/ui/avatar";
import { AppIconButton } from "@shared/ui/button";
import dayjs from "dayjs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { shouldTruncateWorkflowMessage } from "../model/workflowCommentUtils";
import type { WorkflowCommentMessage } from "../types";

type Props = {
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

const MOBILE_BREAKPOINT_QUERY = "(max-width: 640px)";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }
    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
  });

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return isMobile;
};

type CommentMessageItemProps = {
  message: WorkflowCommentMessage;
  displayName: string;
  staff?: StaffType;
  isMine: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
};

function formatMessageTimeLabel(message: WorkflowCommentMessage) {
  const source = message.createdAt ?? message.time;
  if (!source) return "";

  const parsed = dayjs(source);
  if (!parsed.isValid()) return message.time;

  const now = dayjs();
  const elapsedSeconds = now.diff(parsed, "second");

  if (elapsedSeconds <= 0) return "今";
  if (elapsedSeconds < 60) return `${elapsedSeconds}秒前`;

  const elapsedMinutes = now.diff(parsed, "minute");
  if (elapsedMinutes < 60) return `${elapsedMinutes}分前`;

  const elapsedHours = now.diff(parsed, "hour");
  if (elapsedHours < 24) return `${elapsedHours}時間前`;

  const elapsedDays = now.startOf("day").diff(parsed.startOf("day"), "day");
  if (elapsedDays < 7) return `${elapsedDays}日前`;

  return parsed.format("M/D");
}

function CommentMessageItem({
  message,
  displayName,
  staff,
  isMine,
  expanded,
  onToggle,
}: CommentMessageItemProps) {
  const isSystem = message.staffId === "system";
  const isTruncated = shouldTruncateWorkflowMessage(message.text, expanded);
  const timeLabel = formatMessageTimeLabel(message);

  if (isSystem) {
    return (
      <div className="flex w-full flex-col items-center py-1">
        <p className="m-0 max-w-[90%] text-center text-xs font-medium text-slate-500">
          {message.text}
        </p>
        {timeLabel && (
          <span className="mt-0.5 text-[11px] text-slate-400">{timeLabel}</span>
        )}
      </div>
    );
  }

  const avatarText = (() => {
    const familyName = staff?.familyName?.trim();
    if (familyName) return familyName.slice(0, 1);

    const [surname] = displayName.trim().split(/\s+/);
    return surname?.slice(0, 1) || displayName.slice(0, 1);
  })();

  return (
    <div
      className={[
        "flex min-w-0 flex-col",
        isMine ? "items-end" : "items-start",
      ].join(" ")}
    >
      <div
        className={[
          "mb-1 flex min-w-0 items-center gap-3",
          isMine
            ? "ml-auto w-auto flex-row-reverse justify-end"
            : "w-full justify-start",
        ].join(" ")}
      >
        <AppAvatar
          size="small"
          sx={{
            flexShrink: 0,
            fontWeight: 600,
            bgcolor: isSystem
              ? "grey.500"
              : isMine
                ? "success.main"
                : "success.dark",
          }}
        >
          {avatarText}
        </AppAvatar>

        <div
          className={[
            "flex min-w-0 gap-1",
            isMine
              ? "flex-col items-end sm:flex-row-reverse sm:items-center"
              : "flex-col items-start sm:flex-row sm:items-center",
          ].join(" ")}
        >
          <span className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </span>
        </div>
      </div>

      <div
        className={[
          "min-w-0 max-w-full rounded-[10px] border px-4 py-3 text-sm leading-6 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.28)] sm:max-w-[90%]",
          isMine
            ? "border-emerald-800/30 bg-emerald-500 text-white"
            : "border-slate-300/60 bg-white text-slate-900",
        ].join(" ")}
      >
        <div
          className="whitespace-pre-wrap break-words"
          style={
            isTruncated
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : undefined
          }
        >
          {message.text}
        </div>

        {isTruncated && (
          <button
            type="button"
            onClick={() => onToggle(message.id)}
            className={[
              "mt-1 text-xs font-medium underline decoration-transparent transition hover:decoration-current",
              isMine ? "text-white" : "text-emerald-700",
            ].join(" ")}
          >
            {expanded ? "折りたたむ" : "もっと見る"}
          </button>
        )}
      </div>

      {timeLabel && (
        <span
          className={[
            "mt-1 text-xs text-slate-500",
            isMine ? "self-end text-right" : "self-start",
          ].join(" ")}
        >
          {timeLabel}
        </span>
      )}
    </div>
  );
}

type CommentInputAreaProps = {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  sending: boolean;
};

function CommentInputArea({
  input,
  setInput,
  onSend,
  sending,
}: CommentInputAreaProps) {
  const sendDisabled = sending || !input.trim();
  const isMultiline = input.includes("\n");

  return (
    <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <div className="relative">
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: 1.75,
              py: 1.25,
              pr: 5.5,
              backgroundColor: sending
                ? "action.disabledBackground"
                : "background.paper",
            }}
          >
            <InputBase
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  onSend();
                }
              }}
              disabled={sending}
              multiline
              minRows={1}
              maxRows={6}
              placeholder="メッセージを入力..."
              fullWidth
              sx={{
                alignItems: "flex-start",
                "& .MuiInputBase-input": {
                  p: 0,
                  lineHeight: 1.5,
                },
              }}
            />
          </Box>

          <div
            className={`absolute inset-y-0 right-1.5 z-10 flex ${
              isMultiline ? "items-end pb-1.5" : "items-center"
            }`}
          >
            <AppIconButton
              aria-label="送信"
              onClick={onSend}
              disabled={sendDisabled}
              size="sm"
              tone="primary"
              tooltip="Cmd/Ctrl+Enterで送信"
            >
              <SendRoundedIcon fontSize="small" />
            </AppIconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowCommentThreadView({
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
  const isMobile = useIsMobile();
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
    <div className="min-w-0">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-w-0 overflow-auto rounded-[14px] border border-slate-300/30 bg-slate-50 p-5"
        style={{
          maxHeight: isMobile ? 360 : PANEL_HEIGHTS.SCROLLABLE_MAX,
        }}
      >
        <div className="flex flex-col gap-4">
          {visibleMessages.map((message) => {
            const displayName = formatSender(message.sender);
            const staff = message.staffId
              ? staffs.find((item) => item.id === message.staffId)
              : undefined;
            const isMine = Boolean(
              currentStaff && message.staffId === currentStaff.id,
            );
            const expanded = Boolean(expandedMessages[message.id]);

            return (
              <CommentMessageItem
                key={message.id}
                message={message}
                displayName={displayName}
                staff={staff}
                isMine={isMine}
                expanded={expanded}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      </div>

      <CommentInputArea
        input={input}
        setInput={setInput}
        onSend={onSend}
        sending={sending}
      />
    </div>
  );
}

export default function WorkflowCommentThread() {
  const {
    workflow,
    staffs,
    currentStaff,
    messages,
    expandedMessages,
    toggleExpanded,
    input,
    setInput,
    sending,
    formatSender,
    sendMessage,
  } = useWorkflowDetailContext();

  return (
    <WorkflowCommentThreadView
      key={workflow?.id ?? "workflow-comment-thread"}
      messages={messages}
      staffs={staffs}
      currentStaff={currentStaff}
      expandedMessages={expandedMessages}
      onToggle={toggleExpanded}
      input={input}
      setInput={setInput}
      onSend={sendMessage}
      sending={sending}
      formatSender={formatSender}
    />
  );
}
