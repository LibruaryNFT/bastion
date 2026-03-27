"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { bastionClient } from "@/lib/program";
import { useDemo } from "@/app/page";

const ROLES = ["Admin", "Manager", "Operator", "Viewer"];
const ROLE_COLORS: Record<string, string> = {
  Admin: "var(--danger)",
  Manager: "var(--warning)",
  Operator: "var(--accent)",
  Viewer: "var(--text-secondary)",
};

// Map role names to numeric values (from contract)
const ROLE_VALUES: Record<string, number> = {
  Admin: 0,
  Manager: 1,
  Operator: 2,
  Viewer: 3,
};

const MOCK_MEMBERS = [
  { wallet: "7xKX...m4Qp", name: "Alice Chen", role: "Admin", kyc: true, kycDate: "2026-03-20", dailySpent: 12000, dailyLimit: 100000, joined: "Mar 20", lastActivity: "2h ago" },
  { wallet: "9aFR...n7Ks", name: "Bob Martinez", role: "Manager", kyc: true, kycDate: "2026-03-21", dailySpent: 5000, dailyLimit: 50000, joined: "Mar 21", lastActivity: "1h ago" },
  { wallet: "3bGT...p2Lm", name: "Carol Williams", role: "Manager", kyc: true, kycDate: "2026-03-22", dailySpent: 0, dailyLimit: 50000, joined: "Mar 22", lastActivity: "3d ago" },
  { wallet: "5cHU...r8Nj", name: "David Kim", role: "Operator", kyc: true, kycDate: "2026-03-23", dailySpent: 8000, dailyLimit: 10000, joined: "Mar 23", lastActivity: "8h ago" },
  { wallet: "2dIV...s9Ok", name: "Eve Thompson", role: "Viewer", kyc: true, kycDate: "2026-03-25", dailySpent: 0, dailyLimit: 0, joined: "Mar 24", lastActivity: "1d ago" },
];

interface MemberManagerProps {
  vaultAddress: PublicKey;
}

export function MemberManager({ vaultAddress }: MemberManagerProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ wallet: "", role: "Operator" });
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo || !publicKey) {
      setMembers(MOCK_MEMBERS);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const vaultMembers = await bastionClient.fetchVaultMembers(vaultAddress);
        if (vaultMembers && vaultMembers.length > 0) {
          // Format on-chain members for display
          const formattedMembers = vaultMembers.map((m) => ({
            wallet: m.wallet.toBase58().slice(0, 4) + "..." + m.wallet.toBase58().slice(-4),
            name: "On-chain Member", // Would need additional data to get real names
            role: Object.keys(ROLE_VALUES).find((key) => ROLE_VALUES[key] === m.role) || "Viewer",
            kyc: m.kycVerified,
            kycDate: m.kycDate ? new Date(m.kycDate.toNumber() * 1000).toLocaleDateString() : "Pending",
            dailySpent: 0, // Would need transaction history to calculate
            dailyLimit: 0,
            joined: "On-chain",
            lastActivity: "Unknown",
          }));
          setMembers(formattedMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
        setMembers(MOCK_MEMBERS);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [vaultAddress, publicKey, isDemo]);

  const handleAddMember = async () => {
    if (!newMember.wallet) {
      setError("Wallet address is required");
      return;
    }

    if (isDemo) {
      setAdding(true);
      setError(null);
      setSuccessMessage(null);
      await new Promise((r) => setTimeout(r, 1500));
      setAdding(false);
      setSuccessMessage(`Member ${newMember.wallet.slice(0, 4)}...${newMember.wallet.slice(-4)} added successfully!`);
      setShowAddModal(false);
      setNewMember({ wallet: "", role: "Operator" });
      setTimeout(() => setSuccessMessage(null), 4000);
      return;
    }

    if (!publicKey) {
      setError("Connect wallet to add members");
      return;
    }

    setAdding(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newWalletAddress = new PublicKey(newMember.wallet);
      const roleValue = ROLE_VALUES[newMember.role];

      const tx = await bastionClient.buildAddMemberTx(
        vaultAddress,
        publicKey,
        newWalletAddress,
        roleValue
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setSuccessMessage(`Member added successfully! Tx: ${signature.slice(0, 8)}...`);
      setShowAddModal(false);
      setNewMember({ wallet: "", role: "Operator" });
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh members list
      const vaultMembers = await bastionClient.fetchVaultMembers(vaultAddress);
      if (vaultMembers) {
        const formattedMembers = vaultMembers.map((m) => ({
          wallet: m.wallet.toBase58().slice(0, 4) + "..." + m.wallet.toBase58().slice(-4),
          name: "On-chain Member",
          role: Object.keys(ROLE_VALUES).find((key) => ROLE_VALUES[key] === m.role) || "Viewer",
          kyc: m.kycVerified,
          kycDate: m.kycDate ? new Date(m.kycDate.toNumber() * 1000).toLocaleDateString() : "Pending",
          dailySpent: 0,
          dailyLimit: 0,
          joined: "On-chain",
          lastActivity: "Unknown",
        }));
        setMembers(formattedMembers);
      }
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

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
            {members.map((m) => {
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

      {/* Success/Error Messages */}
      {successMessage && (
        <div
          className="p-3 rounded-lg text-xs mb-4"
          style={{ background: "rgba(76,175,80,0.15)", color: "var(--success)" }}
        >
          ✓ {successMessage}
        </div>
      )}
      {error && (
        <div
          className="p-3 rounded-lg text-xs mb-4"
          style={{ background: "rgba(255,71,87,0.15)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

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
                onClick={handleAddMember}
                disabled={adding || !newMember.wallet}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                {adding ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
