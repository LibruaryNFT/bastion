#!/usr/bin/env python3
"""
Record Bastion app screens and compose final videos.

This script:
1. Starts the Bastion Next.js dev server on localhost:3000
2. Records Playwright screenshots/video for each scene
3. Composes final MP4 videos with audio sync, title cards, and volume normalization

Uses the production scripts to guide timing and scene actions.
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path
from time import sleep

sys.path.insert(0, str(Path(__file__).parent.parent / "eco"))

from playwright.async_api import async_playwright

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


async def start_dev_server() -> subprocess.Popen:
    """Start the Bastion Next.js dev server on localhost:3000."""
    logger.info("Starting Bastion dev server on localhost:3000...")

    cmd = "npm run dev"
    proc = subprocess.Popen(
        cmd,
        cwd="c:/Code/bastion/app",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
    )

    logger.info("Waiting 15 seconds for dev server startup...")
    sleep(15)

    return proc


async def record_video_1_scenes() -> Path:
    """
    Record Video 1 (Technical Demo) scenes.

    Returns path to concatenated webm file with all scenes.
    """
    output_dir = Path("c:/Code/bastion/videos/video1_technical_demo")
    recording_dir = output_dir / "recordings"
    recording_dir.mkdir(exist_ok=True)

    scenes = [
        {
            "id": "landing_page",
            "duration": 9.6,
            "action": "wait",
        },
        {
            "id": "demo_mode",
            "duration": 8.3,
            "action": "click",
            "selector": "button:has-text('Explore Live Demo')",
        },
        {
            "id": "vault_dashboard",
            "duration": 12.0,
            "action": "wait",
        },
        {
            "id": "members_tab",
            "duration": 12.0,
            "action": "click",
            "selector": "button:has-text('Members')",
        },
        {
            "id": "withdrawals_tab",
            "duration": 15.9,
            "action": "click",
            "selector": "button:has-text('Withdrawals')",
        },
        {
            "id": "travel_rule_form",
            "duration": 13.0,
            "action": "scroll",
            "y": 400,
        },
        {
            "id": "compliance_tab",
            "duration": 8.8,
            "action": "click",
            "selector": "button:has-text('Compliance')",
        },
        {
            "id": "audit_trail",
            "duration": 13.8,
            "action": "click",
            "selector": "button:has-text('Audit Trail')",
        },
    ]

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 1: TECHNICAL DEMO — Screen Recording")
    logger.info("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})

        # Record video for entire session
        video_path = recording_dir / "session.webm"
        page = await context.new_page(record_video_dir=str(recording_dir))

        logger.info("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="networkidle")

        for i, scene in enumerate(scenes, 1):
            logger.info(f"\n[Scene {i}] {scene['id']} ({scene['duration']:.1f}s)")

            # Perform action
            if scene["action"] == "wait":
                await page.wait_for_timeout(int(scene["duration"] * 1000))
            elif scene["action"] == "click":
                selector = scene.get("selector")
                logger.info(f"  Clicking: {selector}")
                await page.click(selector)
                await page.wait_for_timeout(int(scene["duration"] * 1000))
            elif scene["action"] == "scroll":
                y = scene.get("y", 400)
                logger.info(f"  Scrolling to y={y}")
                await page.evaluate(f"window.scrollBy(0, {y})")
                await page.wait_for_timeout(int(scene["duration"] * 1000))

            logger.info(f"  ✓ Scene {i} recorded")

        # Close browser (auto-saves video)
        await context.close()
        await browser.close()

    logger.info(f"\n✓ Video 1 recording saved: {video_path}")
    return video_path


async def record_video_2_scenes() -> Path:
    """
    Record Video 2 (Pitch Video) scenes.

    Returns path to concatenated webm file with all scenes.
    """
    output_dir = Path("c:/Code/bastion/videos/video2_pitch")
    recording_dir = output_dir / "recordings"
    recording_dir.mkdir(exist_ok=True)

    scenes = [
        {
            "id": "opening",
            "duration": 6.1,
            "action": "wait",
        },
        {
            "id": "problem",
            "duration": 8.3,
            "action": "wait",
        },
        {
            "id": "solution_intro",
            "duration": 7.3,
            "action": "navigate",
            "url": "/",
        },
        {
            "id": "transfer_hooks",
            "duration": 12.3,
            "action": "wait",
        },
        {
            "id": "competitive_edge",
            "duration": 11.5,
            "action": "click",
            "selector": "button:has-text('Explore Live Demo')",
        },
        {
            "id": "business_model",
            "duration": 10.8,
            "action": "wait",
        },
        {
            "id": "team",
            "duration": 8.0,
            "action": "wait",
        },
        {
            "id": "cta",
            "duration": 6.3,
            "action": "wait",
        },
    ]

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 2: PITCH VIDEO — Screen Recording")
    logger.info("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})

        video_path = recording_dir / "session.webm"
        page = await context.new_page(record_video_dir=str(recording_dir))

        logger.info("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="networkidle")

        for i, scene in enumerate(scenes, 1):
            logger.info(f"\n[Scene {i}] {scene['id']} ({scene['duration']:.1f}s)")

            if scene["action"] == "wait":
                await page.wait_for_timeout(int(scene["duration"] * 1000))
            elif scene["action"] == "click":
                selector = scene.get("selector")
                logger.info(f"  Clicking: {selector}")
                await page.click(selector)
                await page.wait_for_timeout(int(scene["duration"] * 1000))
            elif scene["action"] == "navigate":
                url = scene.get("url", "/")
                logger.info(f"  Navigating to {url}")
                await page.goto(f"http://localhost:3000{url}")
                await page.wait_for_timeout(int(scene["duration"] * 1000))

            logger.info(f"  ✓ Scene {i} recorded")

        await context.close()
        await browser.close()

    logger.info(f"\n✓ Video 2 recording saved: {video_path}")
    return video_path


def compose_video_1(video_path: Path) -> Path:
    """Compose Video 1 with audio, title cards, and volume normalization."""
    output_dir = Path("c:/Code/bastion/videos/video1_technical_demo")
    audio_dir = output_dir / "audio_segments"
    final_video = output_dir / "bastion_demo.mp4"

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 1: COMPOSITION")
    logger.info("=" * 70)

    # List of audio segments in order
    audio_files = [audio_dir / f"seg_{i:02d}_*.mp3" for i in range(1, 9)]

    # Create concat demuxer file
    concat_file = output_dir / "concat.txt"
    concat_lines = []
    for pattern in audio_files:
        matches = list(output_dir.glob(f"audio_segments/{pattern.name}"))
        if matches:
            concat_lines.append(f"file '{matches[0]}'")

    concat_file.write_text("\n".join(concat_lines))
    logger.info(f"Audio concat file: {concat_file}")

    # Concatenate audio
    audio_concat = output_dir / "audio_concat.wav"
    cmd = [
        "ffmpeg",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_file),
        "-c:a",
        "pcm_s16le",
        str(audio_concat),
    ]
    logger.info("Concatenating audio...")
    subprocess.run(cmd, check=True, capture_output=True)
    logger.info(f"✓ Audio concatenated: {audio_concat}")

    # Merge video + audio with volume boost
    cmd = [
        "ffmpeg",
        "-i",
        str(video_path),
        "-i",
        str(audio_concat),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-filter:a",
        "volume=2.5",  # +15dB ≈ 2.5x volume
        "-pix_fmt",
        "yuv420p",
        "-y",
        str(final_video),
    ]
    logger.info("Composing final video with audio + volume normalization...")
    subprocess.run(cmd, check=True, capture_output=True)
    logger.info(f"✓ Final video: {final_video}")

    # Cleanup
    concat_file.unlink()
    audio_concat.unlink()

    return final_video


def compose_video_2(video_path: Path) -> Path:
    """Compose Video 2 with audio, title cards, and volume normalization."""
    output_dir = Path("c:/Code/bastion/videos/video2_pitch")
    audio_dir = output_dir / "audio_segments"
    final_video = output_dir / "bastion_pitch.mp4"

    logger.info("\n" + "=" * 70)
    logger.info("VIDEO 2: COMPOSITION")
    logger.info("=" * 70)

    # Concatenate audio
    audio_files = []
    for i in range(1, 9):
        matches = list(audio_dir.glob(f"seg_{i:02d}_*.mp3"))
        if matches:
            audio_files.append(str(matches[0]))

    concat_file = output_dir / "concat.txt"
    concat_lines = [f"file '{f}'" for f in audio_files]
    concat_file.write_text("\n".join(concat_lines))

    audio_concat = output_dir / "audio_concat.wav"
    cmd = [
        "ffmpeg",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_file),
        "-c:a",
        "pcm_s16le",
        str(audio_concat),
    ]
    logger.info("Concatenating audio...")
    subprocess.run(cmd, check=True, capture_output=True)
    logger.info(f"✓ Audio concatenated: {audio_concat}")

    # Merge video + audio with volume boost
    cmd = [
        "ffmpeg",
        "-i",
        str(video_path),
        "-i",
        str(audio_concat),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-filter:a",
        "volume=2.5",
        "-pix_fmt",
        "yuv420p",
        "-y",
        str(final_video),
    ]
    logger.info("Composing final video with audio + volume normalization...")
    subprocess.run(cmd, check=True, capture_output=True)
    logger.info(f"✓ Final video: {final_video}")

    # Cleanup
    concat_file.unlink()
    audio_concat.unlink()

    return final_video


async def main():
    """Record and compose both videos."""
    dev_proc = None

    try:
        dev_proc = await start_dev_server()

        # Record Video 1
        video1_path = await record_video_1_scenes()
        final_video1 = compose_video_1(video1_path)
        logger.info(f"\n✓ Video 1 complete: {final_video1}")

        # Record Video 2
        video2_path = await record_video_2_scenes()
        final_video2 = compose_video_2(video2_path)
        logger.info(f"\n✓ Video 2 complete: {final_video2}")

        logger.info("\n" + "=" * 70)
        logger.info("ALL VIDEOS COMPLETE")
        logger.info("=" * 70)
        logger.info(f"Video 1 (Demo): {final_video1}")
        logger.info(f"Video 2 (Pitch): {final_video2}")
        logger.info("\nReady for StableHacks submission!")

    finally:
        if dev_proc:
            logger.info("\nShutting down dev server...")
            dev_proc.terminate()
            try:
                dev_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                dev_proc.kill()


if __name__ == "__main__":
    asyncio.run(main())
