import { z } from "zod";

import { SHIFT_GROUP_VALIDATION_TEXTS } from "@/shared/config/shiftGroupTexts";

import { parseOptionalInteger } from "./shiftGroupValidation";

const optionalNonNegativeIntegerString = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    return trimmed === "" || /^\d+$/.test(trimmed);
  }, { message });

export const shiftGroupSchema = z
  .object({
    id: z.string(),
    label: z
      .string()
      .trim()
      .min(1, { message: SHIFT_GROUP_VALIDATION_TEXTS.labelRequired }),
    description: z.string(),
    min: optionalNonNegativeIntegerString(
      SHIFT_GROUP_VALIDATION_TEXTS.minInvalid,
    ),
    max: optionalNonNegativeIntegerString(
      SHIFT_GROUP_VALIDATION_TEXTS.maxInvalid,
    ),
    fixed: optionalNonNegativeIntegerString(
      SHIFT_GROUP_VALIDATION_TEXTS.fixedInvalid,
    ),
  })
  .superRefine((values, ctx) => {
    const minValue = parseOptionalInteger(values.min);
    const maxValue = parseOptionalInteger(values.max);
    const fixedValue = parseOptionalInteger(values.fixed);

    if (
      minValue !== null &&
      maxValue !== null &&
      minValue > maxValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.maxRangeError,
      });
    }

    if (
      fixedValue !== null &&
      minValue !== null &&
      fixedValue < minValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fixed"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.fixedBelowMin,
      });
    }

    if (
      fixedValue !== null &&
      maxValue !== null &&
      fixedValue > maxValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fixed"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.fixedAboveMax,
      });
    }

    if (
      fixedValue !== null &&
      (minValue !== null || maxValue !== null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["min"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.rangeConflict,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.rangeConflict,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fixed"],
        message: SHIFT_GROUP_VALIDATION_TEXTS.fixedRangeConflict,
      });
    }
  });

export const shiftGroupFormSchema = z.object({
  shiftGroups: z.array(shiftGroupSchema),
});

export type ShiftGroupFormState = z.infer<typeof shiftGroupFormSchema>;
