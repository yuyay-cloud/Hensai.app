返済試算 Ver2.36.1

このリポジトリは、静的HTML/CSS/JavaScript構成の返済試算PWAです。
現行の安定版は Ver2.36.1 です。

主要ファイル
- index.html: アプリ本体
- manifest.json: PWA名・起動設定・アイコン設定
- sw.js: オフライン用キャッシュ
- icon-*-v2361.png: ホーム画面追加時のアプリアイコン

運用メモ
- v2.36.2系の外部UIパッチは使用しません。
- Service WorkerはGitHub PagesなどのHTTPS配信時に有効になります。
- file://で開いた場合、Service Worker登録は行いません。
