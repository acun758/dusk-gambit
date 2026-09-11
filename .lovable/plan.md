# Blood Sovereign — Chess Grandmaster App

A dark, ornate bilingual (English / 中文) chess experience built from the 14 supplied screens. Gothic "Court of Ruin" aesthetic: obsidian black, crimson, gold accents, Cinzel / Playfair display type.

## Scope

Build every screen as a faithful, fully responsive page with working navigation, tabs, toggles, sliders and hover states. Content (matches, relics, stats) is the demo content from the designs — no accounts or database in this pass.

## Screens and routes

| Route | Screen |
| --- | --- |
| `/` | Sovereign's Decree — home hub: rank card, Grandmaster path progress, Blitz/Rapid/Bullet queues, daily tactics trial |
| `/arsenal` | Mythic relic gallery — 360° forge view, relic filters (King/Queen/Knight...), Arsenal Relics grid |
| `/forge/:id` | Forge Studio — relic detail with bloom intensity slider, ember particles, camera angle and lighting presets |
| `/finisher` | Finisher Workshop — execution timeline scrubber, playback speed, 4-shot storyboard reel |
| `/victory` | Checkmate result — mythic execution banner, war council report (ELO, accuracy, shards) |
| `/archive` | Archive Chronicle / Climax Studio — poster template picker (Tarot Ace, Void Poster, War Dispatch, 9:16 Story), canvas ratio switch, live card preview |
| `/share` | Card Distribution Canvas — WeChat bubble / moments card / rich-link preview forms |
| `/battle` | Active Confrontation — live board with 3D-styled pieces, player bars, engine eval, brilliant-move callout |
| `/puzzle` | Endgame puzzle — 8×8 board with coordinates, timer, mate-in-1 challenge |
| `/puzzle/solved` | Puzzle resolved — S+ rating, spoils of war, unlocked title |
| `/protocols` | Sanctum of Arbiters — ritual & mind covenant, dual-ladder protocol selection with time controls |
| `/analysis` | Post-match analysis — precision comparison, tilt & heartbeat nexus advantage chart across 38 plies |
| `/codex` | Historic duels & codex — opening tree, legendary duels, blind drills tabs with archetype cards |

Screens 4 and 7 are the same Archive Chronicle page in two states, so they share one route with a state toggle.

## Shared pieces

- Top command bar (rank badge, Battle label, clock, sound, profile) present on all desktop screens; screens 9–11 use the WeChat mini-program frame variant instead.
- Ornate frame, corner-flourish, stat pill, and section-header components reused across pages.
- Chess board component driven by a position string, reused by battle, puzzle and archive previews.

## Technical notes

- Tailwind theme tokens in `src/styles.css` for the obsidian/crimson/gold palette; no hardcoded colors in components.
- Cinzel, Playfair Display, Bodoni Moda, Geist and Material Symbols loaded via a `<link>` in the root route.
- Design images hotlinked from the original `lh3.googleusercontent.com` URLs.
- Per-route `head()` metadata with unique titles and descriptions.
- Animations (ember drift, glow pulse, timeline scrub) via CSS keyframes and local React state — no backend calls.
