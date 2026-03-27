"use client";

import { useState } from "react";

export function ComplianceReport() {
  const [expandedMetadata, setExpandedMetadata] = useState<string | null>(null);

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
          { label: "KYC Verified Members", value: "5/5", color: "var(--accent)", detail: "100% coverage" },
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
    </div>
  );
}
