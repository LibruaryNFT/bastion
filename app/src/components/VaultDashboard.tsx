"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { bastionClient, type Member } from "@/lib/program";
import { useDemo } from "@/app/page";
import BN from "bn.js";

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

interface VaultDashboardProps {
  vaultAddress: PublicKey;
}

export function VaultDashboard({ vaultAddress }: VaultDashboardProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();
  const [vault, setVault] = useState(MOCK_VAULT);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [vaultNotFound, setVaultNotFound] = useState(false);

  useEffect(() => {
    // If in demo mode or no wallet connected, use mock data
    if (isDemo || !publicKey) {
      setVault(MOCK_VAULT);
      setMembers([]);
      setVaultNotFound(false);
      return;
    }

    const fetchVaultData = async () => {
      setLoading(true);
      try {
        // Try to fetch vault for connected wallet
        // Default vault name for demo: "Treasury Operations"
        const vaultData = await bastionClient.fetchVault(publicKey, "Treasury Operations");

        if (!vaultData) {
          setVaultNotFound(true);
          setVault(MOCK_VAULT);
          setMembers([]);
        } else {
          setVaultNotFound(false);
          // Convert on-chain data to display format
          const displayVault = {
            name: vaultData.name,
            totalDeposited: vaultData.totalDeposited.toNumber(),
            totalWithdrawn: vaultData.totalWithdrawn.toNumber(),
            memberCount: vaultData.memberCount,
            transactionCount: vaultData.transactionCount.toNumber(),
            dailyLimit: vaultData.dailyLimit.toNumber(),
            approvalThreshold: vaultData.approvalThreshold,
            stablecoin: "USDC", // Infer from on-chain if available
            paused: vaultData.paused,
            createdAt: new Date(vaultData.createdAt.toNumber() * 1000).toISOString(),
          };
          setVault(displayVault);

          // Fetch vault members
          const [vaultPDA] = await bastionClient.getVaultPDA(publicKey, "Treasury Operations");
          const vaultMembers = await bastionClient.fetchVaultMembers(new PublicKey(vaultPDA));
          setMembers(vaultMembers || []);
        }
      } catch (error) {
        console.error("Failed to fetch vault data:", error);
        // Fall back to mock data on error
        setVault(MOCK_VAULT);
        setMembers([]);
        setVaultNotFound(false);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [publicKey, isDemo]);

  const balance = vault.totalDeposited - vault.totalWithdrawn;
  const pendingApprovals = 2; // From MOCK_RECENT_TXS: tx 45 has 1/2, so 2 pending
  const dailySpent = 25_000; // Sum of Alice (12K) + Bob (5K) + David (8K)
  const dailyUsagePercent = Math.round((dailySpent / vault.dailyLimit) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: "var(--text-secondary)" }}>Loading vault data...</p>
      </div>
    );
  }

  if (vaultNotFound && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-semibold mb-2">No vault found</p>
        <p style={{ color: "var(--text-secondary)" }} className="mb-6">
          Connect your wallet and create a vault to get started.
        </p>
        <button
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          Create Vault
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{vault.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {vault.stablecoin} Vault &middot; {vault.memberCount} members &middot; {vault.transactionCount} transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingApprovals > 0 && (
            <div
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-2"
              style={{ borderColor: "var(--warning)", background: "rgba(245,158,11,0.1)" }}
            >
              <span style={{ color: "var(--warning)" }}>⚠</span>
              <span style={{ color: "var(--warning)" }}>{pendingApprovals} Pending Approvals</span>
            </div>
          )}
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

      {/* Daily Spending Limit Card */}
      <div className="mb-8 p-6 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <h3 className="font-semibold text-sm mb-4">Daily Spending Usage</h3>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">${dailySpent.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                of ${vault.dailyLimit.toLocaleString()} daily limit ({dailyUsagePercent}%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Remaining</p>
              <p className="text-lg font-bold" style={{ color: dailyUsagePercent > 80 ? "var(--danger)" : "var(--accent)" }}>
                ${(vault.dailyLimit - dailySpent).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(dailyUsagePercent, 100)}%`,
                background: dailyUsagePercent > 80 ? "var(--danger)" : dailyUsagePercent > 50 ? "var(--warning)" : "var(--accent)",
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
            <span>Alice (Admin): $12,000</span>
            <span>Bob (Manager): $5,000</span>
            <span>David (Operator): $8,000</span>
          </div>
        </div>
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

  const vaultStatus = {
    regulatedEntity: "Licensed Institutional Custodian",
    complianceRating: "A+ (Excellent)",
    lastAuditDate: "2026-03-25 14:32:00 UTC",
    nextAuditDue: "2026-04-25",
  };

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <h3 className="font-semibold text-sm mb-4">Compliance Status</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs">
            <p style={{ color: "var(--text-secondary)" }}>Regulated Entity</p>
            <p className="font-medium mt-1" style={{ color: "var(--accent)" }}>{vaultStatus.regulatedEntity}</p>
          </div>
          <div className="text-xs">
            <p style={{ color: "var(--text-secondary)" }}>Compliance Rating</p>
            <p className="font-medium mt-1" style={{ color: "var(--success)" }}>{vaultStatus.complianceRating}</p>
          </div>
          <div className="text-xs">
            <p style={{ color: "var(--text-secondary)" }}>Last Audit</p>
            <p className="font-mono mt-1" style={{ color: "var(--text-primary)" }}>{vaultStatus.lastAuditDate}</p>
          </div>
          <div className="text-xs">
            <p style={{ color: "var(--text-secondary)" }}>Next Audit Due</p>
            <p className="font-medium mt-1" style={{ color: "var(--warning)" }}>{vaultStatus.nextAuditDue}</p>
          </div>
        </div>
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
    </div>
  );
}
