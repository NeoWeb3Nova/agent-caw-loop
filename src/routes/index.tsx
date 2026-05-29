import { createFileRoute } from "@tanstack/react-router";
import { AgentProvider } from "@/lib/agent-store";
import { VideoCatalog } from "@/components/console/VideoCatalog";
import { PactPanel } from "@/components/console/PactPanel";
import { LogPanel } from "@/components/console/LogPanel";
import { AuditPanel } from "@/components/console/AuditPanel";
import { ApprovalDialog } from "@/components/console/ApprovalDialog";
import { Bot, Cpu } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "x402 Paywall × Cobo Agentic Wallet — Dev Console" },
      {
        name: "description",
        content:
          "Minimal demo of an HTTP 402 video paywall settled autonomously by a budget-bound Cobo Agentic Wallet.",
      },
      { property: "og:title", content: "x402 Paywall × Cobo Agentic Wallet" },
      {
        property: "og:description",
        content:
          "Watch an agent parse a real HTTP 402 challenge, check Pact rules, settle, and unlock the video.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AgentProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border bg-card/40 backdrop-blur">
          <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-tight">x402 Paywall × Cobo Agentic Wallet</h1>
                <p className="text-[11px] text-muted-foreground">
                  video access · autonomous settlement · auditable · by{" "}
                  <span className="text-primary/80">Web3的尼奥</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Bot className="w-3.5 h-3.5" />
              agent runtime: in-browser demo
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
          <div className="flex flex-col gap-4">
            <VideoCatalog />
            <AuditPanel />
          </div>
          <div className="flex flex-col gap-4">
            <PactPanel />
            <LogPanel />
          </div>
        </main>

        <footer className="border-t border-border py-3 text-center text-[11px] text-muted-foreground font-mono">
          server returns real HTTP 402 + <span className="text-primary">X-Payment-Required</span> ·
          agent retries with <span className="text-primary">X-Payment</span> · facilitator mocks
          on-chain settlement
        </footer>

        <ApprovalDialog />
      </div>
    </AgentProvider>
  );
}
