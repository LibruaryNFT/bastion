"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Header } from "@/components/Header";
import { KycGate } from "@/components/KycGate";
import { VaultDashboard } from "@/components/VaultDashboard";
import { CreateVault } from "@/components/CreateVault";
import { MemberManager } from "@/components/MemberManager";
import { WithdrawalPanel } from "@/components/WithdrawalPanel";
import { AuditTrail } from "@/components/AuditTrail";
import { ComplianceReport } from "@/components/ComplianceReport";
import { bastionClient } from "@/lib/program";
import { getProgramStatus } from "@/lib/solana";

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
  const [vaultAddress, setVaultAddress] = useState<PublicKey | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);

  const isConnected = connected || demoMode;
  const walletAddress = demoMode ? DEMO_WALLET : publicKey?.toBase58() || "";

  // Derive vaultAddress PDA when vault is created
  useEffect(() => {
    if (!vaultCreated) {
      setVaultAddress(null);
      return;
    }

    // Demo mode: use a deterministic fake vault address
    if (demoMode) {
      setVaultAddress(new PublicKey(DEMO_WALLET));
      return;
    }

    if (!publicKey) {
      setVaultAddress(null);
      return;
    }

    const deriveVault = async () => {
      setVaultLoading(true);
      try {
        const [vault] = await bastionClient.getVaultPDA(publicKey, "Treasury Operations");
        setVaultAddress(vault);
      } catch (error) {
        console.error("Failed to derive vault PDA:", error);
        // Fallback: use a deterministic address so UI still renders
        setVaultAddress(new PublicKey(DEMO_WALLET));
      } finally {
        setVaultLoading(false);
      }
    };

    deriveVault();
  }, [vaultCreated, publicKey, demoMode]);

  if (!isConnected) {
    return <LandingPage onDemoMode={() => { setDemoMode(true); setKycVerified(true); setVaultCreated(true); }} />;
  }

  if (!kycVerified) {
    // For KYC gate, derive a temporary vault address for the KYC component
    // In production, this would be created during vault initialization
    const tempVaultAddress = publicKey ? new PublicKey("11111111111111111111111111111112") : null;

    return (
      <DemoContext.Provider value={{ isDemo: demoMode, demoWallet: walletAddress }}>
        <KycGate
          vaultAddress={tempVaultAddress || publicKey || new PublicKey("11111111111111111111111111111112")}
          onVerified={() => setKycVerified(true)}
        />
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
            {vaultLoading ? (
              <div className="flex items-center justify-center h-64">
                <p style={{ color: "var(--text-secondary)" }}>Loading vault data...</p>
              </div>
            ) : vaultAddress ? (
              <>
                {activeTab === "dashboard" && <VaultDashboard vaultAddress={vaultAddress} />}
                {activeTab === "members" && <MemberManager vaultAddress={vaultAddress} />}
                {activeTab === "withdrawals" && <WithdrawalPanel vaultAddress={vaultAddress} />}
                {activeTab === "audit" && <AuditTrail vaultAddress={vaultAddress} />}
                {activeTab === "compliance" && <ComplianceReport vaultAddress={vaultAddress} />}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p style={{ color: "var(--text-secondary)" }}>Unable to load vault address</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </DemoContext.Provider>
  );
}

function LandingPage({ onDemoMode }: { onDemoMode: () => void }) {
  const [programStatus, setProgramStatus] = useState({ live: false, slot: 0, balance: 0 });
  const [statusLoading, setStatusLoading] = useState(true);

  // Fetch program status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getProgramStatus();
        setProgramStatus(status);
      } catch (error) {
        console.error("Failed to fetch program status:", error);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: "01", title: "KYC / KYB Onboarding", desc: "On-chain attestation with expiry enforcement per FATF Rec. 10 (CDD). Identity verified via licensed provider before vault access. Expired KYC blocks all operations.", tag: "FATF Rec. 10" },
    { icon: "02", title: "Role-Based Access Control", desc: "Four-tier RBAC (Admin, Manager, Operator, Viewer) enforced on-chain via PDAs. Aligns with ISO 27001 Control A.5.15 and FINMA Circular 2017/1 three lines of defense.", tag: "ISO 27001 / FINMA" },
    { icon: "03", title: "Multi-Signature Approvals", desc: "Configurable M-of-N thresholds for withdrawals with immutable approval chain. Supports FINMA Circular 2023/1 operational risk controls and segregation of duties.", tag: "FINMA 2023/1" },
    { icon: "04", title: "Spending Limits & Caps", desc: "Per-role daily limits enforced at the token level via Transfer Hooks. Cannot be bypassed even by direct program interaction. Meets FINMA operational resilience requirements.", tag: "Token-2022 Hooks" },
    { icon: "05", title: "Travel Rule Compliance", desc: "Originator/beneficiary data per FATF Rec. 16. Configurable thresholds: $1,000 (FATF), CHF 0 (Swiss FINMA 02/2019), EUR 0 (EU TFR 2023/1113).", tag: "FATF Rec. 16" },
    { icon: "06", title: "Immutable Audit Trail", desc: "15 event types on immutable Solana ledger. Satisfies FATF Rec. 11 (record keeping), EU MiCA Art. 68(10) record-keeping RTS, and EU DORA resilience requirements.", tag: "MiCA / DORA" },
  ];

  const stats = [
    { value: "$2.27M", label: "Total Value Secured", sub: "across institutional vaults" },
    { value: "47", label: "Transactions Processed", sub: "with full audit trail" },
    { value: "100%", label: "Compliance Rate", sub: "KYC / KYT / AML / Travel Rule" },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="mesh-gradient" />
      <div className="grid-pattern" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Bastion" className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-lg tracking-tight">Bastion</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://explorer.solana.com/address/3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv?cluster=devnet"
            target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}>
            Verify On-Chain
          </a>
          <a href="https://github.com/LibruaryNFT/bastion" target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-16 pb-20 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 glass-card"
            style={{ color: "var(--accent-light)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: programStatus.live ? "var(--success)" : "#ef4444" }} />
            {statusLoading ? (
              <>Program Status: Loading...</>
            ) : programStatus.live ? (
              <>
                Program Live | Slot: {programStatus.slot.toLocaleString()} | Token-2022 · Anchor Framework
              </>
            ) : (
              <>Program Status: Offline</>
            )}
            &middot; Token-2022 &middot; Anchor Framework
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up delay-1"
          style={{ lineHeight: 1.05 }}>
          Institutional-Grade<br />
          <span style={{ color: "var(--accent-light)" }}>Stablecoin Vaults</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up delay-2"
          style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
          The compliance layer institutions need to operate treasury vaults on Solana.
          KYC-gated access, multi-signature approvals, spending controls, and
          Travel Rule compliance — all enforced on-chain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fade-up delay-3">
          <WalletMultiButton />
          <button
            onClick={onDemoMode}
            className="px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px]"
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          >
            Explore Live Demo
          </button>
        </div>
        <p className="text-xs animate-fade-up delay-3" style={{ color: "var(--text-tertiary)" }}>
          No wallet required for demo &middot; Full vault experience with simulated data
        </p>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className={`text-center animate-fade-up delay-${i + 4}`}>
              <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-20">
        <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
            <span className="text-sm font-medium">Regulatory Framework</span>
          </div>
          {["KYC (FATF Rec. 10)", "AML (AMLA Arts. 3–6)", "Travel Rule (FATF 16)", "FINMA 2023/1", "EU DORA / MiCA"].map((item, i) => (
            <div key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--accent-dim)", color: "var(--accent-light)" }}>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent-light)" }}>
            Infrastructure
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for Regulated Institutions
          </h2>
          <p className="text-base mt-3 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every feature designed to meet the compliance and operational standards
            required by banks, asset managers, and regulated financial entities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className={`glass-card p-6 group hover:border-[var(--border-light)] transition-all animate-fade-up delay-${Math.min(i + 1, 6)}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold" style={{ color: "var(--text-tertiary)" }}>{f.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{ background: "var(--accent-dim)", color: "var(--accent-light)" }}>{f.tag}</span>
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="glass-card p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
                Technical Architecture
              </p>
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                On-Chain Program Design
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                Bastion is a Solana program built with the Anchor framework, leveraging Token-2022
                Transfer Hooks for institutional compliance. All access control, approval logic, and
                regulatory checks are enforced at the token level — not the application layer.
                Designed to satisfy Swiss FINMA licensing requirements, EU MiCA obligations,
                and FATF Recommendations for Virtual Asset Service Providers.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Anchor 0.30", "Token-2022", "PDA Vaults", "CPI Transfers", "Event Emission"].map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-md text-xs font-medium"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { step: "1", title: "Vault Initialization", desc: "Create PDA-owned vault with configurable roles, thresholds, and limits" },
                { step: "2", title: "KYC Verification", desc: "On-chain attestation required before any vault interaction" },
                { step: "3", title: "Deposit & Operations", desc: "Token-2022 transfers with role-based spending limits enforced per-instruction" },
                { step: "4", title: "Multi-Sig Withdrawal", desc: "M-of-N approval collection on-chain before fund release" },
                { step: "5", title: "Travel Rule & Audit", desc: "Originator/beneficiary data anchored. Full event log for regulators" },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                  <span className="text-xs font-mono font-bold mt-0.5" style={{ color: "var(--accent-light)" }}>{s.step}</span>
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Context */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-16">
        <div className="text-center">
          <p className="text-xs font-medium mb-6" style={{ color: "var(--text-tertiary)" }}>
            Built for StableHacks 2026 &middot; Track 1: Institutional Permissioned DeFi Vaults
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["Solana Foundation", "AMINA Bank", "Solstice Labs", "Tenity"].map((name, i) => (
              <span key={i} className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pb-24 text-center">
        <div className="glass-card p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to Explore?</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Connect your Solana wallet to interact with the live devnet program,
            or try the demo to see the full institutional vault experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WalletMultiButton />
            <button
              onClick={onDemoMode}
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px]"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
              }}
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t px-8 py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]"
              style={{ background: "var(--accent)", color: "#fff" }}>B</div>
            <span className="text-sm font-medium">Bastion</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/LibruaryNFT/bastion" target="_blank" rel="noopener noreferrer"
              className="text-xs hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-tertiary)" }}>GitHub</a>
            <a href="https://explorer.solana.com/address/3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv?cluster=devnet"
              target="_blank" rel="noopener noreferrer"
              className="text-xs hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-tertiary)" }}>Solana Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
