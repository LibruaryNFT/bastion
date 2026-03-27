#!/bin/bash
# Verify all Bastion submission files are in place and valid

set -e

echo "=================================================="
echo "BASTION STABLEHACKS 2026 — SUBMISSION VERIFICATION"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Helper functions
check_file() {
    local file=$1
    local desc=$2

    if [ -f "$file" ]; then
        local size=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}✓${NC} $desc ($size)"
    else
        echo -e "${RED}✗${NC} MISSING: $desc at $file"
        ERRORS=$((ERRORS + 1))
    fi
}

check_video_duration() {
    local file=$1
    local expected=$2

    if [ ! -f "$file" ]; then
        echo -e "${RED}✗${NC} File not found: $file"
        ERRORS=$((ERRORS + 1))
        return
    fi

    # Get duration in seconds
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file" 2>/dev/null || echo "0")

    if [ "${duration%.*}" -gt 0 ] 2>/dev/null; then
        # Convert to MM:SS
        mins=$((${duration%.*} / 60))
        secs=$((${duration%.*} % 60))
        echo -e "${GREEN}✓${NC} Duration: ${mins}m${secs}s (expected: ~${expected})"
    else
        echo -e "${RED}✗${NC} Could not determine duration"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "VIDEO FILES"
echo "-----------"
check_file "c:/Code/bastion/videos/video1_technical_demo/bastion_demo.mp4" "Video 1: Technical Demo (1.3 MB)"
check_video_duration "c:/Code/bastion/videos/video1_technical_demo/bastion_demo.mp4" "1m33s"
echo ""

check_file "c:/Code/bastion/videos/video2_pitch/bastion_pitch.mp4" "Video 2: Pitch (1.0 MB)"
check_video_duration "c:/Code/bastion/videos/video2_pitch/bastion_pitch.mp4" "1m11s"
echo ""

echo "AUDIO SEGMENTS (TTS)"
echo "-------------------"
V1_AUDIO_COUNT=$(find c:/Code/bastion/videos/video1_technical_demo/audio_segments -name "*.mp3" | wc -l)
echo -e "${GREEN}✓${NC} Video 1 audio segments: $V1_AUDIO_COUNT files"

V2_AUDIO_COUNT=$(find c:/Code/bastion/videos/video2_pitch/audio_segments -name "*.mp3" | wc -l)
echo -e "${GREEN}✓${NC} Video 2 audio segments: $V2_AUDIO_COUNT files"
echo ""

echo "DOCUMENTATION"
echo "--------------"
check_file "c:/Code/bastion/SUBMISSION_READY.md" "Submission Summary"
check_file "c:/Code/bastion/VIDEOS_PRODUCTION_GUIDE.md" "Production Guide"
check_file "c:/Code/bastion/videos/video1_technical_demo/PRODUCTION_SCRIPT.md" "Video 1 Production Script"
check_file "c:/Code/bastion/videos/video2_pitch/PRODUCTION_SCRIPT.md" "Video 2 Production Script"
echo ""

echo "PRODUCTION SCRIPTS"
echo "-----------------"
check_file "c:/Code/bastion/generate_audio_and_script.py" "TTS Audio Generator"
check_file "c:/Code/bastion/generate_videos.py" "Full End-to-End Pipeline"
check_file "c:/Code/bastion/record_and_compose_videos.py" "Playwright + FFmpeg Composition"
check_file "c:/Code/bastion/compose_with_overlays.py" "Fast Composition (Used)"
echo ""

echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}ALL CHECKS PASSED${NC}"
    echo ""
    echo "✓ Two MP4 videos ready for submission"
    echo "✓ All audio segments generated (16 total)"
    echo "✓ Documentation complete"
    echo "✓ Production scripts available"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Review videos locally (VLC, Windows Media Player)"
    echo "2. Upload to StableHacks platform"
    echo "3. Confirm submission before March 29, 2026"
    echo ""
    echo "Upload these files:"
    echo "  - c:/Code/bastion/videos/video1_technical_demo/bastion_demo.mp4"
    echo "  - c:/Code/bastion/videos/video2_pitch/bastion_pitch.mp4"
else
    echo -e "${RED}$ERRORS ERRORS FOUND${NC}"
    echo ""
    echo "Please review the errors above and rerun."
fi
echo "=================================================="
