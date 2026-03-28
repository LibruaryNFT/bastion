# Bastion — StableHacks Final Submission (48 Hours Remaining)

**Deadline:** March 29, 2026 at 16:00 UTC
**Status:** Two deliverables remain before submission closes
**Videos:** Ready at `/c/Code/bastion/videos/`

---

## Videos Ready for Upload

Both videos are complete, tested, and verified:

| Video | File | Size | Duration | Status |
|-------|------|------|----------|--------|
| **Demo** | `/c/Code/bastion/videos/video1_technical_demo/bastion_demo_v2.mp4` | 2.1 MB | 1:33 | ✅ Ready |
| **Pitch** | `/c/Code/bastion/videos/video2_pitch/bastion_pitch_v2.mp4` | 1.7 MB | 1:11 | ✅ Ready |

---

## Step 1: Upload Videos to YouTube or Loom

### Option A: YouTube (Recommended — Free, Permanent)

1. Go to [youtube.com](https://youtube.com)
2. Click your profile icon → **Create** → **Upload videos**
3. Upload `bastion_demo_v2.mp4`:
   - **Title:** Bastion Technical Demo
   - **Description:** Product walkthrough showing all institutional vault features (KYC, role-based access, Travel Rule compliance, audit trail)
   - **Visibility:** Unlisted (so only people with link can view, not searchable)
   - **Captions:** Leave as auto-generated
4. Wait for processing (usually 1-3 minutes)
5. Copy the video URL (e.g., `https://www.youtube.com/watch?v=...`)
6. Repeat for `bastion_pitch_v2.mp4`:
   - **Title:** Bastion Pitch
   - **Description:** Problem/Solution narrative: Institutions need on-chain stablecoin custody with regulatory compliance. Bastion provides token-level enforcement via Solana Transfer Hooks.
   - **Visibility:** Unlisted

**Result:** Two YouTube links ready for DoraHacks submission form.

### Option B: Loom (Alternative — 5 minute limit on free tier)

Note: Loom's free tier caps videos at 5 minutes. Both Bastion videos fit (1:33 + 1:11), but YouTube is recommended for permanent archival.

---

## Step 2: Fill DoraHacks Submission Form

1. Go to [dorahacks.io](https://dorahacks.io)
2. Navigate to **StableHacks 2026** → Your profile → **My Submissions**
3. Click **+ Create BUIDL**
4. Fill form with this information:

### Form Fields

```
BUIDL Title:
  Bastion — Institutional Permissioned DeFi Vault

Track:
  Track 1: Institutional Permissioned DeFi Vaults

Description (Problem):
  Institutions managing stablecoin treasuries on-chain face a critical gap:
  existing DeFi vaults lack KYC gates, spending controls, and audit trails.
  Regulators won't touch them. Compliance is enforced off-chain or not at all.

  Bastion solves this by moving compliance enforcement to the token level using
  Solana Token-2022 Transfer Hooks — compliance becomes cryptographically proven
  and impossible to bypass.

Key Features:
  ✓ Token-level compliance via Transfer Hooks (Solana Token-2022 standard)
  ✓ KYC gates for vault members (configurable per role)
  ✓ Role-based spending controls (Admin, Manager, Operator, Viewer)
  ✓ Travel Rule compliance (FATF Rec. 16) for transfers ≥ $3,000
  ✓ AML screening integration
  ✓ Immutable audit trail for regulatory proof
  ✓ Multi-signature approval workflows

GitHub Repository:
  https://github.com/LibruaryNFT/bastion

Demo Link:
  https://bastionvault.xyz
  (Click "Explore Live Demo" to bypass wallet requirement)

Tech Stack:
  - Smart Contract: Anchor/Rust, Token-2022 Transfer Hooks
  - Frontend: Next.js 14
  - Blockchain: Solana (Devnet deployment)
  - Program ID: 3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv

Team:
  Justin — Product & Smart Contracts
  Libruary — Research & Frontend

  Shipped DeFi products on Flow and Solana. GRAIL/GOAT vault system
  (Flow), OneConsensus RWA platform (Flow), Cadence Guard framework
  (public), multiple hackathon winners.

Video Links (PASTE URLs FROM STEP 1):
  Demo Video: [YOUTUBE_URL_FROM_DEMO_UPLOAD]
  Pitch Video: [YOUTUBE_URL_FROM_PITCH_UPLOAD]

Why This Track:
  Bastion directly addresses Track 1's core requirement: institutional-grade
  stablecoin vaults with enforced compliance. The Transfer Hook mechanism
  ensures compliance can't be disabled or bypassed, making it uniquely suited
  for institutional on-chain treasury management.

One-Line Pitch:
  Institutional stablecoin custody with cryptographically-enforced compliance
  via Solana Transfer Hooks — compliance enforcement moved from off-chain
  paperwork to on-chain token mechanics.
```

5. **Attach Documents** (if submission form allows file uploads):
   - GitHub README.md
   - TRANSFER_HOOK_SUMMARY.md (technical deep dive)

6. **Review & Submit**
   - Check all fields are complete
   - Verify both YouTube video links work (click to test)
   - Click **Submit** before 2026-03-29 16:00 UTC

---

## DoraHacks Submission Checklist

Before final submit:

- [ ] YouTube videos uploaded successfully
- [ ] Both video URLs copied
- [ ] DoraHacks form filled completely
- [ ] YouTube links pasted into form
- [ ] GitHub repo link verified (public, accessible)
- [ ] Demo app accessible at provided URL
- [ ] Form submitted before deadline

---

## Verification

After submission, DoraHacks will display:
- Submission ID (save for reference)
- Confirmation email sent to registered email
- BUIDL visible on public leaderboard

You can edit submission until deadline by navigating back to form.

---

## Timeline

| Time | Action | Owner |
|------|--------|-------|
| Now | Upload videos to YouTube | You |
| Now | Get YouTube URLs | You |
| Next | Fill DoraHacks form | You |
| Before 2026-03-29 16:00 UTC | Click Submit | You |

**Deadline Buffer:** ~26 hours from session time (2026-03-27 14:00 UTC)

---

## FAQ

**Q: Can I edit the submission after uploading?**
A: Yes, until the deadline. DoraHacks allows revisions.

**Q: What if YouTube processing takes too long?**
A: Loom is instant but free tier caps at 5 minutes. Your videos fit (1:33 + 1:11). Upload to Loom as backup.

**Q: Is the demo app required to be live?**
A: Yes, DoraHacks typically verifies submission links. Vercel app is live and in demo mode (no wallet required).

**Q: Can I submit without videos?**
A: Most hackathons require at least one video. StableHacks explicitly requests them.

---

## Contact

- **Code:** https://github.com/LibruaryNFT/bastion
- **Live Demo:** https://bastion.libruary.com (or Vercel link above)
- **Technical Questions:** See TRANSFER_HOOK_SUMMARY.md in repo

---

**Status:** Ready to submit. Two simple steps remain.
