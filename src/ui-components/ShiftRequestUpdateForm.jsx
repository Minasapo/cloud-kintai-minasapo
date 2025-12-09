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
import { getShiftRequest } from "/api/graphql/documents/queries";
import { updateShiftRequest } from "/api/graphql/documents/mutations";
export default function ShiftRequestUpdateForm(props) {
  const {
    id: idProp,
    shiftRequest: shiftRequestModelProp,
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
    targetMonth: "",
    note: "",
    submittedAt: "",
    updatedAt: "",
  };
  const [staffId, setStaffId] = React.useState(initialValues.staffId);
  const [targetMonth, setTargetMonth] = React.useState(
    initialValues.targetMonth
  );
  const [note, setNote] = React.useState(initialValues.note);
  const [submittedAt, setSubmittedAt] = React.useState(
    initialValues.submittedAt
  );
  const [updatedAt, setUpdatedAt] = React.useState(initialValues.updatedAt);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = shiftRequestRecord
      ? { ...initialValues, ...shiftRequestRecord }
      : initialValues;
    setStaffId(cleanValues.staffId);
    setTargetMonth(cleanValues.targetMonth);
    setNote(cleanValues.note);
    setSubmittedAt(cleanValues.submittedAt);
    setUpdatedAt(cleanValues.updatedAt);
    setErrors({});
  };
  const [shiftRequestRecord, setShiftRequestRecord] = React.useState(
    shiftRequestModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await API.graphql({
              query: getShiftRequest.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getShiftRequest
        : shiftRequestModelProp;
      setShiftRequestRecord(record);
    };
    queryData();
  }, [idProp, shiftRequestModelProp]);
  React.useEffect(resetStateValues, [shiftRequestRecord]);
  const validations = {
    staffId: [{ type: "Required" }],
    targetMonth: [{ type: "Required" }],
    note: [],
    submittedAt: [],
    updatedAt: [],
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
          targetMonth,
          note: note ?? null,
          submittedAt: submittedAt ?? null,
          updatedAt: updatedAt ?? null,
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
            query: updateShiftRequest.replaceAll("__typename", ""),
            variables: {
              input: {
                id: shiftRequestRecord.id,
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
      {...getOverrideProps(overrides, "ShiftRequestUpdateForm")}
      {...rest}
    >
      <TextField
        label="Staff id"
        isRequired={true}
        isReadOnly={false}
        value={staffId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId: value,
              targetMonth,
              note,
              submittedAt,
              updatedAt,
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
        label="Target month"
        isRequired={true}
        isReadOnly={false}
        value={targetMonth}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              targetMonth: value,
              note,
              submittedAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.targetMonth ?? value;
          }
          if (errors.targetMonth?.hasError) {
            runValidationTasks("targetMonth", value);
          }
          setTargetMonth(value);
        }}
        onBlur={() => runValidationTasks("targetMonth", targetMonth)}
        errorMessage={errors.targetMonth?.errorMessage}
        hasError={errors.targetMonth?.hasError}
        {...getOverrideProps(overrides, "targetMonth")}
      ></TextField>
      <TextField
        label="Note"
        isRequired={false}
        isReadOnly={false}
        value={note}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              targetMonth,
              note: value,
              submittedAt,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.note ?? value;
          }
          if (errors.note?.hasError) {
            runValidationTasks("note", value);
          }
          setNote(value);
        }}
        onBlur={() => runValidationTasks("note", note)}
        errorMessage={errors.note?.errorMessage}
        hasError={errors.note?.hasError}
        {...getOverrideProps(overrides, "note")}
      ></TextField>
      <TextField
        label="Submitted at"
        isRequired={false}
        isReadOnly={false}
        value={submittedAt}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              targetMonth,
              note,
              submittedAt: value,
              updatedAt,
            };
            const result = onChange(modelFields);
            value = result?.submittedAt ?? value;
          }
          if (errors.submittedAt?.hasError) {
            runValidationTasks("submittedAt", value);
          }
          setSubmittedAt(value);
        }}
        onBlur={() => runValidationTasks("submittedAt", submittedAt)}
        errorMessage={errors.submittedAt?.errorMessage}
        hasError={errors.submittedAt?.hasError}
        {...getOverrideProps(overrides, "submittedAt")}
      ></TextField>
      <TextField
        label="Updated at"
        isRequired={false}
        isReadOnly={false}
        value={updatedAt}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              staffId,
              targetMonth,
              note,
              submittedAt,
              updatedAt: value,
            };
            const result = onChange(modelFields);
            value = result?.updatedAt ?? value;
          }
          if (errors.updatedAt?.hasError) {
            runValidationTasks("updatedAt", value);
          }
          setUpdatedAt(value);
        }}
        onBlur={() => runValidationTasks("updatedAt", updatedAt)}
        errorMessage={errors.updatedAt?.errorMessage}
        hasError={errors.updatedAt?.hasError}
        {...getOverrideProps(overrides, "updatedAt")}
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
          isDisabled={!(idProp || shiftRequestModelProp)}
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
              !(idProp || shiftRequestModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
