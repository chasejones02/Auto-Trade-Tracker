# CLAUDE.md

## Project Overview

**TradeLog** is a day trading journal web app built as a single-page React application. The core value proposition is **minimum input, maximum insight** — traders log trades in under 15 seconds and the app automatically surfaces performance patterns they'd never spot on their own.

The killer feature is emotion-performance correlation: tracking how emotional states (FOMO, revenge trading, discipline) map to actual outcomes. This is the primary differentiator from existing tools like TradeZella, Tradervue, and Edgewonk.

## Tech Stack

- React (functional components, hooks, single .jsx file)
- Tailwind CSS (core utility classes only — no compiler)
- Recharts (all charts and data visualization)
- Lucide React (icons)
- shadcn/ui (UI components)
- No backend, no localStorage — all state in-memory with seed data

## Design

**Always read `/mnt/skills/public/frontend-design/SKILL.md` before making any UI changes.** This project demands high design quality — not generic AI-generated aesthetics.

The visual direction is a dark-theme trading terminal: near-black backgrounds, green/red for profit/loss, electric blue or amber accents. Typography should feel professional and distinctive — avoid default system fonts. Every view is data-dense but clearly hierarchical.

## Architecture

The app is a single `.jsx` artifact with five views controlled by sidebar navigation:

1. **Dashboard** — equity curve, top-line stats, recent trades, auto-generated insight cards
2. **Trade Log** — inline quick-add form (the most important UX element) + filterable/sortable history table
3. **Analytics** — breakdowns by setup, time of day, day of week, ticker, emotion, streaks
4. **Calendar** — monthly heatmap of P&L per day
5. **Settings** — preferences, tag management, placeholder for future broker integrations

## Key Principles

- The quick-add trade form must feel instant. Single row, no modals, no multi-step flows. Auto-calculate P&L from entry/exit/size.
- Insights must be computed from actual trade data, not hardcoded strings.
- FOMO and revenge trades should always correlate with worse outcomes in seed data — this is the "aha moment."
- Optimized for desktop (traders use large monitors). Should not break on tablet but mobile is not a priority.
- All monetary values: `$X,XXX.XX`. Percentages: `X.X%`. Dates: `MM/DD/YYYY`.

## Seed Data

The app ships with 50–75 realistic trades over 30 days. The data should tell a believable story: a profitable but imperfect trader with a ~60% win rate, clear emotional patterns, and room to improve. See the full MVP prompt doc for detailed seed data requirements.
