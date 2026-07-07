import { AppButton } from "@shared/ui/button";

export default function FilterTrigger({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <AppButton
      variant="outline"
      tone="neutral"
      size="md"
      onClick={onClick}
      sx={{
        width: "100%",
        justifyContent: "space-between",
        borderRadius: "10px",
        textTransform: "none",
        padding: "16px 24px",
        fontSize: "0.95rem",
        lineHeight: 1.5,
        color: "rgb(15, 23, 42)",
        backgroundColor: "rgb(255, 255, 255)",
        borderColor: isOpen ? "rgb(16, 185, 129 / 0.45)" : "rgb(203, 213, 225)",
        boxShadow: isOpen ? "0 0 0 2px rgb(209 250 229)" : "none",
        "&:hover": {
          backgroundColor: "rgb(255, 255, 255)",
          borderColor: isOpen ? "rgb(16, 185, 129 / 0.45)" : "rgb(148, 163, 184)",
        },
      }}
    >
      <span className="truncate text-slate-900">{label}</span>
      <span className="ml-3 text-slate-500">{isOpen ? "▲" : "▼"}</span>
    </AppButton>
  );
}
