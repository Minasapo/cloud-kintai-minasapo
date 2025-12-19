## 概要
-
-
-

## 動作確認
- [ ] Node.js 22 LTS (`nvm use` で 22 系を選択)
- [ ] `npm run lint`
- [ ] `npm run test:unit`
- [ ] `npm run build`

## Node.js / npm メモ
- Node.js 23 系以上で `npm WARN EBADENGINE` が表示された場合は LTS (22.x) に戻すか、下記のいずれかで npm のエンジンチェックを一時的に無効化してください。

```bash
npm_config_engine_strict=false npm ci
# or
npm config set engine-strict false
```
