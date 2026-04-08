import type { WorkflowCategoryOrderItem } from "@entities/workflow/lib/workflowLabels";
import { WorkflowCategory } from "@shared/api/graphql/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import AdminWorkflowSettingsContent from "./AdminWorkflowSettingsContent";
import { useAdminWorkflowSettings } from "./useAdminWorkflowSettings";

const initialItems: WorkflowCategoryOrderItem[] = [
  {
    category: WorkflowCategory.PAID_LEAVE,
    label: "有給休暇申請",
    displayOrder: 0,
    enabled: true,
  },
  {
    category: WorkflowCategory.OVERTIME,
    label: "残業申請",
    displayOrder: 1,
    enabled: true,
  },
];

function TestHarness() {
  const [items, setItems] = useState(initialItems);
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const state = {
    items,
    saving: false,
    hasChanges: false,
    templates: [
      {
        __typename: "WorkflowTemplate",
        id: "template-1",
        name: "稟議申請",
        title: "件名テンプレート",
        content: "本文テンプレート",
        organizationId: "default",
        updatedAt: "2026-04-01T00:00:00.000Z",
        createdAt: "2026-04-01T00:00:00.000Z",
      },
    ],
    templateLoading: false,
    templateError: null,
    templateName,
    setTemplateName,
    templateTitle,
    setTemplateTitle,
    templateContent,
    setTemplateContent,
    editingTemplateId: null,
    templateSaving: false,
    hasTemplateChanges: false,
    isDirty: false,
    isBusy: false,
    handleToggleEnabled: (index: number) => {
      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, enabled: !item.enabled } : item,
        ),
      );
    },
    handleMoveItem: (from: number, to: number) => {
      setItems((current) => {
        if (to < 0 || to >= current.length) {
          return current;
        }

        const moved = current[from];
        if (!moved) {
          return current;
        }

        const next = current.toSpliced(from, 1).toSpliced(to, 0, moved);
        return next.map((item, index) => ({ ...item, displayOrder: index }));
      });
    },
    handleReset: () => setItems(initialItems),
    resetTemplateForm: () => {
      setTemplateName("");
      setTemplateTitle("");
      setTemplateContent("");
    },
    handleTemplateSubmit: jest.fn(),
    handleTemplateEdit: jest.fn(),
    handleTemplateDelete: jest.fn(),
  } satisfies ReturnType<typeof useAdminWorkflowSettings>;

  return <AdminWorkflowSettingsContent state={state} />;
}

const expectBefore = (firstText: string, secondText: string) => {
  const first = screen.getByText(firstText);
  const second = screen.getByText(secondText);

  expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)
    .toBeTruthy();
};

describe("AdminWorkflowSettingsContent", () => {
  it("タブ切り替えで表示セクションを切り替える", () => {
    render(<TestHarness />);

    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ワークフロー種別" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "ワークフローテンプレート" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "ワークフローテンプレート" }),
    );

    expect(
      screen.queryByRole("heading", { name: "ワークフロー種別" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ワークフローテンプレート" }),
    ).toBeInTheDocument();
  });

  it("テンプレート入力値をタブ切り替え後も保持する", () => {
    render(<TestHarness />);

    fireEvent.click(
      screen.getByRole("tab", { name: "ワークフローテンプレート" }),
    );
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "出張申請" },
    });

    fireEvent.click(screen.getByRole("tab", { name: "ワークフロー種別" }));
    fireEvent.click(
      screen.getByRole("tab", { name: "ワークフローテンプレート" }),
    );

    expect(screen.getAllByRole("textbox")[0]).toHaveValue("出張申請");
  });

  it("カテゴリの並び替えをタブ切り替え後も保持する", () => {
    render(<TestHarness />);

    expectBefore("有給休暇申請", "残業申請");

    fireEvent.click(screen.getByRole("button", { name: "残業申請を上へ移動" }));

    expectBefore("残業申請", "有給休暇申請");

    fireEvent.click(
      screen.getByRole("tab", { name: "ワークフローテンプレート" }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "ワークフロー種別" }));

    expectBefore("残業申請", "有給休暇申請");
  });
});
