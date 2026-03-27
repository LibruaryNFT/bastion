#!/usr/bin/env python3
"""
Generate TTS audio segments and production script for Bastion videos.

This script:
1. Generates all TTS audio segments for both videos
2. Creates detailed scene-by-scene production scripts (markdown)
3. Saves timestamps and durations for each scene
4. Provides exact ffmpeg commands for manual video composition

Use this output to manually record screens and compose videos if full
automation encounters issues.
"""

import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "eco"))

from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@dataclass
class Scene:
    """A scene with narration."""

    id: str
    narration: str
    action: str


def load_env():
    """Load environment variables."""
    load_dotenv(Path("c:/Code/eco/.env"))
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set in c:/Code/eco/.env")
    return api_key


def generate_tts(
    client: OpenAI,
    scene: Scene,
    output_path: Path,
    voice: str = "onyx",
    speed: float = 0.92,
) -> float:
    """
    Generate TTS audio for a scene.

    Returns: duration in seconds
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Check cache
    if output_path.exists() and output_path.stat().st_size > 1000:
        logger.info(f"[CACHE] {scene.id}")
        # Get duration via ffprobe
        import subprocess

        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(output_path),
            ],
            capture_output=True,
            text=True,
        )
        return float(result.stdout.strip())

    logger.info(f"[TTS] {scene.id} generating...")

    with client.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice=voice,
        input=scene.narration,
        speed=speed,
    ) as response:
        response.stream_to_file(str(output_path))

    # Get duration
    import subprocess

    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(output_path),
        ],
        capture_output=True,
        text=True,
    )
    duration = float(result.stdout.strip())
    logger.info(f"[TTS] {scene.id}: {duration:.1f}s")
    return duration


def generate_video_1_audio_and_script():
    """Generate Technical Demo audio and script."""
    api_key = load_env()
    client = OpenAI(api_key=api_key)
    output_dir = Path("c:/Code/bastion/videos/video1_technical_demo")
    output_dir.mkdir(parents=True, exist_ok=True)

    scenes = [
        Scene(
            "landing_page",
            "Bastion brings institutional-grade treasury management to Solana. This is compliance at the token level — enforcement that can't be bypassed.",
            "wait",
        ),
        Scene(
            "demo_mode",
            "To see the full platform, click Explore Live Demo. This takes you directly into a vault with realistic institutional data.",
            "click: button:has-text('Explore Live Demo')",
        ),
        Scene(
            "vault_dashboard",
            "The Vault Dashboard shows total assets under management, current balance, and real-time approval status. Each role has spending limits — daily caps, weekly caps, enforced on-chain.",
            "wait",
        ),
        Scene(
            "members_tab",
            "In the Members tab, admins manage role-based access. Admin can do everything. Manager approves large withdrawals. Operator executes transfers within their limits. Viewer is read-only.",
            "click: button:has-text('Members')",
        ),
        Scene(
            "withdrawals_tab",
            "The Withdrawals tab is where the Travel Rule comes in. For transfers three thousand dollars or larger, the form automatically expands to collect originator and beneficiary information — required by international anti-money-laundering rules.",
            "click: button:has-text('Withdrawals')",
        ),
        Scene(
            "travel_rule_form",
            "Notice the Travel Rule form. It requires originator wallet, beneficiary wallet, and purpose of transfer. This data is submitted on-chain with the token itself — no application can intercept it.",
            "scroll: y=400",
        ),
        Scene(
            "compliance_tab",
            "The Compliance tab shows AML screening results, KYC status for each vault member, and compliance scores. Everything is auditable.",
            "click: button:has-text('Compliance')",
        ),
        Scene(
            "audit_trail",
            "And finally, the Audit Trail. Every action — deposit, withdrawal, role change, KYC update — is logged with timestamps and regulatory context. This is immutable proof of institutional controls, on the blockchain.",
            "click: button:has-text('Audit Trail')",
        ),
    ]

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 1: TECHNICAL DEMO - TTS Generation")
    logger.info("=" * 70)

    durations = []
    for i, scene in enumerate(scenes, 1):
        audio_path = output_dir / "audio_segments" / f"seg_{i:02d}_{scene.id}.mp3"
        duration = generate_tts(client, scene, audio_path)
        durations.append((scene, duration))

    total_duration = sum(d for _, d in durations)
    logger.info(f"\nTotal audio: {total_duration:.1f}s")

    # Write production script
    script_path = output_dir / "PRODUCTION_SCRIPT.md"
    script_lines = [
        "# Video 1: Technical Demo — Production Script",
        "",
        "**Total Duration:** ~150 seconds (2:30)",
        "**Resolution:** 1920×1080",
        "**Audio:** OpenAI TTS (voice: Onyx, speed: 0.92x, volume boost: +15dB)",
        "",
        "---",
        "",
    ]

    time_cursor = 0
    for i, (scene, duration) in enumerate(durations, 1):
        time_start = time_cursor
        time_end = time_cursor + int(duration)
        time_cursor = time_end

        script_lines.extend(
            [
                f"## Scene {i}: {scene.id}",
                f"**Time:** {time_start // 60}:{time_start % 60:02d} - {time_end // 60}:{time_end % 60:02d} ({duration:.1f}s)",
                f"**Action:** {scene.action}",
                f"**Audio File:** `seg_{i:02d}_{scene.id}.mp3`",
                "",
                "**Narration:**",
                f"> {scene.narration}",
                "",
                "**What to Show:**",
            ]
        )

        # Add scene-specific guidance
        guidance = {
            "landing_page": "Show the Bastion landing page with program status badge and feature grid.",
            "demo_mode": "Click the 'Explore Live Demo' button to enter demo mode.",
            "vault_dashboard": "Show the main dashboard with vault info, balances, and pending approvals.",
            "members_tab": "Click Members tab. Show the table with roles (Admin/Manager/Operator/Viewer) and their spending limits.",
            "withdrawals_tab": "Click Withdrawals tab. Show the withdrawal form.",
            "travel_rule_form": "Scroll down to show the Travel Rule form that appears for amounts >= $3K.",
            "compliance_tab": "Click Compliance tab. Show AML screening results and KYC status.",
            "audit_trail": "Click Audit Trail. Expand a few entries to show timestamps and metadata.",
        }
        script_lines.append(f"- {guidance.get(scene.id, 'Follow the action above.')}")
        script_lines.append("")
        script_lines.append("---")
        script_lines.append("")

    script_path.write_text("\n".join(script_lines), encoding="utf-8")
    logger.info(f"\n✓ Script saved: {script_path}")
    return output_dir, durations


def generate_video_2_audio_and_script():
    """Generate Pitch Video audio and script."""
    api_key = load_env()
    client = OpenAI(api_key=api_key)
    output_dir = Path("c:/Code/bastion/videos/video2_pitch")
    output_dir.mkdir(parents=True, exist_ok=True)

    scenes = [
        Scene(
            "opening",
            "How do institutions manage stablecoin treasuries on-chain? The answer: they can't. Not yet.",
            "dark background",
        ),
        Scene(
            "problem",
            "Existing vaults have no KYC gates, no spending controls, no audit trail. They're not compliant. Regulators won't touch them.",
            "text slide",
        ),
        Scene(
            "solution_intro",
            "Bastion solves this with a breakthrough idea: enforcement at the token level. Not the application. The token.",
            "navigate to app",
        ),
        Scene(
            "transfer_hooks",
            "Using Solana Token-2022 Transfer Hooks, Bastion checks every transfer — via UI, via CLI, via DEX, via bridge — doesn't matter. Compliance is enforced before the token moves.",
            "show app landing",
        ),
        Scene(
            "competitive_edge",
            "This means compliance can't be bypassed. It's cryptographically proven. On Ethereum, this would cost fifty dollars per transaction. On Solana, it's one quarter of one cent.",
            "click demo mode",
        ),
        Scene(
            "business_model",
            "The business model is simple. Five hundred dollars per vault per month. At one hundred vaults in Year One, that's six hundred thousand in annual recurring revenue.",
            "text slide: pricing",
        ),
        Scene(
            "team",
            "Built by Justin and Libruary — we've shipped DeFi infrastructure on Flow and Solana. This is what we know how to build.",
            "text slide: team",
        ),
        Scene(
            "cta",
            "Bastion is live on Solana Devnet now. Visit github.com/LibruaryNFT/bastion to see the code.",
            "outro card",
        ),
    ]

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 2: PITCH VIDEO - TTS Generation")
    logger.info("=" * 70)

    durations = []
    for i, scene in enumerate(scenes, 1):
        audio_path = output_dir / "audio_segments" / f"seg_{i:02d}_{scene.id}.mp3"
        duration = generate_tts(client, scene, audio_path)
        durations.append((scene, duration))

    total_duration = sum(d for _, d in durations)
    logger.info(f"\nTotal audio: {total_duration:.1f}s")

    # Write production script
    script_path = output_dir / "PRODUCTION_SCRIPT.md"
    script_lines = [
        "# Video 2: Pitch Video — Production Script",
        "",
        "**Total Duration:** ~180 seconds (3:00)",
        "**Resolution:** 1920×1080",
        "**Audio:** OpenAI TTS (voice: Onyx, speed: 0.92x, volume boost: +15dB)",
        "",
        "**Note:** This video combines app screenshots with text slides for visual variety.",
        "",
        "---",
        "",
    ]

    time_cursor = 0
    for i, (scene, duration) in enumerate(durations, 1):
        time_start = time_cursor
        time_end = time_cursor + int(duration)
        time_cursor = time_end

        script_lines.extend(
            [
                f"## Scene {i}: {scene.id}",
                f"**Time:** {time_start // 60}:{time_start % 60:02d} - {time_end // 60}:{time_end % 60:02d} ({duration:.1f}s)",
                f"**Type:** {scene.action}",
                f"**Audio File:** `seg_{i:02d}_{scene.id}.mp3`",
                "",
                "**Narration:**",
                f"> {scene.narration}",
                "",
                "**Visual Composition:**",
            ]
        )

        # Add scene-specific guidance
        guidance = {
            "opening": "Dark background (black or dark blue). Center text: 'How do institutions manage stablecoin treasuries on-chain?' Large, white text.",
            "problem": "Text slide with bullet points:\n  • No KYC gates\n  • No spending controls\n  • No audit trail\n  • Regulators won't touch it",
            "solution_intro": "Text slide: 'Bastion: Enforcement at the Token Level' (large, centered). Fade to app landing page.",
            "transfer_hooks": "Show Bastion app landing page. Emphasize the feature grid and institutional design.",
            "competitive_edge": "Show app demo mode (dashboard). Overlay text: 'Solana: $0.0025 / tx | Ethereum: $5+ / tx'",
            "business_model": "Text slide with pricing table:\n  $500 / vault / month\n  100 vaults Year 1 = $600K ARR",
            "team": "Text slide:\n  Built by Justin\n  Libruary — DeFi infrastructure on Flow & Solana",
            "cta": "Outro card (black background):\n  'Bastion'\n  'github.com/LibruaryNFT/bastion'\n  'Live on Solana Devnet'",
        }
        script_lines.append(f"- {guidance.get(scene.id, 'Follow the action above.')}")
        script_lines.append("")
        script_lines.append("---")
        script_lines.append("")

    script_path.write_text("\n".join(script_lines), encoding="utf-8")
    logger.info(f"\n✓ Script saved: {script_path}")
    return output_dir, durations


def main():
    """Generate audio and scripts for both videos."""
    logger.info("=" * 70)
    logger.info("BASTION VIDEO PRODUCTION — Audio Generation")
    logger.info("=" * 70)

    try:
        # Video 1
        dir1, durations1 = generate_video_1_audio_and_script()
        logger.info(f"\n✓ Video 1 ready: {dir1}")
        logger.info(f"  Audio segments: {len(durations1)}")

        # Video 2
        dir2, durations2 = generate_video_2_audio_and_script()
        logger.info(f"\n✓ Video 2 ready: {dir2}")
        logger.info(f"  Audio segments: {len(durations2)}")

        logger.info("\n" + "=" * 70)
        logger.info("NEXT STEPS:")
        logger.info("=" * 70)
        logger.info("\n1. Review production scripts:")
        logger.info(f"   - {dir1}/PRODUCTION_SCRIPT.md")
        logger.info(f"   - {dir2}/PRODUCTION_SCRIPT.md")
        logger.info("\n2. Start the Bastion app locally:")
        logger.info("   cd c:/Code/bastion/app && npm run dev")
        logger.info("\n3. Record each scene manually with Playwright or screen capture:")
        logger.info("   - Use the timestamps and scene descriptions from the script")
        logger.info("   - Save each scene as a webm or mp4 file")
        logger.info("\n4. Compose final video with ffmpeg:")
        logger.info("   - Concatenate audio segments")
        logger.info("   - Merge with video")
        logger.info("   - Add intro/outro cards")
        logger.info("   - Boost volume +15dB")
        logger.info("\n5. Or use the full pipeline script to automate:")
        logger.info("   python c:/Code/bastion/generate_videos.py")

    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
