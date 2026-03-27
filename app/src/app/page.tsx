"use client";

import { useState, createContext, useContext } from "react";
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

// Demo mode context — lets judges explore the full app without a wallet
export const DemoContext = createContext<{ isDemo: boolean; demoWallet: string }>({
  isDemo: false,
  demoWallet: "",
});
export const useDemo = () => useContext(DemoContext);

const DEMO_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv";

type Tab = "dashboard" | "members" | "withdrawals" | "audit" | "compliance";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [demoMode, setDemoMode] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [vaultCreated, setVaultCreated] = useState(false);

  const isConnected = connected || demoMode;
  const walletAddress = demoMode ? DEMO_WALLET : publicKey?.toBase58() || "";

  if (!isConnected) {
    return <LandingPage onDemoMode={() => { setDemoMode(true); setKycVerified(true); setVaultCreated(true); }} />;
  }

  if (!kycVerified) {
    return (
      <DemoContext.Provider value={{ isDemo: demoMode, demoWallet: walletAddress }}>
        <KycGate onVerified={() => setKycVerified(true)} />
      </DemoContext.Provider>
    );
  }

  if (!vaultCreated) {
    return (
      <DemoContext.Provider value={{ isDemo: demoMode, demoWallet: walletAddress }}>
        <CreateVault onCreated={() => setVaultCreated(true)} />
      </DemoContext.Provider>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Vault Overview", icon: "📊" },
    { id: "members", label: "Members & Roles", icon: "👥" },
    { id: "withdrawals", label: "Withdrawals", icon: "💸" },
    { id: "audit", label: "Audit Trail", icon: "📋" },
    { id: "compliance", label: "Compliance", icon: "🛡️" },
  ];

  return (
    <DemoContext.Provider value={{ isDemo: demoMode, demoWallet: walletAddress }}>
      <div className="min-h-screen">
        <Header />
        {demoMode && (
          <div className="px-4 py-2 text-center text-xs font-medium" style={{ background: "var(--warning-dim, #3d3200)", color: "var(--warning, #f5a623)" }}>
            Demo Mode — Exploring with simulated wallet. Connect a real wallet for full functionality.
          </div>
        )}
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
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
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
    </DemoContext.Provider>
  );
}

function LandingPage({ onDemoMode }: { onDemoMode: () => void }) {
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

        <div className="flex flex-col items-center gap-3 mb-12">
          <WalletMultiButton />
          <button
            onClick={onDemoMode}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            Try Demo — No Wallet Needed
          </button>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Explore the full app with simulated data
          </p>
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
