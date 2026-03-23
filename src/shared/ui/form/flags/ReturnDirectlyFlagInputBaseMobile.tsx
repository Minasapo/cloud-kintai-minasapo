import type { FieldValues } from "react-hook-form";

import ReturnDirectlyFlagInputBase, {
  type ReturnDirectlyFlagInputBaseProps,
} from "./ReturnDirectlyFlagInputBase";

export default function ReturnDirectlyFlagInputBaseMobile<
  TFieldValues extends FieldValues
>(
  props: Omit<
    ReturnDirectlyFlagInputBaseProps<TFieldValues>,
    "inputComponent" | "layout" | "inputVariant"
  >
) {
  return (
    <ReturnDirectlyFlagInputBase
      {...props}
      layout="inline"
      inputVariant="switch"
    />
  );
}
