# makefun-gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/JackEasons/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/JackEasons/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Tide Cover Studio: an offline web app that turns up to three of your photos and a caption into a multi-panel GTA-style poster — a seven-character cast grid with role tags, triptych, 2×2 grid, hero + strip, diagonal split or a single full-bleed photo — with bold striped-gradient Anton display lettering, a letterspaced tagline, a handwritten-style subtitle, a press quote bar, a gold BEST CAST seal and a billing block with a drawn barcode, in Vice Sunset, Neon Nights, Palm Dusk, Gold Hour or Midnight Vice colour grades, exported as a PNG in 1080×1080, 1080×1350 or 1920×1080. Drag any panel to reframe its photo, zoom each photo, or fill every panel with one photo. Your photos never leave the browser. Write the title as WORD / WORD to stack it on two lines, and try the cast grid: seven original character portraits, from the Sunset Driver to the Rooftop Lookout.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve `app/` with any static server (`node serve.ts`, then open http://localhost:8080) — it works with no network. The lettering font is Anton (SIL Open Font License, shipped under `app/fonts/`); the sample photos were made with an image model, including the seven original character portraits. No Rockstar Games logo, artwork, city name or font is used: the default cover is the original title "NEON TIDE".

---

<sub>Entered on [make.fun](https://make.fun/?ref=gbg9q3ye&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
