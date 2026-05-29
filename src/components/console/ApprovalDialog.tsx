import { useAgent } from "@/lib/agent-store";
import { AlertTriangle } from "lucide-react";

export function ApprovalDialog() {
  const { pending, approvePending, rejectPending } = useAgent();
  if (!pending) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-warning/40 bg-card shadow-2xl">
        <div className="p-5 border-b border-border flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold">Human approval required</h3>
            <p className="text-xs text-muted-foreground mt-1">{pending.reason}</p>
          </div>
        </div>
        <div className="p-5 space-y-2 text-xs font-mono">
          <Row k="amount" v={`${pending.payment.amount} ${pending.payment.asset}`} />
          <Row k="pay to" v={pending.payment.payTo} />
          <Row k="resource" v={pending.challenge.resource} />
          <Row k="nonce" v={pending.payment.nonce} />
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={rejectPending} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary">Reject</button>
          <button onClick={approvePending} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Approve & sign</button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-20 shrink-0">{k}</span>
      <span className="break-all">{v}</span>
    </div>
  );
}
