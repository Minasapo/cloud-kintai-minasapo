# shared 層

UI コンポーネント、hooks、lib、config など横断的に利用する資産を配置します。`@shared/...` エイリアスからのみ参照されることを前提にし、ドメイン依存の処理は `entities` へ寄せます。
