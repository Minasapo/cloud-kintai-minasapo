# Widgets Layer

UI レイヤーを FSD へ寄せる第一歩として `components` 直下に偏在していた複合コンポーネントを `widgets` 配下へ移動しました。`widgets` では次のルールに従います。
例として `widgets/layout/header` は ページ全体で使うヘッダー一式をまとめた単位です。

- **目的**: ページを構成する大きめの UI ブロック（ヘッダー / フッター / スナックバーなど）をまとめる。
- **命名**: `widgets/<domain>/<slice>` の 2 階層を基本とし、`layout`, `feedback` など概念ごとに分類する。
- **依存方向**: `widgets` は `shared` / `entities` / `features` までに依存可能だが、`pages` からのみ参照される。

## 現状の構成

- `widgets/layout/header`: 認証・設定情報と連携したアプリ共通ヘッダー。
- `widgets/layout/footer`: ブランドカラーを反映するフッター。
- `widgets/feedback/snackbar`: Redux ベースのグローバル Snackbar スタック。

## 運用指針

- 今後 `components` 配下にある汎用要素は、機能単位なら `features`、純粋な UI なら `shared/ui`、レイアウト断片なら `widgets` へ段階的に移行する。
- 新規追加時は最初から `widgets` or `shared` を意識し、`@/widgets/...` エイリアスを使用する。
