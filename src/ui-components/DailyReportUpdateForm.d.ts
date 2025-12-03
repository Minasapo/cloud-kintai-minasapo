/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { DailyReport } from "../API.ts";
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
export declare type DailyReportUpdateFormInputValues = {
    staffId?: string;
    reportDate?: string;
    title?: string;
    content?: string;
    status?: string;
    updatedAt?: string;
};
export declare type DailyReportUpdateFormValidationValues = {
    staffId?: ValidationFunction<string>;
    reportDate?: ValidationFunction<string>;
    title?: ValidationFunction<string>;
    content?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type DailyReportUpdateFormOverridesProps = {
    DailyReportUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    staffId?: PrimitiveOverrideProps<TextFieldProps>;
    reportDate?: PrimitiveOverrideProps<TextFieldProps>;
    title?: PrimitiveOverrideProps<TextFieldProps>;
    content?: PrimitiveOverrideProps<TextFieldProps>;
    status?: PrimitiveOverrideProps<SelectFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type DailyReportUpdateFormProps = React.PropsWithChildren<{
    overrides?: DailyReportUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    dailyReport?: DailyReport;
    onSubmit?: (fields: DailyReportUpdateFormInputValues) => DailyReportUpdateFormInputValues;
    onSuccess?: (fields: DailyReportUpdateFormInputValues) => void;
    onError?: (fields: DailyReportUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: DailyReportUpdateFormInputValues) => DailyReportUpdateFormInputValues;
    onValidate?: DailyReportUpdateFormValidationValues;
} & React.CSSProperties>;
export default function DailyReportUpdateForm(props: DailyReportUpdateFormProps): React.ReactElement;
