// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
// I wrote this entrypoint myself for the gta6-trophy-guide-01 bounty: it takes
// the static guide in this repo's app/ folder and the screenshots/ renders of
// it, copies both into the grader's output directory, and writes the dossier
// the judge reads, using the vendored make.fun frontend library. The library
// file under vendor/ is the kit's copy and I left it untouched.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.
// The two runs must produce identical bytes, so nothing here depends on the
// clock, the environment, or the order files happen to be listed in.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below mirror the scorer's own limits, so a build that passes here
// is one the gate will accept: at most 4 screenshots, none over 256 KiB, the
// app under 993 files and 48 MiB, and the judge's text capped at 160 KiB.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
