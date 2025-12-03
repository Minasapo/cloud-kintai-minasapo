import { GraphQLResult } from "@aws-amplify/api";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { API } from "aws-amplify";
import { useEffect, useMemo, useState } from "react";

import type {
  CreateDailyReportMutation,
  DailyReportsByStaffIdQuery,
  UpdateDailyReportMutation,
} from "@/API";
import { DailyReportStatus } from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import { createDailyReport, updateDailyReport } from "@/graphql/mutations";
import { dailyReportsByStaffId } from "@/graphql/queries";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

interface QuickDailyReportCardProps {
  staffId: string | null | undefined;
  date: string;
}

export default function QuickDailyReportCard({
  staffId,
  date,
}: QuickDailyReportCardProps) {
  const dispatch = useAppDispatchV2();
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const defaultTitle = useMemo(() => `${date}の日報`, [date]);
  const isEditable = Boolean(staffId) && !isLoading;
  const isDirty = content !== savedContent;
  const contentPanelId = useMemo(() => `quick-daily-report-${date}`, [date]);

  useEffect(() => {
    if (!staffId) {
      setReportId(null);
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
        const response = (await API.graphql({
          query: dailyReportsByStaffId,
          variables: {
            staffId,
            reportDate: { eq: date },
            limit: 1,
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<DailyReportsByStaffIdQuery>;

        if (!mounted) return;

        if (response.errors?.length) {
          throw new Error(response.errors.map((err) => err.message).join("\n"));
        }

        const report =
          response.data?.dailyReportsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => Boolean(item)
          )[0] ?? null;

        if (!mounted) return;

        if (report) {
          const nextContent = report.content ?? "";
          setReportId(report.id);
          setContent(nextContent);
          setSavedContent(nextContent);
        } else {
          setReportId(null);
          setContent("");
          setSavedContent("");
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "日報の取得に失敗しました。"
        );
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
  }, [staffId, date]);

  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  const handleSave = async () => {
    if (!staffId || !isDirty) return;

    setIsSaving(true);
    setError(null);

    try {
      if (reportId) {
        const response = (await API.graphql({
          query: updateDailyReport,
          variables: {
            input: {
              id: reportId,
              content,
              updatedAt: new Date().toISOString(),
            },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<UpdateDailyReportMutation>;

        if (response.errors?.length) {
          throw new Error(response.errors.map((err) => err.message).join("\n"));
        }

        const updatedContent =
          response.data?.updateDailyReport?.content ?? content;
        setSavedContent(updatedContent);
        setContent(updatedContent);
      } else {
        const response = (await API.graphql({
          query: createDailyReport,
          variables: {
            input: {
              staffId,
              reportDate: date,
              title: defaultTitle,
              content,
              status: DailyReportStatus.DRAFT,
              updatedAt: new Date().toISOString(),
              reactions: [],
              comments: [],
            },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<CreateDailyReportMutation>;

        if (response.errors?.length) {
          throw new Error(response.errors.map((err) => err.message).join("\n"));
        }

        const created = response.data?.createDailyReport;
        const nextContent = created?.content ?? content;
        setReportId(created?.id ?? null);
        setSavedContent(nextContent);
        setContent(nextContent);
      }

      dispatch(setSnackbarSuccess("日報を保存しました"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "日報の保存に失敗しました。";
      setError(message);
      dispatch(setSnackbarError("日報の保存に失敗しました"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setContent(savedContent);
    setError(null);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const renderSaveIcon = () => {
    if (!isSaving) {
      return <CheckIcon fontSize="small" />;
    }
    return <CircularProgress size={18} />;
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <IconButton
            size="small"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls={contentPanelId}
            sx={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Stack
            spacing={0.25}
            flexGrow={1}
            onClick={handleToggle}
            sx={{ cursor: "pointer" }}
          >
            <Typography variant="subtitle2">今日の日報メモ</Typography>
            <Typography variant="caption" color="text.secondary">
              {date} / {reportId ? "既存データを更新" : "新規作成"}
            </Typography>
          </Stack>
          {isOpen && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="入力をキャンセル">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    disabled={!isEditable || !isDirty || isSaving}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="保存">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={handleSave}
                    disabled={!isEditable || !isDirty || isSaving}
                  >
                    {renderSaveIcon()}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Stack spacing={1} mt={1} id={contentPanelId}>
            {isLoading && <LinearProgress />}
            <TextField
              multiline
              minRows={4}
              fullWidth
              placeholder={
                staffId
                  ? "今日の振り返りや共有事項をここに入力できます"
                  : "スタッフ情報を読み込み中です"
              }
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={!staffId || isLoading}
            />
            <Typography variant="caption" color="text.secondary">
              他の日報は、日報ページから編集・閲覧できます。
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}
