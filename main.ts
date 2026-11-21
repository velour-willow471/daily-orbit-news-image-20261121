// main.ts — entrypoint for the news-image-20261121 bounty.
// Copies the pre-rendered entry.png (drawn by draw.mjs) to the output
// directory, so both grader runs write byte-identical files.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const src = join(here, "entry.png");
const bytes = readFileSync(src);
// Refuse a truncated image: PNG signature up front, IEND chunk at the end.
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIG)) throw new Error("entry.png is not a PNG");
if (!bytes.subarray(bytes.length - 12).equals(Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]))) {
  throw new Error("entry.png is truncated: no IEND trailer");
}
copyFileSync(src, join(outDir, "entry.png"));
