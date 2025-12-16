/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { ShiftPlanYear } from "../shared/api/graphql/types.ts";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type ShiftPlanYearUpdateFormInputValues = {
    targetYear?: number;
    notes?: string;
    createdBy?: string;
    updatedBy?: string;
};
export declare type ShiftPlanYearUpdateFormValidationValues = {
    targetYear?: ValidationFunction<number>;
    notes?: ValidationFunction<string>;
    createdBy?: ValidationFunction<string>;
    updatedBy?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ShiftPlanYearUpdateFormOverridesProps = {
    ShiftPlanYearUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    targetYear?: PrimitiveOverrideProps<TextFieldProps>;
    notes?: PrimitiveOverrideProps<TextFieldProps>;
    createdBy?: PrimitiveOverrideProps<TextFieldProps>;
    updatedBy?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ShiftPlanYearUpdateFormProps = React.PropsWithChildren<{
    overrides?: ShiftPlanYearUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    shiftPlanYear?: ShiftPlanYear;
    onSubmit?: (fields: ShiftPlanYearUpdateFormInputValues) => ShiftPlanYearUpdateFormInputValues;
    onSuccess?: (fields: ShiftPlanYearUpdateFormInputValues) => void;
    onError?: (fields: ShiftPlanYearUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ShiftPlanYearUpdateFormInputValues) => ShiftPlanYearUpdateFormInputValues;
    onValidate?: ShiftPlanYearUpdateFormValidationValues;
} & React.CSSProperties>;
export default function ShiftPlanYearUpdateForm(props: ShiftPlanYearUpdateFormProps): React.ReactElement;
