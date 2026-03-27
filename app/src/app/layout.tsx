import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletProvider";

export const metadata: Metadata = {
  title: "Bastion | Institutional DeFi Vault",
  description: "Institutional-grade, compliance-first DeFi vault on Solana. KYC-gated, role-based, multi-sig approved.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
