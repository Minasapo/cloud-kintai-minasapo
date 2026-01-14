import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Shared UI/Typography",
  component: Typography,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "body1",
        "body2",
        "caption",
      ],
    },
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "error",
        "textPrimary",
        "textSecondary",
      ],
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: {
    variant: "h1",
    children: "Heading 1",
  },
};

export const Heading2: Story = {
  args: {
    variant: "h2",
    children: "Heading 2",
  },
};

export const Body1: Story = {
  args: {
    variant: "body1",
    children:
      "このは本文テキストです。通常のテキストコンテンツに使用されます。",
  },
};

export const Body2: Story = {
  args: {
    variant: "body2",
    children: "こちらも本文テキストですが、より小さいサイズです。",
  },
};

export const Caption: Story = {
  args: {
    variant: "caption",
    children: "これはキャプションテキストです",
  },
};

export const AllTypographies: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="body1">
        Body 1 - これはデフォルトの本文テキストです
      </Typography>
      <Typography variant="body2">Body 2 - より小さい本文テキスト</Typography>
      <Typography variant="caption">Caption - キャプションテキスト</Typography>
    </Stack>
  ),
};
