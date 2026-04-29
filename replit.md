# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/aether-bot run start` — run the Discord music bot

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Aether Discord Music Bot

Located at `artifacts/aether-bot/`. Long-running console process (no port), runs via the `Aether Bot` workflow. Requires the `DISCORD_BOT_TOKEN` secret.

### Stack
- discord.js v14, DisTube v5
- Plugins: @distube/youtube, @distube/soundcloud, @distube/spotify
- ffmpeg-static (added to `onlyBuiltDependencies` in `pnpm-workspace.yaml`)
- libsodium-wrappers + opusscript for voice encryption/decoding

### Layout
- `src/index.ts` — entry, Discord client + DisTube wiring
- `src/config/` — env config, neon color palette, custom-emoji slot system
- `src/embeds/` — themed embed builders + Now Playing card
- `src/music/distube.ts` — DisTube factory
- `src/commands/{music,info,admin,filter,fun}/` — auto-loaded prefix commands
- `src/events/` — ready, messageCreate, DisTube event embeds
- `emojis-pack/` — 31 PNG/GIF assets for the custom emoji set
- `emojis.json` — generated at runtime when `+uploademojis` finishes; maps slot name → guild emoji ID

### Conventions
- Prefix `+` (override via `BOT_PREFIX` env)
- ZERO unicode emojis in user-facing text — only custom Discord emojis from the slot system, with text fallbacks (`▶`, `≡`, etc.) when slots aren't filled
- Dark/neon aesthetic: hot pink primary, neon cyan secondary, charcoal `#0e0e10` backgrounds
- "Crazy"/punchy/hype tone in copy
