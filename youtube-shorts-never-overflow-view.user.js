// ==UserScript==
// @name         YouTube Shorts - Never Overflow View
// @namespace    https://github.com/aiya000/dotfiles
// @version      1.0.0
// @description  端末サイズが Shorts の縦横比に合わないとき、動画が見切れる代わりに余白（レターボックス / ピラーボックス）を入れて、動画全体が必ず画面内に収まるようにします。
// @author       aiya000
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
  'use strict'

  const styleElementId = 'ysnov-styles'
  const activeClassName = 'ysnov-active'

  /**
   * SPA のルート変化を取りこぼしたときの保険として使うポーリング間隔。
   */
  const routeCheckIntervalMs = 500

  /**
   * YouTube は動画を「幅か高さのどちらかを基準に拡大し、はみ出た分をクリップする」形で
   * 表示するため、端末の縦横比が 9:16 から外れると上下または左右が見切れる。
   *
   * これを `object-fit: contain` に上書きすることで、
   *   - 端末が横に余っているとき → full-height + 左右に余白
   *   - 端末が縦に余っているとき → full-width + 上下に余白
   * のどちらも自動的に成立する。
   *
   * YouTube が付けるのはインラインスタイル（`!important` なし）なので、
   * `!important` 付きの CSS で確実に勝てる。
   *
   * Shorts 以外（通常の watch ページやミニプレイヤー）を壊さないよう、
   * 全ルールを `html.ysnov-active` 配下にスコープする。
   *
   * なお `@run-at document-start` では `<head>` が未生成の場合があるため、
   * その時は `<html>` 直下に挿入する（どちらでも CSS は適用される）。
   */
  function injectStyles() {
    if (document.getElementById(styleElementId) !== null) {
      return
    }

    const style = document.createElement('style')
    style.id = styleElementId
    style.textContent = `
      /* ── 動画本体を親いっぱいに広げ、はみ出しの代わりに余白を作る ── */
      html.${activeClassName} .html5-video-player video.html5-main-video {
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        object-fit: contain !important;
      }

      /* ── 動画のラッパも親いっぱいにして、余白部分を黒で塗る ── */
      html.${activeClassName} .html5-video-player .html5-video-container {
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        background-color: #000 !important;
      }

      /* ── プレイヤー自体が可視領域より大きく作られるケースへの保険 ── */
      html.${activeClassName} #shorts-player,
      html.${activeClassName} .html5-video-player {
        max-width: 100% !important;
        max-height: 100% !important;
      }
    `

    const parent = document.head ?? document.documentElement
    parent.appendChild(style)
  }

  /**
   * @returns {boolean}
   */
  function isShortsRoute() {
    return location.pathname.startsWith('/shorts')
  }

  function syncActiveClass() {
    document.documentElement.classList.toggle(activeClassName, isShortsRoute())
  }

  /**
   * YouTube は SPA で、デスクトップ版とモバイル版で飛ぶナビゲーションイベントが異なる。
   * どのイベントも取りこぼす可能性があるので、購読に加えて定期チェックも併用する。
   * `syncActiveClass` は冪等なので、多重に呼ばれても問題ない。
   */
  function watchNavigation() {
    const documentEvents = ['yt-navigate-start', 'yt-navigate-finish', 'yt-page-data-updated']
    documentEvents.forEach(name => {
      document.addEventListener(name, syncActiveClass)
    })

    window.addEventListener('popstate', syncActiveClass)
    window.addEventListener('hashchange', syncActiveClass)

    setInterval(syncActiveClass, routeCheckIntervalMs)
  }

  injectStyles()
  syncActiveClass()
  watchNavigation()
})()
