"use client";

import { useState } from "react";

const MOCK_PENDING = [
  {
    id: 45,
    requester: "David Kim",
    requesterWallet: "5cHU...r8Nj",
    recipient: "External: 8fKL...v3Wq",
    amount: 75_000,
    memo: "Q1 vendor payment — invoice #INV-2026-0342",
    approvals: 1,
    threshold: 2,
    travelRule: true,
    createdAt: "8h ago",
  },
  {
    id: 44,
    requester: "Bob Martinez",
    requesterWallet: "9aFR...n7Ks",
    recipient: "External: 2mNP...x5Yr",
    amount: 45_000,
    memo: "Monthly payroll disbursement — March 2026",
    approvals: 0,
    threshold: 2,
    travelRule: true,
    createdAt: "1d ago",
  },
];

const MOCK_HISTORY = [
  { id: 46, amount: 15_000, recipient: "0xDEf...5678", status: "executed", time: "5h ago" },
  { id: 43, amount: 200_000, recipient: "0x123...4567", status: "executed", time: "3d ago" },
  { id: 40, amount: 50_000, recipient: "0xABC...DEF0", status: "rejected", time: "5d ago" },
];

export function WithdrawalPanel() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({ recipient: "", amount: "", memo: "" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Withdrawals</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Request, approve, and track stablecoin withdrawals
          </p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          + New Withdrawal Request
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--warning)" }}>
          Pending Approvals ({MOCK_PENDING.length})
        </h2>
        <div className="space-y-3">
          {MOCK_PENDING.map((w) => (
            <div
              key={w.id}
              className="p-5 rounded-xl border"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">${w.amount.toLocaleString()}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,167,38,0.15)", color: "var(--warning)" }}>
                      {w.approvals}/{w.threshold} approvals
                    </span>
                    {w.travelRule && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,71,87,0.15)", color: "var(--danger)" }}>
                        Travel Rule
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Requested by {w.requester} ({w.requesterWallet}) &middot; {w.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: "var(--accent)", color: "#000" }}
                  >
                    Approve
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold border"
                    style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                <p><strong>To:</strong> {w.recipient}</p>
                <p><strong>Memo:</strong> {w.memo}</p>
              </div>

              {/* Travel Rule Info (for qualifying transfers) */}
              {w.travelRule && (
                <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-tertiary)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--danger)" }}>
                    TRAVEL RULE DATA (transfers &gt; $3,000)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>Originator:</span>
                      <span className="ml-1">Treasury Operations Vault</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>Originator Address:</span>
                      <span className="ml-1 font-mono">7xKX...m4Qp</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>Beneficiary:</span>
                      <span className="ml-1">{w.recipient}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)" }}>Purpose:</span>
                      <span className="ml-1">{w.memo.split("—")[0].trim()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Withdrawal History</h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          {MOCK_HISTORY.map((w) => (
            <div
              key={w.id}
              className="px-5 py-3 flex items-center justify-between text-sm"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">↑</span>
                <div>
                  <p className="font-medium text-xs">${w.amount.toLocaleString()} to {w.recipient}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{w.time}</p>
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: w.status === "executed" ? "var(--accent-dim)" : "rgba(255,71,87,0.15)",
                  color: w.status === "executed" ? "var(--accent)" : "var(--danger)",
                }}
              >
                {w.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-6 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <h3 className="text-lg font-bold mb-4">New Withdrawal Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Recipient Wallet
                </label>
                <input
                  type="text"
                  value={newRequest.recipient}
                  onChange={(e) => setNewRequest({ ...newRequest, recipient: e.target.value })}
                  placeholder="Solana wallet address..."
                  className="w-full px-3 py-2 rounded-lg text-sm border font-mono"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={newRequest.amount}
                  onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Memo / Purpose
                </label>
                <textarea
                  value={newRequest.memo}
                  onChange={(e) => setNewRequest({ ...newRequest, memo: e.target.value })}
                  placeholder="e.g., Vendor payment — Invoice #INV-2026-0001"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border resize-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              {Number(newRequest.amount) > 3000 && (
                <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(255,71,87,0.1)", color: "var(--danger)" }}>
                  <strong>Travel Rule applies.</strong> Originator and beneficiary information will
                  be collected and attached to this transfer per FATF requirements.
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewRequest(false)}
                className="flex-1 py-2.5 rounded-lg text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
