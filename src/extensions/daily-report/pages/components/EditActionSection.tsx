import {
  ActionButton,
  DividerLine,
  VStack,
} from "./DailyReportLayoutParts";

export function EditActionSection({
  isEditing,
  canEditSubmit,
  isUpdating,
  isSelectedReportSubmitted,
  onSaveDraft,
  onSubmit,
  onCancel,
  onEdit,
}: {
  isEditing: boolean;
  canEditSubmit: boolean;
  isUpdating: boolean;
  isSelectedReportSubmitted: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onEdit: () => void;
}) {
  return (
    <VStack className="dr-edit-actions">
      <DividerLine />
      {isEditing ? (
        <div className="dr-edit-actions-row">
          <ActionButton
            tone="secondary"
            disabled={!canEditSubmit || isUpdating}
            onClick={onSaveDraft}
          >
            下書き保存
          </ActionButton>
          <ActionButton
            tone="primary"
            disabled={!canEditSubmit || isUpdating || isSelectedReportSubmitted}
            onClick={onSubmit}
          >
            提出する
          </ActionButton>
          <ActionButton tone="ghost" onClick={onCancel}>
            キャンセル
          </ActionButton>
        </div>
      ) : (
        <div className="dr-edit-actions-end">
          <ActionButton tone="secondary" disabled={isUpdating} onClick={onEdit}>
            編集
          </ActionButton>
        </div>
      )}
    </VStack>
  );
}
