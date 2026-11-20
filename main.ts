// Neon Tide Cover Studio: a gta6-cover-art-01 entry (Node 22, standard
// library only). v4 adds a cast-grid layout (seven original character
// portraits with role tags), poster furniture (quote bar, gold BEST CAST
// seal, billing block with a drawn barcode, COMING SOON), a striped-
// gradient title grown to about two thirds of the poster width, a
// letterspaced tagline and a handwritten-style subtitle, and renames the
// default title to the original "NEON TIDE" — on top of v3's Midnight
// Vice grade, character-led hero sample, halftone title band and two-line
// titles written as "NEON / TIDE".
// v5: the title grows to about seven tenths of the poster width, the title
// fade hugs the title block so the right-hand portraits stay bright, each
// cast portrait gets its own cinematic light, the role tags grow a gold
// base, the quote bar rotates three press quotes with the colour grade,
// and the build fails out loud when a screenshot tops the scorer's
// 256 KiB cap instead of handing in a doomed entry.
// files a desktop browser loads offline (app/index.html and its ES modules,
// the Anton font and the sample photos under app/, no library and no
// network request). This program hands the entry in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the rest refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB
// of app files, in all, or a path under app/ over 1000 bytes: app/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

/** Count the files under a directory, so the build summary can say how big the app is. */
function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

// A short build summary on stdout, so a run's result is visible without
// opening the dossier: the dossier size is the one number that moves
// when the app or the screenshots change, and the app file count says
// whether a run picked up the new samples and grades.
const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
const shotFiles = existsSync(join(outDir, 'screenshots'))
  ? readdirSync(join(outDir, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
const appFiles = countFiles(join(outDir, 'app'));
const biggestShot = shotFiles.reduce((m, f) => Math.max(m, statSync(join(outDir, 'screenshots', f)).size), 0);

// The scorer refuses an entry with a screenshot over 256 KiB, so fail
// the build out loud here instead of handing in a doomed entry.
if (biggestShot > 262144) {
  throw new Error(`screenshot over the 256 KiB cap: ${biggestShot} bytes`);
}

// Name every screenshot in the summary, so a missing or renamed shot
// shows up without opening the output directory.
for (const f of shotFiles) {
  console.log(`  shot ${f}: ${statSync(join(outDir, 'screenshots', f)).size} bytes`);
}
// The cast grid's seven portraits are the samples that matter most: say
// how many sample photos the run picked up, so a missing portrait shows.
const sampleDir = join(outDir, 'app', 'samples');
const sampleFiles = existsSync(sampleDir)
  ? readdirSync(sampleDir).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
console.log(`wrote ${join(outDir, 'dossier.json')} (${dossierBytes} bytes, ${shotFiles.length} screenshots, biggest ${biggestShot} bytes, ${appFiles} app files, ${sampleFiles.length} samples)`);
