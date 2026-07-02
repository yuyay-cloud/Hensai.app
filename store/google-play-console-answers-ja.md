# Google Play Console 回答案

作成日: 2026-07-02
対象版: Ver2.36.3
パッケージ名: `cloud.yuyay.hensai`

この文書は、Google Play Console の提出画面で使う回答下書きです。最終提出前に、実際のアプリ内容とGoogle Play Console上の最新表示に合わせて確認してください。

## 公式参照

- Target API level requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- App testing requirements for new personal developer accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Data safety section: https://support.google.com/googleplay/android-developer/answer/10787469
- User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Content ratings: https://support.google.com/googleplay/android-developer/answer/9898843
- Target audience and content: https://support.google.com/googleplay/android-developer/answer/9867159
- Financial services / personal loans policy: https://support.google.com/googleplay/android-developer/answer/17105854

## アプリ設定

- アプリ名: 返済試算
- デフォルト言語: 日本語
- アプリまたはゲーム: アプリ
- 価格: 無料
- アプリカテゴリ: ファイナンス
- 連絡先メール: Play Consoleで管理する公開サポートメールを入力
- プライバシーポリシーURL: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- サポートURL: `https://yuyay-cloud.github.io/Hensai.app/support.html`

## ストア掲載

- 掲載文案: `store/listing-ja.md` を使用
- 短い説明: `借入条件から月々の返済額、利息総額、返済予定表をすばやく確認できます。`
- 注意文: 説明本文に「本アプリの結果は概算であり、金融アドバイスや融資提供ではない」ことを明記する

## Data safety 回答案

現状のコード調査結果:

- 端末内保存: `localStorage` と `sessionStorage`
- 外部送信: なし
- 広告SDK: なし
- 解析SDK: なし
- ログイン: なし
- アカウント作成: なし
- アプリ内課金: なし
- Android権限: `android.permission.INTERNET` のみ

回答案:

- Does your app collect or share any of the required user data types?: No
- Is all of the user data collected by your app encrypted in transit?: 該当なし
- Do you provide a way for users to request that their data is deleted?: 該当なし。アカウントやサーバー保存データはない
- Is your app committed to following the Play Families Policy?: 子ども向けではないため、対象年齢設定に合わせて回答

補足:

- 返済条件、履歴、保存済み条件、テーマ設定、日付表示設定は端末内に保存されるだけで、開発者や第三者へ送信しない。
- 将来、広告、解析、クラッシュレポート、問い合わせフォーム、アカウント機能、クラウド同期を追加した場合は、Data safety とプライバシーポリシーを再確認する。

## App content 回答案

Ads:

- Contains ads?: No

App access:

- Restricted access?: No
- Demo account: 不要

Target audience and content:

- 推奨選択: 18歳以上
- 理由: 借入・返済の概算確認を目的としたファイナンス計算ツールであり、子ども向けに設計していない。
- Families Program: 参加しない

Content rating:

- 暴力、性的表現、薬物、ギャンブル、ユーザー生成コンテンツ、位置情報共有、オンライン購入、チャット機能: なし
- 金融計算ツールであり、実際の融資、投資、暗号資産、ギャンブル、金銭取引は行わない

News:

- News app?: No

Government:

- Government app?: No

Financial features / personal loans:

- このアプリは個人ローンを提供しない
- 融資申込、融資審査、貸付、返済受付、第三者貸金業者への送客、リード生成を行わない
- APR、手数料、貸付条件を提示する金融商品販売アプリではない
- 返済条件をユーザーが入力し、概算の返済予定を端末内で計算するツールである

## Android release

現状:

- `targetSdkVersion`: 36
- `compileSdkVersion`: 36
- `minSdkVersion`: 24
- `versionName`: 2.36.3
- `versionCode`: 23603

提出前に必要:

- GitHub Secrets:
  - `ANDROID_KEYSTORE_BASE64`
  - `ANDROID_KEYSTORE_PASSWORD`
  - `ANDROID_KEY_ALIAS`
  - `ANDROID_KEY_PASSWORD`
- `Android release bundle` workflow を手動実行
- 生成された署名済みAABをPlay Consoleへアップロード

## 新規個人アカウントの注意

Google Playの新規個人デベロッパーアカウントでは、Production申請前に、12人以上のテスターが14日間以上継続してオプトインしたクローズドテストが必要になる。組織アカウントや既存アカウントでは条件が異なる可能性があるため、Play Consoleの表示を優先する。
