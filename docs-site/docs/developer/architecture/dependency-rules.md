---
sidebar_position: 2
---

# 依存ルール

このページは、`src` 配下で依存方向を崩さずに実装するためのルールをまとめたガイドです。

## 依存方向

FSD ベースの依存方向は次の順で固定します。

`pages` → `processes` → `features` → `entities` → `shared`

`widgets` はページ構成要素として `features` / `entities` / `shared` を利用できますが、`pages` から再利用される前提の UI ブロックとして扱います。

## レイヤーごとの依存可否

| 利用元      | 依存してよい先                                           |
| ----------- | -------------------------------------------------------- |
| `pages`     | `processes`, `features`, `entities`, `shared`, `widgets` |
| `processes` | `features`, `entities`, `shared`, `widgets`              |
| `features`  | `entities`, `shared`                                     |
| `entities`  | `shared`                                                 |
| `shared`    | `shared`（同層内）                                       |
| `widgets`   | `features`, `entities`, `shared`                         |

## 禁止パターン

- `entities` から `features` / `pages` を参照する
- `shared` から `entities` / `features` / `pages` を参照する
- 画面専用ロジックを `shared` に持ち込む
- 同じ責務を複数レイヤーへ重複実装する

## 実装時の判断ポイント

1. 画面ルートに直結するか: 直結するなら `pages`。
2. 複数ページをまたぐ業務フローか: そうなら `processes`。
3. 1 画面以下で閉じる機能単位か: そうなら `features`。
4. ドメイン知識や型・API が中心か: そうなら `entities`。
5. 横断再利用する汎用部品か: そうなら `shared`。

## 生成物の扱い

以下は自動生成領域のため、手動編集しません。

- `src/shared/api/graphql/**`
- `src/ui-components/**`

必要な変更は Amplify 側設定更新とコード生成で反映します。

## 関連ページ

- [ディレクトリ構成](./directory-structure.md)
- [配置判断ガイド](./placement-guide.md)
