# shared 層

UI コンポーネント、hooks、lib、config など横断的に利用する資産を配置します。`@shared/...` エイリアスからのみ参照されることを前提にし、ドメイン依存の処理は `entities` へ寄せます。
例として `shared/ui/form/RHFTextField.tsx` は 複数画面で使う共通フォーム部品です。
