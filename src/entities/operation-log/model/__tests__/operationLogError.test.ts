import {
  buildOperationLogMutationError,
  classifyOperationLogErrorKind,
} from "../operationLogError";

describe("operationLogError", () => {
  it("classifies authorization errors", () => {
    expect(
      classifyOperationLogErrorKind([
        "Not Authorized to access createOperationLog on type Mutation",
      ]),
    ).toBe("authorization");
  });

  it("classifies network errors", () => {
    expect(classifyOperationLogErrorKind(["Failed to fetch"])).toBe("network");
  });

  it("classifies validation errors", () => {
    expect(
      classifyOperationLogErrorKind([
        "Validation error of type UndefinedField: Field 'foo' is not defined by type CreateOperationLogInput",
      ]),
    ).toBe("validation");
  });

  it("builds mutation error from GraphQL errors", () => {
    const error = buildOperationLogMutationError([
      {
        message:
          "Validation error of type UndefinedField: Field 'foo' is not defined by type CreateOperationLogInput",
      },
    ]);

    expect(error.name).toBe("OperationLogMutationError");
    expect(error.kind).toBe("validation");
    expect(error.message).toContain("Validation error");
  });
});
