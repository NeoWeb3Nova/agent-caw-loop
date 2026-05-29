import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  buildPayment,
  evaluatePact,
  executePayment,
  probeChallenge,
  randHex,
  todayKey,
  type AgentWallet,
  type AuditRecord,
  type LogEntry,
  type PactRules,
  type VideoUnlock,
} from "./agent";
import type { X402Challenge, X402PaymentPayload, SettlementReceipt } from "./x402";

type PendingApproval = {
  challenge: X402Challenge;
  payment: X402PaymentPayload;
  reason: string;
};

type Unlocked = Record<string, VideoUnlock>;

type Ctx = {
  wallet: AgentWallet;
  setWallet: (w: AgentWallet) => void;
  rules: PactRules;
  setRules: (r: PactRules) => void;
  logs: LogEntry[];
  audit: AuditRecord[];
  spentToday: number;
  unlocked: Unlocked;
  pending: PendingApproval | null;
  busyVideoId: string | null;
  clearLogs: () => void;
  requestVideo: (resourceUrl: string, videoId: string) => Promise<void>;
  approvePending: () => Promise<void>;
  rejectPending: () => void;
  resetWindow: () => void;
};

const AgentCtx = createContext<Ctx | null>(null);

function defaultRules(): PactRules {
  return {
    perTxMaxUSDC: 1.0,
    dailyMaxUSDC: 1.0,
    windowMinutes: 60,
    windowStartedAt: Date.now(),
    allowedHosts: ["localhost", "127.0.0.1", "*.lovable.app"],
    allowedPathPrefixes: ["/api/videos/"],
    humanApprovalThresholdUSDC: 0.2,
  };
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<AgentWallet>({
    address: "0xCAW" + "a1b2c3d4e5f60718293a4b5c",
    balanceUSDC: 5,
  });
  const [rules, setRules] = useState<PactRules>(defaultRules);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [unlocked, setUnlocked] = useState<Unlocked>({});
  const [pending, setPending] = useState<PendingApproval | null>(null);
  const [busyVideoId, setBusy] = useState<string | null>(null);
  const dailyRef = useRef<{ key: string; spent: number }>({ key: todayKey(), spent: 0 });

  const log = useCallback((e: Omit<LogEntry, "id" | "at">) => {
    setLogs((prev) => [{ id: randHex(6), at: Date.now(), ...e }, ...prev].slice(0, 200));
  }, []);

  const recordAudit = useCallback(
    (rec: AuditRecord) => setAudit((prev) => [rec, ...prev].slice(0, 100)),
    [],
  );

  const finalizeUnlock = useCallback(
    (
      videoId: string,
      challenge: X402Challenge,
      payment: X402PaymentPayload,
      unlock: VideoUnlock,
      approvedBy: "agent" | "human",
    ) => {
      if (dailyRef.current.key !== todayKey()) dailyRef.current = { key: todayKey(), spent: 0 };
      dailyRef.current.spent += Number(payment.amount);
      setWallet((w) => ({
        ...w,
        balanceUSDC: Math.max(0, w.balanceUSDC - Number(payment.amount)),
      }));
      setUnlocked((u) => ({ ...u, [videoId]: unlock }));
      recordAudit({
        id: randHex(8),
        at: Date.now(),
        resource: challenge.resource,
        amount: payment.amount,
        asset: payment.asset,
        payTo: payment.payTo,
        payFrom: payment.payFrom,
        txHash: unlock.receipt.txHash,
        nonce: payment.nonce,
        approvedBy,
        pactSnapshot: { ...rules },
      });
      log({
        level: "success",
        scope: "audit",
        message: `Audit record sealed for ${videoId}`,
        data: { tx: unlock.receipt.txHash },
      });
    },
    [log, recordAudit, rules],
  );

  const runSettlement = useCallback(
    async (
      videoId: string,
      challenge: X402Challenge,
      payment: X402PaymentPayload,
      approvedBy: "agent" | "human",
    ) => {
      log({
        level: "http",
        scope: "http",
        message: `Retrying GET ${challenge.resource} with X-Payment header`,
      });
      try {
        const { unlock, xPaymentResponse, status } = await executePayment(challenge, payment);
        log({
          level: "http",
          scope: "http",
          message: `← ${status} OK`,
          data: { xPaymentResponse },
        });
        log({
          level: "success",
          scope: "settle",
          message: `Settled ${payment.amount} ${payment.asset}`,
          data: unlock.receipt,
        });
        finalizeUnlock(videoId, challenge, payment, unlock, approvedBy);
      } catch (err) {
        log({
          level: "error",
          scope: "settle",
          message: `Settlement failed: ${(err as Error).message}`,
        });
      }
    },
    [finalizeUnlock, log],
  );

  const requestVideo = useCallback(
    async (resourceUrl: string, videoId: string) => {
      setBusy(videoId);
      try {
        log({ level: "http", scope: "http", message: `→ GET ${resourceUrl}` });
        const { challenge, raw, status } = await probeChallenge(resourceUrl);
        log({ level: "http", scope: "http", message: `← ${status} Payment Required`, data: raw });
        log({
          level: "decision",
          scope: "agent",
          message: `Parsed x402 challenge: ${challenge.maxAmountRequired} ${challenge.asset} → ${challenge.payTo.slice(0, 10)}…`,
        });

        if (dailyRef.current.key !== todayKey()) dailyRef.current = { key: todayKey(), spent: 0 };
        const decision = evaluatePact(rules, challenge, dailyRef.current.spent);

        if (!decision.ok) {
          log({ level: "error", scope: "pact", message: `Pact denied: ${decision.reason}` });
          return;
        }

        log({
          level: "info",
          scope: "pact",
          message: `Pact ✓ ${decision.needsApproval ? "(needs human approval)" : "(auto-approved)"}`,
          data: decision.reason,
        });

        const payment = buildPayment(challenge, wallet);
        if (decision.needsApproval) {
          setPending({ challenge, payment, reason: decision.reason ?? "" });
          log({ level: "warn", scope: "agent", message: "Awaiting human approval…" });
          return;
        }

        await runSettlement(videoId, challenge, payment, "agent");
      } catch (err) {
        log({ level: "error", scope: "agent", message: (err as Error).message });
      } finally {
        setBusy(null);
      }
    },
    [log, rules, runSettlement, wallet],
  );

  const approvePending = useCallback(async () => {
    if (!pending) return;
    const videoId = pending.challenge.resource.split("/").slice(-2, -1)[0]!;
    setBusy(videoId);
    log({ level: "decision", scope: "agent", message: "Human approved — proceeding to settle." });
    const p = pending;
    setPending(null);
    try {
      await runSettlement(videoId, p.challenge, p.payment, "human");
    } finally {
      setBusy(null);
    }
  }, [log, pending, runSettlement]);

  const rejectPending = useCallback(() => {
    if (!pending) return;
    log({ level: "warn", scope: "agent", message: "Human rejected payment request." });
    setPending(null);
  }, [log, pending]);

  const resetWindow = useCallback(() => {
    setRules((r) => ({ ...r, windowStartedAt: Date.now() }));
    log({ level: "info", scope: "pact", message: "Session window reset." });
  }, [log]);

  const value = useMemo<Ctx>(
    () => ({
      wallet,
      setWallet,
      rules,
      setRules,
      logs,
      audit,
      spentToday: dailyRef.current.spent,
      unlocked,
      pending,
      busyVideoId,
      clearLogs: () => setLogs([]),
      requestVideo,
      approvePending,
      rejectPending,
      resetWindow,
    }),
    [
      wallet,
      rules,
      logs,
      audit,
      unlocked,
      pending,
      busyVideoId,
      requestVideo,
      approvePending,
      rejectPending,
      resetWindow,
    ],
  );

  return <AgentCtx.Provider value={value}>{children}</AgentCtx.Provider>;
}

export function useAgent() {
  const v = useContext(AgentCtx);
  if (!v) throw new Error("useAgent must be used within AgentProvider");
  return v;
}

export type { SettlementReceipt, X402Challenge, X402PaymentPayload };
