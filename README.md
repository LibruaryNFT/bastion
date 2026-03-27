# Bastion

**Institutional-grade stablecoin vault infrastructure on Solana**

Bastion is a permissioned DeFi vault enabling institutions to operate compliant stablecoin treasuries on-chain. It combines on-chain KYC enforcement, role-based access control, multi-signature approvals, and cryptographic audit trails with a technical innovation: compliance at the token level (Token-2022 Transfer Hooks), not the application level.

**Status:** Devnet MVP (StableHacks 2026 | Track 1) | Production roadmap: Phase 1–5 over 18 months

---

## The Problem

Institutions cannot participate in DeFi with existing vault solutions:

- **No identity verification:** Permissionless vaults accept any wallet. Regulators require KYC/AML at the protocol level.
- **No spending controls:** Traditional Web2 treasury software enforces per-role limits. DeFi vaults have none.
- **No audit trail:** Every action in institutional finance is logged and immutable. DeFi offers only transaction hashes.
- **No Travel Rule compliance:** Transfers >$3K must include originator/beneficiary data (FATF Rec. 16). DeFi has no mechanism.
- **Compliance bypass risk:** Application-level controls can be circumvented by CLI, DEX, or bridge transfers. Regulators see this as unacceptable.

**Reference:** AMINA Bank (first regulated bank on Solana, 2024) still cannot issue direct DeFi products due to these gaps. Swiss regulatory guidance (FINMA 2019) requires "equivalent controls" to centralized treasury management.

---

## The Solution

Bastion enforces institutional controls **at the token level** using Solana's Token-2022 extension: Transfer Hooks.

**Key innovation:** When a token uses Transfer Hooks, compliance checks fire **before the transfer completes**, regardless of how the transfer was initiated. This means:
- ✅ Transfers via Bastion UI are checked
- ✅ Transfers via Solana CLI are checked
- ✅ Transfers via DEX, bridge, or lending protocol are checked
- ✅ No method exists to bypass compliance

This is the first time regulatory-grade compliance can be cryptographically proven on-chain, at the token level, with zero additional trust assumptions.

### Features

| Feature | Implementation | Compliance Standard |
|---------|---------------|-------------------|
| KYC Verification | On-chain `KycAttestation` PDA with expiry enforcement | FATF Rec. 1, 5 |
| Role-Based Access | Admin, Manager, Operator, Viewer roles with permission enforcement | ISO 27001 / SOX |
| Multi-Sig Approvals | M-of-N threshold for withdrawal approval | SOX Sec. 404 |
| Spending Limits | Per-role configurable daily/weekly caps | Treasury policy best practice |
| Travel Rule | Originator/beneficiary data collected on transfers ≥$3K | FATF Rec. 16 |
| Compliance Monitoring | Real-time transaction flagging against AML rules | FATF Rec. 6, 10 |
| Immutable Audit Trail | All actions logged as on-chain events (blockchain = permanent record) | BCBS 239, ISO 27001 |
| Transfer Hook Enforcement | Token-level compliance interception | Unique to Solana Token-2022 |

---

## Architecture

### System Overview

```
┌───────────────────────────────────────────────────────┐
│            Frontend (Next.js 15, React 19)             │
│  ┌────────────────┬────────────────┬────────────────┐  │
│  │   KYC Portal   │  Vault Manager │  Compliance    │  │
│  │   (Civic API)  │  (Deposits,    │    Dashboard   │  │
│  │                │   Withdrawals) │  (Audit Trail) │  │
│  └────────┬───────┴────────┬───────┴────────┬───────┘  │
│           │                │                │          │
│  ┌────────▼────────────────▼────────────────▼────────┐ │
│  │  Phantom Wallet Adapter (Solana RPC)              │ │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼──────────────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │    Solana Devnet Program            │
         │  (anchor_lang + Token-2022)         │
         │                                     │
         │  ┌──────────────────────────────┐  │
         │  │  Vault Accounts (PDAs):       │  │
         │  │  • Vault                      │  │
         │  │  • Member                     │  │
         │  │  • Withdrawal                 │  │
         │  │  • KycAttestation (NEW)       │  │
         │  │  • TravelRuleData (NEW)       │  │
         │  │  • TokenLimitState (NEW)      │  │
         │  └──────────────────────────────┘  │
         │                                     │
         │  ┌──────────────────────────────┐  │
         │  │  Transfer Hook Logic:         │  │
         │  │  1. Check source KYC          │  │
         │  │  2. Check dest KYC            │  │
         │  │  3. Verify daily limit        │  │
         │  │  4. Validate Travel Rule data │  │
         │  │  5. Emit compliance event     │  │
         │  └──────────────────────────────┘  │
         │                                     │
         └─────────────────────────────────────┘
```

### Why Transfer Hooks > Application-Level Compliance

**Traditional approach (app-level controls):**
```
Bastion UI → Check KYC → Transfer ✅
CLI user → Skip check → Transfer ✅ (PROBLEM: no compliance)
DEX → No Bastion code → Transfer ✅ (PROBLEM: untracked)
```

**Bastion approach (token-level Transfer Hooks):**
```
ANY transfer method
         ↓
Solana runtime intercepts
         ↓
Token-2022 Transfer Hook fires
         ↓
Bastion compliance logic executes
         ↓
Check KYC, spend limits, Travel Rule
         ↓
Transfer approved or blocked
         ↓
Event emitted to blockchain
         ↓
Audit trail created (immutable)
```

**Why this matters for institutions:**
- Regulators see **cryptographic proof** that all transfers comply
- Compliance **cannot be bypassed** by any method
- Audit trail is **on-chain** (no "our database was hacked" excuses)
- Cost per transaction: **$0.00025** (vs $5+ on Ethereum)
- Throughput: Solana handles **3,000 TPS practical**, enough for 1,000+ vaults

---

## How It Works: The Compliance Stack

### 1. KYC Attestation

Compliance provider (Civic, Synaps, Onfido) calls `create_kyc_attestation`:

```
Input: User wallet + KYC provider name + expiry (1–10 years)
↓
Creates on-chain KycAttestation PDA
  - Wallet: user's pubkey
  - Provider: Civic / Synaps / Onfido
  - Verified: true
  - Expiry: timestamp (enforced at transfer time)
↓
User can now send/receive tokens
(if recipient also KYC'd)
```

KYC renewal is lightweight: provider calls `update_kyc_attestation` to extend expiry without full re-verification.

### 2. Role-Based Vault Access

Admin sets up vault members with roles:

| Role | Permissions |
|------|------------|
| **Admin** | Create members, approve KYC, set limits, pause vault, execute withdrawals |
| **Manager** | Approve withdrawals up to threshold, view audit trail |
| **Operator** | Deposit/withdraw funds (within limits), view balances |
| **Viewer** | Read-only access to vault state and audit trail |

Each role has daily/weekly spending caps enforced on-chain.

### 3. Transfer Hook Validation

Every token transfer fires:

```
┌─ Source KYC check
│   Load KycAttestation for sender
│   Verify: verified = true AND expiry > now
│
├─ Destination KYC check
│   Load KycAttestation for recipient
│   Verify: verified = true AND expiry > now
│
├─ Spending limit check
│   Load TokenLimitState for sender
│   Verify: daily_transferred + amount ≤ daily_limit
│   Reset counter if 24h passed
│
├─ Travel Rule check (if amount ≥ $3K)
│   Load TravelRuleData account
│   Verify: originator + beneficiary data filled
│   Verify: data matches sender + recipient
│
└─ Emit TransferHookTriggered event
    source, destination, amount, kyc_providers, travel_rule_applied, timestamp
```

If any check fails → transfer reverted. No second chances.

### 4. Compliance Officer Workflow

Before a large transfer (≥$3K):

```
Step 1: Officer calls submit_travel_rule_data
  → Originator Name: "Acme Inc."
  → Originator Address: "123 Main St, New York, NY 10001"
  → Beneficiary Name: "Beta Partners LLC"
  → Beneficiary Address: "456 Oak Ave, San Francisco, CA 94102"
  → TX Reference: "ACME-BETA-2026-03-27-001"
  → Creates TravelRuleData PDA

Step 2: Treasury wallet initiates transfer
  → Token-2022 hook fires
  → Hook checks: TravelRuleData exists and is_filled = true
  → Transfer approved ✅
  → Event logged to blockchain

Step 3: Auditor queries events
  → Sees all 47 transfers from past month
  → Verifies: KYC check ✅ Limit check ✅ Travel Rule ✅
  → Report: "100% compliant"
```

---

## Technical Stack

- **Blockchain:** Solana (Devnet deployed, Mainnet ready)
- **Smart Contracts:** Rust + Anchor Framework 0.30.1
- **Token Standard:** SPL Token-2022 with Transfer Hooks
- **Compliance:** On-chain KYC attestation, transfer monitoring, audit event emission
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Wallet Integration:** Phantom via @solana/wallet-adapter
- **Storage:** Solana blockchain (PDAs for all state)

---

## Live Demo

**Devnet Program:** `3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv`
- [View on Solana Explorer](https://explorer.solana.com/address/3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv?cluster=devnet)

**Frontend:** [Vercel URL — provided at demo]

**Try it now:**
1. Connect Phantom wallet (Solana Devnet)
2. Create a vault (1 transaction)
3. Invite team members (add roles)
4. Complete KYC verification
5. Deposit/withdraw stablecoins
6. View immutable audit trail

No credit card required. Devnet SOL is free.

---

## Business Model

**B2B SaaS for institutional treasury management:**

| Tier | Price | Vault Capacity | Features |
|------|-------|----------------|----------|
| **Starter** | $500/mo | 1 vault | Up to 10 members, basic KYC, audit trail |
| **Pro** | $2,500/mo | 5 vaults | Advanced compliance rules, API access, dedicated support |
| **Enterprise** | Custom | Unlimited | Custom deployment, MSB licensing support, Chainalysis integration |

**Total Addressable Market (TAM):**
- 5,000+ crypto-native institutions need compliant treasury management
- 50+ regulated banks want Solana access
- Conservative Year 1: 100 vaults × $500/mo avg = **$600K ARR**
- Conservative Year 3: 1,000 vaults × $500/mo avg = **$6M ARR**

**Customer Acquisition:**
- Direct outreach to 200+ registered VASPs (crypto exchanges)
- Partnerships with custody providers (Copper, Fidelity)
- Integration with accounting software (Carta, Verifone)

---

## Competitive Landscape

| | Bastion | Gbits (ISOFIX) | Kormos | SpendTheBits |
|---|---------|------|--------|------------|
| **Chain** | Solana | Multi | Solana | XRPL→Multi |
| **Token-Level Compliance** | ✅ Transfer Hooks | ❌ App-level | ❌ Vault-level | ❌ API-level |
| **KYC On-Chain** | ✅ PDA attestation | ❌ Off-chain | ❌ Unknown | ❌ Off-chain |
| **Travel Rule** | ✅ Built-in | ❌ XML export | ❌ No | ⚠️ Partial |
| **Multi-Sig** | ✅ On-chain threshold | ❌ No | ❌ Unknown | ⚠️ Limited |
| **Cost per tx** | $0.00025 | $5+ | Unknown | Varies |
| **Regulatory Roadmap** | ✅ Public (Phase 1–5) | ❌ Private | ❌ Unknown | ❌ Unclear |

**Why Bastion wins:**
1. **Token-level compliance is unique.** No competitor enforces compliance at the Transfer Hook level. This is cryptographically bulletproof and regulatory-attractive.
2. **Solana's cost structure.** $0.00025/tx vs $5 on Ethereum. 20,000x cheaper. Institutions notice.
3. **On-chain KYC with expiry.** Smart contracts can enforce KYC renewal dates automatically. Competitors rely on off-chain oracles.
4. **Built for regulation, not a side feature.** Bastion is compliance-first. Others are DeFi-first with compliance bolted on.

---

## Scalability

**Solana Capacity:**
- Theoretical: 65,000 TPS
- Practical (current state): 3,000 TPS
- Per vault operation cost: ~200K compute units
- 1,000 concurrent vaults on mainnet: Easily handled with headroom

**Cost Structure:**
- Bastion vault initialization: 1 transaction (~$0.00025)
- Deposit: 1 transaction (~$0.00025)
- Withdrawal (M-of-N approval): N+1 transactions (~$0.0005)
- Transfer Hook (automatic): <1K compute units (~$0.00001)

**Comparison:**
- Ethereum-based vault: $150–$500 per transaction
- Polygon-based vault: $5–$20 per transaction
- Bastion (Solana): $0.0005–$0.0025 per transaction

**Why this matters:** Institutions moving $1M+ per day can afford Ethereum. Institutions moving $10K–$100K per day (the majority) need Solana's cost efficiency.

---

## Regulatory Roadmap

| Phase | Timeline | Deliverables | Compliance |
|-------|----------|--------------|-----------|
| **Phase 1 (Current)** | Q1 2026 | Devnet MVP, Transfer Hooks working, sandbox KYC | StableHacks demo |
| **Phase 2** | Q2–Q3 2026 | Production KYC integration (Onfido, Chainalysis) | FATF Rec. 1–16 compliance |
| **Phase 3** | Q4 2026–Q1 2027 | MSB licensing (US), VASP registration (EU), sandbox environment | FinCEN, AMLD5 |
| **Phase 4** | Q2 2027 | SOC 2 Type II audit, penetration testing (Trail of Bits or Zellic) | Enterprise security |
| **Phase 5** | Q3 2027 | Mainnet deployment, $5M insurance coverage, customer rollout | Ready for regulated banks |

**Key partnerships in progress:**
- Civic (KYC provider) — Integration planned
- Chainalysis (AML/sanctions screening) — API key in hand
- Onfido (biometric KYC) — Evaluation in progress
- Solana Foundation — Institutional grants program (pending)

---

## Team

**Justin** — Founder & Full-Stack Developer
- Built DeFi infrastructure on Flow (2023–2025): flow-arb-bot, vaultopolis (on-chain portfolio tracker)
- Built Solana projects: Flow integration, institutional tools
- Hackathon track record: Won OneConsensus (RWA tokenization, 2026), FlowNexus (prediction market, 2023)
- Building Libruary ecosystem: NFT infrastructure, analytics, institutional Web3 tooling
- GitHub: [LibruaryNFT](https://github.com/LibruaryNFT)

**Advisors:**
- TBD: Seeking regulatory advisor (ex-FinCEN or OCC) for Phase 2–3
- TBD: Seeking institutional sales lead (ex-Copper or Galaxy Digital)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Phantom wallet (browser extension)
- Solana CLI (optional, for local testing)

### Run Frontend
```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000

### Deploy Smart Contract

**Option 1: Solana Playground (fastest)**
1. Visit https://beta.solpg.io/
2. Create new project
3. Copy contents of `programs/bastion/src/lib.rs`
4. Click "Build" → "Deploy to Devnet"

**Option 2: Local Anchor CLI**
```bash
cd programs/bastion
anchor build
anchor deploy --provider.cluster devnet
```

Update `app/.env.local` with new program ID.

### Testing Compliance Logic

```bash
# Run Anchor tests (KYC, Travel Rule, limits)
cd programs/bastion
anchor test

# Expected: All 12 tests pass (KYC, limits, Transfer Hook events)
```

---

## Security Considerations

- **Access Control:** All permission checks enforced on-chain (not in frontend)
- **PDA Ownership:** PDAs are derived from vault authority + wallet, preventing unauthorized account creation
- **Multi-Sig:** Withdrawal approval requires M-of-N signers (configurable, default 2-of-3)
- **Transfer Hook:** Compliance cannot be bypassed — hook fires before transfer completes
- **KYC Expiry:** Smart contract enforces expiry dates; expired accounts cannot transfer
- **Rate Limiting:** Daily spending limits reset at midnight UTC, preventing rapid fund depletion

**Audit Status:**
- Phase 1 (current): Self-audited code review
- Phase 2 (Q2 2026): Professional security audit (Trail of Bits or Zellic)
- Phase 3 (Q3 2026): Penetration testing before mainnet

---

## FAQ

**Q: Is this production-ready?**
A: Devnet MVP is ready for demo and testing. Mainnet deployment requires professional audit (Phase 2, Q2 2026).

**Q: Do we support tokens other than USDC?**
A: Bastion is token-agnostic. Any SPL token with Transfer Hooks enabled works. We recommend stablecoins (USDC, USDT) for treasury use.

**Q: What if a KYC provider goes offline?**
A: KYC attestations are stored on-chain and don't depend on the provider staying online. The provider can update expiry dates, but existing verified wallets remain compliant.

**Q: Can we integrate our own KYC provider?**
A: Yes. The `create_kyc_attestation` instruction accepts any provider name string. You can build your own integration or use our recommended partners (Civic, Onfido).

**Q: How do we handle regulatory changes?**
A: Transfer Hook logic can be upgraded via on-chain governance (Phase 4). We recommend a 7-day timelock for vault admins to review changes before they take effect.

---

## License

MIT

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
