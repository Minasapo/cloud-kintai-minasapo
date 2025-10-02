/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type WorkflowCreateFormInputValues = {
    category?: string;
    staffId?: string;
    status?: string;
};
export declare type WorkflowCreateFormValidationValues = {
    category?: ValidationFunction<string>;
    staffId?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type WorkflowCreateFormOverridesProps = {
    WorkflowCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    category?: PrimitiveOverrideProps<SelectFieldProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
} & EscapeHatchProps;
export declare type WorkflowCreateFormProps = React.PropsWithChildren<{
    overrides?: WorkflowCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: WorkflowCreateFormInputValues) => WorkflowCreateFormInputValues;
    onSuccess?: (fields: WorkflowCreateFormInputValues) => void;
    onError?: (fields: WorkflowCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: WorkflowCreateFormInputValues) => WorkflowCreateFormInputValues;
    onValidate?: WorkflowCreateFormValidationValues;
} & React.CSSProperties>;
export default function WorkflowCreateForm(props: WorkflowCreateFormProps): React.ReactElement;
