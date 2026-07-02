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
      sx={{
        width: isCompact ? "100%" : "auto",
        "--variant-containedColor": "#fff",
        "--variant-containedBg": "#19b985",
        backgroundColor: "#19b985",
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
