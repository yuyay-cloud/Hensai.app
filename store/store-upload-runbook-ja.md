# iOS / Android ストアアップロードRunbook

更新日: 2026-07-03
対象バージョン: Ver2.36.4
Android Application ID / iOS Bundle ID: `cloud.yuyay.hensai`

## 目的

返済試算アプリをGoogle PlayとApp Storeへ提出できる状態にする。リポジトリ側では、署名済みAndroid App Bundle、署名済みiOS IPA、ストア入力資料、実機テスト観点を整備する。

## リポジトリ側で完了済みの準備

- Web/PWA本体はVer2.36.4としてmainへ反映済み。
- AndroidとiOSのCapacitorプロジェクトが存在する。
- Androidの `targetSdkVersion` は36。
- App ID / Bundle IDは `cloud.yuyay.hensai`。
- `Mobile build check` でAndroid Debug APKとiOS Simulator buildを確認できる。
- ストア用スクリーンショットは `pnpm run store:screenshots` で生成できる。
- Android Playアップロード用Workflowを追加済み。
- iOS App Store Connectアップロード用Workflowを追加済み。

## Androidアップロード手順

1. Play Consoleでアプリを作成する。
2. パッケージ名を `cloud.yuyay.hensai` にする。
3. Play App Signingを有効にする。
4. アップロードキーを作成し、GitHub Secretsへ登録する。
5. Google Cloudでサービスアカウントを作成する。
6. Play Consoleでサービスアカウントへ対象アプリのリリース権限を付与する。
7. サービスアカウントJSONを `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` としてGitHub Secretsへ登録する。
8. `Android Play upload` workflowを `track=internal`, `status=draft` で実行する。
9. Play ConsoleでAAB、署名、対象デバイス、事前チェックを確認する。
10. Android実機で内部テストを行う。
11. 問題なければclosed testingまたはproductionへ進める。

## iOSアップロード手順

1. Apple Developer ProgramでBundle ID `cloud.yuyay.hensai` を作成する。
2. App Store ConnectでiOSアプリレコードを作成する。
3. Apple Distribution証明書を作成する。
4. App Store用Provisioning Profileを作成する。
5. App Store Connect APIキーを作成する。
6. 証明書、Provisioning Profile、APIキーをGitHub Secretsへ登録する。
7. `iOS App Store upload` workflowを `upload_to_app_store=false` で実行し、IPA作成だけ確認する。
8. 問題なければ `upload_to_app_store=true` で実行し、App Store Connectへアップロードする。
9. TestFlightでiOS実機テストを行う。
10. App Privacy、年齢制限、輸出コンプライアンス、Review Notesを入力し、審査へ提出する。

## 実機テスト最小セット

Android内部テストとiOS TestFlightで同じ内容を確認する。

1. 新規試算を作成する。
2. 元利均等返済の結果と予定表を開く。
3. 元金均等返済で毎月元金を入力し、余り調整の初回/最終回を切り替える。
4. 毎月元金が過大な場合に次へ進めないことを確認する。
5. 返済予定表で回数、返済日、返済額、残高が見切れないことを確認する。
6. 比較画面でA/Bの返済額と差額が読めることを確認する。
7. 履歴保存と復元を確認する。
8. 保存済み条件を確認する。
9. PDF印刷または共有を確認する。
10. ダークモード、ライトモードを確認する。
11. アプリを終了して再起動し、初期画面が壊れていないことを確認する。

## 申請で使う資料

- ストア掲載文案: `store/listing-ja.md`
- Google Play Console回答案: `store/google-play-console-answers-ja.md`
- App Store Connect回答案: `store/app-store-connect-answers-ja.md`
- スクリーンショット計画: `store/screenshot-plan-ja.md`
- 公開チェックリスト: `store/STORE_RELEASE_CHECKLIST.md`

## 重要な制約

- Google Playの新規アプリとアップデートは、2025-08-31以降Android 15/API 35以上のtarget APIが必要。現在のtargetは36なので条件を満たす。
- Google Playの新規アプリはPlay App Signingが必須。
- 2023-11-13以降作成のGoogle Play個人デベロッパーアカウントでは、production申請前にclosed test要件が発生する。
- Appleは2026-04-28以降、App Store ConnectへアップロードするアプリにXcode 26以降とiOS 26 SDK以降を要求している。
- App Store Connectへビルドをアップロードするには、対象ロールとApp Store Connect APIキーまたはXcode/Transporterの認証が必要。

## リポジトリ外で必要なもの

- Google Play Consoleアカウント。
- Apple Developer ProgramのTeam。
- ストアの契約、税務、支払い情報。
- Androidアップロードキー。
- Google Play連携済みサービスアカウントJSON。
- Apple Distribution証明書。
- App Store用Provisioning Profile。
- App Store Connect APIキー。
- Android実機またはPlay内部テスター。
- iOS実機とTestFlightテスター。

## 公式参照

- Google Play Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play App Bundle upload: https://developer.android.com/studio/publish/upload-bundle
- Google Play app testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
- Apple upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- App Store Connect upload builds: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
