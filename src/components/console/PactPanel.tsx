import { useAgent } from "@/lib/agent-store";
import { Shield, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

export function PactPanel() {
  const { rules, setRules, wallet, spentToday, resetWindow } = useAgent();
  const windowEnd = rules.windowStartedAt + rules.windowMinutes * 60_000;
  const remainingMin = Math.max(0, Math.round((windowEnd - Date.now()) / 60_000));

  return (
    <Card title="Pact / CAW rules" icon={<Shield className="w-4 h-4 text-primary" />}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Per-tx max (USDC)">
          <input type="number" step="0.01" min="0" value={rules.perTxMaxUSDC}
            onChange={(e) => setRules({ ...rules, perTxMaxUSDC: Number(e.target.value) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Daily max (USDC)">
          <input type="number" step="0.1" min="0" value={rules.dailyMaxUSDC}
            onChange={(e) => setRules({ ...rules, dailyMaxUSDC: Number(e.target.value) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Window (minutes)">
          <input type="number" min="1" value={rules.windowMinutes}
            onChange={(e) => setRules({ ...rules, windowMinutes: Number(e.target.value) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Human-approval ≥ (USDC)">
          <input type="number" step="0.01" min="0" value={rules.humanApprovalThresholdUSDC}
            onChange={(e) => setRules({ ...rules, humanApprovalThresholdUSDC: Number(e.target.value) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Allowed hosts" className="col-span-2">
          <input value={rules.allowedHosts.join(", ")}
            onChange={(e) => setRules({ ...rules, allowedHosts: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Allowed path prefixes" className="col-span-2">
          <input value={rules.allowedPathPrefixes.join(", ")}
            onChange={(e) => setRules({ ...rules, allowedPathPrefixes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            className="rounded-md bg-input border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
        <Stat label="wallet" value={`${wallet.balanceUSDC.toFixed(2)} USDC`} />
        <Stat label="spent today" value={`${spentToday.toFixed(2)} / ${rules.dailyMaxUSDC}`} />
        <Stat label="window left" value={`${remainingMin}m`} />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground font-mono break-all">
        agent: {wallet.address}
      </div>
      <button onClick={resetWindow} className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
        <RotateCw className="w-3 h-3" /> reset session window
      </button>
    </Card>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-1.5">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-primary">{value}</div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
      </header>
      {children}
    </section>
  );
}
