# クラウド勤怠

Amplifyを使ったサーバーレスな勤怠システムです

## ユーザー向け

TDB

## 開発環境向け

### 必要なツール

- Node.js 22 LTS 以上 （`.nvmrc` で 22 系を指定しています）
- npm 10 以上
- `nvm` を利用している場合はリポジトリ直下で `nvm use` を実行してください

### EBADENGINE 警告について

Node.js 23 系以上で `npm ci` / `npm install` を実行すると `jest@30` から `npm WARN EBADENGINE` が発生する場合があります。推奨は Node.js 22 LTS に切り替えることですが、やむを得ず 23 系を利用する場合は以下のいずれかで警告を抑止できます。

```bash
# 一時的にエンジンチェックを外す
npm_config_engine_strict=false npm ci

# もしくはグローバル設定
npm config set engine-strict false
```

### 開発サーバーの起動

```bash
npm ci
make start
```
