"use client";

export function ComplianceReport() {
  return (
    <div>
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

      {/* Compliance Score */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall Score", value: "98%", color: "var(--accent)", detail: "Excellent" },
          { label: "KYC Coverage", value: "5/5", color: "var(--accent)", detail: "100% verified" },
          { label: "AML Flags", value: "0", color: "var(--accent)", detail: "No suspicious activity" },
          { label: "Travel Rule", value: "3/3", color: "var(--accent)", detail: "All qualifying transfers compliant" },
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
              { list: "OFAC SDN List", status: "Clear", lastChecked: "2h ago", wallets: 5 },
              { list: "EU Sanctions", status: "Clear", lastChecked: "2h ago", wallets: 5 },
              { list: "UN Consolidated", status: "Clear", lastChecked: "2h ago", wallets: 5 },
              { list: "PEP Database", status: "Clear", lastChecked: "2h ago", wallets: 5 },
              { list: "Chainalysis Blocklist", status: "Clear", lastChecked: "2h ago", wallets: 47 },
            ].map((s) => (
              <div key={s.list} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                  <span>{s.list}</span>
                </div>
                <div className="flex items-center gap-4" style={{ color: "var(--text-secondary)" }}>
                  <span>{s.wallets} checked</span>
                  <span>{s.lastChecked}</span>
                </div>
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
