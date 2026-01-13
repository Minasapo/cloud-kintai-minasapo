import type { Meta, StoryObj } from "@storybook/react";
import { Box, Stack, Typography } from "@mui/material";
import WorkflowApprovalTimeline from "@features/workflow/approval-flow/ui/WorkflowApprovalTimeline";
import type { WorkflowApprovalStepView } from "@features/workflow/approval-flow/types";

const meta = {
  title: "Features/Workflow/ApprovalTimeline",
  component: WorkflowApprovalTimeline,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "タイムラインのタイトル",
    },
    steps: {
      description: "承認ステップ配列",
    },
  },
} satisfies Meta<typeof WorkflowApprovalTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSteps: WorkflowApprovalStepView[] = [
  {
    id: "step1",
    role: "申請者",
    state: "承認済み",
    approvedAt: "2026-01-13",
    comment: "申請しました",
  },
  {
    id: "step2",
    role: "承認者1",
    state: "承認済み",
    approvedAt: "2026-01-13",
    comment: "承認しました",
  },
  {
    id: "step3",
    role: "承認者2",
    state: "未承認",
    approvedAt: null,
    comment: null,
  },
];

const pendingSteps: WorkflowApprovalStepView[] = [
  {
    id: "step1",
    role: "申請者",
    state: "承認済み",
    approvedAt: "2026-01-13",
    comment: "申請しました",
  },
  {
    id: "step2",
    role: "承認者1",
    state: "未承認",
    approvedAt: null,
    comment: null,
  },
];

export const Default: Story = {
  args: {
    title: "承認フロー",
    steps: mockSteps,
  },
};

export const Pending: Story = {
  args: {
    title: "現在の承認状況",
    steps: pendingSteps,
  },
};

export const AllApproved: Story = {
  args: {
    title: "承認完了",
    steps: [
      {
        id: "step1",
        role: "申請者",
        state: "承認済み",
        approvedAt: "2026-01-13",
        comment: "申請",
      },
      {
        id: "step2",
        role: "承認者1",
        state: "承認済み",
        approvedAt: "2026-01-13",
        comment: "承認",
      },
      {
        id: "step3",
        role: "承認者2",
        state: "承認済み",
        approvedAt: "2026-01-13",
        comment: "承認",
      },
    ],
  },
};
