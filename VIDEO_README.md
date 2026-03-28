# Bastion Demo Video — Quick Start

This directory contains configs for building Bastion demo videos using eco's reproducible video pipeline.

## Files

- **`video_config_technical_demo.yaml`** — 8 scenes, ~2:30, shows vault features
- **`video_config_pitch.yaml`** — 10 scenes, ~3:00, problem/solution narrative

## Build a Video

### Full pipeline (audio + screenshots + composition)

```bash
cd c:\Code\eco

# Technical demo
python -m command.content.video_pipeline c:\Code\bastion\video_config_technical_demo.yaml

# Pitch video
python -m command.content.video_pipeline c:\Code\bastion\video_config_pitch.yaml
```

Output videos:
- `c:\Code\bastion\demos\technical_demo\bastion_demo.mp4`
- `c:\Code\bastion\demos\pitch\bastion_demo.mp4`

### Quick iteration (audio only, skip screenshots)

If you want to update narration without waiting for screenshots:

```bash
python -m command.content.video_pipeline c:\Code\bastion\video_config_technical_demo.yaml --steps audio
```

Then edit `audio_segments/` manually if needed.

### Regenerate everything

```bash
python -m command.content.video_pipeline c:\Code\bastion\video_config_technical_demo.yaml --force
```

## Customize

Edit the YAML file to:

- **Change narration** → Update `narration:` text for each scene
- **Add scenes** → Add new entries under `scenes:`
- **Reorder scenes** → Reorder YAML entries
- **Skip scenes** → Delete YAML entries
- **Change voice** → Update `voice_name:` (nova, alloy, fable, onyx, shimmer)
- **Speed up/slow down** → Adjust `voice_speed:` (0.25–4.0, default 0.92)
- **Adjust intro/outro** → Change `intro_duration:` and `outro_duration:`

## Scene Format

```yaml
scenes:
  - name: dashboard
    narration: "What to say during this scene"
    url_path: /dashboard          # Navigate here (optional)
    click_selectors:              # Click these in order (optional)
      - "button:has-text('Enter')"
      - ".expand-button"
    scroll_to: 400                # Scroll to Y position (optional)
    wait_ms: 1000                 # Wait extra time (optional)
```

All fields except `name` and `narration` are optional.

## Troubleshooting

### Dev server doesn't start

```
ERROR: Dev server not ready after 30 seconds at http://localhost:3000/
```

Fix:

```bash
cd c:\Code\bastion
npm run dev  # Should work manually
```

If it doesn't, the app may be broken. Check `app/` directory.

### ffmpeg not found

Install from https://ffmpeg.org/download.html or update PATH.

### Screenshots are black

The dev server might not be ready yet. Add more `wait_ms` to the first scene:

```yaml
- name: landing_page
  narration: "..."
  wait_ms: 2000  # Increase from 500
```

### Video is too quiet

OpenAI TTS is quiet by default. The pipeline boosts audio +15dB automatically. If still quiet, this is normal — YouTube's auto-normalization will fix it.

### Video composition is very slow

ffmpeg encoding takes 5–10 minutes for a 3-minute video. This is normal. Don't interrupt it.

## File Structure

After building a video:

```
demos/
├── technical_demo/
│   ├── bastion_demo.mp4          # Final video
│   ├── audio_segments/
│   │   ├── seg_00_HASH.mp3       # Cached audio, won't regenerate if narration unchanged
│   │   ├── seg_01_HASH.mp3
│   │   └── ...
│   └── screenshots/
│       ├── scene_00_landing_page.png
│       ├── scene_01_demo_mode.png
│       └── ...
└── pitch/
    └── ...
```

Audio files are cached by narration content hash, so re-running won't waste API calls if you didn't change narration.

## For the Record

**Manual build process (old way, for reference):**

1. Start dev server manually: `npm run dev`
2. Use Playwright to take screenshots manually
3. Generate audio with `openai.api.audio.speech.create()`
4. Stitch with ffmpeg
5. Generate title cards with ffmpeg drawtext
6. Boost volume

**New way (automated):**

```bash
python -m command.content.video_pipeline config.yaml
```

All 6 steps automated, idempotent, cached, Windows-native.

## Full Documentation

See `c:\Code\eco\command\content\VIDEO_PIPELINE.md` for complete reference.

## Support

If something breaks, run with debug logging:

```bash
python -m command.content.video_pipeline config.yaml --log-level DEBUG
```

This will print every step, making it easier to diagnose where it fails.
