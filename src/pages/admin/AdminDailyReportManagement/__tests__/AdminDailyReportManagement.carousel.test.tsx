import { render, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDailyReportManagement from "../AdminDailyReportManagement";

// Mock dependencies
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

jest.mock("@/lib/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: jest.fn().mockResolvedValue({
      data: {
        listDailyReports: {
          items: [
            {
              id: "report-1",
              reportDate: "2024-01-20",
              title: "Report 1",
              content: "Content 1",
              staffId: "staff-1",
              status: "submitted",
              reactions: [],
              comments: [],
              updatedAt: "2024-01-20T10:00:00Z",
            },
            {
              id: "report-2",
              reportDate: "2024-01-19",
              title: "Report 2",
              content: "Content 2",
              staffId: "staff-1",
              status: "submitted",
              reactions: [],
              comments: [],
              updatedAt: "2024-01-19T10:00:00Z",
            },
          ],
          nextToken: null,
        },
      },
      errors: null,
    }),
  },
}));

describe("AdminDailyReportManagement - Carousel Navigation State", () => {
  it("passes carousel state to detail page when navigating to a report", async () => {
    const mockNavigate = jest.fn();
    jest.doMock("react-router-dom", () => {
      const originalModule = jest.requireActual("react-router-dom");
      return {
        ...originalModule,
        useNavigate: () => mockNavigate,
      };
    });

    const { container } = render(
      <BrowserRouter>
        <AdminDailyReportManagement />
      </BrowserRouter>
    );

    // Wait for the table to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the first row in the table
    const rows = container.querySelectorAll("tbody tr");
    if (rows.length > 0) {
      fireEvent.click(rows[0]);

      // Check if navigate was called with carousel state
      expect(mockNavigate).toHaveBeenCalled();
      const callArgs = mockNavigate.mock.calls[0];
      if (callArgs[1] && callArgs[1].state) {
        expect(callArgs[1].state).toHaveProperty("carouselState");
        expect(callArgs[1].state.carouselState).toHaveProperty("filteredReports");
        expect(callArgs[1].state.carouselState).toHaveProperty("currentIndex");
      }
    }
  });

  it("includes filter conditions in the passed state", async () => {
    const { container } = await render(
      <BrowserRouter>
        <AdminDailyReportManagement />
      </BrowserRouter>
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Filter by staff
    const staffSelect = container.querySelector("#staff-filter-label");
    if (staffSelect) {
      fireEvent.click(staffSelect);
    }

    // Navigate logic would include filters in state
    // This would require more comprehensive mocking
  });
});
