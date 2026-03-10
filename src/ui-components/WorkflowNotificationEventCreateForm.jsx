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
  SelectField,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createWorkflowNotificationEvent } from "../shared/api/graphql/documents/mutations";
const client = generateClient();
export default function WorkflowNotificationEventCreateForm(props) {
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
    recipientStaffId: "",
    actorStaffId: "",
    workflowId: "",
    eventType: "",
    commentId: "",
    title: "",
    body: "",
    isRead: false,
    readAt: "",
    eventAt: "",
  };
  const [recipientStaffId, setRecipientStaffId] = React.useState(
    initialValues.recipientStaffId
  );
  const [actorStaffId, setActorStaffId] = React.useState(
    initialValues.actorStaffId
  );
  const [workflowId, setWorkflowId] = React.useState(initialValues.workflowId);
  const [eventType, setEventType] = React.useState(initialValues.eventType);
  const [commentId, setCommentId] = React.useState(initialValues.commentId);
  const [title, setTitle] = React.useState(initialValues.title);
  const [body, setBody] = React.useState(initialValues.body);
  const [isRead, setIsRead] = React.useState(initialValues.isRead);
  const [readAt, setReadAt] = React.useState(initialValues.readAt);
  const [eventAt, setEventAt] = React.useState(initialValues.eventAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setRecipientStaffId(initialValues.recipientStaffId);
    setActorStaffId(initialValues.actorStaffId);
    setWorkflowId(initialValues.workflowId);
    setEventType(initialValues.eventType);
    setCommentId(initialValues.commentId);
    setTitle(initialValues.title);
    setBody(initialValues.body);
    setIsRead(initialValues.isRead);
    setReadAt(initialValues.readAt);
    setEventAt(initialValues.eventAt);
    setErrors({});
  };
  const validations = {
    recipientStaffId: [{ type: "Required" }],
    actorStaffId: [{ type: "Required" }],
    workflowId: [{ type: "Required" }],
    eventType: [{ type: "Required" }],
    commentId: [],
    title: [{ type: "Required" }],
    body: [{ type: "Required" }],
    isRead: [{ type: "Required" }],
    readAt: [],
    eventAt: [{ type: "Required" }],
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
          recipientStaffId,
          actorStaffId,
          workflowId,
          eventType,
          commentId,
          title,
          body,
          isRead,
          readAt,
          eventAt,
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
            query: createWorkflowNotificationEvent.replaceAll("__typename", ""),
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
      {...getOverrideProps(overrides, "WorkflowNotificationEventCreateForm")}
      {...rest}
    >
      <TextField
        label="Recipient staff id"
        isRequired={true}
        isReadOnly={false}
        value={recipientStaffId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId: value,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.recipientStaffId ?? value;
          }
          if (errors.recipientStaffId?.hasError) {
            runValidationTasks("recipientStaffId", value);
          }
          setRecipientStaffId(value);
        }}
        onBlur={() => runValidationTasks("recipientStaffId", recipientStaffId)}
        errorMessage={errors.recipientStaffId?.errorMessage}
        hasError={errors.recipientStaffId?.hasError}
        {...getOverrideProps(overrides, "recipientStaffId")}
      ></TextField>
      <TextField
        label="Actor staff id"
        isRequired={true}
        isReadOnly={false}
        value={actorStaffId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId: value,
              workflowId,
              eventType,
              commentId,
              title,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.actorStaffId ?? value;
          }
          if (errors.actorStaffId?.hasError) {
            runValidationTasks("actorStaffId", value);
          }
          setActorStaffId(value);
        }}
        onBlur={() => runValidationTasks("actorStaffId", actorStaffId)}
        errorMessage={errors.actorStaffId?.errorMessage}
        hasError={errors.actorStaffId?.hasError}
        {...getOverrideProps(overrides, "actorStaffId")}
      ></TextField>
      <TextField
        label="Workflow id"
        isRequired={true}
        isReadOnly={false}
        value={workflowId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId: value,
              eventType,
              commentId,
              title,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.workflowId ?? value;
          }
          if (errors.workflowId?.hasError) {
            runValidationTasks("workflowId", value);
          }
          setWorkflowId(value);
        }}
        onBlur={() => runValidationTasks("workflowId", workflowId)}
        errorMessage={errors.workflowId?.errorMessage}
        hasError={errors.workflowId?.hasError}
        {...getOverrideProps(overrides, "workflowId")}
      ></TextField>
      <SelectField
        label="Event type"
        placeholder="Please select an option"
        isDisabled={false}
        value={eventType}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType: value,
              commentId,
              title,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.eventType ?? value;
          }
          if (errors.eventType?.hasError) {
            runValidationTasks("eventType", value);
          }
          setEventType(value);
        }}
        onBlur={() => runValidationTasks("eventType", eventType)}
        errorMessage={errors.eventType?.errorMessage}
        hasError={errors.eventType?.hasError}
        {...getOverrideProps(overrides, "eventType")}
      >
        <option
          children="Workflow comment"
          value="WORKFLOW_COMMENT"
          {...getOverrideProps(overrides, "eventTypeoption0")}
        ></option>
      </SelectField>
      <TextField
        label="Comment id"
        isRequired={false}
        isReadOnly={false}
        value={commentId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId: value,
              title,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.commentId ?? value;
          }
          if (errors.commentId?.hasError) {
            runValidationTasks("commentId", value);
          }
          setCommentId(value);
        }}
        onBlur={() => runValidationTasks("commentId", commentId)}
        errorMessage={errors.commentId?.errorMessage}
        hasError={errors.commentId?.hasError}
        {...getOverrideProps(overrides, "commentId")}
      ></TextField>
      <TextField
        label="Title"
        isRequired={true}
        isReadOnly={false}
        value={title}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title: value,
              body,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.title ?? value;
          }
          if (errors.title?.hasError) {
            runValidationTasks("title", value);
          }
          setTitle(value);
        }}
        onBlur={() => runValidationTasks("title", title)}
        errorMessage={errors.title?.errorMessage}
        hasError={errors.title?.hasError}
        {...getOverrideProps(overrides, "title")}
      ></TextField>
      <TextField
        label="Body"
        isRequired={true}
        isReadOnly={false}
        value={body}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title,
              body: value,
              isRead,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.body ?? value;
          }
          if (errors.body?.hasError) {
            runValidationTasks("body", value);
          }
          setBody(value);
        }}
        onBlur={() => runValidationTasks("body", body)}
        errorMessage={errors.body?.errorMessage}
        hasError={errors.body?.hasError}
        {...getOverrideProps(overrides, "body")}
      ></TextField>
      <SwitchField
        label="Is read"
        defaultChecked={false}
        isDisabled={false}
        isChecked={isRead}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title,
              body,
              isRead: value,
              readAt,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.isRead ?? value;
          }
          if (errors.isRead?.hasError) {
            runValidationTasks("isRead", value);
          }
          setIsRead(value);
        }}
        onBlur={() => runValidationTasks("isRead", isRead)}
        errorMessage={errors.isRead?.errorMessage}
        hasError={errors.isRead?.hasError}
        {...getOverrideProps(overrides, "isRead")}
      ></SwitchField>
      <TextField
        label="Read at"
        isRequired={false}
        isReadOnly={false}
        value={readAt}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title,
              body,
              isRead,
              readAt: value,
              eventAt,
            };
            const result = onChange(modelFields);
            value = result?.readAt ?? value;
          }
          if (errors.readAt?.hasError) {
            runValidationTasks("readAt", value);
          }
          setReadAt(value);
        }}
        onBlur={() => runValidationTasks("readAt", readAt)}
        errorMessage={errors.readAt?.errorMessage}
        hasError={errors.readAt?.hasError}
        {...getOverrideProps(overrides, "readAt")}
      ></TextField>
      <TextField
        label="Event at"
        isRequired={true}
        isReadOnly={false}
        value={eventAt}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              recipientStaffId,
              actorStaffId,
              workflowId,
              eventType,
              commentId,
              title,
              body,
              isRead,
              readAt,
              eventAt: value,
            };
            const result = onChange(modelFields);
            value = result?.eventAt ?? value;
          }
          if (errors.eventAt?.hasError) {
            runValidationTasks("eventAt", value);
          }
          setEventAt(value);
        }}
        onBlur={() => runValidationTasks("eventAt", eventAt)}
        errorMessage={errors.eventAt?.errorMessage}
        hasError={errors.eventAt?.hasError}
        {...getOverrideProps(overrides, "eventAt")}
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
