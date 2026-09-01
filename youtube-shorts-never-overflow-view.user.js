// ==UserScript==
// @name         YouTube Shorts - Never Overflow View
// @namespace    https://github.com/aiya000/dotfiles
// @version      1.0.0
// @description  Keeps a Shorts video fully visible by letterboxing / pillarboxing it instead of clipping the overflow, whenever the viewport aspect ratio does not match 9:16.
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
   * Fallback polling interval, in case an SPA route change is missed.
   */
  const routeCheckIntervalMs = 500

  /**
   * YouTube scales a Shorts video to fill either the width or the height of the
   * player and clips the overflow, so the top / bottom (or left / right) gets cut
   * off whenever the viewport aspect ratio differs from 9:16.
   *
   * Overriding the video element with `object-fit: contain` covers both cases at once:
   *   - viewport relatively wide → full-height + pillarboxing (bars on the left / right)
   *   - viewport relatively tall → full-width + letterboxing (bars on the top / bottom)
   *
   * YouTube applies its sizing via inline styles without `!important`, so `!important`
   * rules reliably win.
   *
   * All rules are scoped under `html.ysnov-active` so that the regular watch page and
   * the miniplayer stay untouched.
   *
   * Note that `<head>` may not exist yet under `@run-at document-start`; in that case
   * the style element goes directly under `<html>`, where the CSS still applies.
   */
  function injectStyles() {
    if (document.getElementById(styleElementId) !== null) {
      return
    }

    const style = document.createElement('style')
    style.id = styleElementId
    style.textContent = `
      /* ── Stretch the video to its parent, and pad instead of overflowing ── */
      html.${activeClassName} .html5-video-player video.html5-main-video {
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        object-fit: contain !important;
      }

      /* ── Stretch the wrapper too, and paint the padded area black ── */
      html.${activeClassName} .html5-video-player .html5-video-container {
        width: 100% !important;
        height: 100% !important;
        left: 0 !important;
        top: 0 !important;
        background-color: #000 !important;
      }

      /* ── Safety net for the case where the player itself is laid out larger than the visible area ── */
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
   * YouTube is an SPA, and the desktop and mobile versions fire different navigation
   * events. Any of them can be missed, so polling is used alongside the listeners.
   * `syncActiveClass` is idempotent, so redundant calls are harmless.
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
