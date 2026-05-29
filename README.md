# x402 Paywall × Cobo Agentic Wallet

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=fff)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.x-FF4154?logo=react-router&logoColor=fff)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-New_York-000?logo=shadcnui&logoColor=fff)](https://ui.shadcn.com/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh/)

A **developer console** that puts an autonomous crypto agent in the driver's seat — negotiating **HTTP 402** paywalls, enforcing programmable spending rules ("Pacts"), and settling microtransactions without manual intervention.

![x402 flow](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fe9d1c97-7fb8-4683-bca4-41c5433b30c8/id-preview-c05a8441--f092d7ca-9b80-42d1-a705-524006a57853.lovable.app-1780042818311.png)

> **Status:** In-browser demo with mocked on-chain settlement. Ready for real wallet integration.

---

## How It Works

Every request to a protected resource follows a **challenge → evaluate → settle → unlock** loop.

```
┌──────────────┐     1. GET /api/videos/:id            ┌──────────────┐
│              │ ──────────────────────────────────▶   │              │
│   Cobo Agentic Wallet  │     2. 402 + X-Payment-Required ◀─── │   Merchant   │
│  (in-browser)│                                        │   Server     │
│              │     3. Evaluate Pact rules             │              │
│              │                                        │              │
│              │     4. GET + X-Payment header ──────▶  │              │
│              │       5. Verify via facilitator ────▶  │ Facilitator  │
│              │       6. Settlement receipt ◀────────  │  (mock)     │
│              │     7. 200 + video unlock ◀──────────  │              │
└──────────────┘                                        └──────────────┘
```

### The x402 Protocol

[x402](https://github.com/anthropics/x402) extends HTTP status **402 Payment Required** into a structured negotiation:

1. **Merchant issues a challenge** — The protected endpoint returns a `402` with an `X-Payment-Required` header containing a base64-encoded `X402Challenge` payload: `scheme`, `network`, `asset`, `amount`, `payTo` address, `resource` URL, and `nonce`.

2. **Agent builds a payment** — The agent constructs an `X402PaymentPayload` with matching fields plus its own `payFrom` address and a `signature`, then retries the request with an `X-Payment` header.

3. **Facilitator settles** — The merchant forwards the payment to a facilitator for on-chain settlement. In this demo, the facilitator mocks validation and returns a deterministic `SettlementReceipt` with a transaction hash.

### Agent Pact Rules

The agent operates within a programmable **Pact** — a set of spending guardrails:

| Rule | Default | Description |
|------|---------|-------------|
| `perTxMaxUSDC` | 0.25 | Maximum USDC per single transaction |
| `dailyMaxUSDC` | 1.00 | Maximum USDC spent in a calendar day |
| `windowMinutes` | 60 | Session validity window from activation |
| `allowedHosts` | `localhost`, `*.lovable.app` | Host allowlist for payment destinations |
| `allowedPathPrefixes` | `/api/videos/` | URL path allowlist |
| `humanApprovalThresholdUSDC` | 0.20 | Amounts at or above this require manual approval |

All rules are editable in real-time through the **Pact Panel** in the console.

### Dual-Approval Model

Transactions fall into three tiers:

| Amount | Behavior |
|--------|----------|
| Below `humanApprovalThresholdUSDC` | **Auto-approved** — agent settles independently |
| At or above threshold but within caps | **Human-in-the-loop** — modal dialog prompts for approval or rejection |
| Exceeds any cap | **Denied** — blocked before any payment reaches the network |

---

## Built With

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (New York) |
| Icons | [Lucide React](https://lucide.dev) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Package Manager | Bun |
| Linting | ESLint + Prettier + TypeScript-ESLint |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.2
- Node.js 22 (for type checking)

### Installation

```bash
git clone <repo-url>
cd agent-caw-loop
bun install
```

### Development

```bash
bun run dev
```

Opens a dev server at `http://localhost:5173` (or the next available port).

### Production

```bash
bun run build
bun run preview
```

---

## Usage

1. Open the app in a browser.
2. Browse the video catalog — each video has a USDC price.
3. Click **Agent pay & watch** on any video.
4. Watch the agent runtime log as it:
   - Probes the endpoint and receives an HTTP 402 challenge
   - Evaluates the challenge against Pact rules
   - Auto-approves or prompts for human approval
   - Retries with payment and receives the video unlock
5. Explore the **Pact Panel** to tweak rules and see how the agent responds.
6. Check the **Audit Trail** for a tamper-evident settlement history.

---

## Project Structure

```
src/
├── lib/
│   ├── x402.ts                  # Protocol types & wire encoding
│   ├── agent.ts                 # Pact evaluation, payment flow, HTTP client
│   ├── agent-store.tsx          # React Context provider & agent state
│   ├── videos.ts                # Video catalog data
│   ├── config.server.ts         # Server-only config helpers
│   ├── error-capture.ts         # SSR error capture for h3 recovery
│   ├── error-page.ts            # Fallback error HTML
│   └── api/
│       └── example.functions.ts # createServerFn example
├── components/
│   ├── console/
│   │   ├── VideoCatalog.tsx     # Video player & selection grid
│   │   ├── PactPanel.tsx        # Pact rules editor & wallet stats
│   │   ├── LogPanel.tsx         # Collapsible agent runtime log
│   │   ├── AuditPanel.tsx       # Settlement history table
│   │   └── ApprovalDialog.tsx   # Human approval modal
│   └── ui/                      # shadcn/ui primitives
├── routes/
│   ├── __root.tsx               # Root layout (QueryClientProvider + Outlet)
│   ├── index.tsx                # Main console page
│   └── api/
│       ├── videos/$id/stream.ts # Protected video endpoint (402 gateway)
│       └── x402/settle.ts       # Mock settlement facilitator
├── server.ts                    # SSR error boundary
├── start.ts                     # App bootstrap with error middleware
├── router.tsx                   # Router configuration
└── styles.css                   # Global styles
```

---

## Development

```bash
# Type checking
bun x tsc --noEmit

# Lint
bun run lint

# Format
bun run format
```

---

*Built with [TanStack Start](https://tanstack.com/start) · Inspired by [HTTP 402](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) and autonomous agent payment patterns.*
