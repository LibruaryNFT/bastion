"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { bastionClient } from "@/lib/program";
import { EXPLORER_URLS } from "@/lib/constants";
import { useDemo } from "@/app/page";

interface CreateVaultProps {
  onCreated: () => void;
}

export function CreateVault({ onCreated }: CreateVaultProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();
  const [form, setForm] = useState({
    name: "",
    dailyLimit: "100000",
    approvalThreshold: "2",
    stablecoin: "USDC",
  });
  const [creating, setCreating] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name) {
      setError("Vault name is required");
      return;
    }

    if (isDemo) {
      // Simulate vault creation in demo mode
      setCreating(true);
      setError(null);
      setTxSignature(null);
      await new Promise((r) => setTimeout(r, 2000));
      setCreating(false);
      setTxSignature("DEMO_TX_" + Math.random().toString(36).substring(7));
      onCreated();
      return;
    }

    if (!publicKey) {
      setError("Connect wallet to create vault on-chain");
      return;
    }

    setCreating(true);
    setError(null);
    setTxSignature(null);

    try {
      // Build initialize vault transaction
      const tx = await bastionClient.buildInitializeVaultTx(
        publicKey,
        form.name,
        parseInt(form.dailyLimit),
        parseInt(form.approvalThreshold)
      );

      // Set recent blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      // Sign and send transaction
      const signature = await sendTransaction(tx, connection);

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setTxSignature(signature);
      onCreated();
    } catch (err) {
      console.error("Vault creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create vault on-chain");
    } finally {
      setCreating(false);
    }
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

        {error && (
          <div
            className="p-3 rounded-lg text-xs"
            style={{ background: "rgba(255,71,87,0.15)", color: "var(--danger)" }}
          >
            {error}
          </div>
        )}

        {txSignature && (
          <div
            className="p-4 rounded-lg text-xs"
            style={{ background: "rgba(76,175,80,0.15)" }}
          >
            <p className="font-semibold mb-2" style={{ color: "var(--success)" }}>
              ✓ Vault created successfully!
            </p>
            <p style={{ color: "var(--text-secondary)" }} className="mb-2">
              Transaction signature:
            </p>
            <a
              href={
                txSignature.startsWith("DEMO_TX_")
                  ? "#"
                  : EXPLORER_URLS.devnet.tx(txSignature)
              }
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono break-all hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {txSignature}
            </a>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!form.name || creating || !publicKey && !isDemo}
          className="w-full mt-6 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          {creating ? "Creating vault on-chain..." : "Create Vault"}
        </button>
      </div>
    </div>
  );
}
