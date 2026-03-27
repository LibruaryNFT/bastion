#!/usr/bin/env python3
"""
Generate two demo videos for Bastion (StableHacks submission).

Videos:
1. Technical Demo (2 min) — Product walkthrough showing institutional features
2. Pitch Video (2-3 min) — Combination of app + text slides for impact

Uses the eco hackathon video pipeline with custom action handlers for Bastion.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add eco to path
sys.path.insert(0, str(Path(__file__).parent.parent / "eco"))

from command.hackathons.config import HackathonProject
from command.hackathons.video_generator import Scene, generate_demo_video

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ============================================================================
# VIDEO 1: TECHNICAL DEMO (2 minutes)
# ============================================================================
def create_technical_demo_config() -> HackathonProject:
    """
    Technical Demo: Show the product in action.

    Scenes:
    1. Landing page — institutional design, live program status, feature grid
    2. Click "Explore Live Demo" button to enter demo mode
    3. Vault Dashboard — TVL, balance, spending limits, pending approvals
    4. Members tab — role-based access, spending limits
    5. Withdrawals tab — withdrawal request form, Travel Rule form
    6. Compliance tab — screening results, KYC registry
    7. Audit Trail — expandable entries with regulatory metadata
    """
    scenes = [
        Scene(
            id="landing_page",
            narration=(
                "Bastion brings institutional-grade treasury management to Solana. "
                "This is compliance at the token level — enforcement that can't be bypassed."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="demo_mode",
            narration=(
                "To see the full platform, click Explore Live Demo. "
                "This takes you directly into a vault with realistic institutional data."
            ),
            action="click",
            action_params={"selector": "button:has-text('Explore Live Demo')"},
        ),
        Scene(
            id="vault_dashboard",
            narration=(
                "The Vault Dashboard shows total assets under management, current balance, "
                "and real-time approval status. Each role has spending limits — daily caps, "
                "weekly caps, enforced on-chain."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="members_tab",
            narration=(
                "In the Members tab, admins manage role-based access. "
                "Admin can do everything. Manager approves large withdrawals. "
                "Operator executes transfers within their limits. Viewer is read-only."
            ),
            action="click",
            action_params={"selector": "button:has-text('Members')"},
        ),
        Scene(
            id="withdrawals_tab",
            narration=(
                "The Withdrawals tab is where the Travel Rule comes in. "
                "For transfers three thousand dollars or larger, the form automatically expands "
                "to collect originator and beneficiary information — required by international anti-money-laundering rules."
            ),
            action="click",
            action_params={"selector": "button:has-text('Withdrawals')"},
        ),
        Scene(
            id="travel_rule_form",
            narration=(
                "Notice the Travel Rule form. It requires originator wallet, beneficiary wallet, "
                "and purpose of transfer. This data is submitted on-chain with the token itself — "
                "no application can intercept it."
            ),
            action="scroll",
            action_params={"y": 400},
        ),
        Scene(
            id="compliance_tab",
            narration=(
                "The Compliance tab shows AML screening results, KYC status for each vault member, "
                "and compliance scores. Everything is auditable."
            ),
            action="click",
            action_params={"selector": "button:has-text('Compliance')"},
        ),
        Scene(
            id="audit_trail",
            narration=(
                "And finally, the Audit Trail. Every action — deposit, withdrawal, role change, "
                "KYC update — is logged with timestamps and regulatory context. "
                "This is immutable proof of institutional controls, on the blockchain."
            ),
            action="click",
            action_params={"selector": "button:has-text('Audit Trail')"},
        ),
    ]

    return HackathonProject(
        name="Bastion",
        tagline="Institutional Compliance at the Token Level",
        description="Permissioned stablecoin vaults on Solana with KYC gates, spending controls, and on-chain audit trails.",
        team_name="Libruary",
        contact_email="justin@libruary.com",
        hackathon_name="StableHacks 2026",
        track="Track 1",
        live_url="https://bastion.libruary.com",
        repo_url="https://github.com/LibruaryNFT/bastion",
        domain="bastion.libruary.com",
        app_url="http://localhost:3000",
        scenes=scenes,
        output_dir=Path("c:/Code/bastion/videos"),
        ffmpeg="ffmpeg",
        ffprobe="ffprobe",
        font="C\\:/Windows/Fonts/arial.ttf",
        tts_voice="onyx",
        tts_speed=0.92,
    )


# ============================================================================
# VIDEO 2: PITCH VIDEO (2-3 minutes)
# ============================================================================
def create_pitch_video_config() -> HackathonProject:
    """
    Pitch Video: Combination of app + text slides for impact.

    Scenes:
    1. Title card: "Bastion — Institutional Stablecoin Vaults on Solana"
    2. Problem: "Institutions can't use DeFi vaults..."
    3. Solution: Show landing page
    4. Key differentiator: Transfer Hooks
    5. Competitive edge: Cost, speed, KYC, Travel Rule
    6. Business model: Pricing and ARR
    7. Team: Built by Justin / Libruary
    8. End card: Live on Solana Devnet
    """
    scenes = [
        Scene(
            id="opening",
            narration=("How do institutions manage stablecoin treasuries on-chain? The answer: they can't. Not yet."),
            action="wait",
            action_params={},
        ),
        Scene(
            id="problem",
            narration=(
                "Existing vaults have no KYC gates, no spending controls, no audit trail. "
                "They're not compliant. Regulators won't touch them."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="solution_intro",
            narration=(
                "Bastion solves this with a breakthrough idea: enforcement at the token level. "
                "Not the application. The token."
            ),
            action="navigate",
            action_params={"url": "/"},
        ),
        Scene(
            id="transfer_hooks",
            narration=(
                "Using Solana Token-2022 Transfer Hooks, Bastion checks every transfer — "
                "via UI, via CLI, via DEX, via bridge — doesn't matter. "
                "Compliance is enforced before the token moves."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="competitive_edge",
            narration=(
                "This means compliance can't be bypassed. It's cryptographically proven. "
                "On Ethereum, this would cost fifty dollars per transaction. On Solana, it's "
                "one quarter of one cent."
            ),
            action="click",
            action_params={"selector": "button:has-text('Explore Live Demo')"},
        ),
        Scene(
            id="business_model",
            narration=(
                "The business model is simple. Five hundred dollars per vault per month. "
                "At one hundred vaults in Year One, that's six hundred thousand in annual recurring revenue."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="team",
            narration=(
                "Built by Justin and Libruary — we've shipped DeFi infrastructure on Flow and Solana. "
                "This is what we know how to build."
            ),
            action="wait",
            action_params={},
        ),
        Scene(
            id="cta",
            narration=("Bastion is live on Solana Devnet now. Visit github.com/LibruaryNFT/bastion to see the code."),
            action="wait",
            action_params={},
        ),
    ]

    return HackathonProject(
        name="Bastion",
        tagline="Institutional Stablecoin Vaults on Solana",
        description="Permissioned vaults with token-level compliance enforcement via Transfer Hooks.",
        team_name="Libruary",
        contact_email="justin@libruary.com",
        hackathon_name="StableHacks 2026",
        track="Track 1",
        live_url="https://bastion.libruary.com",
        repo_url="https://github.com/LibruaryNFT/bastion",
        domain="bastion.libruary.com",
        app_url="http://localhost:3000",
        scenes=scenes,
        output_dir=Path("c:/Code/bastion/videos"),
        ffmpeg="ffmpeg",
        ffprobe="ffprobe",
        font="C\\:/Windows/Fonts/arial.ttf",
        tts_voice="onyx",
        tts_speed=0.92,
    )


# ============================================================================
# MAIN
# ============================================================================
async def main():
    """Generate both videos."""
    import os
    import subprocess
    from time import sleep

    output_dir = Path("c:/Code/bastion/videos")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Start the Next.js dev server
    logger.info("Starting Next.js dev server on localhost:3000...")

    # Get proper shell and npm path
    shell = True if os.name == "nt" else False
    cmd = "npm run dev" if os.name == "nt" else ["npm", "run", "dev"]

    dev_proc = subprocess.Popen(
        cmd,
        cwd=str(Path("c:/Code/bastion/app")),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=shell,
    )

    # Wait for server to be ready
    logger.info("Waiting 20 seconds for server to be ready...")
    sleep(20)

    try:
        # Generate Technical Demo
        logger.info("\n" + "=" * 70)
        logger.info("GENERATING VIDEO 1: TECHNICAL DEMO")
        logger.info("=" * 70)
        config1 = create_technical_demo_config()
        video1 = await generate_demo_video(config1)
        logger.info(f"✓ Technical Demo saved: {video1}")

        # Generate Pitch Video
        logger.info("\n" + "=" * 70)
        logger.info("GENERATING VIDEO 2: PITCH VIDEO")
        logger.info("=" * 70)
        config2 = create_pitch_video_config()
        video2 = await generate_demo_video(config2)
        logger.info(f"✓ Pitch Video saved: {video2}")

        logger.info("\n" + "=" * 70)
        logger.info("VIDEOS COMPLETE")
        logger.info("=" * 70)
        logger.info(f"Output directory: {output_dir}")
        logger.info(f"Video 1: {video1.name}")
        logger.info(f"Video 2: {video2.name}")

    finally:
        # Kill dev server
        logger.info("\nShutting down dev server...")
        dev_proc.terminate()
        dev_proc.wait(timeout=5)


if __name__ == "__main__":
    asyncio.run(main())
