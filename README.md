# makefun-gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/JackEasons/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/JackEasons/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Studio: an offline web app that turns up to three of your photos and a caption into a multi-panel GTA-style poster — triptych, 2×2 grid, hero + strip or a single full-bleed photo — with bold Anton display lettering and Vice Sunset, Neon Nights or Palm Dusk colour grades, exported as a PNG in 1080×1080, 1080×1350 or 1920×1080. Drag any panel to reframe its photo, zoom each photo, or fill every panel with one photo. Your photos never leave the browser.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve `app/` with any static server (`node serve.ts`, then open http://localhost:8080) — it works with no network. The lettering font is Anton (SIL Open Font License, shipped under `app/fonts/`); the sample photos were made with an image model. No Rockstar Games logo, artwork or font is used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=gbg9q3ye&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
