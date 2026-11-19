// gta6-trophy-guide-01 entry: hands the guide in.
// Copies app/ and screenshots/ from the repository into /output, then writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Node 22, standard library only. Runs twice with byte-identical output.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The competition's caps, from its gate: the dossier's text at most 160 KiB,
// at most 4 screenshots of at most 256 KiB each, app/ at most 993 entries
// and 48 MiB, every app/ path at most 1,000 UTF-8 bytes.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyEntryDir(name) {
  const src = join(BOT_DIR, name);
  const dst = join(OUTPUT_DIR, name);
  cpSync(src, dst, { recursive: true });
}

function handInGuide() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyEntryDir("app");
  copyEntryDir("screenshots");
  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
}

handInGuide();
