/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { Workflow } from "../API.ts";
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
export declare type WorkflowUpdateFormInputValues = {
    approvedStaffIds?: string[];
    rejectedStaffIds?: string[];
    finalDecisionTimestamp?: string;
    category?: string;
    staffId?: string;
    status?: string;
    assignedApproverStaffIds?: string[];
    nextApprovalStepIndex?: number;
    submitterApproverSetting?: string;
    submitterApproverId?: string;
    submitterApproverIds?: string[];
    submitterApproverMultipleMode?: string;
};
export declare type WorkflowUpdateFormValidationValues = {
    approvedStaffIds?: ValidationFunction<string>;
    rejectedStaffIds?: ValidationFunction<string>;
    finalDecisionTimestamp?: ValidationFunction<string>;
    category?: ValidationFunction<string>;
    staffId?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    assignedApproverStaffIds?: ValidationFunction<string>;
    nextApprovalStepIndex?: ValidationFunction<number>;
    submitterApproverSetting?: ValidationFunction<string>;
    submitterApproverId?: ValidationFunction<string>;
    submitterApproverIds?: ValidationFunction<string>;
    submitterApproverMultipleMode?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type WorkflowUpdateFormOverridesProps = {
    WorkflowUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    approvedStaffIds?: PrimitiveOverrideProps<TextFieldProps>;
    rejectedStaffIds?: PrimitiveOverrideProps<TextFieldProps>;
    finalDecisionTimestamp?: PrimitiveOverrideProps<TextFieldProps>;
    category?: PrimitiveOverrideProps<SelectFieldProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    assignedApproverStaffIds?: PrimitiveOverrideProps<TextFieldProps>;
    nextApprovalStepIndex?: PrimitiveOverrideProps<TextFieldProps>;
    submitterApproverSetting?: PrimitiveOverrideProps<SelectFieldProps>;
    submitterApproverId?: PrimitiveOverrideProps<TextFieldProps>;
    submitterApproverIds?: PrimitiveOverrideProps<TextFieldProps>;
    submitterApproverMultipleMode?: PrimitiveOverrideProps<SelectFieldProps>;
} & EscapeHatchProps;
export declare type WorkflowUpdateFormProps = React.PropsWithChildren<{
    overrides?: WorkflowUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    workflow?: Workflow;
    onSubmit?: (fields: WorkflowUpdateFormInputValues) => WorkflowUpdateFormInputValues;
    onSuccess?: (fields: WorkflowUpdateFormInputValues) => void;
    onError?: (fields: WorkflowUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: WorkflowUpdateFormInputValues) => WorkflowUpdateFormInputValues;
    onValidate?: WorkflowUpdateFormValidationValues;
} & React.CSSProperties>;
export default function WorkflowUpdateForm(props: WorkflowUpdateFormProps): React.ReactElement;
