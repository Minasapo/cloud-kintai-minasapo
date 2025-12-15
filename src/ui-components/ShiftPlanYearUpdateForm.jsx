/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { getShiftPlanYear } from "@shared/api/graphql/documents/queries";
import { updateShiftPlanYear } from "@shared/api/graphql/documents/mutations";
export default function ShiftPlanYearUpdateForm(props) {
  const {
    id: idProp,
    shiftPlanYear: shiftPlanYearModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    targetYear: "",
    notes: "",
    createdBy: "",
    updatedBy: "",
  };
  const [targetYear, setTargetYear] = React.useState(initialValues.targetYear);
  const [notes, setNotes] = React.useState(initialValues.notes);
  const [createdBy, setCreatedBy] = React.useState(initialValues.createdBy);
  const [updatedBy, setUpdatedBy] = React.useState(initialValues.updatedBy);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = shiftPlanYearRecord
      ? { ...initialValues, ...shiftPlanYearRecord }
      : initialValues;
    setTargetYear(cleanValues.targetYear);
    setNotes(cleanValues.notes);
    setCreatedBy(cleanValues.createdBy);
    setUpdatedBy(cleanValues.updatedBy);
    setErrors({});
  };
  const [shiftPlanYearRecord, setShiftPlanYearRecord] = React.useState(
    shiftPlanYearModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await graphqlClient.graphql({
              query: getShiftPlanYear.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getShiftPlanYear
        : shiftPlanYearModelProp;
      setShiftPlanYearRecord(record);
    };
    queryData();
  }, [idProp, shiftPlanYearModelProp]);
  React.useEffect(resetStateValues, [shiftPlanYearRecord]);
  const validations = {
    targetYear: [{ type: "Required" }],
    notes: [],
    createdBy: [],
    updatedBy: [],
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
          targetYear,
          notes: notes ?? null,
          createdBy: createdBy ?? null,
          updatedBy: updatedBy ?? null,
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
          await graphqlClient.graphql({
            query: updateShiftPlanYear.replaceAll("__typename", ""),
            variables: {
              input: {
                id: shiftPlanYearRecord.id,
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
      {...getOverrideProps(overrides, "ShiftPlanYearUpdateForm")}
      {...rest}
    >
      <TextField
        label="Target year"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={targetYear}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              targetYear: value,
              notes,
              createdBy,
              updatedBy,
            };
            const result = onChange(modelFields);
            value = result?.targetYear ?? value;
          }
          if (errors.targetYear?.hasError) {
            runValidationTasks("targetYear", value);
          }
          setTargetYear(value);
        }}
        onBlur={() => runValidationTasks("targetYear", targetYear)}
        errorMessage={errors.targetYear?.errorMessage}
        hasError={errors.targetYear?.hasError}
        {...getOverrideProps(overrides, "targetYear")}
      ></TextField>
      <TextField
        label="Notes"
        isRequired={false}
        isReadOnly={false}
        value={notes}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              targetYear,
              notes: value,
              createdBy,
              updatedBy,
            };
            const result = onChange(modelFields);
            value = result?.notes ?? value;
          }
          if (errors.notes?.hasError) {
            runValidationTasks("notes", value);
          }
          setNotes(value);
        }}
        onBlur={() => runValidationTasks("notes", notes)}
        errorMessage={errors.notes?.errorMessage}
        hasError={errors.notes?.hasError}
        {...getOverrideProps(overrides, "notes")}
      ></TextField>
      <TextField
        label="Created by"
        isRequired={false}
        isReadOnly={false}
        value={createdBy}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              targetYear,
              notes,
              createdBy: value,
              updatedBy,
            };
            const result = onChange(modelFields);
            value = result?.createdBy ?? value;
          }
          if (errors.createdBy?.hasError) {
            runValidationTasks("createdBy", value);
          }
          setCreatedBy(value);
        }}
        onBlur={() => runValidationTasks("createdBy", createdBy)}
        errorMessage={errors.createdBy?.errorMessage}
        hasError={errors.createdBy?.hasError}
        {...getOverrideProps(overrides, "createdBy")}
      ></TextField>
      <TextField
        label="Updated by"
        isRequired={false}
        isReadOnly={false}
        value={updatedBy}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              targetYear,
              notes,
              createdBy,
              updatedBy: value,
            };
            const result = onChange(modelFields);
            value = result?.updatedBy ?? value;
          }
          if (errors.updatedBy?.hasError) {
            runValidationTasks("updatedBy", value);
          }
          setUpdatedBy(value);
        }}
        onBlur={() => runValidationTasks("updatedBy", updatedBy)}
        errorMessage={errors.updatedBy?.errorMessage}
        hasError={errors.updatedBy?.hasError}
        {...getOverrideProps(overrides, "updatedBy")}
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
          isDisabled={!(idProp || shiftPlanYearModelProp)}
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
              !(idProp || shiftPlanYearModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
