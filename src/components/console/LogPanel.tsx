import { useAgent } from "@/lib/agent-store";
import { Terminal, Trash2 } from "lucide-react";

const colors: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-warning",
  error: "text-destructive",
  success: "text-success",
  decision: "text-accent",
  http: "text-primary",
};

export function LogPanel() {
  const { logs, clearLogs } = useAgent();
  return (
    <section className="rounded-xl border border-border bg-card p-4 flex flex-col min-h-0">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Agent runtime log</h3>
        </div>
        <button onClick={clearLogs} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> clear
        </button>
      </header>
      <div className="font-mono text-[12px] leading-relaxed overflow-auto max-h-[420px] space-y-1">
        {logs.length === 0 && <div className="text-muted-foreground italic">No activity yet. Click "Agent pay & watch".</div>}
        {logs.map((l) => (
          <details key={l.id} className="group border-b border-border/50 pb-1">
            <summary className="cursor-pointer list-none flex gap-2 items-baseline flex-wrap">
              <span className="text-muted-foreground tabular-nums">{new Date(l.at).toLocaleTimeString()}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{l.scope}</span>
              <span className={colors[l.level] ?? ""}>{l.message}</span>
            </summary>
            {l.data !== undefined && (
              <pre className="mt-1 ml-6 text-[11px] text-muted-foreground bg-secondary/50 rounded p-2 overflow-auto whitespace-pre-wrap break-all">
                {JSON.stringify(l.data, null, 2)}
              </pre>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
