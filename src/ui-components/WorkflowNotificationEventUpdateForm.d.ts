/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { WorkflowNotificationEvent } from "../shared/api/graphql/types.ts";
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
export declare type WorkflowNotificationEventUpdateFormInputValues = {
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
    version?: number;
};
export declare type WorkflowNotificationEventUpdateFormValidationValues = {
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
    version?: ValidationFunction<number>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type WorkflowNotificationEventUpdateFormOverridesProps = {
    WorkflowNotificationEventUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
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
    version?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type WorkflowNotificationEventUpdateFormProps = React.PropsWithChildren<{
    overrides?: WorkflowNotificationEventUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    workflowNotificationEvent?: WorkflowNotificationEvent;
    onSubmit?: (fields: WorkflowNotificationEventUpdateFormInputValues) => WorkflowNotificationEventUpdateFormInputValues;
    onSuccess?: (fields: WorkflowNotificationEventUpdateFormInputValues) => void;
    onError?: (fields: WorkflowNotificationEventUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: WorkflowNotificationEventUpdateFormInputValues) => WorkflowNotificationEventUpdateFormInputValues;
    onValidate?: WorkflowNotificationEventUpdateFormValidationValues;
} & React.CSSProperties>;
export default function WorkflowNotificationEventUpdateForm(props: WorkflowNotificationEventUpdateFormProps): React.ReactElement;
