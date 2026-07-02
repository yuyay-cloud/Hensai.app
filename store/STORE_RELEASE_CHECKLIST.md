# ストア公開チェックリスト

対象アプリ: 返済試算
現在の公開版: Ver2.36.3
想定バンドルID: `cloud.yuyay.hensai`

## 方針

- iOS / Android は Capacitor でネイティブ包装する。
- 既存の PWA / GitHub Pages 公開は維持する。
- アプリ本体の返済計算、休日補正、履歴保存、PDF印刷はこの準備作業では変更しない。
- ネイティブのアプリアイコンと起動画面画像は既存ブランド画像を使用する。

## アカウント

- Apple Developer Program に登録する。
- Google Play Console に登録する。
- Google Play の個人アカウントで公開する場合は、12人以上のテスターによる14日間以上のクローズドテスト要件を確認する。

## 必須URL

- プライバシーポリシー: `https://yuyay-cloud.github.io/Hensai.app/privacy.html`
- サポート: `https://yuyay-cloud.github.io/Hensai.app/support.html`

## 提出前に必要な作業

- Android Studio で Android プロジェクトを開き、署名設定を行う。
- Xcode で iOS プロジェクトを開き、Team、Bundle Identifier、Signing を設定する。
- ストア用スクリーンショットを作成する。
- App Privacy / Data Safety で、返済条件は端末内保存のみで外部送信しないことを申告する。
- 金融アドバイスではなく概算試算ツールであることを説明文に明記する。
- 実機で以下を確認する。
  - 新規試算
  - 元利均等
  - 元金均等
  - 比較
  - 履歴
  - PDF印刷または共有
  - ダーク / ライト
  - オフライン起動

## ビルド手順

```powershell
pnpm install
pnpm run build:web
pnpm run cap:sync
```

Android:

```powershell
pnpm run android:sync
```

iOS:

```powershell
pnpm run ios:sync
```

iOS の最終ビルドと提出は macOS + Xcode が必要。
