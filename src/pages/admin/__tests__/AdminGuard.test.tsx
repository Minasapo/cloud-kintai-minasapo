import { AuthContext } from "@app/providers/auth/AuthContext";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AdminGuard from "../AdminGuard";

function renderAdminGuard(roles: StaffRole[]) {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AuthContext.Provider
        value={{
          signOut: jest.fn(),
          signIn: jest.fn(),
          authStatus: "authenticated",
          cognitoUser: {
            id: "user-1",
            givenName: "太郎",
            familyName: "田中",
            mailAddress: "tanaka@example.com",
            roles,
            owner: false,
            emailVerified: true,
          },
          isCognitoUserRole: (role: StaffRole) => roles.includes(role),
          hasRole: (role: StaffRole) => roles.includes(role),
          roles,
        }}
      >
        <Routes>
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<div>admin content</div>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe("AdminGuard", () => {
  it("renders child route for admin role", () => {
    renderAdminGuard([StaffRole.ADMIN]);
    expect(screen.getByText("admin content")).toBeInTheDocument();
  });

  it("renders not-found page for non-admin role", () => {
    renderAdminGuard([StaffRole.STAFF]);
    expect(screen.getByText("ページが見つかりません")).toBeInTheDocument();
  });
});
