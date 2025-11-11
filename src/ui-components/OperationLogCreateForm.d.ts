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
export declare type OperationLogCreateFormInputValues = {
    staffId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    timestamp?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: string;
    severity?: string;
};
export declare type OperationLogCreateFormValidationValues = {
    staffId?: ValidationFunction<string>;
    action?: ValidationFunction<string>;
    resource?: ValidationFunction<string>;
    resourceId?: ValidationFunction<string>;
    timestamp?: ValidationFunction<string>;
    details?: ValidationFunction<string>;
    ipAddress?: ValidationFunction<string>;
    userAgent?: ValidationFunction<string>;
    metadata?: ValidationFunction<string>;
    severity?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type OperationLogCreateFormOverridesProps = {
    OperationLogCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    action?: PrimitiveOverrideProps<TextFieldProps>;
    resource?: PrimitiveOverrideProps<TextFieldProps>;
    resourceId?: PrimitiveOverrideProps<TextFieldProps>;
    timestamp?: PrimitiveOverrideProps<TextFieldProps>;
    details?: PrimitiveOverrideProps<TextFieldProps>;
    ipAddress?: PrimitiveOverrideProps<TextFieldProps>;
    userAgent?: PrimitiveOverrideProps<TextFieldProps>;
    metadata?: PrimitiveOverrideProps<TextFieldProps>;
    severity?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type OperationLogCreateFormProps = React.PropsWithChildren<{
    overrides?: OperationLogCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: OperationLogCreateFormInputValues) => OperationLogCreateFormInputValues;
    onSuccess?: (fields: OperationLogCreateFormInputValues) => void;
    onError?: (fields: OperationLogCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: OperationLogCreateFormInputValues) => OperationLogCreateFormInputValues;
    onValidate?: OperationLogCreateFormValidationValues;
} & React.CSSProperties>;
export default function OperationLogCreateForm(props: OperationLogCreateFormProps): React.ReactElement;
