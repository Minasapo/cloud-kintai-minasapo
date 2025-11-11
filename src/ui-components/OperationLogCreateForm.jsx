/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { createOperationLog } from "../graphql/mutations";
export default function OperationLogCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    staffId: "",
    action: "",
    resource: "",
    resourceId: "",
    timestamp: "",
    details: "",
    ipAddress: "",
    userAgent: "",
    metadata: "",
    severity: "",
  };
  const [staffId, setStaffId] = React.useState(initialValues.staffId);
  const [action, setAction] = React.useState(initialValues.action);
  const [resource, setResource] = React.useState(initialValues.resource);
  const [resourceId, setResourceId] = React.useState(initialValues.resourceId);
  const [timestamp, setTimestamp] = React.useState(initialValues.timestamp);
  const [details, setDetails] = React.useState(initialValues.details);
  const [ipAddress, setIpAddress] = React.useState(initialValues.ipAddress);
  const [userAgent, setUserAgent] = React.useState(initialValues.userAgent);
  const [metadata, setMetadata] = React.useState(initialValues.metadata);
  const [severity, setSeverity] = React.useState(initialValues.severity);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setStaffId(initialValues.staffId);
    setAction(initialValues.action);
    setResource(initialValues.resource);
    setResourceId(initialValues.resourceId);
    setTimestamp(initialValues.timestamp);
    setDetails(initialValues.details);
    setIpAddress(initialValues.ipAddress);
    setUserAgent(initialValues.userAgent);
    setMetadata(initialValues.metadata);
    setSeverity(initialValues.severity);
    setErrors({});
  };
  const validations = {
    staffId: [],
    action: [{ type: "Required" }],
    resource: [],
    resourceId: [],
    timestamp: [{ type: "Required" }],
    details: [],
    ipAddress: [],
    userAgent: [],
    metadata: [],
    severity: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          staffId,
          action,
          resource,
          resourceId,
          timestamp,
          details,
          ipAddress,
          userAgent,
          metadata,
          severity,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await API.graphql({
            query: createOperationLog.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "OperationLogCreateForm")}
      {...rest}
    >
      <TextField
        label="Staff id"
        isRequired={false}
        isReadOnly={false}
        value={staffId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId: value,
              action,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.staffId ?? value;
          }
          if (errors.staffId?.hasError) {
            runValidationTasks("staffId", value);
          }
          setStaffId(value);
        }}
        onBlur={() => runValidationTasks("staffId", staffId)}
        errorMessage={errors.staffId?.errorMessage}
        hasError={errors.staffId?.hasError}
        {...getOverrideProps(overrides, "staffId")}
      ></TextField>
      <TextField
        label="Action"
        isRequired={true}
        isReadOnly={false}
        value={action}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action: value,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.action ?? value;
          }
          if (errors.action?.hasError) {
            runValidationTasks("action", value);
          }
          setAction(value);
        }}
        onBlur={() => runValidationTasks("action", action)}
        errorMessage={errors.action?.errorMessage}
        hasError={errors.action?.hasError}
        {...getOverrideProps(overrides, "action")}
      ></TextField>
      <TextField
        label="Resource"
        isRequired={false}
        isReadOnly={false}
        value={resource}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource: value,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.resource ?? value;
          }
          if (errors.resource?.hasError) {
            runValidationTasks("resource", value);
          }
          setResource(value);
        }}
        onBlur={() => runValidationTasks("resource", resource)}
        errorMessage={errors.resource?.errorMessage}
        hasError={errors.resource?.hasError}
        {...getOverrideProps(overrides, "resource")}
      ></TextField>
      <TextField
        label="Resource id"
        isRequired={false}
        isReadOnly={false}
        value={resourceId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId: value,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.resourceId ?? value;
          }
          if (errors.resourceId?.hasError) {
            runValidationTasks("resourceId", value);
          }
          setResourceId(value);
        }}
        onBlur={() => runValidationTasks("resourceId", resourceId)}
        errorMessage={errors.resourceId?.errorMessage}
        hasError={errors.resourceId?.hasError}
        {...getOverrideProps(overrides, "resourceId")}
      ></TextField>
      <TextField
        label="Timestamp"
        isRequired={true}
        isReadOnly={false}
        value={timestamp}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp: value,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.timestamp ?? value;
          }
          if (errors.timestamp?.hasError) {
            runValidationTasks("timestamp", value);
          }
          setTimestamp(value);
        }}
        onBlur={() => runValidationTasks("timestamp", timestamp)}
        errorMessage={errors.timestamp?.errorMessage}
        hasError={errors.timestamp?.hasError}
        {...getOverrideProps(overrides, "timestamp")}
      ></TextField>
      <TextField
        label="Details"
        isRequired={false}
        isReadOnly={false}
        value={details}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp,
              details: value,
              ipAddress,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.details ?? value;
          }
          if (errors.details?.hasError) {
            runValidationTasks("details", value);
          }
          setDetails(value);
        }}
        onBlur={() => runValidationTasks("details", details)}
        errorMessage={errors.details?.errorMessage}
        hasError={errors.details?.hasError}
        {...getOverrideProps(overrides, "details")}
      ></TextField>
      <TextField
        label="Ip address"
        isRequired={false}
        isReadOnly={false}
        value={ipAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress: value,
              userAgent,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.ipAddress ?? value;
          }
          if (errors.ipAddress?.hasError) {
            runValidationTasks("ipAddress", value);
          }
          setIpAddress(value);
        }}
        onBlur={() => runValidationTasks("ipAddress", ipAddress)}
        errorMessage={errors.ipAddress?.errorMessage}
        hasError={errors.ipAddress?.hasError}
        {...getOverrideProps(overrides, "ipAddress")}
      ></TextField>
      <TextField
        label="User agent"
        isRequired={false}
        isReadOnly={false}
        value={userAgent}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent: value,
              metadata,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.userAgent ?? value;
          }
          if (errors.userAgent?.hasError) {
            runValidationTasks("userAgent", value);
          }
          setUserAgent(value);
        }}
        onBlur={() => runValidationTasks("userAgent", userAgent)}
        errorMessage={errors.userAgent?.errorMessage}
        hasError={errors.userAgent?.hasError}
        {...getOverrideProps(overrides, "userAgent")}
      ></TextField>
      <TextField
        label="Metadata"
        isRequired={false}
        isReadOnly={false}
        value={metadata}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata: value,
              severity,
            };
            const result = onChange(modelFields);
            value = result?.metadata ?? value;
          }
          if (errors.metadata?.hasError) {
            runValidationTasks("metadata", value);
          }
          setMetadata(value);
        }}
        onBlur={() => runValidationTasks("metadata", metadata)}
        errorMessage={errors.metadata?.errorMessage}
        hasError={errors.metadata?.hasError}
        {...getOverrideProps(overrides, "metadata")}
      ></TextField>
      <TextField
        label="Severity"
        isRequired={false}
        isReadOnly={false}
        value={severity}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              action,
              resource,
              resourceId,
              timestamp,
              details,
              ipAddress,
              userAgent,
              metadata,
              severity: value,
            };
            const result = onChange(modelFields);
            value = result?.severity ?? value;
          }
          if (errors.severity?.hasError) {
            runValidationTasks("severity", value);
          }
          setSeverity(value);
        }}
        onBlur={() => runValidationTasks("severity", severity)}
        errorMessage={errors.severity?.errorMessage}
        hasError={errors.severity?.hasError}
        {...getOverrideProps(overrides, "severity")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
