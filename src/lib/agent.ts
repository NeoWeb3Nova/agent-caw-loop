import { encodePayment, decodeChallenge, type X402Challenge, type X402PaymentPayload, type SettlementReceipt } from "./x402";

export type PactRules = {
  perTxMaxUSDC: number;
  dailyMaxUSDC: number;
  windowMinutes: number;          // session validity from windowStartedAt
  windowStartedAt: number;        // unix ms
  allowedHosts: string[];         // e.g. ["localhost", "*.lovable.app"]
  allowedPathPrefixes: string[];  // e.g. ["/api/videos/"]
  humanApprovalThresholdUSDC: number; // >= triggers manual approve
};

export type AgentWallet = {
  address: string;
  balanceUSDC: number;
};

export type LogEntry = {
  id: string;
  at: number;
  level: "info" | "warn" | "error" | "success" | "decision" | "http";
  scope: "agent" | "pact" | "http" | "settle" | "audit";
  message: string;
  data?: unknown;
};

export type AuditRecord = {
  id: string;
  at: number;
  resource: string;
  amount: string;
  asset: string;
  payTo: string;
  payFrom: string;
  txHash: string;
  nonce: string;
  approvedBy: "agent" | "human";
  pactSnapshot: PactRules;
};

export type PactDecision =
  | { ok: true; needsApproval: boolean; reason?: string }
  | { ok: false; reason: string };

export function hostMatches(host: string, patterns: string[]) {
  return patterns.some((p) => {
    if (p === host) return true;
    if (p.startsWith("*.")) return host === p.slice(2) || host.endsWith(p.slice(1));
    return false;
  });
}

export function evaluatePact(
  rules: PactRules,
  challenge: X402Challenge,
  spentTodayUSDC: number,
  now = Date.now(),
): PactDecision {
  const amount = Number(challenge.maxAmountRequired);

  // Time window
  const windowEnd = rules.windowStartedAt + rules.windowMinutes * 60_000;
  if (now > windowEnd)
    return { ok: false, reason: `session window expired (ended ${new Date(windowEnd).toLocaleTimeString()})` };

  // Per-tx cap
  if (amount > rules.perTxMaxUSDC)
    return { ok: false, reason: `amount ${amount} USDC exceeds per-tx cap ${rules.perTxMaxUSDC}` };

  // Daily cap
  if (spentTodayUSDC + amount > rules.dailyMaxUSDC)
    return { ok: false, reason: `would exceed daily cap (${spentTodayUSDC + amount} / ${rules.dailyMaxUSDC} USDC)` };

  // Whitelist
  let url: URL;
  try { url = new URL(challenge.resource); }
  catch { return { ok: false, reason: "invalid resource URL" }; }

  if (!hostMatches(url.hostname, rules.allowedHosts))
    return { ok: false, reason: `host "${url.hostname}" not in allowlist` };

  if (!rules.allowedPathPrefixes.some((p) => url.pathname.startsWith(p)))
    return { ok: false, reason: `path "${url.pathname}" not in allowed prefixes` };

  // Human approval threshold
  const needsApproval = amount >= rules.humanApprovalThresholdUSDC;
  return { ok: true, needsApproval, reason: needsApproval ? `>= human approval threshold ${rules.humanApprovalThresholdUSDC} USDC` : undefined };
}

function rand(n = 12) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function buildPayment(challenge: X402Challenge, wallet: AgentWallet): X402PaymentPayload {
  return {
    scheme: challenge.scheme,
    network: challenge.network,
    asset: challenge.asset,
    amount: challenge.maxAmountRequired,
    payTo: challenge.payTo,
    payFrom: wallet.address,
    resource: challenge.resource,
    nonce: challenge.nonce,
    signature: "0xCAW" + rand(28), // CAW co-signed mock signature
    issuedAt: Date.now(),
  };
}

export type FetchProtectedResult =
  | { stage: "challenged"; challenge: X402Challenge; raw: unknown }
  | { stage: "denied-by-pact"; challenge: X402Challenge; reason: string }
  | { stage: "awaiting-approval"; challenge: X402Challenge; payment: X402PaymentPayload }
  | { stage: "settled"; challenge: X402Challenge; payment: X402PaymentPayload; receipt: SettlementReceipt; payload: VideoUnlock }
  | { stage: "error"; error: string };

export type VideoUnlock = {
  ok: true;
  video: { id: string; title: string; src: string; poster: string; durationSec: number };
  receipt: SettlementReceipt;
};

/**
 * Probe the protected endpoint with no payment, return the challenge.
 */
export async function probeChallenge(resourceUrl: string): Promise<{ challenge: X402Challenge; raw: unknown; status: number }> {
  const res = await fetch(resourceUrl, { method: "GET" });
  const raw = await res.json().catch(() => null);
  if (res.status !== 402) throw new Error(`expected 402, got ${res.status}`);
  const header = res.headers.get("x-payment-required");
  if (!header) throw new Error("missing X-Payment-Required header");
  const challenge = decodeChallenge(header);
  return { challenge, raw, status: res.status };
}

/**
 * Retry the protected endpoint with X-Payment header → returns unlocked video.
 */
export async function executePayment(
  challenge: X402Challenge,
  payment: X402PaymentPayload,
): Promise<{ unlock: VideoUnlock; xPaymentResponse: string | null; status: number }> {
  const header = encodePayment(payment);
  const res = await fetch(challenge.resource, {
    method: "GET",
    headers: { "X-Payment": header },
  });
  const body = await res.json();
  if (!res.ok || !body?.ok) throw new Error(body?.error || `request failed (${res.status})`);
  return { unlock: body as VideoUnlock, xPaymentResponse: res.headers.get("x-payment-response"), status: res.status };
}

export function todayKey(now = Date.now()) {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export { rand as randHex };
