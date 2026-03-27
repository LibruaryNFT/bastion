"use client";

import { useState } from "react";

interface CreateVaultProps {
  onCreated: () => void;
}

export function CreateVault({ onCreated }: CreateVaultProps) {
  const [form, setForm] = useState({
    name: "",
    dailyLimit: "100000",
    approvalThreshold: "2",
    stablecoin: "USDC",
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    // Simulate vault creation on-chain
    await new Promise((r) => setTimeout(r, 2000));
    setCreating(false);
    onCreated();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="max-w-lg w-full p-8 rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <h2 className="text-2xl font-bold mb-2">Create Institutional Vault</h2>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Configure your permissioned vault with role-based access control,
          spending limits, and multi-sig approval requirements.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Vault Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Treasury Operations"
              maxLength={32}
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Stablecoin
            </label>
            <select
              value={form.stablecoin}
              onChange={(e) => setForm({ ...form, stablecoin: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <option value="USDC">USDC (Circle)</option>
              <option value="USDT">USDT (Tether)</option>
              <option value="PYUSD">PYUSD (PayPal)</option>
              <option value="EURC">EURC (Circle EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Daily Spending Limit (USD)
            </label>
            <input
              type="number"
              value={form.dailyLimit}
              onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Admin: 100% &middot; Manager: 50% &middot; Operator: 10%
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Multi-Sig Approval Threshold
            </label>
            <select
              value={form.approvalThreshold}
              onChange={(e) => setForm({ ...form, approvalThreshold: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} of N signers required</option>
              ))}
            </select>
          </div>

          {/* Role Summary */}
          <div className="p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              ROLE PERMISSIONS
            </p>
            <div className="space-y-2 text-xs">
              {[
                { role: "Admin", perms: "Full control, add members, verify KYC, unlimited operations", color: "var(--danger)" },
                { role: "Manager", perms: "Approve withdrawals, 50% daily limit", color: "var(--warning)" },
                { role: "Operator", perms: "Request withdrawals, 10% daily limit", color: "var(--accent)" },
                { role: "Viewer", perms: "Read-only access, no transactions", color: "var(--text-secondary)" },
              ].map((r) => (
                <div key={r.role} className="flex items-start gap-2">
                  <span className="font-medium w-16" style={{ color: r.color }}>{r.role}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{r.perms}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!form.name || creating}
          className="w-full mt-6 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          {creating ? "Creating vault on-chain..." : "Create Vault"}
        </button>
      </div>
    </div>
  );
}
