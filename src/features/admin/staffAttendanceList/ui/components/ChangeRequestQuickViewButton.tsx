import { AppButton } from "@shared/ui/button";

type ChangeRequestQuickViewButtonProps = {
  badgeContent: number;
  onClick: () => void;
};

export function ChangeRequestQuickViewButton({
  badgeContent,
  onClick,
}: ChangeRequestQuickViewButtonProps) {
  if (badgeContent <= 0) {
    return null;
  }

  return (
    <AppButton
      size="sm"
      variant="solid"
      sx={{ fontWeight: "bold" }}
      onClick={onClick}
      data-testid="quick-view-change-request"
    >
      申請確認
    </AppButton>
  );
}
