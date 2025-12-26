/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { AuditLog } from "../shared/api/graphql/types.ts";
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
export declare type AuditLogUpdateFormInputValues = {
    resourceType?: string;
    resourceId?: string;
    action?: string;
    actorId?: string;
    actorRole?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
    before?: string;
    after?: string;
    diff?: string;
    createdAt?: string;
    ttl?: number;
    reason?: string;
};
export declare type AuditLogUpdateFormValidationValues = {
    resourceType?: ValidationFunction<string>;
    resourceId?: ValidationFunction<string>;
    action?: ValidationFunction<string>;
    actorId?: ValidationFunction<string>;
    actorRole?: ValidationFunction<string>;
    requestId?: ValidationFunction<string>;
    ip?: ValidationFunction<string>;
    userAgent?: ValidationFunction<string>;
    before?: ValidationFunction<string>;
    after?: ValidationFunction<string>;
    diff?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    ttl?: ValidationFunction<number>;
    reason?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AuditLogUpdateFormOverridesProps = {
    AuditLogUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    resourceType?: PrimitiveOverrideProps<TextFieldProps>;
    resourceId?: PrimitiveOverrideProps<TextFieldProps>;
    action?: PrimitiveOverrideProps<TextFieldProps>;
    actorId?: PrimitiveOverrideProps<TextFieldProps>;
    actorRole?: PrimitiveOverrideProps<TextFieldProps>;
    requestId?: PrimitiveOverrideProps<TextFieldProps>;
    ip?: PrimitiveOverrideProps<TextFieldProps>;
    userAgent?: PrimitiveOverrideProps<TextFieldProps>;
    before?: PrimitiveOverrideProps<TextAreaFieldProps>;
    after?: PrimitiveOverrideProps<TextAreaFieldProps>;
    diff?: PrimitiveOverrideProps<TextAreaFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    ttl?: PrimitiveOverrideProps<TextFieldProps>;
    reason?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type AuditLogUpdateFormProps = React.PropsWithChildren<{
    overrides?: AuditLogUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    auditLog?: AuditLog;
    onSubmit?: (fields: AuditLogUpdateFormInputValues) => AuditLogUpdateFormInputValues;
    onSuccess?: (fields: AuditLogUpdateFormInputValues) => void;
    onError?: (fields: AuditLogUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AuditLogUpdateFormInputValues) => AuditLogUpdateFormInputValues;
    onValidate?: AuditLogUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AuditLogUpdateForm(props: AuditLogUpdateFormProps): React.ReactElement;
