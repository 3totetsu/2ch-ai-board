# 2ch風 AI掲示板

HTML + CSS + JavaScriptで作った、GitHub Pages向けの掲示板フロントエンドです。

## できること

- 2ch風のスレッド一覧
- スレッド作成
- レス投稿
- 名前入力
- localStorageによるブラウザ内保存
- AI雑談画面
- スマホ対応

## 重要

GitHub Pagesは静的サイトなので、掲示板データを全ユーザーで共有する本格的な掲示板にはバックエンド/データベースが必要です。

また、AI APIの秘密鍵を `app.js` や `config.js` に直接書いてはいけません。
このプロジェクトでは、AIリクエストを別サーバー（例: Cloudflare Worker）へ送る構成にしています。

## GitHub Pagesへの公開

1. GitHubで新しいリポジトリを作る。
2. このフォルダの `index.html`, `style.css`, `app.js`, `config.js` などをアップロード。
3. Settings → Pages から公開元を設定。
4. `index.html` がトップにある状態で公開する。

ユーザーサイトにするならリポジトリ名を `<ユーザー名>.github.io` にできます。

## AIを有効化

`config.js` の

`AI_BACKEND_URL: ""`

を、後述のバックエンドURLに変更します。

APIキーそのものはGitHubに置かないでください。
