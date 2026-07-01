import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import AppButton, { type AppButtonProps } from "./AppButton";

export type AppBackButtonProps = Omit<AppButtonProps, "startIcon">;

export default function AppBackButton({ children, ...props }: AppBackButtonProps) {
  return (
    <AppButton {...props} startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}>
      {children}
    </AppButton>
  );
}