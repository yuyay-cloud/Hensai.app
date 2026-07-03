# Google Play Console 回答案

更新日: 2026-07-03
対象バージョン: Ver2.36.4
パッケージ名: `cloud.yuyay.hensai`

## 公式参照

- Target API level requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Upload your app to the Play Console: https://developer.android.com/studio/publish/upload-bundle
- App testing requirements: https://support.google.com/googleplay/android-developer/answer/14151465
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Financial services policy: https://support.google.com/googleplay/android-developer/answer/17105854

## アプリ設定

- アプリ名: 返済試算
- デフォルト言語: 日本語
- アプリまたはゲーム: アプリ
- 価格: 無料
- カテゴリ: ファイナンス
- プライバシーポリシーURL: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- サポートURL: `https://yuyay-cloud.github.io/Hensai.app/support.html`

## ストア掲載

- 掲載文案: `store/listing-ja.md`
- スクリーンショット生成: `pnpm run store:screenshots`
- 生成先: `outputs/store-screenshots/`

## Data safety 回答案

現在の実装前提:

- ログインなし。
- アカウント作成なし。
- 広告SDKなし。
- 解析SDKなし。
- 外部サーバーへのユーザーデータ送信なし。
- 入力条件、履歴、保存済み条件は端末内の `localStorage` / `sessionStorage` に保存される。
- Android権限は基本的に `android.permission.INTERNET` のみ。

回答案:

- Does your app collect or share any of the required user data types?: No
- Is all of the user data collected by your app encrypted in transit?: Not applicable
- Do you provide a way for users to request that their data is deleted?: Not applicable. Account data or server-side user data is not held.
- Does your app use advertising ID?: No

補足文:

返済条件、履歴、保存済み条件、テーマ設定、日付表示設定は端末内に保存されます。開発者または第三者へ送信されません。将来、問い合わせフォーム、解析、広告、クラウド同期を追加する場合は、Data safetyとプライバシーポリシーを再確認してください。

## App content 回答案

Ads:

- Contains ads?: No

App access:

- Restricted access?: No
- Demo account: 不要

Target audience and content:

- 推奨対象年齢: 18歳以上
- 理由: 借入、返済、利息を確認する成人向けの金融計算ツールであり、子ども向けではありません。
- Families Program: 参加しない

Content rating:

- 暴力、性的表現、薬物、ギャンブル、ユーザー生成コンテンツ、位置情報共有、オンライン購入、チャット: なし
- 金融計算ツールであり、実際の融資、投資、審査、契約、ギャンブル、暗号資産取引は行いません。

News:

- News app?: No

Government:

- Government app?: No

Financial features / personal loans:

- 本アプリは個人ローンを提供しません。
- 融資申込、投資勧誘、与信審査、貸付、返済受付、第三者金融機関への送客、リード生成を行いません。
- ユーザーが入力した条件から返済額と返済予定を端末内で概算するツールです。

## Android release

- `targetSdkVersion`: 36
- `compileSdkVersion`: 36
- `minSdkVersion`: 24
- `versionName`: 2.36.4
- `versionCode`: 23604

アップロード:

1. GitHub Secretsを登録する。
2. `Android Play upload` workflowを実行する。
3. 初回は `track=internal`, `status=draft` を選ぶ。
4. Play ConsoleでAAB、署名、事前審査、対象デバイス、Data safetyを確認する。
5. 実機テスト後にclosed testingまたはproductionへ進める。

## 新規個人アカウントの注意

2023-11-13以降に作成されたGoogle Playの個人デベロッパーアカウントでは、production申請前にclosed testの要件が課されます。少なくとも12人のテスターが14日以上継続して参加している必要があります。最終判断はPlay Consoleの表示を優先してください。
