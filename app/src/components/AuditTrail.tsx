"use client";

import { useState } from "react";

const MOCK_AUDIT_LOG = [
  { id: 47, action: "DEPOSIT", actor: "Alice Chen (Admin)", details: "$250,000 USDC deposited", timestamp: "2026-03-26 18:30:00 UTC", txHash: "5xKm...9pQ3" },
  { id: 46, action: "WITHDRAWAL_EXECUTED", actor: "System (2/2 approved)", details: "$15,000 USDC to 0xDEf...5678", timestamp: "2026-03-26 15:12:00 UTC", txHash: "3bNr...7wL8" },
  { id: 45, action: "WITHDRAWAL_APPROVED", actor: "Carol Williams (Manager)", details: "Approved TX #45 ($75,000)", timestamp: "2026-03-26 12:45:00 UTC", txHash: "8cPs...2xM4" },
  { id: 44, action: "WITHDRAWAL_REQUESTED", actor: "David Kim (Operator)", details: "$75,000 USDC — Q1 vendor payment", timestamp: "2026-03-26 12:00:00 UTC", txHash: "1dQt...6yN9" },
  { id: 43, action: "KYC_VERIFIED", actor: "Alice Chen (Admin)", details: "Verified Eve Thompson via Onfido (ref: KYC-2026-0089)", timestamp: "2026-03-25 14:00:00 UTC", txHash: "4eRu...0zO5" },
  { id: 42, action: "MEMBER_ADDED", actor: "Alice Chen (Admin)", details: "Added Eve Thompson as Viewer", timestamp: "2026-03-25 13:55:00 UTC", txHash: "7fSv...3aP1" },
  { id: 41, action: "DEPOSIT", actor: "Bob Martinez (Manager)", details: "$500,000 USDC deposited", timestamp: "2026-03-25 10:00:00 UTC", txHash: "2gTw...8bQ6" },
  { id: 40, action: "WITHDRAWAL_REJECTED", actor: "Alice Chen (Admin)", details: "Rejected TX #40 ($50,000) — insufficient documentation", timestamp: "2026-03-21 09:30:00 UTC", txHash: "9hUx...4cR2" },
  { id: 39, action: "SPENDING_LIMIT_RESET", actor: "System", details: "Daily spending counters reset for all members", timestamp: "2026-03-21 00:00:00 UTC", txHash: "—" },
  { id: 38, action: "VAULT_CREATED", actor: "Alice Chen (Admin)", details: "Treasury Operations vault initialized", timestamp: "2026-03-20 10:00:00 UTC", txHash: "6iVy...5dS7" },
];

const ACTION_COLORS: Record<string, string> = {
  DEPOSIT: "var(--accent)",
  WITHDRAWAL_EXECUTED: "var(--accent)",
  WITHDRAWAL_APPROVED: "var(--warning)",
  WITHDRAWAL_REQUESTED: "var(--warning)",
  WITHDRAWAL_REJECTED: "var(--danger)",
  KYC_VERIFIED: "#8b5cf6",
  MEMBER_ADDED: "#3b82f6",
  SPENDING_LIMIT_RESET: "var(--text-secondary)",
  VAULT_CREATED: "#3b82f6",
  VAULT_PAUSED: "var(--danger)",
};

export function AuditTrail() {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL"
    ? MOCK_AUDIT_LOG
    : MOCK_AUDIT_LOG.filter((e) => e.action.startsWith(filter));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Immutable on-chain log of all vault actions. Every event is timestamped and traceable.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold border"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "DEPOSIT", "WITHDRAWAL", "KYC", "MEMBER", "VAULT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: filter === f ? "var(--accent-dim)" : "var(--bg-secondary)",
              color: filter === f ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {f === "ALL" ? "All Events" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Log */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        {filtered.map((entry, i) => (
          <div
            key={entry.id}
            className="px-5 py-4 flex items-start gap-4"
            style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: ACTION_COLORS[entry.action] || "var(--text-secondary)" }}
              />
              {i < filtered.length - 1 && (
                <div className="w-px flex-1 mt-1" style={{ background: "var(--border)", minHeight: "24px" }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                  style={{
                    color: ACTION_COLORS[entry.action] || "var(--text-secondary)",
                    background: `${ACTION_COLORS[entry.action] || "var(--text-secondary)"}15`,
                  }}
                >
                  {entry.action}
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  #{entry.id}
                </span>
              </div>
              <p className="text-sm">{entry.details}</p>
              <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>{entry.actor}</span>
                <span>{entry.timestamp}</span>
                {entry.txHash !== "—" && (
                  <span className="font-mono">tx: {entry.txHash}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
