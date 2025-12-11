---
applyTo: "tests/office/flow.spec.ts"
---

# 概要

- `/office` は `src/pages/office/OfficePage.tsx` で即座に `/office/qr` へ遷移するリダイレクト専用ページ。
- 直下のレイアウトは `OfficeLayoutGuard` (`@features/attendance/office-layout`) で保護されており、オペレーターまたは管理者ロールのみがアクセスできる。
- QR 表示 (`/office/qr`) は `@features/attendance/office-qr` の `useOfficeQr` + `OfficeQrPanel` を利用し、`data-testid="office-qr-*"` で主要要素にアクセスできる。
- QR 登録 (`/office/qr/register`) は `@features/attendance/office-qr-register` の `OfficeQrRegisterPanel` を描画し、トークン検証は `validateOfficeQrToken` に委譲される。

# 画面要素

## QR ビュー

- `office-qr-disabled-alert`: オフィスモードが無効な場合の警告。
- `office-qr-admin-alert`: 管理者ロールで閲覧している旨の警告。
- `office-qr-mode-toggle`: 出勤/退勤モード切替ボタン。
- `office-qr-progress`: 更新までの残り時間を示すプログレスバー。
- `office-qr-copy-button`, `office-qr-refresh-button`: URL コピーと手動更新操作。

## QR 登録

- `office-qr-register-disabled-alert`: オフィスモード無効時の警告。
- `office-qr-register-error-alert`: トークン不備や期限切れ時のバリデーション結果。
- `office-qr-register-clock-(in|out)-button`: トークンが有効な場合のみ表示される打刻ボタン。

# テスト観点

1. `/office` アクセス時に `OfficePage` が確実に `/office/qr` に遷移すること。
2. QR ビューはオフィスモードの有効/無効で表示内容が分岐するため、`office-qr-disabled-alert` が存在すればそちらを検証し、無い場合は QR 操作用 UI を操作しておく。
3. `/office/qr/register` はトークンなしでアクセスすると必ず `office-qr-register-error-alert` を表示する（ただしオフィスモード無効時は disabled alert が優先される）。
