# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## What this is

Single-file luxury wedding invitation — `index.html` is entire app. No build, no bundler, no package.json. Open directly in browser.

## Stack (all via CDN, no local deps)

- **React 18** + **Babel standalone** — JSX compiled in-browser via `<script type="text/babel">`
- **Motion One v11** (`motion@11/dist/motion.js`) — exposes `window.Motion.animate` only; `inView`, `stagger`, `scroll` NOT exported in v11, will throw if destructured
- Scroll reveals + stagger use **native `IntersectionObserver`** instead
- Fonts: Frank Ruhl Libre, Heebo (HE), Cormorant Garamond, Great Vibes (FR script), all via Google Fonts

## Architecture

All in `index.html` in order:

1. `<head>` — CDN links, all CSS in one `<style>` block
2. `<script type="text/babel">` — all React components inline:
   - `TEXT` object — copy for both languages (`he` / `fr`)
   - `useMotionSetup()` — scroll progress bar + IntersectionObserver reveal groups (`.reveal`, `.details-grid`, `#sched-list`, `.gallery-grid`, `.countdown-grid`)
   - `Hero` — entrance stagger + parallax via native scroll listener
   - Sections: `Details`, `Schedule`, `Gallery`, `Countdown`, `RSVP`, `Footer`
   - Reusable: `HoverBtn`, `OrnamentSimple`, `OrnamentBotanic`, icon map `Ic`
   - `App` — lang state (`he`/`fr`), renders all sections, language toggle

## Language system

`lang` state in `App` drives everything. Switch via `document.documentElement.setAttribute('lang'/'dir')`. Hebrew RTL default; French LTR. Font stacks differ per language — use `lang === 'he'` checks, never `isHe` (not in scope inside child components).

## Key CSS tokens

```
--cream / --cream-deep     backgrounds
--copper / --copper-deep / --copper-light   primary brand green-gold
--ink / --ink-soft         text
--font-serif               Frank Ruhl Libre (HE) / Cormorant Garamond (FR)
--font-script              Great Vibes (FR names only)
```

`.gold-foil` — gradient shimmer via `background-clip:text`. Known: Great Vibes 'r' glyph hairline disappears >~80px on Windows (DirectWrite hinting disabled). Accepted as-is.

## Reveal animation pattern

Elements start hidden (`opacity:0; transform:translateY(24px)`). `useMotionSetup` wires IntersectionObserver to add CSS transition + set visible on intersection. Do NOT use Motion One's `inView` — not exported from CDN bundle.

## Countdown target

`2026-08-09T18:30:00+03:00`

## Remote

`https://github.com/Hillelse/invitation` (public, branch: `master`)

## Comments

Sparse. Only complex code.
