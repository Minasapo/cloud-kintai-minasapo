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
export declare type ShiftRequestCreateFormInputValues = {
    staffId?: string;
    targetMonth?: string;
    note?: string;
    submittedAt?: string;
    updatedAt?: string;
};
export declare type ShiftRequestCreateFormValidationValues = {
    staffId?: ValidationFunction<string>;
    targetMonth?: ValidationFunction<string>;
    note?: ValidationFunction<string>;
    submittedAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ShiftRequestCreateFormOverridesProps = {
    ShiftRequestCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    targetMonth?: PrimitiveOverrideProps<TextFieldProps>;
    note?: PrimitiveOverrideProps<TextFieldProps>;
    submittedAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ShiftRequestCreateFormProps = React.PropsWithChildren<{
    overrides?: ShiftRequestCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: ShiftRequestCreateFormInputValues) => ShiftRequestCreateFormInputValues;
    onSuccess?: (fields: ShiftRequestCreateFormInputValues) => void;
    onError?: (fields: ShiftRequestCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ShiftRequestCreateFormInputValues) => ShiftRequestCreateFormInputValues;
    onValidate?: ShiftRequestCreateFormValidationValues;
} & React.CSSProperties>;
export default function ShiftRequestCreateForm(props: ShiftRequestCreateFormProps): React.ReactElement;
