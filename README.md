# Aligned

*AI-Assisted Development at Scale: Keeping Product Decisions, Specs, and Agents Aligned.* Talk by Juan G. Carmona, X-Ops Conference Madrid 2026, Aula Magna, Universidad Rey Juan Carlos, Saturday 21 November 2026. 50-minute slot: about 40 minutes of talk, then questions.

Published at **https://aligned.jgcarmona.com**.

## What is where

| Path | What |
| --- | --- |
| [`content/thesis.md`](content/thesis.md) | The idea and what the audience takes home |
| [`content/narrative.md`](content/narrative.md) | The story, timings, source keys, what is reused from *Ingeniería del Software 2.0* |
| [`content/outline.md`](content/outline.md) | Scene by scene: what is on screen, motion, and the source of every claim |
| [`content/speaker-notes.md`](content/speaker-notes.md), [`speaker-notes.es.md`](content/speaker-notes.es.md) | What Juan says, in English and Spanish. The presenter window reads the one for the current language at build time |
| [`content/open-questions.md`](content/open-questions.md) | Decisions still open |
| [`content/evidence/`](content/evidence/) | Recorded command output shown on screen |
| `src/scenes.tsx` | The eleven scenes; mirrors `outline.md` |
| `src/field/` | The recurring glyph graph (three.js points + glyph atlas) and its forms |

`content/` is the source of the story. Change the outline first, then the scene.

## Run

Requires Node.js 22.

```bash
npm ci
```

```bash
npm run dev
```

Open the printed URL. Each scene has its own URL, `#/<scene-id>` or `#/<scene-id>/<step>`.

| Key | Action |
| --- | --- |
| → ↓ PageDown Space Enter | next step or scene (presentation clickers send PageDown/PageUp) |
| ← ↑ PageUp Backspace | previous |
| Home / End | first / last scene |
| P | open the presenter window (notes, timer against 40:00, current and next) |
| B or . | blackout |
| F | fullscreen |

The title sheet has an EN/ES toggle at the bottom left. The whole deck and the presenter notes switch language, and the choice is kept in the URL (`?lang=es`) and in the browser. Literal quotations, artifact text and terminal output stay in their original English. From the first minute, the sheet block at the bottom right shows the minutes since the page loaded (HH:mm), as in *Software Engineering 2.0*.

Click the right two thirds of the screen to advance and the left third to go back. Both windows stay in sync through a `BroadcastChannel`, and keys work in either one.

## Build, PDF, screenshots

```bash
npm run build
```

```bash
npm run preview
```

After `npm run build`:

```bash
npm run pdf
```

writes `aligned-xops-madrid-2026.pdf`, one 1920×1080 page per scene at its final step (from `?print`).

```bash
npm run shots
```

writes one PNG per step to `screenshots/`. Prefix either command with `LANG_DECK=es` for Spanish. `npm run og` regenerates `public/og.png`; run `npm run build` again afterwards so it reaches `dist/`.

## Offline and accessibility

- Everything is bundled: system font stacks, no web fonts, no CDNs, no video. The built `dist/` works with no network.
- `prefers-reduced-motion`: the glyph field stops idling and jumps between forms, and CSS animations and view transitions are off.
- Without WebGL, the field falls back to a static Canvas 2D rendering. Print and presenter previews always use it.
- Type sizes are set for a 1920×1080 sheet that scales to the screen. Body text is 30px or larger on the sheet.

## Dependencies and why

| Dependency | Why |
| --- | --- |
| `react`, `react-dom` | Same base as *Ingeniería del Software 2.0* |
| `three` | The recurring glyph graph: 5,200 points drawn as glyph sprites and morphed on the GPU at 60 fps |
| `qrcode` | Encodes the final QR, drawn as crisp SVG so it scans from the back of the room |
| `vite`, `@vitejs/plugin-react`, `typescript` | Build |
| `@playwright/test` | Screenshots, PDF and OG image |

No GSAP: the only continuous animation is the field morph, driven by one shader uniform. Scene changes use the browser's View Transitions API, which needs no library.

## Deploy (Cloudflare Pages)

Deploy only after Juan approves the release.

```bash
npm run build
```

```bash
npx wrangler pages deploy dist --project-name talk-aligned --branch main
```

Custom domain `aligned.jgcarmona.com` is attached to the `talk-aligned` Pages project in the Cloudflare dashboard. Navigation uses hash URLs, so no redirect rules are needed.

## Editions

Each edition gets a git tag: `xops-madrid-2026`.
