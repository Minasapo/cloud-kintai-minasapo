import Switch from "@mui/material/Switch";
import type { FieldValues } from "react-hook-form";

import ReturnDirectlyFlagInputBase, {
  type ReturnDirectlyFlagInputBaseProps,
} from "./ReturnDirectlyFlagInputBase";

export default function ReturnDirectlyFlagInputBaseMobile<
  TFieldValues extends FieldValues
>(
  props: Omit<
    ReturnDirectlyFlagInputBaseProps<TFieldValues>,
    "inputComponent" | "layout"
  >
) {
  return (
    <ReturnDirectlyFlagInputBase
      {...props}
      inputComponent={Switch}
      layout="inline"
    />
  );
}
