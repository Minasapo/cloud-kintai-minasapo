import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Alert,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useMemo, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  getDefaultWorkflowCategoryOrder,
  type WorkflowCategoryOrderItem,
} from "@/entities/workflow/lib/workflowLabels";
import useWorkflowTemplates from "@/entities/workflow-template/model/useWorkflowTemplates";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";
import { formatDateSlash } from "@/shared/lib/time";

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
  const WORKFLOW_TEMPLATE_ORGANIZATION_ID = "default";
  const dispatch = useAppDispatchV2();
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { getWorkflowCategoryOrder, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const {
    templates,
    loading: templateLoading,
    error: templateError,
    createTemplate,
    updateTemplate,
    removeTemplate,
  } = useWorkflowTemplates({
    isAuthenticated,
    organizationId: WORKFLOW_TEMPLATE_ORGANIZATION_ID,
  });

  const [configId, setConfigId] = useState<string | null>(null);
  const [items, setItems] = useState<WorkflowCategoryOrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [templateSaving, setTemplateSaving] = useState(false);

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

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateTitle("");
    setTemplateContent("");
    setEditingTemplateId(null);
  };

  const handleTemplateSubmit = async () => {
    const normalizedName = templateName.trim();
    const normalizedTitle = templateTitle.trim();
    const normalizedContent = templateContent.trim();

    if (!normalizedName || !normalizedTitle || !normalizedContent) {
      dispatch(
        setSnackbarError(
          "テンプレート名・タイトルテンプレート・詳細内容テンプレートを入力してください。",
        ),
      );
      return;
    }

    if (templateSaving) {
      return;
    }

    setTemplateSaving(true);
    try {
      if (editingTemplateId) {
        await updateTemplate({
          id: editingTemplateId,
          name: normalizedName,
          title: normalizedTitle,
          content: normalizedContent,
        });
        dispatch(setSnackbarSuccess("テンプレートを更新しました。"));
      } else {
        await createTemplate({
          name: normalizedName,
          title: normalizedTitle,
          content: normalizedContent,
        });
        dispatch(setSnackbarSuccess("テンプレートを作成しました。"));
      }
      resetTemplateForm();
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError("テンプレートの保存に失敗しました。"));
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleTemplateEdit = (templateId: string) => {
    const target = templates.find((template) => template.id === templateId);
    if (!target) {
      return;
    }
    setEditingTemplateId(target.id);
    setTemplateName(target.name);
    setTemplateTitle(target.title);
    setTemplateContent(target.content);
  };

  const handleTemplateDelete = async (templateId: string) => {
    const target = templates.find((template) => template.id === templateId);
    if (!target) {
      return;
    }

    const confirmed = window.confirm(
      `テンプレート「${target.name}」を削除します。よろしいですか？`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await removeTemplate(templateId);
      if (editingTemplateId === templateId) {
        resetTemplateForm();
      }
      dispatch(setSnackbarSuccess("テンプレートを削除しました。"));
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError("テンプレートの削除に失敗しました。"));
    }
  };

  return (
    <AdminSettingsLayout>
      <div className="flex flex-col gap-10">
        {/* === ワークフロー種別 セクション === */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-slate-800">ワークフロー種別</h2>
            <p className="text-sm text-slate-500">
              表示順序の変更と有効/無効の切り替えを行えます。
            </p>
          </div>

          <Alert severity="info" className="mb-2">
            並び順は新規申請画面とワークフロー一覧の種別フィルタに反映されます。
          </Alert>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <div
                  key={item.category}
                  className="flex flex-row items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded transition-colors"
                >
                  <div className="flex flex-row items-center gap-2">
                    <span className="w-6 text-sm text-slate-400 text-center">
                      {index + 1}
                    </span>
                    <span className="text-base font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <button
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      onClick={() =>
                        setItems((prev) => moveItem(prev, index, index - 1))
                      }
                      disabled={index === 0}
                      aria-label={`${item.label}を上へ移動`}
                      type="button"
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </button>
                    <button
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      onClick={() =>
                        setItems((prev) => moveItem(prev, index, index + 1))
                      }
                      disabled={index === items.length - 1}
                      aria-label={`${item.label}を下へ移動`}
                      type="button"
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </button>
                    <div className="ml-2 min-w-[88px]">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.enabled}
                            onChange={() => handleToggleEnabled(index)}
                          />
                        }
                        label={item.enabled ? "有効" : "無効"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row justify-between pt-2">
            <button
              className="flex flex-row items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              onClick={handleReset}
              disabled={saving}
              type="button"
            >
              <RestartAltIcon fontSize="small" />
              <span>デフォルトに戻す</span>
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              type="button"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        {/* === ワークフローテンプレート セクション === */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-slate-800">ワークフローテンプレート</h2>
            <p className="text-sm text-slate-500">
              「その他」申請で利用するテンプレートを管理できます。新しいものが上に表示されます。
            </p>
          </div>

          <Alert severity="info" className="mb-2">
            テンプレート適用時は、申請フォームの入力内容を上書きする確認が表示されます。
          </Alert>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
                {editingTemplateId ? "テンプレート編集" : "テンプレート作成"}
              </h3>
              <TextField
                label="テンプレート名"
                size="small"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
              />
              <TextField
                label="タイトルテンプレート"
                size="small"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
              />
              <TextField
                label="詳細内容テンプレート"
                size="small"
                multiline
                minRows={5}
                value={templateContent}
                onChange={(event) => setTemplateContent(event.target.value)}
              />
              <div className="flex flex-row justify-end gap-2 pt-2">
                {editingTemplateId && (
                  <button
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={resetTemplateForm}
                    type="button"
                  >
                    キャンセル
                  </button>
                )}
                <button
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  onClick={handleTemplateSubmit}
                  disabled={templateSaving}
                  type="button"
                >
                  {templateSaving
                    ? "保存中..."
                    : editingTemplateId
                      ? "更新"
                      : "作成"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">テンプレート一覧</h3>
              {templateError && <Alert severity="error">{templateError}</Alert>}
              {templateLoading ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  読み込み中...
                </p>
              ) : templates.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  テンプレートはまだありません。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>テンプレート名</TableCell>
                        <TableCell>タイトルテンプレート</TableCell>
                        <TableCell>作成日</TableCell>
                        <TableCell align="right">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>{template.name}</TableCell>
                          <TableCell>{template.title}</TableCell>
                          <TableCell>{formatDateSlash(template.createdAt)}</TableCell>
                          <TableCell align="right">
                            <button
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition ml-1"
                              onClick={() => handleTemplateEdit(template.id)}
                              aria-label="テンプレートを編集"
                              type="button"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </button>
                            <button
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition ml-1"
                              onClick={() => handleTemplateDelete(template.id)}
                              aria-label="テンプレートを削除"
                              type="button"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
