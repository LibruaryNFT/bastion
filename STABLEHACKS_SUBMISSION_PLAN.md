# Bastion → StableHacks Submission Plan

**Deadline:** March 29, 2026 (48 hours)
**Status:** Smart contract + frontend complete, devnet deployment live

---

## Quick Wins (Next 2 Days)

### 1. Demo Video (2-3 min) — Target: 30-45 min total
**Why it matters:** Judges see product in action. Shows KYC gate, vault creation, fund deposit, compliance enforcement.

**Script outline:**
```
[0:00-0:10] Title card: "Bastion: Institutional Permissioned Vaults"
[0:10-0:30] Problem: "Institutions need permissionless blockchain with control"
[0:30-0:45] Solution intro: "On-chain KYC + role-based access + spending limits"

[0:45-1:15] DEMO PART 1: KYC Gate
- Show wallet connect
- Navigate to KYC attestation page
- Create KYC with Civic (mock provider)
- Show expiry enforcement

[1:15-1:45] DEMO PART 2: Vault Creation
- Create new vault with multi-sig settings
- Add 3 members (admin, treasurer, audit)
- Set daily spending limit ($5000)
- Show role assignments

[1:45-2:15] DEMO PART 3: Fund Deposit
- Deposit $10K USDC from treasury wallet
- Show deposit confirmation
- Verify balance in vault

[2:15-2:45] DEMO PART 4: Compliance Dashboard
- Show all transactions logged
- Show KYC status of each member
- Show spending limits enforced
- Show audit trail

[2:45-3:00] Closing: "Bastion: Risk meets regulation on Solana"
```

**Tools:** Loom (easiest, 30 sec signup) or ScreenFlow (native, highest quality)

**How-to record:**
1. Open testnet at `localhost:3000/bastion` (or deployed frontend URL)
2. Start recording with Loom
3. Follow script, natural narration (don't read stiffly)
4. Stop recording
5. Download as MP4
6. Upload to YouTube (unlisted link for judges)

**Quality bar:** Clear, audible, no lag/freezes. Don't worry about perfect edits — authenticity matters more.

---

### 2. Pitch Video (60 sec, optional but recommended)
**Why it matters:** Judges remember elevator pitches. Increases submit completion score.

**Structure:**
```
[0:00-0:15] Problem: "Institutional stablecoin adoption blocked by compliance gaps"
[0:15-0:35] Solution: "Bastion enforces KYC, roles, and Travel Rule at token level"
[0:35-0:50] Traction: "Deployed to devnet, live in explorer"
[0:50-1:00] Ask: "Building institutional DeFi on Solana"
```

**How-to:** Record on phone or webcam, natural speaking. Judges care about clarity, not production.

---

### 3. DoraHacks Submission Form (30 min)
**URL:** https://dorahacks.io/
**Steps:**
1. Log in with GitHub / email
2. Find "StableHacks" hackathon
3. Click "Submit Build"
4. Fill required fields:
   - **Project name:** Bastion: Institutional Permissioned Vaults
   - **Track:** Track 1 (Institutional Permissioned DeFi Vaults)
   - **Description (500 words max):**
     ```
     Bastion solves institutional adoption of blockchain by combining permissionless
     infrastructure with institutional controls. We built:

     Smart Contract (Token-2022 Transfer Hook):
     - On-chain KYC attestation with expiry enforcement
     - Role-based access control (admin, treasurer, audit)
     - Daily token-level spending limits
     - Travel Rule data collection for transfers ≥ $3000
     - All compliance rules enforced at token level, not application level

     Frontend (Next.js):
     - KYC gate before vault access
     - Multi-sig wallet creation and management
     - Vault dashboard with role-based views
     - Real-time compliance dashboard with audit trail

     Why it matters: Institutional funds move on blockchain when rules are
     tamper-proof and auditable. Bastion makes that possible on Solana.
     ```
   - **GitHub URL:** https://github.com/LibruaryNFT/bastion
   - **Demo video (optional):** [YouTube link]
   - **Live link (if deployed):** testnet.vaultopolis.com/bastion or devnet address
   - **Team members:** [Your name + any other team members]

5. Review and submit

---

## Timeline

| Time | Task | Duration | Owner |
|------|------|----------|-------|
| Today AM | Record demo video | 45 min | You |
| Today PM | Record pitch video | 20 min | You |
| Today PM | Fill DoraHacks form | 30 min | You |
| Today PM | Submit | 5 min | You |
| March 28 | Buffer day (edits if needed) | — | — |

**Total active time:** ~2 hours spread over 2 days. No crunch needed.

---

## Submission Checklist

Before hitting submit:

- [ ] Demo video uploaded to YouTube (unlisted)
- [ ] Pitch video uploaded to YouTube (unlisted) — if doing it
- [ ] GitHub repo is public and polished
- [ ] README.md on GitHub clearly explains what Bastion does
- [ ] Devnet program ID verified: `3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv`
- [ ] DoraHacks form filled completely
- [ ] All links tested (YouTube, GitHub, demo URL)
- [ ] Form submitted before March 29, 11:59 PM UTC

---

## Success Criteria

✅ **Minimum viable submission:** GitHub + form + demo video
✅ **Strong submission:** GitHub + form + demo video + pitch video
✅ **Exceptional submission:** + README with architecture diagrams + live devnet link

You have the code. You have the devnet deployment. You just need the videos (which are just 2-3 min of screen recording) and the form. This is doable.
