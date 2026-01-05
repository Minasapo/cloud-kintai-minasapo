/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getAuditLog } from "../shared/api/graphql/documents/queries";
import { updateAuditLog } from "../shared/api/graphql/documents/mutations";
const client = generateClient();
export default function AuditLogUpdateForm(props) {
  const {
    id: idProp,
    auditLog: auditLogModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    resourceType: "",
    resourceId: "",
    action: "",
    actorId: "",
    actorRole: "",
    requestId: "",
    ip: "",
    userAgent: "",
    before: "",
    after: "",
    diff: "",
    createdAt: "",
    ttl: "",
    reason: "",
  };
  const [resourceType, setResourceType] = React.useState(
    initialValues.resourceType
  );
  const [resourceId, setResourceId] = React.useState(initialValues.resourceId);
  const [action, setAction] = React.useState(initialValues.action);
  const [actorId, setActorId] = React.useState(initialValues.actorId);
  const [actorRole, setActorRole] = React.useState(initialValues.actorRole);
  const [requestId, setRequestId] = React.useState(initialValues.requestId);
  const [ip, setIp] = React.useState(initialValues.ip);
  const [userAgent, setUserAgent] = React.useState(initialValues.userAgent);
  const [before, setBefore] = React.useState(initialValues.before);
  const [after, setAfter] = React.useState(initialValues.after);
  const [diff, setDiff] = React.useState(initialValues.diff);
  const [createdAt, setCreatedAt] = React.useState(initialValues.createdAt);
  const [ttl, setTtl] = React.useState(initialValues.ttl);
  const [reason, setReason] = React.useState(initialValues.reason);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = auditLogRecord
      ? { ...initialValues, ...auditLogRecord }
      : initialValues;
    setResourceType(cleanValues.resourceType);
    setResourceId(cleanValues.resourceId);
    setAction(cleanValues.action);
    setActorId(cleanValues.actorId);
    setActorRole(cleanValues.actorRole);
    setRequestId(cleanValues.requestId);
    setIp(cleanValues.ip);
    setUserAgent(cleanValues.userAgent);
    setBefore(
      typeof cleanValues.before === "string" || cleanValues.before === null
        ? cleanValues.before
        : JSON.stringify(cleanValues.before)
    );
    setAfter(
      typeof cleanValues.after === "string" || cleanValues.after === null
        ? cleanValues.after
        : JSON.stringify(cleanValues.after)
    );
    setDiff(
      typeof cleanValues.diff === "string" || cleanValues.diff === null
        ? cleanValues.diff
        : JSON.stringify(cleanValues.diff)
    );
    setCreatedAt(cleanValues.createdAt);
    setTtl(cleanValues.ttl);
    setReason(cleanValues.reason);
    setErrors({});
  };
  const [auditLogRecord, setAuditLogRecord] = React.useState(auditLogModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getAuditLog.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getAuditLog
        : auditLogModelProp;
      setAuditLogRecord(record);
    };
    queryData();
  }, [idProp, auditLogModelProp]);
  React.useEffect(resetStateValues, [auditLogRecord]);
  const validations = {
    resourceType: [{ type: "Required" }],
    resourceId: [{ type: "Required" }],
    action: [{ type: "Required" }],
    actorId: [{ type: "Required" }],
    actorRole: [],
    requestId: [{ type: "Required" }],
    ip: [],
    userAgent: [],
    before: [{ type: "JSON" }],
    after: [{ type: "JSON" }],
    diff: [{ type: "JSON" }],
    createdAt: [{ type: "Required" }],
    ttl: [],
    reason: [],
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
  const convertTimeStampToDate = (ts) => {
    if (Math.abs(Date.now() - ts) < Math.abs(Date.now() - ts * 1000)) {
      return new Date(ts);
    }
    return new Date(ts * 1000);
  };
  const convertToLocal = (date) => {
    const df = new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "iso8601",
      numberingSystem: "latn",
      hourCycle: "h23",
    });
    const parts = df.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
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
          resourceType,
          resourceId,
          action,
          actorId,
          actorRole: actorRole ?? null,
          requestId,
          ip: ip ?? null,
          userAgent: userAgent ?? null,
          before: before ?? null,
          after: after ?? null,
          diff: diff ?? null,
          createdAt,
          ttl: ttl ?? null,
          reason: reason ?? null,
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
          await client.graphql({
            query: updateAuditLog.replaceAll("__typename", ""),
            variables: {
              input: {
                id: auditLogRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "AuditLogUpdateForm")}
      {...rest}
    >
      <TextField
        label="Resource type"
        isRequired={true}
        isReadOnly={false}
        value={resourceType}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType: value,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.resourceType ?? value;
          }
          if (errors.resourceType?.hasError) {
            runValidationTasks("resourceType", value);
          }
          setResourceType(value);
        }}
        onBlur={() => runValidationTasks("resourceType", resourceType)}
        errorMessage={errors.resourceType?.errorMessage}
        hasError={errors.resourceType?.hasError}
        {...getOverrideProps(overrides, "resourceType")}
      ></TextField>
      <TextField
        label="Resource id"
        isRequired={true}
        isReadOnly={false}
        value={resourceId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId: value,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
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
        label="Action"
        isRequired={true}
        isReadOnly={false}
        value={action}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action: value,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
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
        label="Actor id"
        isRequired={true}
        isReadOnly={false}
        value={actorId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId: value,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.actorId ?? value;
          }
          if (errors.actorId?.hasError) {
            runValidationTasks("actorId", value);
          }
          setActorId(value);
        }}
        onBlur={() => runValidationTasks("actorId", actorId)}
        errorMessage={errors.actorId?.errorMessage}
        hasError={errors.actorId?.hasError}
        {...getOverrideProps(overrides, "actorId")}
      ></TextField>
      <TextField
        label="Actor role"
        isRequired={false}
        isReadOnly={false}
        value={actorRole}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole: value,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.actorRole ?? value;
          }
          if (errors.actorRole?.hasError) {
            runValidationTasks("actorRole", value);
          }
          setActorRole(value);
        }}
        onBlur={() => runValidationTasks("actorRole", actorRole)}
        errorMessage={errors.actorRole?.errorMessage}
        hasError={errors.actorRole?.hasError}
        {...getOverrideProps(overrides, "actorRole")}
      ></TextField>
      <TextField
        label="Request id"
        isRequired={true}
        isReadOnly={false}
        value={requestId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId: value,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.requestId ?? value;
          }
          if (errors.requestId?.hasError) {
            runValidationTasks("requestId", value);
          }
          setRequestId(value);
        }}
        onBlur={() => runValidationTasks("requestId", requestId)}
        errorMessage={errors.requestId?.errorMessage}
        hasError={errors.requestId?.hasError}
        {...getOverrideProps(overrides, "requestId")}
      ></TextField>
      <TextField
        label="Ip"
        isRequired={false}
        isReadOnly={false}
        value={ip}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip: value,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.ip ?? value;
          }
          if (errors.ip?.hasError) {
            runValidationTasks("ip", value);
          }
          setIp(value);
        }}
        onBlur={() => runValidationTasks("ip", ip)}
        errorMessage={errors.ip?.errorMessage}
        hasError={errors.ip?.hasError}
        {...getOverrideProps(overrides, "ip")}
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
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent: value,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason,
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
      <TextAreaField
        label="Before"
        isRequired={false}
        isReadOnly={false}
        value={before}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before: value,
              after,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.before ?? value;
          }
          if (errors.before?.hasError) {
            runValidationTasks("before", value);
          }
          setBefore(value);
        }}
        onBlur={() => runValidationTasks("before", before)}
        errorMessage={errors.before?.errorMessage}
        hasError={errors.before?.hasError}
        {...getOverrideProps(overrides, "before")}
      ></TextAreaField>
      <TextAreaField
        label="After"
        isRequired={false}
        isReadOnly={false}
        value={after}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after: value,
              diff,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.after ?? value;
          }
          if (errors.after?.hasError) {
            runValidationTasks("after", value);
          }
          setAfter(value);
        }}
        onBlur={() => runValidationTasks("after", after)}
        errorMessage={errors.after?.errorMessage}
        hasError={errors.after?.hasError}
        {...getOverrideProps(overrides, "after")}
      ></TextAreaField>
      <TextAreaField
        label="Diff"
        isRequired={false}
        isReadOnly={false}
        value={diff}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff: value,
              createdAt,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.diff ?? value;
          }
          if (errors.diff?.hasError) {
            runValidationTasks("diff", value);
          }
          setDiff(value);
        }}
        onBlur={() => runValidationTasks("diff", diff)}
        errorMessage={errors.diff?.errorMessage}
        hasError={errors.diff?.hasError}
        {...getOverrideProps(overrides, "diff")}
      ></TextAreaField>
      <TextField
        label="Created at"
        isRequired={true}
        isReadOnly={false}
        type="datetime-local"
        value={createdAt && convertToLocal(new Date(createdAt))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : new Date(e.target.value).toISOString();
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt: value,
              ttl,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.createdAt ?? value;
          }
          if (errors.createdAt?.hasError) {
            runValidationTasks("createdAt", value);
          }
          setCreatedAt(value);
        }}
        onBlur={() => runValidationTasks("createdAt", createdAt)}
        errorMessage={errors.createdAt?.errorMessage}
        hasError={errors.createdAt?.hasError}
        {...getOverrideProps(overrides, "createdAt")}
      ></TextField>
      <TextField
        label="Ttl"
        isRequired={false}
        isReadOnly={false}
        type="datetime-local"
        value={ttl && convertToLocal(convertTimeStampToDate(ttl))}
        onChange={(e) => {
          let value =
            e.target.value === "" ? "" : Number(new Date(e.target.value));
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl: value,
              reason,
            };
            const result = onChange(modelFields);
            value = result?.ttl ?? value;
          }
          if (errors.ttl?.hasError) {
            runValidationTasks("ttl", value);
          }
          setTtl(value);
        }}
        onBlur={() => runValidationTasks("ttl", ttl)}
        errorMessage={errors.ttl?.errorMessage}
        hasError={errors.ttl?.hasError}
        {...getOverrideProps(overrides, "ttl")}
      ></TextField>
      <TextField
        label="Reason"
        isRequired={false}
        isReadOnly={false}
        value={reason}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              resourceType,
              resourceId,
              action,
              actorId,
              actorRole,
              requestId,
              ip,
              userAgent,
              before,
              after,
              diff,
              createdAt,
              ttl,
              reason: value,
            };
            const result = onChange(modelFields);
            value = result?.reason ?? value;
          }
          if (errors.reason?.hasError) {
            runValidationTasks("reason", value);
          }
          setReason(value);
        }}
        onBlur={() => runValidationTasks("reason", reason)}
        errorMessage={errors.reason?.errorMessage}
        hasError={errors.reason?.hasError}
        {...getOverrideProps(overrides, "reason")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || auditLogModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || auditLogModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
