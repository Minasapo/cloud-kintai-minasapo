import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { graphqlBaseQuery } from "@shared/api/graphql/graphqlBaseQuery";

const mockApi = {} as BaseQueryApi;
const mockExtraOptions = {};

jest.mock("@shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn(),
  },
}));

const mockGraphql = graphqlClient.graphql as jest.Mock;

describe("graphqlBaseQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success cases", () => {
    it("クエリが成功した場合、data を返すこと", async () => {
      mockGraphql.mockResolvedValue({ data: { user: { id: "1" } } });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { user { id } }" }, mockApi, mockExtraOptions);

      expect(result).toEqual({ data: { user: { id: "1" } } });
    });

    it("result.data が undefined の場合、data に null を返すこと", async () => {
      mockGraphql.mockResolvedValue({ data: undefined });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions);

      expect(result).toEqual({ data: null });
    });

    it("variables を graphqlClient に渡すこと", async () => {
      mockGraphql.mockResolvedValue({ data: {} });
      const fn = graphqlBaseQuery();
      await fn({ document: "query ($id: ID!) { item(id: $id) }", variables: { id: "123" } }, mockApi, mockExtraOptions);

      expect(mockGraphql).toHaveBeenCalledWith(
        expect.objectContaining({ variables: { id: "123" } }),
      );
    });

    it("authMode 未指定の場合、defaultAuthMode を使用すること", async () => {
      mockGraphql.mockResolvedValue({ data: {} });
      const fn = graphqlBaseQuery({ defaultAuthMode: "iam" });
      await fn({ document: "query { noop }" }, mockApi, mockExtraOptions);

      expect(mockGraphql).toHaveBeenCalledWith(
        expect.objectContaining({ authMode: "iam" }),
      );
    });

    it("リクエスト単位の authMode 指定が defaultAuthMode を上書きすること", async () => {
      mockGraphql.mockResolvedValue({ data: {} });
      const fn = graphqlBaseQuery({ defaultAuthMode: "userPool" });
      await fn({ document: "query { noop }", authMode: "apiKey" }, mockApi, mockExtraOptions);

      expect(mockGraphql).toHaveBeenCalledWith(
        expect.objectContaining({ authMode: "apiKey" }),
      );
    });

    it("defaultAuthMode 未設定の場合、userPool を既定値として使用すること", async () => {
      mockGraphql.mockResolvedValue({ data: {} });
      const fn = graphqlBaseQuery();
      await fn({ document: "query { noop }" }, mockApi, mockExtraOptions);

      expect(mockGraphql).toHaveBeenCalledWith(
        expect.objectContaining({ authMode: "userPool" }),
      );
    });
  });

  describe("GraphQL errors in response", () => {
    it("result.errors が存在する場合、error を返すこと", async () => {
      mockGraphql.mockResolvedValue({
        data: null,
        errors: [{ message: "Field not found" }],
      });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { bad }" }, mockApi, mockExtraOptions);

      expect(result).toEqual({
        error: {
          message: "GraphQL request failed",
          details: expect.arrayContaining([
            expect.objectContaining({ message: "Field not found" }),
          ]),
        },
      });
    });

    it("エラーに path がある場合、details に path を含めること", async () => {
      mockGraphql.mockResolvedValue({
        data: null,
        errors: [{ message: "Not found", path: ["user", "id"] }],
      });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { user { id } }" }, mockApi, mockExtraOptions) as {
        error: { details: unknown[] };
      };

      expect((result.error.details as Array<Record<string, unknown>>)[0].path).toEqual(["user", "id"]);
    });

    it("errorType がある場合、details に errorType を含めること", async () => {
      mockGraphql.mockResolvedValue({
        data: null,
        errors: [{ message: "Unauthorized", errorType: "Unauthorized" }],
      });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { secret }" }, mockApi, mockExtraOptions) as {
        error: { details: unknown[] };
      };

      expect((result.error.details as Array<Record<string, unknown>>)[0].errorType).toBe("Unauthorized");
    });

    it("errors 配列が空の場合、error を返さないこと", async () => {
      mockGraphql.mockResolvedValue({ data: { user: { id: "1" } }, errors: [] });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { user { id } }" }, mockApi, mockExtraOptions);

      expect(result).toEqual({ data: { user: { id: "1" } } });
    });
  });

  describe("thrown error handling", () => {
    it("Error が throw された場合、message を含む error を返すこと", async () => {
      mockGraphql.mockRejectedValue(new Error("Network error"));
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions);

      expect(result).toEqual({
        error: expect.objectContaining({
          message: "Network error",
          details: expect.objectContaining({ message: "Network error" }),
        }),
      });
    });

    it("Error 名を details に含めること", async () => {
      mockGraphql.mockRejectedValue(new TypeError("Type mismatch"));
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions) as {
        error: { details: Record<string, unknown> };
      };

      expect(result.error.details.name).toBe("TypeError");
    });

    it("statusCode が存在する場合、details に statusCode を含めること", async () => {
      const err = Object.assign(new Error("Forbidden"), { statusCode: 403 });
      mockGraphql.mockRejectedValue(err);
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions) as {
        error: { details: Record<string, unknown> };
      };

      expect(result.error.details.statusCode).toBe(403);
    });

    it("Error 以外の値が throw された場合、error を返すこと", async () => {
      mockGraphql.mockRejectedValue({ code: "CUSTOM_ERROR", value: 42 });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions) as {
        error: { message: string; details: unknown };
      };

      expect(result.error.message).toBe("Unknown error");
      expect(result.error.details).toBeDefined();
    });

    it("文字列が throw された場合、フォールバックメッセージを返すこと", async () => {
      mockGraphql.mockRejectedValue("string error");
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions) as {
        error: { message: string };
      };

      expect(result.error.message).toBe("Unknown error");
    });
  });

  describe("serializeValue edge cases via error details", () => {
    it("GraphQL error extensions のネストオブジェクトをシリアライズすること", async () => {
      mockGraphql.mockResolvedValue({
        data: null,
        errors: [
          {
            message: "Error",
            extensions: { code: "NOT_FOUND", extra: { nested: true } },
          },
        ],
      });
      const fn = graphqlBaseQuery();
      const result = await fn({ document: "query { noop }" }, mockApi, mockExtraOptions) as {
        error: { details: Array<Record<string, unknown>> };
      };

      const ext = result.error.details[0].extensions as Record<string, unknown>;
      expect(ext.code).toBe("NOT_FOUND");
    });
  });
});
