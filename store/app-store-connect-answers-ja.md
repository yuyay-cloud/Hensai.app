# App Store Connect 回答案

作成日: 2026-07-02
対象版: Ver2.36.4
Bundle ID: `cloud.yuyay.hensai`

この文書は、App Store Connect の提出画面で使う回答下書きです。Apple Developer Program のTeam、署名、App Store Connect上の表示に合わせて最終確認してください。

## 公式参照

- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- User Privacy and Data Use: https://developer.apple.com/app-store/user-privacy-and-data-use/
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- Upload app previews and screenshots: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/

## 基本情報

- App name: 返済試算
- Subtitle案: 返済額と予定表をすばやく確認
- Primary category: Finance
- Secondary category案: Utilities
- SKU案: `cloud.yuyay.hensai`
- Bundle ID: `cloud.yuyay.hensai`
- Version: 2.36.4
- Copyright: App Store Connectの開発者名に合わせて入力
- Privacy Policy URL: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- Support URL: `https://yuyay-cloud.github.io/Hensai.app/support.html`
- Marketing URL: 空欄可

## App Privacy 回答案

現状のコード調査結果:

- 端末内保存: `localStorage` と `sessionStorage`
- 外部送信: なし
- 広告SDK: なし
- 解析SDK: なし
- ログイン: なし
- アカウント作成: なし
- アプリ内課金: なし
- カメラ、写真、連絡先、位置情報、マイク、Bluetooth等の権限: なし

回答案:

- Data collected: No
- Data linked to the user: No
- Data used to track the user: No
- Tracking permission / ATT: 不要
- Third-party data collection: なし

補足:

- 返済条件、履歴、保存済み条件、テーマ設定、日付表示設定は端末内に保存され、開発者や第三者へ送信しない。
- 将来、広告、解析、クラッシュレポート、問い合わせフォーム、アカウント機能、クラウド同期を追加した場合は、App Privacy とプライバシーポリシーを再確認する。

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

想定される年齢レーティングは低くなる可能性が高いが、アプリの対象は借入・返済条件を確認する成人利用者として説明する。

## App Review Notes 案

以下をApp Review Notesへ入力する。

```text
このアプリは、借入条件を入力して返済額、利息総額、返済予定表、A/B比較を確認する返済シミュレーションツールです。

ログイン、アカウント作成、課金、広告、外部サーバーへのデータ送信はありません。入力条件、履歴、保存済み条件、テーマ設定、日付表示設定は端末内にのみ保存されます。

主な確認手順:
1. 「新しく試算する」から借入金額、金利、返済方式、返済期間または返済回数を入力します。
2. 試算結果で月々の返済額、総返済額、利息総額を確認できます。
3. 「予定表を表示」で返済日ごとの返済額、元金、利息、残高を確認できます。
4. 「比較」から別条件を入力すると、月々の差額、総返済額の差額、利息総額の差額を確認できます。
5. 画面メニューからPDF印刷、履歴、保存済み条件、ダーク/ライトモードを確認できます。

本アプリは金融アドバイス、融資申込、融資審査、貸付、返済受付、第三者貸金業者への送客を行いません。計算結果は概算です。
```

## Sign-in / Demo

- Sign-in required?: No
- Demo account: 不要

## Export Compliance メモ

- 独自暗号は実装していない
- HTTPSやOS/WebKitが提供する標準的な暗号機能のみを使う想定
- App Store Connectの輸出コンプライアンス設問は、開発者の法的判断が必要なため、実際の設問文に沿って確認する

## iOS archive 前提

提出前に必要:

- Apple Developer Program 登録
- App Store Connectでアプリ作成
- XcodeでTeam設定
- Bundle ID `cloud.yuyay.hensai` を登録
- Signing & Capabilities を設定
- Generic iOS Device向けにArchive作成
- TestFlightへアップロードして審査前確認

現状のiOS設定:

- `MARKETING_VERSION`: 2.36.4
- `CURRENT_PROJECT_VERSION`: 23604
- `IPHONEOS_DEPLOYMENT_TARGET`: 15.0
