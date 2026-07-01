import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { AppButton } from "@shared/ui/button";

export default function WorkflowCreateButton({
  isCompact,
  onClick,
}: {
  isCompact: boolean;
  onClick: () => void;
}) {
  return (
    <AppButton
      size="sm"
      onClick={onClick}
      className={[
        "workflow-create-button",
        isCompact ? "workflow-create-button--compact" : "",
      ].join(" ")}
      sx={{
        "--variant-containedColor": "#fff",
        "--variant-containedBg": "#19b985",
        backgroundColor: "#19b985",
        borderColor: "rgba(4, 120, 87, 0.55)",
        boxShadow:
          "inset 0 -2px 0 rgba(0, 0, 0, 0.12), 0 12px 24px -18px rgba(5, 150, 105, 0.55)",
        "&:hover": {
          "--variant-containedBg": "#17ab7b",
          backgroundColor: "#17ab7b",
        },
      }}
      startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
    >
      {isCompact ? "新規" : "新規作成"}
    </AppButton>
  );
}
