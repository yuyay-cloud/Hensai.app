# Android優先リリース手順

対象バージョン: Ver2.36.4
パッケージ名: `cloud.yuyay.hensai`

## 現在完了していること

- Android debug buildはGitHub Actionsで成功済み。
- ストア用スクリーンショットは `pnpm run store:screenshots` で生成済み。
- `Android Play upload` workflowはmainで有効化済み。
- `targetSdkVersion` は36。Google PlayのAndroid 15/API 35以上要件を満たしている。
- GitHub PagesのプライバシーポリシーとサポートURLは公開済み。

## 次に必要な外部作業

1. Google Play Consoleでアプリを作成する。
2. アプリのパッケージ名を `cloud.yuyay.hensai` にする。
3. Play App Signingを有効にする。
4. Androidアップロードキーを作成する。
5. Google Cloudでサービスアカウントを作成する。
6. Play Consoleでサービスアカウントに対象アプリのリリース権限を付与する。
7. サービスアカウントJSONをダウンロードする。

## 秘密ファイルの置き場所

秘密ファイルはGit管理しない `private/` に置く。

例:

```text
private/android-upload-key.jks
private/google-play-service-account.json
```

`private/` は `.gitignore` に追加済み。

## GitHub Secrets登録

アップロードキーとサービスアカウントJSONが揃ったら、以下を実行する。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/set-android-play-secrets.ps1 `
  -KeystorePath private/android-upload-key.jks `
  -ServiceAccountJsonPath private/google-play-service-account.json `
  -KeyAlias hensai-upload
```

アップロードキーだけ先に登録する場合:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/set-android-play-secrets.ps1 `
  -KeystorePath private/android-upload-key.jks `
  -KeyAlias hensai-upload `
  -SkipGooglePlayServiceAccount
```

登録されるSecrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

## 内部テストへアップロード

Secrets登録後、GitHub Actionsで以下を実行する。

```powershell
gh workflow run "Android Play upload" `
  --repo yuyay-cloud/Hensai.app `
  -f track=internal `
  -f status=draft
```

実行状況確認:

```powershell
gh run list --repo yuyay-cloud/Hensai.app --workflow "Android Play upload" --limit 1
```

## Android実機テスト

内部テスト配布後、Google Playからインストールして確認する。

内部テスト前にDebug APKで先に確認する場合:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-android-debug-apk.ps1
```

前提:

- `outputs/mobile-artifacts/app-debug.apk` がある。
- Android端末でUSBデバッグを有効にする。
- USB接続後、端末側のRSA確認を許可する。
- `private/tools/platform-tools/adb.exe` がある。無い場合は通常の `adb` をPATHから探す。

- 新規試算
- 元利均等返済
- 元金均等返済
- 毎月元金入力
- 余り調整の初回/最終回切替
- 過大な毎月元金で次へ進めないこと
- 返済予定表の回数、返済日、返済額、残高
- A/B比較の差額カード
- 履歴保存と復元
- PDF印刷または共有
- ダークモード、ライトモード
- アプリ再起動

## production前の注意

新規の個人デベロッパーアカウントでは、production申請前にclosed testing要件が発生する場合がある。少なくとも12人のテスターが14日以上継続して参加する要件が出る場合は、Play Consoleの表示を優先する。

## 公式参照

- Google Play Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Android App Bundle upload: https://developer.android.com/studio/publish/upload-bundle
- Google Play app testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
