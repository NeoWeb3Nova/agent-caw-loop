import { useAgent } from "@/lib/agent-store";
import { VIDEOS } from "@/lib/videos";
import { Lock, Play, Loader2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export function VideoCatalog() {
  const { unlocked, requestVideo, busyVideoId } = useAgent();
  const [selected, setSelected] = useState<string>(VIDEOS[0].id);
  const current = VIDEOS.find((v) => v.id === selected)!;
  const unlock = unlocked[current.id];

  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const resourceUrl = `${origin}/api/videos/${current.id}/stream`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="aspect-video bg-black relative">
          {unlock ? (
            <video
              key={unlock.video.src}
              src={unlock.video.src}
              poster={unlock.video.poster}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-[radial-gradient(ellipse_at_center,_oklch(0.28_0.03_250)_0%,_oklch(0.12_0.015_250)_100%)]">
              <img src={current.poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <Lock className="w-10 h-10 mb-3 text-primary relative" />
              <div className="text-sm relative">Locked — x402 paywall</div>
              <div className="text-2xl font-mono text-primary mt-1 relative">{current.priceUSDC} USDC</div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{current.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{current.description}</p>
            </div>
            {unlock ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-success/15 text-success px-2 py-1 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> unlocked
              </span>
            ) : (
              <button
                onClick={() => requestVideo(resourceUrl, current.id)}
                disabled={busyVideoId === current.id || !origin}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {busyVideoId === current.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Agent pay & watch
              </button>
            )}
          </div>
          <div className="mt-3 font-mono text-[11px] text-muted-foreground break-all">
            GET {resourceUrl || "…"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {VIDEOS.map((v) => {
          const isSel = v.id === selected;
          const isUnlocked = !!unlocked[v.id];
          return (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`text-left rounded-lg border p-2 transition ${isSel ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}
            >
              <div className="aspect-video rounded bg-muted overflow-hidden mb-1.5">
                <img src={v.poster} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="text-xs font-medium truncate">{v.title}</div>
              <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                <span className="text-primary">{v.priceUSDC} USDC</span>
                {isUnlocked && <ShieldCheck className="w-3 h-3 text-success" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
