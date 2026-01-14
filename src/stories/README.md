# Storybook ガイド

このプロジェクトでは、UIコンポーネントの開発とドキュメント化のために **Storybook** を使用しています。

## 概要

Storybookは、UI コンポーネントを分離した環境で開発・テストするための強力なツールです。このプロジェクトでは、段階的な導入を進めており、以下の目的で活用しています：

- **UIの変更差分を視覚的に確認** - コンポーネントのバリエーションを複数比較
- **ドキュメント自動生成** - コンポーネントの Props、使用方法を自動ドキュメント化
- **Visual Regression Testing** - UI の意図しない変更をテストで検出

## 起動方法

```bash
npm run storybook
```

起動後、ブラウザで [http://localhost:6006](http://localhost:6006) にアクセスしてください。

## ビルド

本番用の Storybook スタティックサイトをビルドします：

```bash
npm run storybook:build
```

出力先：`./storybook-static/`

## ストーリーファイルの場所

ストーリーファイルは以下の場所に配置します：

```
src/stories/
```

または、コンポーネント配置に合わせて各階層に `.stories.ts` / `.stories.tsx` ファイルを配置できます：

```
src/shared/ui/button/Button.stories.tsx
src/features/shift/request-form/ShiftRequestForm.stories.tsx
```

## ストーリーの作成方法

### 1. シンプルなコンポーネントストーリー（Button）

[src/stories/Button.stories.ts](../src/stories/Button.stories.ts) を参照：

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import Button from "@mui/material/Button";

const meta = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"], // Docタブを自動生成
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "contained",
    color: "primary",
    children: "Click me",
  },
};
```

### 2. コンポーネント内の複数バリエーション

```typescript
export const Secondary: Story = {
  args: {
    variant: "contained",
    color: "secondary",
    children: "Secondary Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};
```

### 3. カスタムレンダリング（複合コンポーネント）

```typescript
export const ComplexExample: Story = {
  render: () => (
    <Stack spacing={2}>
      <Button variant="contained">Button 1</Button>
      <Button variant="outlined">Button 2</Button>
    </Stack>
  ),
};
```

## フェーズ別ロードマップ

### ✅ フェーズ 1: 基盤構築（完了）

- Storybook のセットアップ
- 基本設定（Vite、TypeScript、MUI テーマ）
- 最初のストーリー作成（Button、Typography）
- `npm run storybook` / `npm run storybook:build` スクリプト追加

### 📅 フェーズ 2: 基本コンポーネント（次のステップ）

以下のコンポーネントのストーリーを段階的に追加：

- `src/shared/ui/*` の汎用UI要素
  - Typography, Button, Card, Chip, Badge
  - TextField, Select, Checkbox, Switch
  - Dialog, Snackbar, Alert
  - CommonBreadcrumbs, Link

### 📅 フェーズ 3: 複合コンポーネント

- `src/features/*` の機能コンポーネント
- `src/widgets/*` のレイアウトコンポーネント

### 📅 フェーズ 4: VRT 統合

- Playwrightとの連携
- Visual Regression Testing（VRT）の導入
- 自動差分検出パイプライン

### 📅 フェーズ 5: ドキュメント・カタログ化

- デザイントークン、色、タイポグラフィの可視化
- ガイドラインドキュメント（MDX）

## よくある質問

### Q: 既存コンポーネントのストーリーはどこに追加すればいい？

**A:** 2 つのパターンがあります：

1. **集中管理** - `src/stories/` に全ストーリーを配置（現在のアプローチ）
2. **コンポーネント同一ディレクトリ** - コンポーネント横に `.stories.tsx` を配置

段階を進めるに従い、2 へ移行予定です。

### Q: storybook のスタイルが想定と異なる

**A:** `.storybook/preview.ts` で MUI テーマを読み込んでいます。プロジェクトの実際のテーマを反映させる場合は、ここを更新してください。

### Q: Storybook のポートを変更したい

**A:** `package.json` の `storybook` スクリプトで `-p` オプションを変更：

```json
"storybook": "storybook dev -p 6006"
```

## 参考リンク

- [Storybook 公式ドキュメント](https://storybook.js.org/)
- [React コンポーネントストーリー](https://storybook.js.org/docs/react/get-started/introduction)
- [Storybook の Args / Controls](https://storybook.js.org/docs/react/essentials/controls)
