export default function WorkflowCreateButton({
  isCompact,
  onClick,
}: {
  isCompact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "workflow-create-button",
        isCompact ? "workflow-create-button--compact" : "",
      ].join(" ")}
    >
      <span className="workflow-create-button__icon">+</span>
      {isCompact ? "新規" : "新規作成"}
    </button>
  );
}
