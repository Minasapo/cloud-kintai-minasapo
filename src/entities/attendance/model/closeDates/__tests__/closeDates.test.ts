import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  type CreateCloseDateInput,
  type ModelCloseDateConditionInput,
  type UpdateCloseDateInput,
} from "@shared/api/graphql/types";

import createCloseDateData from "../createCloseDateData";
import deleteCloseDateData from "../deleteCloseDateData";
import fetchCloseDates from "../fetchCloseDates";
import updateCloseDateData from "../updateCloseDateData";

const mockedGraphql = graphqlClient.graphql as jest.Mock;

const makeCreateCloseDateInput = (
  overrides: Partial<CreateCloseDateInput> = {},
): CreateCloseDateInput => ({
  closeDate: "2024-01-31",
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  ...overrides,
});

const makeUpdateCloseDateInput = (
  overrides: Partial<UpdateCloseDateInput> = {},
): UpdateCloseDateInput => ({
  id: "1",
  ...overrides,
});

// ---------------------------------------------------------------------------
// fetchCloseDates
// ---------------------------------------------------------------------------
describe("fetchCloseDates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("closeDates のリストを返す", async () => {
    const mockItems = [
      {
        id: "1",
        closeDate: "2024-01-31",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    ];
    mockedGraphql.mockResolvedValueOnce({
      data: { listCloseDates: { items: mockItems, nextToken: null } },
    });

    const result = await fetchCloseDates();

    expect(result).toEqual(mockItems);
    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({ authMode: "userPool" }),
    );
  });

  it("nextToken がある場合はページネーションで全件取得する", async () => {
    const page1 = [
      {
        id: "1",
        closeDate: "2024-01-31",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    ];
    const page2 = [
      {
        id: "2",
        closeDate: "2024-02-29",
        startDate: "2024-02-01",
        endDate: "2024-02-29",
      },
    ];

    mockedGraphql
      .mockResolvedValueOnce({
        data: { listCloseDates: { items: page1, nextToken: "token123" } },
      })
      .mockResolvedValueOnce({
        data: { listCloseDates: { items: page2, nextToken: null } },
      });

    const result = await fetchCloseDates();

    expect(result).toHaveLength(2);
    expect(result).toEqual([...page1, ...page2]);
    expect(mockedGraphql).toHaveBeenCalledTimes(2);
  });

  it("null アイテムをフィルタリングする", async () => {
    const mockItems = [
      { id: "1", closeDate: "2024-01-31" },
      null,
      { id: "2", closeDate: "2024-02-29" },
    ];
    mockedGraphql.mockResolvedValueOnce({
      data: { listCloseDates: { items: mockItems, nextToken: null } },
    });

    const result = await fetchCloseDates();

    expect(result).toHaveLength(2);
  });

  it("GraphQL errors が返された場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      errors: [{ message: "GraphQL fetch error" }],
    });

    await expect(fetchCloseDates()).rejects.toThrow("GraphQL fetch error");
  });

  it("data が返されない場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({ data: { listCloseDates: null } });

    await expect(fetchCloseDates()).rejects.toThrow("No data returned");
  });
});

// ---------------------------------------------------------------------------
// createCloseDateData
// ---------------------------------------------------------------------------
describe("createCloseDateData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("作成した CloseDate を返す", async () => {
    const mockCloseDate = {
      id: "new-1",
      closeDate: "2024-01-31",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };
    mockedGraphql.mockResolvedValueOnce({
      data: { createCloseDate: mockCloseDate },
    });

    const result = await createCloseDateData(makeCreateCloseDateInput());

    expect(result).toEqual(mockCloseDate);
    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({ authMode: "userPool" }),
    );
  });

  it("input を variables に含めて呼び出す", async () => {
    const input = {
      closeDate: "2024-01-31",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };
    mockedGraphql.mockResolvedValueOnce({
      data: { createCloseDate: { id: "1", ...input } },
    });

    await createCloseDateData(input);

    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input },
      }),
    );
  });

  it("GraphQL errors が返された場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      errors: [{ message: "Create error" }],
    });

    await expect(createCloseDateData(makeCreateCloseDateInput())).rejects.toThrow(
      "Create error",
    );
  });

  it("data がない場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      data: { createCloseDate: null },
    });

    await expect(createCloseDateData(makeCreateCloseDateInput())).rejects.toThrow(
      "No data returned",
    );
  });
});

// ---------------------------------------------------------------------------
// updateCloseDateData
// ---------------------------------------------------------------------------
describe("updateCloseDateData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("更新した CloseDate を返す", async () => {
    const mockCloseDate = {
      id: "1",
      closeDate: "2024-01-28",
      startDate: "2024-01-01",
      endDate: "2024-01-28",
      version: 2,
    };
    mockedGraphql.mockResolvedValueOnce({
      data: { updateCloseDate: mockCloseDate },
    });

    const result = await updateCloseDateData({
      input: makeUpdateCloseDateInput(),
    });

    expect(result).toEqual(mockCloseDate);
    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({ authMode: "userPool" }),
    );
  });

  it("condition を variables に含めて送信する", async () => {
    const mockCloseDate = { id: "1", closeDate: "2024-01-28", version: 2 };
    mockedGraphql.mockResolvedValueOnce({
      data: { updateCloseDate: mockCloseDate },
    });
    const condition: ModelCloseDateConditionInput = { version: { eq: 1 } };

    await updateCloseDateData({
      input: makeUpdateCloseDateInput({ closeDate: "2024-01-28" }),
      condition,
    });

    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ condition }),
      }),
    );
  });

  it("condition が未指定のとき variables.condition は undefined になる", async () => {
    const mockCloseDate = { id: "1", closeDate: "2024-01-28", version: 2 };
    mockedGraphql.mockResolvedValueOnce({
      data: { updateCloseDate: mockCloseDate },
    });

    await updateCloseDateData({
      input: makeUpdateCloseDateInput({ closeDate: "2024-01-28" }),
    });

    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ condition: undefined }),
      }),
    );
  });

  it("GraphQL errors が返された場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      errors: [{ message: "Update error" }],
    });

    await expect(
      updateCloseDateData({ input: makeUpdateCloseDateInput() }),
    ).rejects.toThrow("Update error");
  });

  it("data がない場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      data: { updateCloseDate: null },
    });

    await expect(
      updateCloseDateData({ input: makeUpdateCloseDateInput() }),
    ).rejects.toThrow("No data returned");
  });
});

// ---------------------------------------------------------------------------
// deleteCloseDateData
// ---------------------------------------------------------------------------
describe("deleteCloseDateData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("削除した CloseDate を返す", async () => {
    const mockCloseDate = {
      id: "del-1",
      closeDate: "2024-01-31",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    };
    mockedGraphql.mockResolvedValueOnce({
      data: { deleteCloseDate: mockCloseDate },
    });

    const result = await deleteCloseDateData({ id: "del-1" });

    expect(result).toEqual(mockCloseDate);
    expect(mockedGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        authMode: "userPool",
        variables: { input: { id: "del-1" } },
      }),
    );
  });

  it("GraphQL errors が返された場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      errors: [{ message: "Delete error" }],
    });

    await expect(deleteCloseDateData({ id: "del-1" })).rejects.toThrow(
      "Delete error",
    );
  });

  it("data がない場合は例外をスローする", async () => {
    mockedGraphql.mockResolvedValueOnce({
      data: { deleteCloseDate: null },
    });

    await expect(deleteCloseDateData({ id: "del-1" })).rejects.toThrow(
      "No data returned",
    );
  });
});
