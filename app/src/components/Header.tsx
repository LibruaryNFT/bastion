"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Header() {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          B
        </div>
        <span className="font-semibold tracking-tight">Bastion</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          Devnet
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Solana Devnet
          </span>
        </div>
        <WalletMultiButton />
      </div>
    </header>
  );
}
