import { useAgent } from "@/lib/agent-store";
import { Receipt } from "lucide-react";

export function AuditPanel() {
  const { audit } = useAgent();
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Audit trail (settlements)</h3>
      </header>
      <div className="overflow-auto max-h-[280px]">
        {audit.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">No settlements yet.</div>
        ) : (
          <table className="w-full text-[11px] font-mono">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-1 pr-2">time</th>
                <th className="pr-2">amount</th>
                <th className="pr-2">approved</th>
                <th className="pr-2">tx hash</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id} className="border-t border-border/50 align-top">
                  <td className="py-1 pr-2 tabular-nums">{new Date(a.at).toLocaleTimeString()}</td>
                  <td className="pr-2 text-primary">{a.amount} {a.asset}</td>
                  <td className="pr-2">
                    <span className={a.approvedBy === "human" ? "text-warning" : "text-success"}>{a.approvedBy}</span>
                  </td>
                  <td className="pr-2 truncate max-w-[180px]" title={a.txHash}>{a.txHash.slice(0, 14)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
