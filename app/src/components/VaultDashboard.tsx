"use client";

import { useState } from "react";

// Mock data — in production, fetched from on-chain via @solana/web3.js
const MOCK_VAULT = {
  name: "Treasury Operations",
  totalDeposited: 2_450_000,
  totalWithdrawn: 180_000,
  memberCount: 5,
  transactionCount: 47,
  dailyLimit: 100_000,
  approvalThreshold: 2,
  stablecoin: "USDC",
  paused: false,
  createdAt: "2026-03-20T10:00:00Z",
};

const MOCK_RECENT_TXS = [
  { id: 47, type: "deposit", amount: 250_000, from: "0xABc...1234", time: "2h ago", status: "confirmed" },
  { id: 46, type: "withdrawal", amount: 15_000, to: "0xDEf...5678", time: "5h ago", status: "executed", approvals: "2/2" },
  { id: 45, type: "withdrawal", amount: 75_000, to: "0x789...ABCD", time: "8h ago", status: "pending", approvals: "1/2" },
  { id: 44, type: "deposit", amount: 500_000, from: "0xFED...9876", time: "1d ago", status: "confirmed" },
  { id: 43, type: "kyc_verified", wallet: "0xNew...User", time: "1d ago", status: "verified" },
  { id: 42, type: "member_added", wallet: "0xNew...User", role: "Operator", time: "1d ago", status: "added" },
];

export function VaultDashboard() {
  const vault = MOCK_VAULT;
  const balance = vault.totalDeposited - vault.totalWithdrawn;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{vault.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {vault.stablecoin} Vault &middot; {vault.memberCount} members &middot; {vault.transactionCount} transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: vault.paused ? "rgba(255,71,87,0.15)" : "var(--accent-dim)",
              color: vault.paused ? "var(--danger)" : "var(--accent)",
            }}
          >
            {vault.paused ? "PAUSED" : "ACTIVE"}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Vault Balance", value: `$${balance.toLocaleString()}`, sub: `${vault.stablecoin}`, accent: true },
          { label: "Total Deposited", value: `$${vault.totalDeposited.toLocaleString()}`, sub: "All time" },
          { label: "Total Withdrawn", value: `$${vault.totalWithdrawn.toLocaleString()}`, sub: "All time" },
          { label: "Daily Limit", value: `$${vault.dailyLimit.toLocaleString()}`, sub: `${vault.approvalThreshold}-of-N multi-sig` },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: stat.accent ? "var(--accent)" : "var(--text-primary)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Deposit Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <DepositCard stablecoin={vault.stablecoin} />
        <ComplianceStatusCard />
      </div>

      {/* Recent Activity */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm">Recent Activity</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {MOCK_RECENT_TXS.map((tx) => (
            <div key={tx.id} className="px-5 py-3 flex items-center justify-between text-sm"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {tx.type === "deposit" ? "↓" : tx.type === "withdrawal" ? "↑" : tx.type === "kyc_verified" ? "✓" : "+"}
                </span>
                <div>
                  <p className="font-medium text-xs">
                    {tx.type === "deposit" && `Deposit $${tx.amount?.toLocaleString()}`}
                    {tx.type === "withdrawal" && `Withdrawal $${tx.amount?.toLocaleString()}`}
                    {tx.type === "kyc_verified" && `KYC Verified: ${tx.wallet}`}
                    {tx.type === "member_added" && `Member Added: ${tx.wallet} (${tx.role})`}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tx.time}</p>
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background:
                    tx.status === "confirmed" || tx.status === "executed" || tx.status === "verified" || tx.status === "added"
                      ? "var(--accent-dim)"
                      : "rgba(255,167,38,0.15)",
                  color:
                    tx.status === "confirmed" || tx.status === "executed" || tx.status === "verified" || tx.status === "added"
                      ? "var(--accent)"
                      : "var(--warning)",
                }}
              >
                {tx.status} {tx.approvals ? `(${tx.approvals})` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DepositCard({ stablecoin }: { stablecoin: string }) {
  const [amount, setAmount] = useState("");

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <h3 className="font-semibold text-sm mb-4">Deposit {stablecoin}</h3>
      <div className="space-y-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full px-3 py-2 rounded-lg text-sm border"
          style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        />
        <button
          className="w-full py-2.5 rounded-lg font-semibold text-sm"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          Deposit to Vault
        </button>
      </div>
    </div>
  );
}

function ComplianceStatusCard() {
  const checks = [
    { label: "KYC Registry", status: "active", detail: "5/5 members verified" },
    { label: "AML Screening", status: "active", detail: "Last scan: 2h ago" },
    { label: "KYT Monitoring", status: "active", detail: "47 transactions monitored" },
    { label: "Travel Rule", status: "active", detail: "3 qualifying transfers flagged" },
    { label: "Sanctions Check", status: "active", detail: "OFAC + EU lists current" },
  ];

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <h3 className="font-semibold text-sm mb-4">Compliance Status</h3>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
              <span>{check.label}</span>
            </div>
            <span style={{ color: "var(--text-secondary)" }}>{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
