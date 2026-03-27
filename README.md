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

### High-Level System

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

### Token-2022 Transfer Hook Architecture

This is the core innovation: compliance at the **token level**, not the application level.

```
┌────────────────────────────────────────────────┐
│     User transfers token (any app, any way)    │
│  (Bastion UI, CLI, DEX, Bridge, Lending...)   │
└──────────────────┬─────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Token-2022 Program │
        │  (Solana Runtime)   │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌─────────┐  ┌──────────────┐  ┌────────┐
│ Decimals│  │ Metadata     │  │Transfer│
│ Check   │  │ Update       │  │Hook ◄──┼── COMPLIANCE INTERCEPT
└─────────┘  └──────────────┘  └────┬───┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  Bastion Transfer Hook Logic    │
                    │  ┌────────────────────────────┐ │
                    │  │ 1. Check Source KYC        │ │
                    │  │ 2. Check Dest KYC          │ │
                    │  │ 3. Check Daily Limit       │ │
                    │  │ 4. Check Travel Rule Data  │ │
                    │  │ 5. Emit Compliance Event   │ │
                    │  └────────────────────────────┘ │
                    └────────────┬─────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │ Transfer Approved? ✅ or ❌
                    └──────────┬────────────────┘
                               │
                    ┌──────────▼────────────┐
                    │ Complete Token        │
                    │ Transfer or Fail      │
                    └───────────────────────┘
```

**Key Insight:** The hook runs at the Token-2022 level, **before the transfer is finalized**. This means:
- ✅ Transfers via Bastion UI are checked
- ✅ Transfers via Solana CLI are checked
- ✅ Transfers via DEX/Bridge/Lending are checked
- ❌ Cannot bypass compliance by any method

---

### Why Token-2022 Transfer Hooks > Application-Level Controls

| Aspect | App-Level | Token-2022 Hook |
|--------|-----------|-----------------|
| **Enforcement Scope** | Only Bastion app | Every transfer anywhere |
| **Bypass Risk** | High (CLI, other apps) | None (at token level) |
| **Regulatory Proof** | "We check users" | Cryptographic proof on-chain |
| **Audit Trail** | Database (mutable) | Blockchain (immutable) |
| **Performance** | App-dependent | Built into token |
| **Compliance Scalability** | Per-app | Per-token (once, forever) |

**Real-world scenario:**
- User gets verified KYC ✅
- Bastion app goes offline 🔥
- User still can't transfer token elsewhere ✅ (KYC checked at token level)
- Regulator audits: "Did all transfers comply?"
- Answer: "Yes, here are all 47 Transfer Hook events" ✅

## Tech Stack

- **Blockchain**: Solana (Devnet)
- **Smart Contracts**: Rust + Anchor Framework
- **Token Standard**: SPL Token-2022 (Transfer Hooks, Metadata)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Wallet**: Phantom (via @solana/wallet-adapter)
- **Compliance**: On-chain KYC attestation + audit trail

---

## Token-2022 Transfer Hook: How Compliance Works

### Transfer Hook Validation Flow

Every token transfer involving Bastion-controlled tokens goes through 5 compliance checks:

#### 1. **Source Wallet KYC Check**
```
Input: Transfer source wallet
├─ Load KYC attestation account for source
├─ Verify: Wallet in attestation matches source ✓
├─ Verify: KYC status = verified ✓
└─ Verify: KYC expiry > current time ✓
   └─ If any check fails → BLOCK TRANSFER
```

**On-Chain Account:** `KycAttestation`
- Seeds: `["kyc_attestation", wallet_pubkey]`
- Fields: `wallet`, `verified`, `provider`, `verified_at`, `expiry`
- Lifespan: 1–10 years (configurable per provider)

#### 2. **Destination Wallet KYC Check**
```
Input: Transfer destination wallet
├─ Load KYC attestation account for destination
├─ Verify: Wallet in attestation matches destination ✓
├─ Verify: KYC status = verified ✓
└─ Verify: KYC expiry > current time ✓
   └─ If any check fails → BLOCK TRANSFER
```

Same account structure as source, ensures **both parties are KYC-verified**.

#### 3. **Token-Level Daily Spending Limit**
```
Input: Transfer amount, source wallet
├─ Load TokenLimitState for source wallet
├─ Check if 24h reset is needed
│  └─ If now - last_reset >= 86400 seconds:
│     └─ Reset daily_transferred = 0
├─ Verify: daily_transferred + amount <= daily_limit ✓
└─ If check fails → BLOCK TRANSFER
   Otherwise → Update daily_transferred += amount
```

**On-Chain Account:** `TokenLimitState`
- Seeds: `["token_state", wallet_pubkey]`
- Fields: `wallet`, `daily_limit`, `daily_transferred`, `last_transfer_reset`
- Usage: Prevents rapid depletion, independent of vault limits

#### 4. **Travel Rule Data (Large Transfers)**
```
Input: Transfer amount
├─ Check if amount >= 3,000,000,000 (3000 USDC at 6 decimals)
│  └─ If YES:
│     ├─ Load TravelRuleData account
│     ├─ Verify: originator matches source wallet ✓
│     ├─ Verify: beneficiary matches destination wallet ✓
│     └─ Verify: is_filled = true (data submitted) ✓
│        └─ If any check fails → BLOCK TRANSFER
│  └─ If NO: Skip Travel Rule check (small transfer)
```

**On-Chain Account:** `TravelRuleData`
- Seeds: `["travel_rule", originator_wallet, beneficiary_wallet]`
- Fields: `originator_name`, `originator_address`, `beneficiary_name`, `beneficiary_address`, `tx_reference`, `is_filled`
- Requirement: Complies with FATF Travel Rule guidelines

#### 5. **Emit Compliance Event**
```
Emit TransferHookTriggered {
  source: wallet_pubkey,
  destination: wallet_pubkey,
  amount: u64,
  source_kyc_provider: String,    ← Identifies compliance provider
  dest_kyc_provider: String,       ← Identifies compliance provider
  travel_rule_applies: bool,       ← Was Travel Rule required?
  timestamp: i64
}
```

**Event Indexing:** All events are queryable on-chain, creating an immutable compliance audit trail.

---

### Instructions: How Compliance Providers Use the System

#### A. Setting Up KYC for a Wallet

**Instruction:** `create_kyc_attestation`

```rust
// Called by: Compliance provider (Civic, Synaps, etc.)
// Creates: On-chain proof that wallet passed KYC

Signers:
  - provider (compliance provider account)

Accounts:
  - subject (wallet being verified)
  - kyc_attestation (new PDA account)

Parameters:
  - provider: String (name of KYC provider, max 32 chars)
  - kyc_expiry_days: u16 (1–3650 days, i.e., 1–10 years)

Result:
  - New KycAttestation account created
  - wallet: subject's pubkey
  - verified: true
  - provider: recorded provider name
  - expiry: now + (days * 86400 seconds)
  - Event: KycAttestationCreated
```

**Example:**
```
Provider: Civic
Subject: Alice (0x123...)
Expiry: 365 days
→ KycAttestation created at seed ["kyc_attestation", 0x123...]
→ Alice can now participate in all transfers (until expiry)
```

#### B. Renewing KYC Without Re-Verification

**Instruction:** `update_kyc_attestation`

```rust
// Called by: Original KYC provider only
// Updates: Extends KYC expiry without full re-verification

Signers:
  - provider (must match original provider)

Accounts:
  - kyc_attestation (existing account)

Parameters:
  - new_expiry_days: u16

Result:
  - kyc_attestation.expiry updated
  - Event: KycAttestationUpdated
```

#### C. Submitting Travel Rule Data Before Large Transfer

**Instruction:** `submit_travel_rule_data`

```rust
// Called by: Compliance officer (before transfer ≥ 3000 USDC)
// Creates: On-chain record of originator & beneficiary details

Signers:
  - submitter (compliance officer)

Accounts:
  - originator (source wallet)
  - beneficiary (destination wallet)
  - travel_rule_data (new PDA account)

Parameters:
  - originator_name: String (legal name, max 128 chars)
  - originator_address: String (postal address, max 256 chars)
  - beneficiary_name: String (legal name, max 128 chars)
  - beneficiary_address: String (postal address, max 256 chars)
  - tx_reference: String (unique ID for audit, max 64 chars)

Result:
  - New TravelRuleData account at seed ["travel_rule", originator, beneficiary]
  - is_filled: true
  - Event: TravelRuleDataSubmitted
```

**Example:**
```
Originator: Alice (0x123...)
Beneficiary: Bob (0x456...)
Amount: 5000 USDC

Step 1: Compliance officer calls submit_travel_rule_data
  → Originator Name: "Alice Johnson"
  → Originator Address: "123 Main St, New York, NY 10001"
  → Beneficiary Name: "Bob Smith"
  → Beneficiary Address: "456 Oak Ave, San Francisco, CA 94102"
  → TX Ref: "ALICE-BOB-2026-03-27-001"
  → TravelRuleData account created

Step 2: Alice initiates transfer (via Bastion, CLI, or any app)
  → Token-2022 calls transfer_hook
  → Hook checks: amount (5000) >= threshold (3000) ✓
  → Hook loads TravelRuleData for (Alice, Bob)
  → Hook verifies: is_filled = true ✓
  → Transfer approved ✅
```

#### D. Setting Per-Wallet Transfer Limits

**Instruction:** `initialize_token_limit`

```rust
// Called by: Admin (setup)
// Creates: Per-wallet daily transfer limit

Signers:
  - admin (administrator)

Accounts:
  - wallet (wallet to limit)
  - token_state (new PDA account)

Parameters:
  - daily_limit: u64 (max transfer per 24h, in token base units)

Result:
  - New TokenLimitState account at seed ["token_state", wallet]
  - daily_transferred: 0 (resets daily)
  - last_transfer_reset: now
  - Event: TokenLimitInitialized
```

**Example:**
```
Wallet: Alice
Daily Limit: 10,000,000,000 (10K USDC at 6 decimals)

Day 1:
  - Alice transfers 5000 USDC → daily_transferred = 5000
  - Alice transfers 3000 USDC → daily_transferred = 8000
  - Alice tries to transfer 5000 USDC → BLOCKED (would exceed 10K limit)

Day 2 (24h later):
  - Daily reset triggers at first transfer
  - daily_transferred = 0
  - Alice can transfer up to 10K again
```

---

### Real-World Compliance Scenario

**Scenario:** Acme Institutional Treasury transfers $50K USDC to Beta Partners

**Timeline:**

| Time | Action | Who | On-Chain Result |
|------|--------|-----|-----------------|
| Week 1 | Both parties pass KYC with Civic | Civic | `KycAttestation` created for both wallets, expiry Dec 2026 |
| Week 1 | Acme's limit set to $500K/day | Acme Admin | `TokenLimitState` created, daily_limit = 500,000,000,000 |
| Day of Transfer | Compliance officer submits Travel Rule | Acme Compliance | `TravelRuleData` created: Acme → Beta, amount $50K |
| Transfer Time | Acme wallet initiates transfer | Acme Treasury | Token-2022 hook fires: ✅ KYC ✅ Limit ✅ Travel Rule |
| Post-Transfer | Regulator audits | Auditor | Queries `TransferHookTriggered` events, verifies all checks ✅ |

**Why This Works:**
- Compliance is **built into the token**, not the app
- Every transfer is **cryptographically verified** on-chain
- Audit trail is **immutable** (blockchain)
- KYC **cannot expire silently** (smart contract enforces expiry)
- Travel Rule **blocks transfer if data missing** (no workarounds)

## Key Accounts & PDAs

| Account | PDA Seeds | Purpose |
|---------|-----------|---------|
| `Vault` | `["vault", authority, vault_name]` | Institutional vault instance |
| `Member` | `["member", vault, wallet]` | Role assignment for wallet |
| `Withdrawal` | `["withdrawal", vault, tx_count]` | Pending/executed withdrawal |
| **`KycAttestation`** | **`["kyc_attestation", wallet]`** | **On-chain KYC proof (NEW)** |
| **`TravelRuleData`** | **`["travel_rule", originator, beneficiary]`** | **FATF Travel Rule data (NEW)** |
| **`TokenLimitState`** | **`["token_state", wallet]`** | **Token-level daily limit (NEW)** |

---

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

### Deploy Smart Contract

The Anchor program is in `programs/bastion/`.

**Option 1: Solana Playground (Easiest)**
1. Visit https://beta.solpg.io/
2. Upload `programs/bastion/src/lib.rs`
3. Click "Build" → "Deploy"

**Option 2: Local Anchor CLI**
```bash
cd programs/bastion
anchor build
anchor deploy --provider.cluster devnet
```

**Devnet Program ID:**
```
3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv
```

**View on Solana Explorer:**
- https://explorer.solana.com/address/3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv?cluster=devnet
- Inspect transactions, accounts, and events in real-time

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
