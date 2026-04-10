import { Save } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import AppButton from "./AppButton";
import type { ButtonSize } from "./types";

export type AppSaveButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "children"
> & {
  children?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  size?: ButtonSize;
  endIcon?: ReactNode;
  className?: string;
};

const joinClassNames = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

export default function AppSaveButton({
  children = "保存",
  className,
  ...props
}: AppSaveButtonProps) {
  return (
    <AppButton
      {...props}
      className={joinClassNames("app-save-button", className)}
      tone="primary"
      variant="solid"
      startIcon={<Save size={16} strokeWidth={2} />}
    >
      {children}
    </AppButton>
  );
}
