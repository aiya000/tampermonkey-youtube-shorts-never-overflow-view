# Tampermonkey YouTube Shorts - Never Overflow View

A tampermonkey script that keeps a YouTube Shorts video fully visible.

When the viewport aspect ratio does not match the 9:16 of Shorts, YouTube scales the video up and clips
whatever does not fit, so the top / bottom (or left / right) of the video gets cut off.
This script replaces that behavior with letterboxing / pillarboxing, so the whole video always fits on screen.

## 動作

- 端末が横に余っているとき → **full-height** で表示し、左右に余白を入れる
- 端末が縦に余っているとき → **full-width** で表示し、上下に余白を入れる

仕組みは単純で、Shorts のプレイヤーの `<video>` に `object-fit: contain` を `!important` で
上書きしているだけです。YouTube が付けるサイズ指定はインラインスタイル（`!important` なし）なので、
CSS 側で確実に勝てます。

通常の watch ページやミニプレイヤーを壊さないよう、CSS は `/shorts` にいる間だけ有効になります
（`<html>` に付けた `ysnov-active` クラスでスコープしています）。

## インストール

1. ブラウザに [Tampermonkey](https://www.tampermonkey.net/) をインストール
2. [youtube-shorts-never-overflow-view.user.js](https://raw.githubusercontent.com/aiya000/tampermonkey-youtube-shorts-never-overflow-view/refs/heads/main/youtube-shorts-never-overflow-view.user.js) を Tampermonkey にインストール

## 対応 URL

- `https://www.youtube.com/*`
- `https://m.youtube.com/*`
- `https://youtube.com/*`

`/shorts` 配下のページでのみ動作します。

## 開発

```console
$ bun install
$ bun run typecheck
$ bun run lint
$ bun run fix
```
