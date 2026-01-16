import { Stack } from "@mui/material";
import { WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Shared UI/Feedback/StatusChip",
  component: StatusChip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        null,
        WorkflowStatus.DRAFT,
        WorkflowStatus.SUBMITTED,
        WorkflowStatus.PENDING,
        WorkflowStatus.APPROVED,
        WorkflowStatus.REJECTED,
        WorkflowStatus.CANCELLED,
      ],
      description: "ワークフロー状態",
    },
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: {
    status: WorkflowStatus.DRAFT,
  },
};

export const Submitted: Story = {
  args: {
    status: WorkflowStatus.SUBMITTED,
  },
};

export const Pending: Story = {
  args: {
    status: WorkflowStatus.PENDING,
  },
};

export const Approved: Story = {
  args: {
    status: WorkflowStatus.APPROVED,
  },
};

export const Rejected: Story = {
  args: {
    status: WorkflowStatus.REJECTED,
  },
};

export const Cancelled: Story = {
  args: {
    status: WorkflowStatus.CANCELLED,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <StatusChip status={WorkflowStatus.DRAFT} />
      <StatusChip status={WorkflowStatus.SUBMITTED} />
      <StatusChip status={WorkflowStatus.PENDING} />
      <StatusChip status={WorkflowStatus.APPROVED} />
      <StatusChip status={WorkflowStatus.REJECTED} />
      <StatusChip status={WorkflowStatus.CANCELLED} />
    </Stack>
  ),
};

export const Null: Story = {
  args: {
    status: null,
  },
};

export const Empty: Story = {
  args: {
    status: undefined,
  },
};
