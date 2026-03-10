/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type WorkflowNotificationEventCreateFormInputValues = {
    recipientStaffId?: string;
    actorStaffId?: string;
    workflowId?: string;
    eventType?: string;
    commentId?: string;
    title?: string;
    body?: string;
    isRead?: boolean;
    readAt?: string;
    eventAt?: string;
};
export declare type WorkflowNotificationEventCreateFormValidationValues = {
    recipientStaffId?: ValidationFunction<string>;
    actorStaffId?: ValidationFunction<string>;
    workflowId?: ValidationFunction<string>;
    eventType?: ValidationFunction<string>;
    commentId?: ValidationFunction<string>;
    title?: ValidationFunction<string>;
    body?: ValidationFunction<string>;
    isRead?: ValidationFunction<boolean>;
    readAt?: ValidationFunction<string>;
    eventAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type WorkflowNotificationEventCreateFormOverridesProps = {
    WorkflowNotificationEventCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    recipientStaffId?: PrimitiveOverrideProps<TextFieldProps>;
    actorStaffId?: PrimitiveOverrideProps<TextFieldProps>;
    workflowId?: PrimitiveOverrideProps<TextFieldProps>;
    eventType?: PrimitiveOverrideProps<SelectFieldProps>;
    commentId?: PrimitiveOverrideProps<TextFieldProps>;
    title?: PrimitiveOverrideProps<TextFieldProps>;
    body?: PrimitiveOverrideProps<TextFieldProps>;
    isRead?: PrimitiveOverrideProps<SwitchFieldProps>;
    readAt?: PrimitiveOverrideProps<TextFieldProps>;
    eventAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type WorkflowNotificationEventCreateFormProps = React.PropsWithChildren<{
    overrides?: WorkflowNotificationEventCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: WorkflowNotificationEventCreateFormInputValues) => WorkflowNotificationEventCreateFormInputValues;
    onSuccess?: (fields: WorkflowNotificationEventCreateFormInputValues) => void;
    onError?: (fields: WorkflowNotificationEventCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: WorkflowNotificationEventCreateFormInputValues) => WorkflowNotificationEventCreateFormInputValues;
    onValidate?: WorkflowNotificationEventCreateFormValidationValues;
} & React.CSSProperties>;
export default function WorkflowNotificationEventCreateForm(props: WorkflowNotificationEventCreateFormProps): React.ReactElement;
