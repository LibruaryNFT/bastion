"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { bastionClient, type Member } from "@/lib/program";
import { useDemo } from "@/app/page";

interface ComplianceReportProps {
  vaultAddress: PublicKey;
}

export function ComplianceReport({ vaultAddress }: ComplianceReportProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();
  const [expandedMetadata, setExpandedMetadata] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [kycCoverage, setKycCoverage] = useState(100);

  useEffect(() => {
    if (isDemo || !publicKey) {
      setMembers([]);
      setKycCoverage(100);
      return;
    }

    const fetchComplianceData = async () => {
      setLoading(true);
      try {
        const vaultMembers = await bastionClient.fetchVaultMembers(vaultAddress);
        if (vaultMembers && vaultMembers.length > 0) {
          setMembers(vaultMembers);
          const verifiedCount = vaultMembers.filter((m) => m.kycVerified).length;
          setKycCoverage(Math.round((verifiedCount / vaultMembers.length) * 100));
        }
      } catch (error) {
        console.error("Failed to fetch compliance data:", error);
        setMembers([]);
        setKycCoverage(100);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [vaultAddress, publicKey, isDemo]);

  // Compliance methodology breakdown
  const complianceBreakdown = [
    { component: "KYC Coverage", weight: 35, score: 100 },
    { component: "AML Screening", weight: 25, score: 95 },
    { component: "Transaction Monitoring", weight: 20, score: 100 },
    { component: "Sanctions Check", weight: 15, score: 96 },
    { component: "Travel Rule Compliance", weight: 5, score: 90 },
  ];

  const overallScore = Math.round(
    complianceBreakdown.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0)
  );

  return (
    <div>
      {/* Sandbox Mode Disclaimer */}
      <div className="mb-6 p-4 rounded-lg border-2" style={{ borderColor: "var(--warning)", background: "rgba(245,158,11,0.05)" }}>
        <div className="flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Sandbox Mode Disclaimer</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Connected to sandbox compliance providers. This is a demonstration environment using mock data.
              Production deployment requires licensed KYC/AML providers (Onfido, Complyadvantage, Notabene, etc.).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            KYC, KYT, AML, and Travel Rule compliance status at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            Export PDF Report
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Compliance Score Breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div
          className="p-6 rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <h3 className="text-sm font-semibold mb-4">Compliance Score Methodology</h3>
          <div className="space-y-3">
            {complianceBreakdown.map((item) => (
              <div key={item.component}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span>{item.component}</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.score}% ({item.weight}% weight)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.score}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between items-center">
                <span className="font-medium text-xs">Overall Score</span>
                <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                  {overallScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Provider & Timestamp Info */}
        <div
          className="p-6 rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <h3 className="text-sm font-semibold mb-4">Screening Metadata</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span style={{ color: "var(--text-secondary)" }}>Primary KYC Provider:</span>
              <p className="font-mono mt-1">Onfido (Sandbox v3.2.1)</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)" }}>AML Screening Provider:</span>
              <p className="font-mono mt-1">Complyadvantage (Real-time)</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)" }}>OFAC List Version:</span>
              <p className="font-mono mt-1">2026-03-26 (Updated daily)</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)" }}>Last Full Audit:</span>
              <p className="font-mono mt-1">2026-03-25 14:32:00 UTC</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Vault Risk Rating", value: "A+", color: "var(--success)", detail: "Excellent compliance posture" },
          { label: "KYC Verified Members", value: `${members.filter((m) => m.kycVerified).length}/${members.length || 5}`, color: "var(--accent)", detail: `${kycCoverage}% coverage` },
          { label: "Active AML Alerts", value: "0", color: "var(--accent)", detail: "No flags this period" },
          { label: "Travel Rule Transfers", value: "3", color: "var(--accent)", detail: "All compliant" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* KYC Registry */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div
          className="p-5 rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <h3 className="font-semibold text-sm mb-4">KYC Registry</h3>
          <div className="space-y-3">
            {[
              { name: "Alice Chen", status: "Verified", provider: "Onfido", date: "Mar 20", risk: "Low" },
              { name: "Bob Martinez", status: "Verified", provider: "Onfido", date: "Mar 21", risk: "Low" },
              { name: "Carol Williams", status: "Verified", provider: "Onfido", date: "Mar 22", risk: "Low" },
              { name: "David Kim", status: "Verified", provider: "Onfido", date: "Mar 23", risk: "Low" },
              { name: "Eve Thompson", status: "Verified", provider: "Onfido", date: "Mar 25", risk: "Low" },
            ].map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                  <span className="font-medium">{m.name}</span>
                </div>
                <div className="flex items-center gap-4" style={{ color: "var(--text-secondary)" }}>
                  <span>{m.provider}</span>
                  <span>{m.date}</span>
                  <span className="px-2 py-0.5 rounded" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {m.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AML/Sanctions Screening */}
        <div
          className="p-5 rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <h3 className="font-semibold text-sm mb-4">AML & Sanctions Screening</h3>
          <div className="space-y-3">
            {[
              { list: "OFAC SDN List", status: "Clear", lastChecked: "2h ago", wallets: 5, version: "v2.165" },
              { list: "EU Consolidated Sanctions", status: "Clear", lastChecked: "2h ago", wallets: 5, version: "v1.98" },
              { list: "UN Consolidated List", status: "Clear", lastChecked: "2h ago", wallets: 5, version: "2026-03-20" },
              { list: "PEP Database (SWIFT)", status: "Clear", lastChecked: "2h ago", wallets: 5, version: "v3.12" },
              { list: "Chainalysis Blocklist", status: "Clear", lastChecked: "2h ago", wallets: 47, version: "Live" },
            ].map((s) => (
              <div
                key={s.list}
                className="p-2 rounded border cursor-pointer transition-colors"
                style={{
                  borderColor: expandedMetadata === s.list ? "var(--accent)" : "var(--border)",
                  background: expandedMetadata === s.list ? "var(--bg-tertiary)" : "transparent",
                }}
                onClick={() => setExpandedMetadata(expandedMetadata === s.list ? null : s.list)}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                    <span>{s.list}</span>
                  </div>
                  <div className="flex items-center gap-4" style={{ color: "var(--text-secondary)" }}>
                    <span>{s.wallets} checked</span>
                    <span>{s.lastChecked}</span>
                  </div>
                </div>
                {expandedMetadata === s.list && (
                  <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                    <p><strong>List Version:</strong> {s.version}</p>
                    <p><strong>Check Reference:</strong> SCR-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
                    <p><strong>Provider:</strong> Complyadvantage Real-time Screening</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Rule Transfers */}
      <div
        className="rounded-xl border overflow-hidden mb-8"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm">Travel Rule Qualifying Transfers (&gt;$3,000)</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Per FATF guidelines, originator and beneficiary information is collected and stored for all qualifying transfers.
          </p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["TX #", "Amount", "Originator", "Beneficiary", "Purpose", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: 46, amount: "$15,000", originator: "Treasury Ops Vault", beneficiary: "0xDEf...5678 (Verified)", purpose: "Supplier payment", status: "Compliant" },
              { id: 43, amount: "$200,000", originator: "Treasury Ops Vault", beneficiary: "0x123...4567 (Verified)", purpose: "Capital reallocation", status: "Compliant" },
              { id: 45, amount: "$75,000", originator: "Treasury Ops Vault", beneficiary: "0x789...ABCD (Pending)", purpose: "Vendor payment Q1", status: "Pending Approval" },
            ].map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-5 py-3 font-mono">#{tx.id}</td>
                <td className="px-5 py-3 font-medium">{tx.amount}</td>
                <td className="px-5 py-3">{tx.originator}</td>
                <td className="px-5 py-3">{tx.beneficiary}</td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>{tx.purpose}</td>
                <td className="px-5 py-3">
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      background: tx.status === "Compliant" ? "var(--accent-dim)" : "rgba(255,167,38,0.15)",
                      color: tx.status === "Compliant" ? "var(--accent)" : "var(--warning)",
                    }}
                  >
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KYT Transaction Monitoring */}
      <div
        className="p-5 rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <h3 className="font-semibold text-sm mb-4">KYT — Transaction Monitoring Summary</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Transactions Monitored</p>
            <p className="text-3xl font-bold">47</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Since vault creation</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Flagged for Review</p>
            <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>0</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>No suspicious patterns detected</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Risk Score</p>
            <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>LOW</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Based on transaction patterns</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "var(--bg-tertiary)" }}>
          <p className="font-medium mb-2">Monitoring Rules Active:</p>
          <div className="grid grid-cols-2 gap-1" style={{ color: "var(--text-secondary)" }}>
            <span>Unusual transaction volume detection</span>
            <span>Rapid successive transfers flagging</span>
            <span>Known-bad address screening</span>
            <span>Cross-reference with sanctions lists</span>
            <span>Structuring pattern detection</span>
            <span>Dormant account reactivation alerts</span>
          </div>
        </div>
      </div>

      {/* Regulatory Standards Mapping */}
      <div className="mt-8 p-6 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Regulatory Standards Mapping</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              How Bastion satisfies each regulatory requirement
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "var(--accent-dim)", color: "var(--accent-light)" }}>
            12 Standards Mapped
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              standard: "FATF Recommendation 1",
              title: "Risk-Based Approach",
              requirement: "Apply risk-based AML/CFT measures proportionate to identified risks",
              implementation: "Role-based spending limits enforce tiered controls. Admin has full access, Operator has 10% daily cap. Transfer Hook validates limits on every transfer.",
              status: "enforced",
            },
            {
              standard: "FATF Recommendation 5",
              title: "Customer Due Diligence",
              requirement: "Identify and verify customer identity before establishing business relationship",
              implementation: "On-chain KycAttestation PDA created per wallet. Includes verified flag, provider reference, and expiry timestamp. Transfer Hook rejects transfers from unverified wallets.",
              status: "enforced",
            },
            {
              standard: "FATF Recommendation 10",
              title: "Record Keeping",
              requirement: "Maintain transaction records for at least 5 years, available to authorities",
              implementation: "All events emitted on-chain (immutable Solana ledger). KycAttestationCreated, TransferHookTriggered, WithdrawalExecuted events include full metadata. On-chain data persists indefinitely.",
              status: "enforced",
            },
            {
              standard: "FATF Recommendation 15",
              title: "Virtual Asset Service Providers",
              requirement: "VASPs must be regulated, licensed, and subject to AML/CFT supervision",
              implementation: "Bastion enforces compliance at the token level — even if a VASP builds their own UI, Transfer Hooks still fire. Regulatory roadmap includes MSB licensing (US) and VASP registration (EU).",
              status: "partial",
            },
            {
              standard: "FATF Recommendation 16",
              title: "Travel Rule",
              requirement: "Collect and transmit originator/beneficiary information on transfers above threshold",
              implementation: "Transfers >= $3,000 USDC require TravelRuleData PDA with originator name, address, institution + beneficiary name, address, institution. Data submitted on-chain before transfer executes.",
              status: "enforced",
            },
            {
              standard: "Swiss AMLA Art. 10",
              title: "Due Diligence (Swiss Anti-Money Laundering Act)",
              requirement: "Financial intermediaries must verify identity of contracting party",
              implementation: "KYC attestation required before any vault interaction. Attestation includes provider reference (Onfido sandbox), document type, and expiry. Expired KYC blocks all operations.",
              status: "enforced",
            },
            {
              standard: "FINMA Circular 2023/1",
              title: "Operational Risk Management",
              requirement: "Institutions must implement controls for operational risk including unauthorized transactions",
              implementation: "Per-role daily spending limits enforced at token level. Multi-sig approval thresholds prevent single-actor risk. Vault pause/unpause for emergency stop. All enforced on-chain, not client-side.",
              status: "enforced",
            },
            {
              standard: "EU MiCA Article 68",
              title: "Record-Keeping Obligations",
              requirement: "Crypto-asset service providers must keep records of all services and transactions",
              implementation: "15 event types emitted on-chain: vault creation, KYC verification, deposits, withdrawal requests/approvals/executions, Travel Rule submissions, Transfer Hook triggers. Immutable and queryable via Solana RPC.",
              status: "enforced",
            },
            {
              standard: "ISO 27001",
              title: "Information Security Access Control",
              requirement: "Restrict access to information assets based on business and security requirements",
              implementation: "Four-tier role system (Admin, Manager, Operator, Viewer) with on-chain enforcement. PDA-based account ownership prevents unauthorized access. Role changes require Admin approval.",
              status: "enforced",
            },
            {
              standard: "SOX Section 404",
              title: "Internal Controls Over Financial Reporting",
              requirement: "Management must assess effectiveness of internal controls",
              implementation: "Multi-sig approval workflow for withdrawals. Configurable M-of-N thresholds. Audit trail captures every approval with actor identity and timestamp. Controls are cryptographic, not policy-based.",
              status: "enforced",
            },
            {
              standard: "BCBS 239",
              title: "Principles for Risk Data Aggregation",
              requirement: "Banks must have strong capabilities for risk data aggregation and reporting",
              implementation: "All vault metrics available on-chain: total deposited, total withdrawn, member count, daily spending per role, pending approvals. Exportable via Solana RPC. Real-time, not batch.",
              status: "enforced",
            },
            {
              standard: "EU GDPR Art. 17",
              title: "Right to Erasure Consideration",
              requirement: "Data subjects have right to erasure of personal data",
              implementation: "Personal KYC data (name, document) stored off-chain with compliance provider (Onfido). On-chain attestation contains only: wallet address, verified flag, provider reference hash, expiry. No PII on-chain.",
              status: "designed",
            },
          ].map((reg, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:border-[var(--border-light)]"
              style={{ borderColor: "var(--border)", background: "var(--bg-tertiary)" }}
              onClick={() => setExpandedMetadata(expandedMetadata === reg.standard ? null : reg.standard)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    reg.status === "enforced" ? "bg-[var(--success)]" :
                    reg.status === "partial" ? "bg-[var(--warning)]" :
                    "bg-[var(--accent)]"
                  }`} />
                  <div>
                    <span className="text-sm font-semibold">{reg.standard}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>{reg.title}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  reg.status === "enforced" ? "bg-[var(--success-dim)] text-[var(--success)]" :
                  reg.status === "partial" ? "bg-[var(--warning-dim)] text-[var(--warning)]" :
                  "bg-[var(--accent-dim)] text-[var(--accent-light)]"
                }`}>
                  {reg.status === "enforced" ? "On-Chain Enforced" :
                   reg.status === "partial" ? "Partially Implemented" :
                   "Architecture Ready"}
                </span>
              </div>

              {expandedMetadata === reg.standard && (
                <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: "var(--text-tertiary)" }}>Requirement</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{reg.requirement}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: "var(--accent-light)" }}>Bastion Implementation</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>{reg.implementation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span>On-Chain Enforced (10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
            <span>Partially Implemented (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span>Architecture Ready (1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
