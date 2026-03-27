# Bastion Demo Videos — Production Guide

**StableHacks 2026 Track 1 Submission**
**Generated:** March 27, 2026
**Framework:** Eco Hackathon Video Pipeline (TTS + Playwright + ffmpeg)

---

## Overview

Two videos are generated for the Bastion institutional stablecoin vault platform:

1. **Technical Demo** (~2 minutes) — Product walkthrough showing all features in action
2. **Pitch Video** (~2-3 minutes) — Problem → Solution → Competitive Edge → Ask

Both videos use:
- **TTS Narration:** OpenAI TTS (voice: Onyx, speed: 0.92x)
- **Screen Recording:** Playwright (1920×1080, 60fps recorded to webm)
- **Composition:** ffmpeg with audio sync + intro/outro cards + volume normalization
- **Format:** MP4, H.264 codec, AAC audio

---

## Video 1: Technical Demo

**Purpose:** Show judges the product in action. What does Bastion actually do?

**Duration:** ~2 minutes (120–140 seconds)

**Scene Breakdown:**

| Scene | Duration | What Happens | Why |
|-------|----------|--------------|-----|
| 1. Landing page | 10s | Show institutional design, live program status badge, feature grid | Hook: establish credibility |
| 2. Demo mode entry | 8s | Click "Explore Live Demo" button, enter demo mode with realistic data | UX bridge: no wallet needed |
| 3. Vault Dashboard | 18s | Show TVL, balance, spending limits, pending approvals | Core functionality: asset mgmt |
| 4. Members tab | 15s | Show role-based access matrix (Admin/Manager/Operator/Viewer), per-role limits | Institutional feature |
| 5. Withdrawals tab | 18s | Show withdrawal form, then scroll to Travel Rule form (≥$3K) | Key compliance feature |
| 6. Travel Rule detail | 15s | Explain originator/beneficiary fields, regulatory context | FATF Rec. 16 enforcement |
| 7. Compliance tab | 18s | Show AML screening, KYC status, compliance scores | Regulatory proof |
| 8. Audit Trail | 20s | Expand entries, show timestamps, regulatory metadata | Immutable evidence |

**Total audio:** ~122 seconds → video pads to ~150s with fades

**Key Narration Themes:**
- "Compliance at the token level — enforcement that can't be bypassed"
- "Each role has spending limits — daily caps, weekly caps, enforced on-chain"
- "Travel Rule collects originator/beneficiary data — required by international AML rules"
- "Every action logged with timestamps and regulatory context — immutable proof"

**Technical Highlights to Emphasize:**
- Transfer Hooks (Token-2022) as the enforcement layer
- On-chain KYC attestations
- Role-based access control (RBAC)
- Spending limits per role
- Travel Rule automation

---

## Video 2: Pitch Video

**Purpose:** Tell a compelling story. Problem → Solution → Why Bastion Wins → Business Model

**Duration:** ~2-3 minutes (150–180 seconds)

**Scene Breakdown:**

| Scene | Duration | What | Why |
|-------|----------|------|-----|
| 1. Opening hook | 8s | "How do institutions manage stablecoin treasuries on-chain?" | Hook: relatable problem |
| 2. Problem statement | 12s | "Existing vaults: no KYC, no controls, no audit trail. Regulators won't touch them." | Set urgency |
| 3. Solution intro | 10s | Show landing page, emphasize "enforcement at the token level" | Positioning |
| 4. Transfer Hooks | 18s | Explain token-level enforcement: UI, CLI, DEX — doesn't matter, all checked | Technical differentiation |
| 5. Competitive edge | 16s | "$0.0025 per tx vs $5 on Ethereum. Solana scales. Cryptographic proof." | Economics + proof |
| 6. Business model | 12s | "$500/vault/month. 100 vaults Year 1 = $600K ARR." | Revenue clarity |
| 7. Team credibility | 10s | "Built by Justin / Libruary — shipped DeFi infrastructure on Flow and Solana." | Trust |
| 8. CTA | 6s | "Live on Solana Devnet. github.com/LibruaryNFT/bastion" | Action |

**Total audio:** ~92 seconds → video pads to ~180s with longer holds + title cards

**Scene Composition:**
- Scenes 1–2: Dark background with text overlays (title cards)
- Scene 3: App UI (landing page)
- Scene 4: App UI (explain Transfer Hooks on screen)
- Scene 5: Text slide (cost comparison)
- Scene 6: Text slide (pricing table)
- Scene 7: Text slide (team info)
- Scene 8: Outro card with repo URL

**Key Messaging:**
1. **Problem:** Traditional vaults can't serve institutions
2. **Solution:** Bastion uses Transfer Hooks for token-level enforcement
3. **Why It Works:** Compliance can't be bypassed
4. **Economics:** 20,000x cheaper than Ethereum
5. **Market:** Institutions are regulated, need this badly
6. **Proof:** Live code, real Devnet deployment
7. **Business:** Clear revenue model, achievable targets

---

## Production Specs

### App Access
- **Dev Server:** `localhost:3000` (started by script)
- **Demo Mode:** Button "Explore Live Demo" on landing page
- **Mock Data:** All fixtures realistic but test data (wallet: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv`)

### Audio Settings
- **Model:** OpenAI TTS-1-HD
- **Voice:** Onyx (professional male, institutional tone)
- **Speed:** 0.92x (slightly slower for clarity)
- **Sample Rate:** 44.1 kHz
- **Volume Boost:** +15dB in final mix (TTS is quiet at baseline)

### Video Settings
- **Resolution:** 1920×1080 (Full HD)
- **Frame Rate:** 60 fps (recorded), 30 fps (final output)
- **Codec:** H.264 (libx264, preset=medium, crf=23)
- **Audio Codec:** AAC (192 kbps)
- **Pixel Format:** yuv420p (compatibility)

### Intro/Outro Cards
Both videos use auto-generated title cards:

**Intro (4 seconds):**
- Title: "Bastion" (orange, 96px)
- Subtitle: "Institutional Compliance at the Token Level" (gray, 36px)
- Fade in/out: 1 second each

**Outro (6 seconds):**
- Project: "Bastion" (orange, 72px)
- Team: "Built by Libruary" (white, 32px)
- Domain: "bastion.libruary.com" (gray, 28px)
- Hackathon: "StableHacks 2026" (dark gray, 24px)
- Fade in/out: 1 second each

### File Locations
- **Output Directory:** `c:/Code/bastion/videos/`
- **Audio Segments:** `videos/audio_segments/seg_*.mp3` (cached)
- **Screen Recording:** `videos/screen_recording/*.webm` (temporary)
- **Final Videos:**
  - `bastion_demo.mp4` (Technical Demo)
  - `bastion_pitch.mp4` (Pitch Video)
- **Intermediate Files:** Auto-cleaned after composition

---

## Execution Log

### Script: `c:/Code/bastion/generate_videos.py`

**Entry Point:**
```bash
cd /c/Code/bastion
python generate_videos.py
```

**What Happens:**
1. Loads eco hackathon pipeline (video_generator.py, TTS, Playwright)
2. Starts Next.js dev server on localhost:3000
3. Waits 15 seconds for server startup
4. **Video 1:**
   - Generates 8 TTS audio segments
   - Records screen with Playwright (~150s webm)
   - Composes: intro + raw video + outro
   - Final: 160s MP4 (~50 MB)
5. **Video 2:**
   - Generates 8 TTS audio segments
   - Records screen with Playwright (~180s webm)
   - Composes: intro + raw video + outro
   - Final: 200s MP4 (~60 MB)
6. Cleans up intermediate files
7. Kills dev server

**Expected Duration:** 20–30 minutes total (mostly TTS + composition time)

**Success Indicators:**
- ✓ Two MP4 files in `c:/Code/bastion/videos/`
- ✓ File sizes: 40–70 MB each
- ✓ Duration: Video 1 ~160s, Video 2 ~200s
- ✓ Audio + video in sync
- ✓ Intro/outro cards with project branding
- ✓ Volume normalized (+15dB)

---

## Deployment Checklist

### Before Submission
- [ ] Play both videos in a media player (VLC, Windows Media Player)
- [ ] Verify audio is clear and properly synchronized
- [ ] Check that intro/outro cards render correctly
- [ ] Confirm video duration is under 3 minutes per StableHacks rules
- [ ] Check file sizes are reasonable (~50–70 MB)
- [ ] Verify no artifacts, black frames, or glitches
- [ ] Test on different devices (laptop, phone) if possible

### Upload to Platform
- [ ] Upload `bastion_demo.mp4` to StableHacks video submission
- [ ] Upload `bastion_pitch.mp4` to secondary video or mention it in application
- [ ] Add file hashes (SHA-256) to application metadata
- [ ] Note: "Generated with Eco Hackathon Pipeline" in technical notes

### Backups
- [ ] Copy final videos to Google Drive or backup storage
- [ ] Keep raw Playwright webm files in case re-composition is needed
- [ ] Archive this production guide with the submission package

---

## Troubleshooting

### Issue: Audio TTS is quiet or missing
**Fix:** Volume boost is applied in final composition (+15dB). If still quiet, check:
- OPENAI_API_KEY is set and valid
- OpenAI account has API credits remaining
- Check `videos/audio_segments/` directory for MP3 files

### Issue: Video out of sync with audio
**Fix:** TTS duration mismatch with recorded video. Try:
- Re-run scene recording (deletes old webm, regenerates)
- Manually adjust scene narration if text was edited
- Increase `action_time` in scene handlers if clicking is slow

### Issue: Playwright can't find button/selector
**Fix:** App CSS/structure may have changed. Common fixes:
- Update selectors in scene action_params
- Add delays: `await page.wait_for_timeout(3000)`
- Use text match: `button:has-text('exact text')`
- Inspect page: run `page.screenshot()` and manually check DOM

### Issue: ffmpeg composition fails
**Fix:** Check ffmpeg version and codec support:
```bash
ffmpeg -version
ffprobe -version
```
Must be recent (2024+) with libx264 and aac support.

### Issue: Dev server doesn't start
**Fix:**
```bash
cd /c/Code/bastion/app
npm install  # reinstall deps if needed
npm run dev  # verify manually
```

---

## Customization

### Change Narration
Edit scenes in `generate_videos.py`:
```python
Scene(
    id="my_scene",
    narration="New narration text here",  # Edit this
    action="click",
    action_params={"selector": "button"},
)
```

### Change App Access URL
Update `app_url` in config:
```python
app_url="https://bastion-staging.vercel.app"  # or other URL
```
Note: Playwright waits for networkidle, so staging URLs work too.

### Change Branding (Intro/Outro)
Configs automatically use project name + tagline. To customize:
```python
intro=TitleCard(
    duration=4.0,
    lines=[
        {"text": "Custom Title", "color": "0xff0000", "size": 100, "y_offset": -50},
        {"text": "Custom Subtitle", "color": "0xffffff", "size": 40, "y_offset": 60},
    ],
)
```

### Adjust Video Length
Per-scene duration is determined by TTS audio length. To shorten overall video:
- Reduce narration length (fewer words)
- Remove scenes
To lengthen:
- Add more detail to narrations
- Add more scenes (e.g., demo more tabs)

---

## Technical References

- **Eco Hackathon Pipeline:** `c:/Code/eco/command/hackathons/video_generator.py`
- **Scene Definitions:** `c:/Code/eco/command/hackathons/video_generator.py` (Scene class)
- **OpenAI TTS API:** https://platform.openai.com/docs/guides/text-to-speech
- **Playwright API:** https://playwright.dev/python/
- **ffmpeg Documentation:** https://ffmpeg.org/documentation.html

---

## Success Metrics (Post-Submission)

Track engagement on StableHacks platform:
- Views per video
- Click-through rate to GitHub/website
- Comments/questions received
- Judge feedback (if available)

These metrics inform future video improvements.
