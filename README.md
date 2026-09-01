# Tampermonkey YouTube Shorts - Never Overflow View

A tampermonkey script that keeps a YouTube Shorts video fully visible.

When the viewport aspect ratio does not match the 9:16 of Shorts, YouTube scales the video up and clips
whatever does not fit, so the top / bottom (or left / right) of the video gets cut off.
This script replaces that behavior with letterboxing / pillarboxing, so the whole video always fits on screen.

## Behavior

- Viewport relatively wide → shown at **full-height**, with bars on the left and right
- Viewport relatively tall → shown at **full-width**, with bars on the top and bottom

The mechanism is simple: it overrides the Shorts player's `<video>` with `object-fit: contain` using
`!important`. YouTube applies its sizing via inline styles without `!important`, so the CSS reliably wins.

The CSS is only active while you are on a `/shorts` route (scoped by the `ysnov-active` class on `<html>`),
so the regular watch page and the miniplayer stay untouched.

## Examples

Original (Bad😞)
<img width="300" alt="Screenshot_20260901_141523_Firefox" src="https://github.com/user-attachments/assets/e6c98c99-b28d-44ed-acec-ed6559348f42" />

This plugin (Better😊)
<img width="300" alt="Screenshot_20260901_141440_Firefox" src="https://github.com/user-attachments/assets/5d667244-e2b4-4dc2-9d39-4fdc3d6a1207" />

Behavior (This plugin)
https://github.com/user-attachments/assets/2b18bae8-6d09-4e57-92b6-d111de2787f8



## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. Install [youtube-shorts-never-overflow-view.user.js](https://raw.githubusercontent.com/aiya000/tampermonkey-youtube-shorts-never-overflow-view/refs/heads/main/youtube-shorts-never-overflow-view.user.js) into Tampermonkey

## Supported URLs

- `https://www.youtube.com/*`
- `https://m.youtube.com/*`
- `https://youtube.com/*`

Only pages under `/shorts` are affected.

## Development

```console
$ bun install
$ bun run typecheck
$ bun run lint
$ bun run fix
```
