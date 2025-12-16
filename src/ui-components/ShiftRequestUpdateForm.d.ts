/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { ShiftRequest } from "../shared/api/graphql/types.ts";
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
export declare type ShiftRequestUpdateFormInputValues = {
    staffId?: string;
    targetMonth?: string;
    note?: string;
    submittedAt?: string;
    updatedAt?: string;
};
export declare type ShiftRequestUpdateFormValidationValues = {
    staffId?: ValidationFunction<string>;
    targetMonth?: ValidationFunction<string>;
    note?: ValidationFunction<string>;
    submittedAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ShiftRequestUpdateFormOverridesProps = {
    ShiftRequestUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    targetMonth?: PrimitiveOverrideProps<TextFieldProps>;
    note?: PrimitiveOverrideProps<TextFieldProps>;
    submittedAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ShiftRequestUpdateFormProps = React.PropsWithChildren<{
    overrides?: ShiftRequestUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    shiftRequest?: ShiftRequest;
    onSubmit?: (fields: ShiftRequestUpdateFormInputValues) => ShiftRequestUpdateFormInputValues;
    onSuccess?: (fields: ShiftRequestUpdateFormInputValues) => void;
    onError?: (fields: ShiftRequestUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ShiftRequestUpdateFormInputValues) => ShiftRequestUpdateFormInputValues;
    onValidate?: ShiftRequestUpdateFormValidationValues;
} & React.CSSProperties>;
export default function ShiftRequestUpdateForm(props: ShiftRequestUpdateFormProps): React.ReactElement;
