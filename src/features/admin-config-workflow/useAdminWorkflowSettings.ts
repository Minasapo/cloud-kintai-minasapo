import { useAppDispatchV2 } from "@app/hooks";
import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  getDefaultWorkflowCategoryOrder,
  type WorkflowCategoryOrderItem,
} from "@entities/workflow/lib/workflowLabels";
import useWorkflowTemplates from "@entities/workflow-template/model/useWorkflowTemplates";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useWorkflowTemplateForm } from "./useWorkflowTemplateForm";

const logger = createLogger("AdminWorkflowSettings");

const WORKFLOW_TEMPLATE_ORGANIZATION_ID = "default";
const CATEGORY_AUTO_SAVE_DELAY = 600;

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

export function useAdminWorkflowSettings() {
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
  const [categorySaveToken, setCategorySaveToken] = useState(0);

  const templateForm = useWorkflowTemplateForm({
    templates,
    createTemplate,
    updateTemplate,
    removeTemplate,
  });

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

  const persistWorkflowCategoryOrder = useCallback(
    async (nextItems: WorkflowCategoryOrderItem[]) => {
      setSaving(true);

      const workflowCategoryOrder = {
        categories: resetDisplayOrder(nextItems).map((item) => ({
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
      } catch (error) {
        logger.error("Failed to save workflow category order", error);
        dispatch(
          pushNotification({
            tone: "error",
            message: "ワークフロー種別設定の保存に失敗しました。",
          }),
        );
      } finally {
        setSaving(false);
      }
    },
    [configId, dispatch, fetchConfig, getConfigId, saveConfig],
  );

  useEffect(() => {
    if (categorySaveToken === 0 || !hasChanges) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void persistWorkflowCategoryOrder(items);
    }, CATEGORY_AUTO_SAVE_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [categorySaveToken, hasChanges, items, persistWorkflowCategoryOrder]);

  const handleToggleEnabled = (index: number) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item,
      ),
    );
    setCategorySaveToken((prev) => prev + 1);
  };

  const handleMoveItem = (from: number, to: number) => {
    setItems((prev) => moveItem(prev, from, to));
    setCategorySaveToken((prev) => prev + 1);
  };

  const handleReset = () => {
    setItems(getDefaultWorkflowCategoryOrder());
    setCategorySaveToken((prev) => prev + 1);
  };

  return {
    items,
    saving,
    hasChanges,
    templates,
    templateLoading,
    templateError,
    ...templateForm,
    isDirty: hasChanges || templateForm.hasTemplateChanges,
    isBusy: saving || templateForm.templateSaving,
    handleToggleEnabled,
    handleMoveItem,
    handleReset,
  };
}
