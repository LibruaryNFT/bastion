# Bastion — Institutional Permissioned DeFi Vault on Solana

**StableHacks 2026 | Track 1: Institutional Permissioned DeFi Vaults**

Bastion is an institutional-grade, compliance-first DeFi vault built on Solana. It provides role-based access control, KYC-gated deposits, multi-signature approvals, spending limits, and a full audit trail — everything institutions need to operate stablecoin treasuries on-chain.

## The Problem

Institutions cannot participate in DeFi without:
- **Identity verification** (KYC/AML) at the protocol level
- **Role-based permissions** (CEO, CFO, Treasurer have different access)
- **Spending controls** (daily limits, approval workflows for large transfers)
- **Audit trails** (every action logged for compliance reporting)
- **Travel Rule compliance** (sender/receiver info on transfers >$3K)

Current DeFi vaults are permissionless by design — great for retail, unusable for institutions.

## The Solution

Bastion enforces institutional controls at the smart contract level using Solana's Token-2022 extensions:

- **KYC Gate**: Only verified identities can deposit or withdraw
- **Role-Based Access**: Admin, Manager, Operator roles with different permissions
- **Multi-Sig Approvals**: Large transactions require multiple authorized signers
- **Spending Limits**: Configurable daily/weekly limits per role
- **Audit Trail**: Every vault action is logged on-chain with timestamps
- **Travel Rule**: Collects and attaches originator/beneficiary data to qualifying transfers
- **Regulatory Reporting**: Export compliance reports (CSV/PDF) for regulators

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ KYC Flow │ │ Vault UI │ │ Compliance Dash │  │
│  └────┬─────┘ └────┬─────┘ └───────┬─────────┘  │
│       │             │               │            │
│  ┌────▼─────────────▼───────────────▼─────────┐  │
│  │        Solana Wallet Adapter (Phantom)      │  │
│  └────────────────────┬───────────────────────┘  │
└───────────────────────┼──────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────┐
│            Solana Program (Anchor/Rust)           │
│  ┌──────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │ Vault    │ │ Roles &   │ │ Transaction     │  │
│  │ Manager  │ │ Permissions│ │ Monitor (KYT)  │  │
│  └──────────┘ └───────────┘ └─────────────────┘  │
│  ┌──────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │ KYC      │ │ Multi-Sig │ │ Audit Logger    │  │
│  │ Registry │ │ Approvals │ │                 │  │
│  └──────────┘ └───────────┘ └─────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Tech Stack

- **Blockchain**: Solana (Devnet)
- **Smart Contracts**: Rust + Anchor Framework
- **Token Standard**: SPL Token-2022 (Transfer Hooks, Metadata)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Wallet**: Phantom (via @solana/wallet-adapter)
- **Compliance**: On-chain KYC attestation + audit trail

## Getting Started

### Prerequisites
- Node.js 18+
- Phantom wallet browser extension
- Solana CLI (optional, for local development)

### Run Frontend
```bash
cd app
npm install
npm run dev
```

### Smart Contract
The Anchor program is in `programs/bastion/`. Deploy via [Solana Playground](https://beta.solpg.io/) or local Anchor CLI.

## Compliance Features

| Feature | Status | Implementation |
|---------|--------|---------------|
| KYC Gate | Done | On-chain registry, wallet-level verification |
| KYT (Transaction Monitoring) | Done | Real-time flagging of suspicious patterns |
| AML Screening | Done | Blocklist check before every transfer |
| Travel Rule | Done | Originator/beneficiary data on transfers >$3K |
| Multi-Sig Approvals | Done | Configurable threshold per vault |
| Spending Limits | Done | Per-role daily/weekly caps |
| Audit Trail | Done | Immutable on-chain log of all actions |
| Regulatory Export | Done | CSV/PDF report generation |

## Team

- **Libruary** — DeFi infrastructure builders (Flow, Solana)
- Won hackathons with RWA tokenization and prediction market projects
- Building institutional-grade blockchain infrastructure since 2023

## License

MIT
