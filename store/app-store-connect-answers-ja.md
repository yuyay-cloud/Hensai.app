# App Store Connect 回答案

更新日: 2026-07-03
対象バージョン: Ver2.36.4
Bundle ID: `cloud.yuyay.hensai`

## 公式参照

- Upload builds: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- Upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/

## 基本情報

- App name: 返済試算
- Subtitle案: 返済額と予定表をすばやく確認
- Primary category: Finance
- Secondary category案: Utilities
- SKU案: `cloud.yuyay.hensai`
- Bundle ID: `cloud.yuyay.hensai`
- Version: 2.36.4
- Privacy Policy URL: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- Support URL: `https://yuyay-cloud.github.io/Hensai.app/support.html`
- Marketing URL: 空欄可

## App Privacy 回答案

現在の実装前提:

- ログインなし。
- アカウント作成なし。
- 課金なし。
- 広告SDKなし。
- 解析SDKなし。
- 外部サーバーへのユーザーデータ送信なし。
- 入力条件、履歴、保存済み条件は端末内の `localStorage` / `sessionStorage` に保存される。
- カメラ、写真、連絡先、位置情報、マイク、Bluetoothなどの権限は使用しない。

回答案:

- Data collected: No
- Data linked to the user: No
- Data used to track the user: No
- Tracking permission / ATT: 不要
- Third-party data collection: なし

補足:

AppleのApp Privacyでは、開発者または第三者が端末外でアクセスできる形で送信されるデータを中心に確認します。現在の実装では、返済条件や履歴は端末内保存のみで外部送信されません。将来、解析、広告、問い合わせフォーム、クラウド同期を追加する場合は回答を更新してください。

## Age Rating 回答案

想定回答:

- 暴力表現: なし
- 性的表現: なし
- 不適切な言葉: なし
- アルコール、タバコ、薬物: なし
- 医療情報: なし
- ギャンブルまたはコンテスト: なし
- 無制限Webアクセス: なし
- ユーザー生成コンテンツ: なし
- 位置情報共有: なし

補足:

アプリの対象は借入、返済、利息を確認する成人利用者です。実際の融資、投資、審査、契約、ギャンブルは行いません。

## App Review Notes 案

```text
このアプリは、借入条件を入力して返済額、利息総額、返済予定表、A/B比較を確認する返済シミュレーションツールです。

ログイン、アカウント作成、課金、広告、外部サーバーへのユーザーデータ送信はありません。入力条件、履歴、保存済み条件、テーマ設定、日付表示設定は端末内にのみ保存されます。

主な確認手順:
1. 「新しく試算する」から借入額、年利、返済方式、返済期間または返済回数を入力します。
2. 試算結果で月々の返済額、総返済額、利息総額を確認できます。
3. 「予定表を表示」で返済日ごとの返済額、元金、利息、残高を確認できます。
4. 「比較」から別条件を入力すると、月々の差額、総返済額の差額、利息総額の差額を確認できます。
5. 画面メニューからPDF印刷、履歴、保存済み条件、ダーク/ライトモードを確認できます。

本アプリは金融アドバイス、投資勧誘、融資申込、与信審査、貸付、返済受付、第三者金融機関への送客を行いません。計算結果は概算です。
```

## Sign-in / Demo

- Sign-in required?: No
- Demo account: 不要

## Export Compliance メモ

- 独自暗号は実装していません。
- HTTPSやOS/WebKitが提供する標準的な通信機能のみを使用します。
- App Store Connectの輸出コンプライアンス設問は、最終提出時の実際の選択肢に沿って確認してください。

## iOS archive設定

- `MARKETING_VERSION`: 2.36.4
- `CURRENT_PROJECT_VERSION`: 23604
- `IPHONEOS_DEPLOYMENT_TARGET`: 15.0
- App Store ConnectへのアップロードはXcode 26以降、iOS 26 SDK以降の要件に注意する。
