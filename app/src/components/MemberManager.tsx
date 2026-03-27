"use client";

import { useState } from "react";

const ROLES = ["Admin", "Manager", "Operator", "Viewer"];
const ROLE_COLORS: Record<string, string> = {
  Admin: "var(--danger)",
  Manager: "var(--warning)",
  Operator: "var(--accent)",
  Viewer: "var(--text-secondary)",
};

const MOCK_MEMBERS = [
  { wallet: "7xKX...m4Qp", name: "Alice Chen", role: "Admin", kyc: true, kycDate: "2026-03-20", dailySpent: 12000, dailyLimit: 100000, joined: "Mar 20", lastActivity: "2h ago" },
  { wallet: "9aFR...n7Ks", name: "Bob Martinez", role: "Manager", kyc: true, kycDate: "2026-03-21", dailySpent: 5000, dailyLimit: 50000, joined: "Mar 21", lastActivity: "1h ago" },
  { wallet: "3bGT...p2Lm", name: "Carol Williams", role: "Manager", kyc: true, kycDate: "2026-03-22", dailySpent: 0, dailyLimit: 50000, joined: "Mar 22", lastActivity: "3d ago" },
  { wallet: "5cHU...r8Nj", name: "David Kim", role: "Operator", kyc: true, kycDate: "2026-03-23", dailySpent: 8000, dailyLimit: 10000, joined: "Mar 23", lastActivity: "8h ago" },
  { wallet: "2dIV...s9Ok", name: "Eve Thompson", role: "Viewer", kyc: true, kycDate: "2026-03-25", dailySpent: 0, dailyLimit: 0, joined: "Mar 24", lastActivity: "1d ago" },
];

export function MemberManager() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ wallet: "", role: "Operator" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Members & Roles</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage vault access, roles, and KYC verification status
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          + Add Member
        </button>
      </div>

      {/* Members Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Member", "Role", "Spending Limit", "Daily Usage", "KYC Status", "Last Activity", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_MEMBERS.map((m) => {
              const usagePercent = m.dailyLimit > 0 ? Math.round((m.dailySpent / m.dailyLimit) * 100) : 0;
              return (
                <tr key={m.wallet} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-xs">{m.name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{m.wallet}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: ROLE_COLORS[m.role], background: `${ROLE_COLORS[m.role]}15` }}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <p>${m.dailyLimit.toLocaleString()}</p>
                    <p style={{ color: "var(--text-secondary)" }}>daily limit</p>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <div className="w-16 h-2 rounded-full mb-1" style={{ background: "var(--bg-tertiary)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(usagePercent, 100)}%`,
                          background: usagePercent > 80 ? "var(--danger)" : usagePercent > 50 ? "var(--warning)" : "var(--accent)",
                        }}
                      />
                    </div>
                    <p style={{ color: "var(--text-secondary)" }}>
                      ${m.dailySpent.toLocaleString()} ({usagePercent}%)
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    {m.kyc ? (
                      <div className="text-xs">
                        <span style={{ color: "var(--success)" }}>✓ Verified</span>
                        <p style={{ color: "var(--text-secondary)" }}>{m.kycDate}</p>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--danger)" }}>Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {m.lastActivity}
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                      Edit
                    </button>
                    <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-6 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <h3 className="text-lg font-bold mb-4">Add Vault Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newMember.wallet}
                  onChange={(e) => setNewMember({ ...newMember, wallet: e.target.value })}
                  placeholder="Solana wallet address..."
                  className="w-full px-3 py-2 rounded-lg text-sm border font-mono"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="p-3 rounded-lg text-xs" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                New member will need to complete KYC verification before they can transact.
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
