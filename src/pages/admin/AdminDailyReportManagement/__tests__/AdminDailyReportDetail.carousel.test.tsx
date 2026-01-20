import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDailyReportDetail from "../AdminDailyReportDetail";

// Mock dependencies
jest.mock("@/hooks/useCognitoUser", () => ({
  __esModule: true,
  default: () => ({
    cognitoUser: { id: "test-user-id" },
  }),
}));

jest.mock("@/hooks/useStaffs/useStaffs", () => ({
  useStaffs: () => ({
    staffs: [
      {
        id: "staff-1",
        familyName: "Test",
        givenName: "User",
      },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock("@/hooks/useStaff/fetchStaff", () => ({
  __esModule: true,
  default: async (id: string) => ({
    id,
    familyName: "Test",
    givenName: "User",
  }),
}));

jest.mock("@/lib/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn(),
  },
}));

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useParams: () => ({ id: "report-1" }),
    useLocation: () => ({
      state: {
        report: {
          id: "report-1",
          title: "Test Report",
          date: "2024-01-20",
          author: "Test User",
          staffId: "staff-1",
          content: "Test content",
          status: "submitted",
          reactions: [],
          comments: [],
          updatedAt: "2024-01-20T10:00:00Z",
        },
        carouselState: {
          filteredReports: [
            {
              id: "report-1",
              title: "Test Report 1",
              date: "2024-01-20",
              author: "Test User",
              staffId: "staff-1",
              content: "Test content 1",
              status: "submitted",
              reactions: [],
              comments: [],
              updatedAt: "2024-01-20T10:00:00Z",
            },
            {
              id: "report-2",
              title: "Test Report 2",
              date: "2024-01-19",
              author: "Test User",
              staffId: "staff-1",
              content: "Test content 2",
              status: "submitted",
              reactions: [],
              comments: [],
              updatedAt: "2024-01-19T10:00:00Z",
            },
          ],
          currentIndex: 0,
        },
      },
    }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
});

describe("AdminDailyReportDetail - Carousel Feature", () => {
  it("displays carousel controls when carousel state is available", () => {
    const { container } = render(
      <BrowserRouter>
        <AdminDailyReportDetail />
      </BrowserRouter>
    );

    // Check if carousel container exists
    expect(container.textContent).toContain("1 / 2");
  });

  it("shows previous button disabled when on first item", () => {
    const { container } = render(
      <BrowserRouter>
        <AdminDailyReportDetail />
      </BrowserRouter>
    );

    const prevButtons = container.querySelectorAll("button");
    const prevButton = Array.from(prevButtons).find((btn) =>
      btn.textContent?.includes("前へ")
    );
    expect(prevButton).toBeDisabled();
  });

  it("shows next button enabled when not on last item", () => {
    const { container } = render(
      <BrowserRouter>
        <AdminDailyReportDetail />
      </BrowserRouter>
    );

    const nextButtons = container.querySelectorAll("button");
    const nextButton = Array.from(nextButtons).find((btn) =>
      btn.textContent?.includes("次へ")
    );
    expect(nextButton).toBeEnabled();
  });

  it("does not display carousel when carousel state is not available", () => {
    jest.resetModules();
    jest.doMock("react-router-dom", () => {
      const originalModule = jest.requireActual("react-router-dom");
      return {
        ...originalModule,
        useParams: () => ({ id: "report-1" }),
        useLocation: () => ({
          state: {
            report: {
              id: "report-1",
              title: "Test Report",
              date: "2024-01-20",
              author: "Test User",
              staffId: "staff-1",
              content: "Test content",
              status: "submitted",
              reactions: [],
              comments: [],
              updatedAt: "2024-01-20T10:00:00Z",
            },
          },
        }),
        useSearchParams: () => [new URLSearchParams(), jest.fn()],
      };
    });

    const { container } = render(
      <BrowserRouter>
        <AdminDailyReportDetail />
      </BrowserRouter>
    );

    // Carousel should not be visible
    expect(container.textContent).not.toContain(" / ");
  });
});
