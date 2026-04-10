/**
 * 既存の Workflow レコードから動的フォームの fields マップを初期化するユーティリティ。
 * WorkflowEdit / useWorkflowEditLoaderState で使用する。
 */
import type { WorkflowEntity } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import { isoDateFromTimestamp, parseTimeToISO } from "@shared/lib/time";

type FieldsMap = Record<string, unknown>;

export const initDynamicFieldsFromWorkflow = (
  categoryLabel: string,
  workflow: WorkflowEntity,
): FieldsMap => {
  const od = workflow.overTimeDetails;

  switch (categoryLabel) {
    case "有給休暇申請":
      return {
        dateRange: {
          start: od?.startTime ?? "",
          end: od?.endTime ?? "",
        },
        reason: od?.reason ?? "",
      };

    case "欠勤申請": {
      const date = od?.date ? isoDateFromTimestamp(od.date) : "";
      return {
        date,
        reason: od?.reason ?? "",
      };
    }

    case "残業申請": {
      const date = od?.date ? isoDateFromTimestamp(od.date) : "";
      return {
        date,
        timeRange: {
          start: od?.startTime ? parseTimeToISO(od.startTime, date) : null,
          end: od?.endTime ? parseTimeToISO(od.endTime, date) : null,
        },
        reason: od?.reason ?? "",
      };
    }

    case "打刻修正(出勤忘れ)": {
      const date = od?.date ? isoDateFromTimestamp(od.date) : "";
      return {
        date,
        checkInTime: od?.startTime ? parseTimeToISO(od.startTime, date) : null,
      };
    }

    case "打刻修正(退勤忘れ)": {
      const date = od?.date ? isoDateFromTimestamp(od.date) : "";
      return {
        date,
        checkOutTime: od?.endTime ? parseTimeToISO(od.endTime, date) : null,
      };
    }

    case "その他":
      return {
        title: workflow.customWorkflowTitle ?? "",
        content: workflow.customWorkflowContent ?? "",
      };

    default:
      return {};
  }
};
