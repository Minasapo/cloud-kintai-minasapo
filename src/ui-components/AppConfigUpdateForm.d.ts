/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { AppConfig } from "../API.ts";
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
export declare type AppConfigUpdateFormInputValues = {
    name?: string;
    workStartTime?: string;
    workEndTime?: string;
    lunchRestStartTime?: string;
    lunchRestEndTime?: string;
    amHolidayStartTime?: string;
    amHolidayEndTime?: string;
    pmHolidayStartTime?: string;
    pmHolidayEndTime?: string;
    specialHolidayEnabled?: boolean;
    amPmHolidayEnabled?: boolean;
    officeMode?: boolean;
    absentEnabled?: boolean;
    hourlyPaidHolidayEnabled?: boolean;
};
export declare type AppConfigUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    workStartTime?: ValidationFunction<string>;
    workEndTime?: ValidationFunction<string>;
    lunchRestStartTime?: ValidationFunction<string>;
    lunchRestEndTime?: ValidationFunction<string>;
    amHolidayStartTime?: ValidationFunction<string>;
    amHolidayEndTime?: ValidationFunction<string>;
    pmHolidayStartTime?: ValidationFunction<string>;
    pmHolidayEndTime?: ValidationFunction<string>;
    specialHolidayEnabled?: ValidationFunction<boolean>;
    amPmHolidayEnabled?: ValidationFunction<boolean>;
    officeMode?: ValidationFunction<boolean>;
    absentEnabled?: ValidationFunction<boolean>;
    hourlyPaidHolidayEnabled?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type AppConfigUpdateFormOverridesProps = {
    AppConfigUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    workStartTime?: PrimitiveOverrideProps<TextFieldProps>;
    workEndTime?: PrimitiveOverrideProps<TextFieldProps>;
    lunchRestStartTime?: PrimitiveOverrideProps<TextFieldProps>;
    lunchRestEndTime?: PrimitiveOverrideProps<TextFieldProps>;
    amHolidayStartTime?: PrimitiveOverrideProps<TextFieldProps>;
    amHolidayEndTime?: PrimitiveOverrideProps<TextFieldProps>;
    pmHolidayStartTime?: PrimitiveOverrideProps<TextFieldProps>;
    pmHolidayEndTime?: PrimitiveOverrideProps<TextFieldProps>;
    specialHolidayEnabled?: PrimitiveOverrideProps<SwitchFieldProps>;
    amPmHolidayEnabled?: PrimitiveOverrideProps<SwitchFieldProps>;
    officeMode?: PrimitiveOverrideProps<SwitchFieldProps>;
    absentEnabled?: PrimitiveOverrideProps<SwitchFieldProps>;
    hourlyPaidHolidayEnabled?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type AppConfigUpdateFormProps = React.PropsWithChildren<{
    overrides?: AppConfigUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    appConfig?: AppConfig;
    onSubmit?: (fields: AppConfigUpdateFormInputValues) => AppConfigUpdateFormInputValues;
    onSuccess?: (fields: AppConfigUpdateFormInputValues) => void;
    onError?: (fields: AppConfigUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: AppConfigUpdateFormInputValues) => AppConfigUpdateFormInputValues;
    onValidate?: AppConfigUpdateFormValidationValues;
} & React.CSSProperties>;
export default function AppConfigUpdateForm(props: AppConfigUpdateFormProps): React.ReactElement;
