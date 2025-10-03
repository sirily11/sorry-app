# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 application using React 19, TypeScript, and Tailwind CSS v4. The project uses Turbopack for faster builds and development, and Biome for linting/formatting instead of ESLint/Prettier.

Key dependencies:
- **Vercel AI SDK** (`ai`) - for AI/LLM integrations
- **Upstash Redis** (`@upstash/redis`) - for serverless Redis operations
- **shadcn/ui** - UI component library (configured with "new-york" style)
- **Biome** - fast linting and formatting tool

## Development Commands

```bash
# Start development server with Turbopack
bun dev  # or npm run dev

# Build for production with Turbopack
bun run build  # or npm run build

# Start production server
bun start  # or npm start

# Run linter
bun run lint  # or npm run lint

# Format code
bun run format  # or npm run format
```

## Architecture

### Path Aliases
- `@/*` maps to `./src/*`
- shadcn/ui specific aliases (configured in components.json):
  - `@/components` - components directory
  - `@/lib/utils` - utility functions
  - `@/ui` - UI components from shadcn/ui
  - `@/hooks` - custom React hooks

### Application Structure
- **App Router**: Uses Next.js 15 App Router pattern (`src/app/`)
- **Server Actions**: Prefer server actions over REST APIs for CRUD operations (per global user instructions)
- **Styling**: Tailwind CSS v4 with CSS variables enabled, using "neutral" base color
- **Fonts**: Uses Geist Sans and Geist Mono from `next/font/google`

### External Services
The app integrates with:
- **Upstash Redis**: Serverless Redis for caching/state (environment variables: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `REDIS_URL`)
- **AI Gateway**: Uses `AI_GATEWAY_API_KEY` for AI service integration

## Code Style

### Biome Configuration
- 2-space indentation
- Recommended rules enabled for React and Next.js
- Automatic import organization on save
- Ignores: node_modules, .next, dist, build

### TypeScript
- Strict mode enabled
- ES2017 target
- Path aliases configured for `@/*` imports

## Important Notes

- Development server runs on http://localhost:3000
- Uses Turbopack for both dev and build (faster than webpack)
- shadcn/ui components should be added to `@/components/ui`
- The `cn()` utility in `@/lib/utils` is used for merging Tailwind classes
