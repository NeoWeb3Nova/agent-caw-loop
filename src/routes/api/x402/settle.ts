import { createFileRoute } from "@tanstack/react-router";
import type { SettlementReceipt, X402PaymentPayload } from "@/lib/x402";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function txHash() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "0x" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

// Mock x402 facilitator. In a real system this verifies the EIP-3009 signature
// and broadcasts the transfer on-chain. Here we sanity-check the payload and
// return a deterministic receipt.
export const Route = createFileRoute("/api/x402/settle")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const { payload, expected } = (await request.json()) as {
          payload: X402PaymentPayload;
          expected: { amount: string; payTo: string; resource: string };
        };

        const fail = (error: string): SettlementReceipt => ({
          ok: false,
          txHash: "",
          settledAt: Date.now(),
          amount: payload?.amount ?? "0",
          asset: payload?.asset ?? "USDC",
          network: payload?.network ?? "base-sepolia-mock",
          payTo: payload?.payTo ?? "",
          payFrom: payload?.payFrom ?? "",
          resource: payload?.resource ?? "",
          nonce: payload?.nonce ?? "",
          error,
        });

        if (!payload?.signature || payload.signature.length < 8)
          return Response.json(fail("invalid_signature"), { headers: CORS });
        if (payload.payTo !== expected.payTo)
          return Response.json(fail("merchant_mismatch"), { headers: CORS });
        if (payload.resource !== expected.resource)
          return Response.json(fail("resource_mismatch"), { headers: CORS });
        if (Number(payload.amount) < Number(expected.amount))
          return Response.json(fail("insufficient_amount"), { headers: CORS });

        // Simulate facilitator latency
        await new Promise((r) => setTimeout(r, 350));

        const receipt: SettlementReceipt = {
          ok: true,
          txHash: txHash(),
          settledAt: Date.now(),
          amount: payload.amount,
          asset: payload.asset,
          network: payload.network,
          payTo: payload.payTo,
          payFrom: payload.payFrom,
          resource: payload.resource,
          nonce: payload.nonce,
        };
        return Response.json(receipt, { headers: CORS });
      },
    },
  },
});
