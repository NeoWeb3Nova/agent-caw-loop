// Shared x402 protocol types — safe to import from client or server.

export type X402Challenge = {
  scheme: "exact";
  network: "base-sepolia-mock";
  asset: "USDC";
  maxAmountRequired: string; // human, e.g. "0.05"
  payTo: string;             // merchant address
  resource: string;          // canonical URL of the resource
  description: string;
  mimeType: string;
  validUntil: number;        // unix ms
  nonce: string;
};

export type X402PaymentPayload = {
  scheme: "exact";
  network: "base-sepolia-mock";
  asset: "USDC";
  amount: string;
  payTo: string;
  payFrom: string;     // agent CAW address
  resource: string;
  nonce: string;
  // Mocked "signature" — in a real impl this is an EIP-3009 / EIP-712 sig
  signature: string;
  issuedAt: number;
};

export type SettlementReceipt = {
  ok: boolean;
  txHash: string;
  settledAt: number;
  amount: string;
  asset: string;
  network: string;
  payTo: string;
  payFrom: string;
  resource: string;
  nonce: string;
  error?: string;
};

export function encodePayment(payload: X402PaymentPayload): string {
  return btoaUtf8(JSON.stringify(payload));
}

export function decodePayment(header: string): X402PaymentPayload {
  return JSON.parse(atobUtf8(header));
}

export function encodeChallenge(c: X402Challenge): string {
  return btoaUtf8(JSON.stringify(c));
}

export function decodeChallenge(header: string): X402Challenge {
  return JSON.parse(atobUtf8(header));
}

function btoaUtf8(s: string) {
  if (typeof btoa !== "undefined") return btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s, "utf-8").toString("base64");
}
function atobUtf8(s: string) {
  if (typeof atob !== "undefined") return decodeURIComponent(escape(atob(s)));
  return Buffer.from(s, "base64").toString("utf-8");
}
