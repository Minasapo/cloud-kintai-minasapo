# フェーズ 2-5: Storybook 拡張ロードマップ

このドキュメントは、Storybook の段階的な拡張計画を記載します。

## フェーズ 2: 基本コンポーネントストーリー追加

### 目的
`src/shared/ui/*` の汎用UI要素をドキュメント化し、チーム内での実装品質を統一。

### 予定コンポーネント

#### ⬜ Typography
- `src/shared/ui/typography/Title.tsx`
- `src/shared/ui/typography/SectionHeading.tsx`

#### ⬜ Feedback
- `src/shared/ui/chips/StatusChip.tsx`
- `src/shared/ui/chips/Badge.tsx`

#### ⬜ Layout
- `src/shared/ui/layout/PageSection.tsx`
- `src/shared/ui/header/HeaderBar.tsx`
- `src/shared/ui/header/MobileMenu.tsx`

#### ⬜ Navigation
- `src/shared/ui/breadcrumbs/CommonBreadcrumbs.tsx`
- `src/shared/ui/link/Link.tsx`

#### ⬜ Page
- `src/shared/ui/page/Page.tsx`

### 作成方法

各ストーリーは以下のテンプレートに従って作成：

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import YourComponent from "@shared/ui/your-component/YourComponent";

const meta = {
  title: "Shared UI/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Props の control を定義
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // デフォルトの Props
  },
};

export const Variant: Story = {
  args: {
    // バリエーション
  },
};
```

### 実装進捗

- [ ] Typography コンポーネント
- [ ] Feedback コンポーネント（Chip, Badge）
- [ ] Layout コンポーネント
- [ ] Navigation コンポーネント
- [ ] Page コンポーネント

---

## フェーズ 3: 複合コンポーネントストーリー

### 目的
フィーチャーやウィジェットの複雑なコンポーネントをドキュメント化。

### 予定コンポーネント

#### Features
- `src/features/shift/request-form/ShiftRequestForm.tsx`
- `src/features/shift/management/ShiftManagementBoard.tsx`
- `src/features/workflow/approval-flow/ui/WorkflowApprovalTimeline.tsx`

#### Widgets
- `src/widgets/layout/header/HeaderWidget.tsx`
- `src/widgets/layout/footer/FooterWidget.tsx`
- `src/widgets/feedback/snackbar/SnackbarWidget.tsx`

### 実装進捗

- [ ] Shift Request Form
- [ ] Shift Management Board
- [ ] Workflow Approval Timeline
- [ ] Header Widget
- [ ] Footer Widget

---

## フェーズ 4: Visual Regression Testing (VRT) 統合

### 目的
Playwright と Storybook を連携させ、自動的に UI の差分検出を実施。

### 実装内容

#### 4.1 Playwright テスト環境構築
- Storybook 向けの Playwright 設定
- スナップショット撮影スクリプト

#### 4.2 VRT パイプライン
```bash
npm run storybook:build
npm run test:vrt:baseline    # ベースラインスナップショット作成
npm run test:vrt:compare     # 差分チェック
```

#### 4.3 CI/CD 統合
- GitHub Actions で Storybook ビルド
- VRT 結果をコメント出力
- PR に自動差分アノテーション

### 実装進捗

- [ ] VRT 基盤設定
- [ ] ベースラインスナップショット作成
- [ ] GitHub Actions ワークフロー構築
- [ ] PR コメント自動化

---

## フェーズ 5: ドキュメント・カタログ化

### 目的
デザインシステム、トークン、ガイドラインを一元管理。

### 実装内容

#### 5.1 Design Tokens
- 色パレット
- タイポグラフィスケール
- スペーシング/サイズ定義

#### 5.2 MDX ドキュメント
- コンポーネント仕様書
- 使用例とベストプラクティス
- アクセシビリティガイドライン

#### 5.3 スタイルガイド
- ブランドガイドライン
- UI パターンカタログ
- コンポーネント相互作用ルール

### 実装進捗

- [ ] Design Tokens ドキュメント
- [ ] Color Palette ページ
- [ ] Typography ガイド
- [ ] Component Best Practices

---

## 実装手順と注意事項

### ストーリー作成時のチェックリスト

- [ ] タイトルが `Domain/ComponentName` の形式
- [ ] `tags: ["autodocs"]` で自動ドキュメント化を有効化
- [ ] Props の `argTypes` を完全に定義
- [ ] デフォルト、複数バリエーションの Story を含める
- [ ] Decorator が必要な場合（Router, Provider等）は明記
- [ ] ファイル名が `.stories.ts` または `.stories.tsx`

### テスト実行

```bash
# Storybook 起動
npm run storybook

# ビルド確認
npm run storybook:build

# VRT 実行（フェーズ 4 以降）
npm run test:vrt:baseline
npm run test:vrt:compare
```

### レビュー時の確認事項

1. **ビジュアル確認** - Storybook UI で複数ブラウザ・デバイスで見栄えを確認
2. **ドキュメント** - Props の説明が正確で、使用例が十分か
3. **インタラクション** - Controls パネルで全バリエーションが動作するか
4. **パフォーマンス** - 複雑なコンポーネントは遅延読み込み対応を検討

---

## 参考リンク

- [Storybook 公式ドキュメント](https://storybook.js.org/)
- [Playwright + Storybook 統合](https://storybook.js.org/docs/writing-tests/stories)
- [MDX ドキュメント作成](https://storybook.js.org/docs/writing-docs/mdx)
- [Design Tokens](https://storybook.js.org/docs/get-started/design-tokens)
