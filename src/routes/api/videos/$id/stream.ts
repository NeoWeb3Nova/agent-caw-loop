import { createFileRoute } from "@tanstack/react-router";
import { VIDEOS, MERCHANT_ADDRESS } from "@/lib/videos";
import {
  decodePayment,
  encodeChallenge,
  type X402Challenge,
  type SettlementReceipt,
} from "@/lib/x402";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Payment",
  "Access-Control-Expose-Headers": "X-Payment-Required, X-Payment-Response, WWW-Authenticate",
};

function rand(n = 16) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/videos/$id/stream")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params, request }) => {
        const video = VIDEOS.find((v) => v.id === params.id);
        if (!video) {
          return new Response(JSON.stringify({ error: "video not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const url = new URL(request.url);
        const resource = `${url.origin}/api/videos/${video.id}/stream`;
        const paymentHeader = request.headers.get("x-payment");

        if (!paymentHeader) {
          const challenge: X402Challenge = {
            scheme: "exact",
            network: "base-sepolia-mock",
            asset: "USDC",
            maxAmountRequired: video.priceUSDC,
            payTo: MERCHANT_ADDRESS,
            resource,
            description: `Unlock "${video.title}"`,
            mimeType: "video/mp4",
            validUntil: Date.now() + 5 * 60_000,
            nonce: rand(12),
          };
          const body = {
            x402Version: 1,
            error: "payment_required",
            accepts: [challenge],
          };
          return new Response(JSON.stringify(body), {
            status: 402,
            headers: {
              "Content-Type": "application/json",
              "WWW-Authenticate": `x402 scheme="exact", network="${challenge.network}", asset="${challenge.asset}", amount="${challenge.maxAmountRequired}"`,
              "X-Payment-Required": encodeChallenge(challenge),
              ...CORS,
            },
          });
        }

        // Verify payment via internal facilitator
        let payload;
        try {
          payload = decodePayment(paymentHeader);
        } catch {
          return new Response(JSON.stringify({ error: "invalid_payment_header" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const facilitatorUrl = `${url.origin}/api/x402/settle`;
        const settleRes = await fetch(facilitatorUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload, expected: { amount: video.priceUSDC, payTo: MERCHANT_ADDRESS, resource } }),
        });
        const receipt = (await settleRes.json()) as SettlementReceipt;

        if (!receipt.ok) {
          return new Response(JSON.stringify({ error: "settlement_failed", receipt }), {
            status: 402,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        // Issue access — return the protected resource URL + a short-lived ticket
        const body = {
          ok: true,
          video: {
            id: video.id,
            title: video.title,
            src: video.src,
            poster: video.poster,
            durationSec: video.durationSec,
          },
          receipt,
        };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Payment-Response": btoa(JSON.stringify({ txHash: receipt.txHash, settledAt: receipt.settledAt })),
            ...CORS,
          },
        });
      },
    },
  },
});
