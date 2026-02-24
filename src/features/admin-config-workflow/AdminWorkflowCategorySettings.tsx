import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import {
  getDefaultWorkflowCategoryOrder,
  type WorkflowCategoryOrderItem,
} from "@/entities/workflow/lib/workflowLabels";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

const resetDisplayOrder = (
  items: WorkflowCategoryOrderItem[],
): WorkflowCategoryOrderItem[] =>
  items.map((item, index) => ({
    ...item,
    displayOrder: index,
  }));

const moveItem = (
  items: WorkflowCategoryOrderItem[],
  from: number,
  to: number,
): WorkflowCategoryOrderItem[] => {
  if (to < 0 || to >= items.length) {
    return items;
  }

  const moved = items[from];
  if (!moved) {
    return items;
  }

  const withoutMoved = items.toSpliced(from, 1);
  const next = withoutMoved.toSpliced(to, 0, moved);
  return resetDisplayOrder(next);
};

export default function AdminWorkflowCategorySettings() {
  const dispatch = useAppDispatchV2();
  const { getWorkflowCategoryOrder, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);

  const [configId, setConfigId] = useState<string | null>(null);
  const [items, setItems] = useState<WorkflowCategoryOrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(getWorkflowCategoryOrder());
    setConfigId(getConfigId());
  }, [getConfigId, getWorkflowCategoryOrder]);

  const hasChanges = useMemo(() => {
    const current = JSON.stringify(resetDisplayOrder(items));
    const original = JSON.stringify(
      resetDisplayOrder(getWorkflowCategoryOrder()),
    );
    return current !== original;
  }, [getWorkflowCategoryOrder, items]);

  const handleToggleEnabled = (index: number) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const handleReset = () => {
    setItems(getDefaultWorkflowCategoryOrder());
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    const workflowCategoryOrder = {
      categories: resetDisplayOrder(items).map((item) => ({
        category: item.category,
        label: item.label,
        displayOrder: item.displayOrder,
        enabled: item.enabled,
      })),
    };

    try {
      if (configId) {
        await saveConfig({
          id: configId,
          workflowCategoryOrder,
        } as UpdateAppConfigInput);
      } else {
        await saveConfig({
          name: "default",
          workflowCategoryOrder,
        } as CreateAppConfigInput);
      }
      await fetchConfig();
      setConfigId(getConfigId());
      dispatch(setSnackbarSuccess("ワークフロー種別設定を保存しました。"));
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError("ワークフロー種別設定の保存に失敗しました。"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h6">ワークフロー種別</Typography>
        <Typography variant="body2" color="text.secondary">
          表示順序の変更と有効/無効の切り替えを行えます。
        </Typography>
      </Stack>

      <Alert severity="info">
        並び順は新規申請画面とワークフロー一覧の種別フィルタに反映されます。
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <Stack
              key={item.category}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: 24 }}
                >
                  {index + 1}
                </Typography>
                <Typography variant="body1">{item.label}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  size="small"
                  onClick={() =>
                    setItems((prev) => moveItem(prev, index, index - 1))
                  }
                  disabled={index === 0}
                  aria-label={`${item.label}を上へ移動`}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    setItems((prev) => moveItem(prev, index, index + 1))
                  }
                  disabled={index === items.length - 1}
                  aria-label={`${item.label}を下へ移動`}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <FormControlLabel
                  control={
                    <Switch
                      checked={item.enabled}
                      onChange={() => handleToggleEnabled(index)}
                    />
                  }
                  label={item.enabled ? "有効" : "無効"}
                  sx={{ ml: 1 }}
                />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        sx={{ pb: 4 }}
      >
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          disabled={saving}
        >
          デフォルトに戻す
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "保存中..." : "保存"}
        </Button>
      </Stack>
    </Stack>
  );
}
