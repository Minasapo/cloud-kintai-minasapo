import { Headline } from "@shared/ui/typography/Headline";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Shared UI/Typography/Headline",
  component: Headline,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "ヘッドラインテキスト",
    },
  },
} satisfies Meta<typeof Headline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "セクションヘッドライン",
  },
};

export const WithLongText: Story = {
  args: {
    children:
      "これは長いセクションヘッドラインです。複数行になる可能性があります。",
  },
};

export const MultilineExample: Story = {
  render: () => (
    <div>
      <Headline>最初のセクション</Headline>
      <p style={{ marginTop: "20px", marginBottom: "30px" }}>
        このセクションのコンテンツがここに表示されます。
      </p>
      <Headline>次のセクション</Headline>
      <p style={{ marginTop: "20px" }}>別のセクションのコンテンツ。</p>
    </div>
  ),
};
