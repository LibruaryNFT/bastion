"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Header } from "@/components/Header";
import { KycGate } from "@/components/KycGate";
import { VaultDashboard } from "@/components/VaultDashboard";
import { CreateVault } from "@/components/CreateVault";
import { MemberManager } from "@/components/MemberManager";
import { WithdrawalPanel } from "@/components/WithdrawalPanel";
import { AuditTrail } from "@/components/AuditTrail";
import { ComplianceReport } from "@/components/ComplianceReport";

type Tab = "dashboard" | "members" | "withdrawals" | "audit" | "compliance";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [kycVerified, setKycVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [vaultCreated, setVaultCreated] = useState(false);

  if (!connected) {
    return <LandingPage />;
  }

  if (!kycVerified) {
    return <KycGate onVerified={() => setKycVerified(true)} />;
  }

  if (!vaultCreated) {
    return <CreateVault onCreated={() => setVaultCreated(true)} />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Vault Overview", icon: "📊" },
    { id: "members", label: "Members & Roles", icon: "👥" },
    { id: "withdrawals", label: "Withdrawals", icon: "💸" },
    { id: "audit", label: "Audit Trail", icon: "📋" },
    { id: "compliance", label: "Compliance", icon: "🛡️" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                style={{
                  background: activeTab === tab.id ? "var(--accent-dim)" : "transparent",
                }}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Vault Info */}
          <div className="p-4 mx-4 mt-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Connected Wallet</p>
            <p className="text-xs font-mono mt-1 truncate" style={{ color: "var(--text-primary)" }}>
              {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
              <span className="text-xs" style={{ color: "var(--success)" }}>KYC Verified</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "dashboard" && <VaultDashboard />}
          {activeTab === "members" && <MemberManager />}
          {activeTab === "withdrawals" && <WithdrawalPanel />}
          {activeTab === "audit" && <AuditTrail />}
          {activeTab === "compliance" && <ComplianceReport />}
        </main>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
            Built on Solana &middot; Token-2022
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Bastion
          </h1>
          <p className="text-xl mb-2" style={{ color: "var(--text-secondary)" }}>
            Institutional Permissioned DeFi Vault
          </p>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
            KYC-gated deposits, role-based access control, multi-sig approvals,
            spending limits, and full audit trail. Everything institutions need
            to operate stablecoin treasuries on-chain.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <WalletMultiButton />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
          {[
            { title: "KYC Gate", desc: "Identity verification before vault access" },
            { title: "Role-Based Access", desc: "Admin, Manager, Operator, Viewer roles" },
            { title: "Multi-Sig", desc: "Configurable approval thresholds" },
            { title: "Spending Limits", desc: "Per-role daily & weekly caps" },
            { title: "Travel Rule", desc: "Originator/beneficiary data on large transfers" },
            { title: "Audit Trail", desc: "Immutable on-chain activity log" },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs" style={{ color: "var(--text-secondary)" }}>
          StableHacks 2026 &middot; Track 1: Institutional Permissioned DeFi Vaults
        </p>
      </div>
    </div>
  );
}
