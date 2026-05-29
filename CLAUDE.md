# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `bun run dev` — Start dev server (Vite)
- `bun run build` — Production build
- `bun run build:dev` — Dev-mode build
- `bun run preview` — Preview production build
- `bun run lint` — ESLint check (ts, tsx)
- `bun run format` — Prettier format

## Architecture

**TanStack Start** (React 19 + Vite + file-based routing) app demonstrating the **x402 payment protocol** — an autonomous agent that pays HTTP 402 paywalls for video content.

### Project structure

| Layer | Files | Purpose |
|-------|-------|---------|
| x402 protocol | `src/lib/x402.ts` | Shared types + wire encoding (`X402Challenge`, `X402PaymentPayload`, `SettlementReceipt`). Safe for client and server. |
| Agent logic | `src/lib/agent.ts` | `evaluatePact()` — pact rule checks (per-tx cap, daily cap, allowlist, human-approval threshold). `probeChallenge()` / `executePayment()` — HTTP client for 402 flow. `buildPayment()` — constructs payment payload. |
| Agent state | `src/lib/agent-store.tsx` | React Context provider. Manages wallet, pact rules, logs, audit trail, unlock state, pending approvals. Exposes `useAgent()` hook. |
| Video catalog | `src/lib/videos.ts` | `VIDEOS` array (3 items) + `MERCHANT_ADDRESS`. |
| Console UI | `src/components/console/` | `VideoCatalog` (player + grid), `PactPanel` (rule editor + wallet stats), `LogPanel` (collapsible runtime log), `AuditPanel` (settlement history table), `ApprovalDialog` (modal for human-gated payments). |
| API routes | `src/routes/api/videos/$id/stream.ts` | Protected video endpoint. Returns `402` with `X-Payment-Required` header on first request; validates `X-Payment` header via internal facilitator; returns video unlock on success. |
| API routes | `src/routes/api/x402/settle.ts` | Mock settlement facilitator. Validates payment payload, returns settlement receipt. |
| Server entry | `src/server.ts` | SSR error boundary — catches h3-swallowed errors, renders fallback HTML. |

### x402 flow

1. Client `GET /api/videos/:id/stream` → server returns `402` + `X-Payment-Required` header (base64-encoded `X402Challenge`)
2. Agent decodes challenge, runs `evaluatePact()` against configurable rules
3. If pact denies → blocked. If pact approves but exceeds human threshold → modal dialog for manual sign-off
4. Agent builds `X402PaymentPayload`, encodes as `X-Payment` header, retries the same `GET`
5. Server receives payment, calls internal `/api/x402/settle` (mock facilitator), returns video unlock + `SettlementReceipt`

### Key conventions

- `.server.ts` suffix prevents Vite from bundling into client — use for server-only modules
- `createServerFn()` for server-side handlers called from client (see `src/lib/api/example.functions.ts`)
- API routes use file-based routing under `src/routes/api/`
- All UI components are in `src/components/` — `ui/` for shadcn primitives, `console/` for app-specific
- `@/` path alias maps to `src/`
- Tailwind CSS v4 with shadcn/ui (New York style)
- Bun is the package manager
- No tests exist yet — none to run
