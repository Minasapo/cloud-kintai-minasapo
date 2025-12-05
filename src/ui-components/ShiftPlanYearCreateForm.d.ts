/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type ShiftPlanYearCreateFormInputValues = {
    targetYear?: number;
    notes?: string;
    createdBy?: string;
    updatedBy?: string;
};
export declare type ShiftPlanYearCreateFormValidationValues = {
    targetYear?: ValidationFunction<number>;
    notes?: ValidationFunction<string>;
    createdBy?: ValidationFunction<string>;
    updatedBy?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ShiftPlanYearCreateFormOverridesProps = {
    ShiftPlanYearCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    targetYear?: PrimitiveOverrideProps<TextFieldProps>;
    notes?: PrimitiveOverrideProps<TextFieldProps>;
    createdBy?: PrimitiveOverrideProps<TextFieldProps>;
    updatedBy?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ShiftPlanYearCreateFormProps = React.PropsWithChildren<{
    overrides?: ShiftPlanYearCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: ShiftPlanYearCreateFormInputValues) => ShiftPlanYearCreateFormInputValues;
    onSuccess?: (fields: ShiftPlanYearCreateFormInputValues) => void;
    onError?: (fields: ShiftPlanYearCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ShiftPlanYearCreateFormInputValues) => ShiftPlanYearCreateFormInputValues;
    onValidate?: ShiftPlanYearCreateFormValidationValues;
} & React.CSSProperties>;
export default function ShiftPlanYearCreateForm(props: ShiftPlanYearCreateFormProps): React.ReactElement;
