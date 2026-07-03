# ストア公開チェックリスト

更新日: 2026-07-03
対象バージョン: Ver2.36.4
Android Application ID / iOS Bundle ID: `cloud.yuyay.hensai`

## 現状

- GitHub Pages公開URL: `https://yuyay-cloud.github.io/Hensai.app/`
- プライバシーポリシー: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- サポートURL: `https://yuyay-cloud.github.io/Hensai.app/support.html`
- Android `compileSdkVersion`: 36
- Android `targetSdkVersion`: 36
- Android `minSdkVersion`: 24
- Android `versionName`: 2.36.4
- Android `versionCode`: 23604
- iOS `MARKETING_VERSION`: 2.36.4
- iOS `CURRENT_PROJECT_VERSION`: 23604
- iOS deployment target: 15.0

## 実装済みWorkflow

- `Mobile build check`: PRとmain更新時にWebビルド、Capacitor同期、Android Debug APK、iOS Simulatorビルドを確認する。
- `Android release bundle`: 手動実行で署名済みAndroid App Bundleを作成し、Artifactとして保存する。
- `Android Play upload`: 手動実行で署名済みAABを作成し、Google Playの指定トラックへアップロードする。
- `iOS App Store upload`: 手動実行で署名済みIPAを作成する。`upload_to_app_store=true` の場合だけApp Store Connectへ検証とアップロードを行う。

## GitHub Secrets

Android:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

iOS:

- `APPLE_TEAM_ID`
- `IOS_DISTRIBUTION_CERTIFICATE_BASE64`
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64`
- `IOS_PROVISIONING_PROFILE_NAME`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64`

## Google Playで必要な作業

- Play Consoleでアプリを作成する。
- パッケージ名を `cloud.yuyay.hensai` にする。
- Play App Signingを有効にする。
- Google CloudのサービスアカウントをPlay Consoleに連携し、対象アプリへのリリース権限を付与する。
- `store/google-play-console-answers-ja.md` をもとに、ストア掲載、Data safety、対象年齢、広告、金融機能関連の回答を入力する。
- `Android Play upload` を `track=internal`, `status=draft` で実行し、内部テストへ配布する。
- 実機テスト後、必要に応じてclosed testing、productionへ進める。
- 新規の個人デベロッパーアカウントの場合、production申請前に12人以上のテスターが14日以上継続してclosed testに参加している必要がある。

## App Store Connectで必要な作業

- Apple Developer ProgramのTeamでBundle ID `cloud.yuyay.hensai` を作成する。
- App Store ConnectでiOSアプリレコードを作成する。
- App Store用のDistribution証明書とProvisioning Profileを作成する。
- App Store Connect APIキーを作成する。
- `store/app-store-connect-answers-ja.md` をもとに、アプリ情報、App Privacy、年齢制限、輸出コンプライアンス、Review Notesを入力する。
- `iOS App Store upload` を `upload_to_app_store=false` で実行し、署名済みIPAが作れることを確認する。
- 確認後、`upload_to_app_store=true` でApp Store Connectへアップロードする。
- TestFlightで実機テストを行い、問題がなければ審査へ提出する。

## 実機テスト観点

AndroidとiOSの両方で確認する。

- 新規試算が完了する。
- 元利均等返済の予定表が崩れない。
- 元金均等返済の予定表、余り調整、エラー表示が動く。
- 比較モードでA/B条件、月々差額、総額差額、利息差額が見やすい。
- 返済予定表で回数、返済日、返済額、残高が360から430px幅で見切れない。
- 履歴保存、履歴復元、保存済み条件が壊れていない。
- PDF印刷または共有が動く。
- ダークモード、ライトモードが崩れない。
- PWA/アプリ起動時の表示が壊れていない。
- オフライン起動または再表示で最低限の画面が開く。

## 申請前に残るブロッカー

以下はリポジトリ側だけでは完了できない。

- Google Play Consoleアカウント作成と本人確認。
- Apple Developer Program登録とTeam設定。
- ストアの税務、支払い、契約情報。
- 署名証明書、Provisioning Profile、サービスアカウントJSON、APIキーの発行。
- 実機またはTestFlight/内部テストでの最終確認。
- App Store Review / Google Play Reviewへの最終提出。

## 公式参照

- Google Play Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play App Bundle upload: https://developer.android.com/studio/publish/upload-bundle
- Google Play closed testing requirement: https://support.google.com/googleplay/android-developer/answer/14151465
- Apple upload requirements: https://developer.apple.com/news/upcoming-requirements/
- App Store Connect build upload: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
