"use client";

import { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useDemo } from "@/app/page";

export function Header() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setWalletBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setLoadingBalance(true);
      try {
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / 1e9);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();

    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Bastion" className="w-8 h-8 rounded-lg" />
        <span className="font-semibold tracking-tight">Bastion</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          {isDemo ? "Demo" : "Devnet"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          {isDemo ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--warning)" }} />
                <span>Demo Mode</span>
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>Simulated Wallet</span>
            </>
          ) : connected && publicKey ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
                <span>Network: Solana Devnet</span>
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span className="font-mono">{truncateAddress(publicKey.toBase58())}</span>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>
                {loadingBalance ? "..." : `${walletBalance.toFixed(2)} SOL`}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
                <span>Network: Solana Devnet</span>
              </div>
            </>
          )}
        </div>

        <WalletMultiButton />
      </div>
    </header>
  );
}
