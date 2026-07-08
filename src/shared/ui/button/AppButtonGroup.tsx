import type { ButtonGroupProps } from "@mui/material/ButtonGroup";
import ButtonGroup from "@mui/material/ButtonGroup";

export type AppButtonGroupProps = ButtonGroupProps;

export default function AppButtonGroup(props: AppButtonGroupProps) {
  return <ButtonGroup {...props} />;
}
