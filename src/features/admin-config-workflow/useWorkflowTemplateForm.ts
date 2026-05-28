import { useAppDispatchV2 } from "@app/hooks";
import { createLogger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useMemo, useState } from "react";

const logger = createLogger("WorkflowTemplateForm");

type Template = { id: string; name: string; title: string; content: string };

type Params = {
  templates: Template[];
  createTemplate: (params: {
    name: string;
    title: string;
    content: string;
  }) => Promise<unknown>;
  updateTemplate: (params: {
    id: string;
    name: string;
    title: string;
    content: string;
  }) => Promise<unknown>;
  removeTemplate: (id: string) => Promise<void>;
};

export function useWorkflowTemplateForm({
  templates,
  createTemplate,
  updateTemplate,
  removeTemplate,
}: Params) {
  const dispatch = useAppDispatchV2();
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [templateSaving, setTemplateSaving] = useState(false);
  const [initialTemplateName, setInitialTemplateName] = useState("");
  const [initialTemplateTitle, setInitialTemplateTitle] = useState("");
  const [initialTemplateContent, setInitialTemplateContent] = useState("");
  const [templateDeleteConfirmOpen, setTemplateDeleteConfirmOpen] =
    useState(false);
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(
    null,
  );

  const hasTemplateChanges =
    templateName !== initialTemplateName ||
    templateTitle !== initialTemplateTitle ||
    templateContent !== initialTemplateContent;

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateTitle("");
    setTemplateContent("");
    setEditingTemplateId(null);
    setInitialTemplateName("");
    setInitialTemplateTitle("");
    setInitialTemplateContent("");
  };

  const handleTemplateSubmit = async () => {
    const normalizedName = templateName.trim();
    const normalizedTitle = templateTitle.trim();
    const normalizedContent = templateContent.trim();

    if (!normalizedName || !normalizedTitle || !normalizedContent) {
      dispatch(
        pushNotification({
          tone: "error",
          message:
            "テンプレート名・タイトルテンプレート・詳細内容テンプレートを入力してください。",
        }),
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
        dispatch(
          pushNotification({
            tone: "success",
            message: "テンプレートを更新しました。",
          }),
        );
      } else {
        await createTemplate({
          name: normalizedName,
          title: normalizedTitle,
          content: normalizedContent,
        });
        dispatch(
          pushNotification({
            tone: "success",
            message: "テンプレートを作成しました。",
          }),
        );
      }

      resetTemplateForm();
    } catch (error) {
      logger.error("Failed to save template", error);
      dispatch(
        pushNotification({
          tone: "error",
          message: "テンプレートの保存に失敗しました。",
        }),
      );
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
    setInitialTemplateName(target.name);
    setInitialTemplateTitle(target.title);
    setInitialTemplateContent(target.content);
  };

  const handleTemplateDelete = (templateId: string) => {
    setPendingDeleteTemplateId(templateId);
    setTemplateDeleteConfirmOpen(true);
  };

  const handleCancelTemplateDelete = () => {
    setTemplateDeleteConfirmOpen(false);
    setPendingDeleteTemplateId(null);
  };

  const templateDeleteConfirmMessage = useMemo(() => {
    if (!pendingDeleteTemplateId) {
      return "";
    }

    const target = templates.find((template) => template.id === pendingDeleteTemplateId);
    if (!target) {
      return "";
    }

    return `テンプレート「${target.name}」を削除します。よろしいですか？`;
  }, [pendingDeleteTemplateId, templates]);

  const handleConfirmTemplateDelete = async () => {
    if (!pendingDeleteTemplateId) {
      return;
    }

    const templateId = pendingDeleteTemplateId;
    setTemplateDeleteConfirmOpen(false);
    setPendingDeleteTemplateId(null);

    try {
      await removeTemplate(templateId);
      if (editingTemplateId === templateId) {
        resetTemplateForm();
      }
      dispatch(
        pushNotification({
          tone: "success",
          message: "テンプレートを削除しました。",
        }),
      );
    } catch (error) {
      logger.error("Failed to delete template", error);
      dispatch(
        pushNotification({
          tone: "error",
          message: "テンプレートの削除に失敗しました。",
        }),
      );
    }
  };

  return {
    templateName,
    setTemplateName,
    templateTitle,
    setTemplateTitle,
    templateContent,
    setTemplateContent,
    editingTemplateId,
    templateSaving,
    hasTemplateChanges,
    resetTemplateForm,
    handleTemplateSubmit,
    handleTemplateEdit,
    handleTemplateDelete,
    templateDeleteConfirmOpen,
    templateDeleteConfirmMessage,
    handleConfirmTemplateDelete,
    handleCancelTemplateDelete,
  };
}
