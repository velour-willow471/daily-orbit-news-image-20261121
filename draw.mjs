// draw.mjs — renders entry.png for the 21 November 2026 world-news image.
// Original work for the make.fun news-image-20261121 bounty. Pure Node stdlib:
// a tiny 5x7 bitmap font, a small vector canvas, and a hand-rolled PNG encoder.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// ---------------------------------------------------------------- font (5x7)
// Each glyph is 7 rows of 5 bits, written as strings of 0/1.
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "[": ["01110", "01000", "01000", "01000", "01000", "01000", "01110"],
  "]": ["01110", "00010", "00010", "00010", "00010", "00010", "01110"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
};
const BLANK = ["00000", "00000", "00000", "00000", "00000", "00000", "00000"];

// ---------------------------------------------------------------- canvas
export const W = 1024;
export const H = 1024;

export function makeCanvas() {
  return { px: new Uint8Array(W * H * 3), w: W, h: H };
}

export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function fill(c, x0, y0, x1, y1, col) {
  const [r, g, b] = col;
  x0 = Math.max(0, x0 | 0); y0 = Math.max(0, y0 | 0);
  x1 = Math.min(c.w, x1 | 0); y1 = Math.min(c.h, y1 | 0);
  for (let y = y0; y < y1; y++) {
    let i = (y * c.w + x0) * 3;
    for (let x = x0; x < x1; x++, i += 3) {
      c.px[i] = r; c.px[i + 1] = g; c.px[i + 2] = b;
    }
  }
}

export function setPx(c, x, y, col) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 3;
  c.px[i] = col[0]; c.px[i + 1] = col[1]; c.px[i + 2] = col[2];
}

// Bresenham line with square brush of size t.
export function line(c, x0, y0, x1, y1, col, t = 1) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, x = x0, y = y0;
  const half = Math.floor(t / 2);
  for (;;) {
    for (let a = -half; a <= half; a++)
      for (let b = -half; b <= half; b++) setPx(c, x + a, y + b, col);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

export function circle(c, cx, cy, r, col, filled = true) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (filled ? d <= r : d <= r && d >= r - 1.5) setPx(c, cx + x, cy + y, col);
    }
  }
}

// Fill a polygon given as [x,y,...] points (scanline).
export function poly(c, pts, col) {
  const ys = pts.filter((_, i) => i % 2 === 1);
  const y0 = Math.max(0, Math.min(...ys) | 0);
  const y1 = Math.min(c.h, Math.max(...ys) | 0);
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i += 2) {
      const x1 = pts[i], y1p = pts[i + 1];
      const x2 = pts[(i + 2) % pts.length], y2p = pts[(i + 3) % pts.length];
      if ((y1p <= y && y2p > y) || (y2p <= y && y1p > y)) {
        xs.push(x1 + ((y - y1p) / (y2p - y1p)) * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      fill(c, Math.ceil(xs[k]), y, Math.floor(xs[k + 1]) + 1, y + 1, col);
    }
  }
}

// ---------------------------------------------------------------- text
export function textWidth(s, scale) {
  return s.length * 6 * scale - scale;
}

export function drawText(c, s, x, y, scale, col) {
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = FONT[ch] ?? BLANK;
    for (let r = 0; r < 7; r++) {
      for (let colI = 0; colI < 5; colI++) {
        if (g[r][colI] === "1") {
          fill(c, cx + colI * scale, y + r * scale, cx + (colI + 1) * scale, y + (r + 1) * scale, col);
        }
      }
    }
    cx += 6 * scale;
  }
  return cx;
}

// Wrap text into lines that fit maxWidth px at the given scale.
export function wrap(s, maxWidth, scale) {
  const words = s.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (textWidth(test, scale) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function drawLines(c, lines, x, y, scale, col, leading) {
  let yy = y;
  for (const ln of lines) {
    drawText(c, ln, x, yy, scale, col);
    yy += leading;
  }
  return yy;
}

// ---------------------------------------------------------------- PNG encode
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    t[n] = v;
  }
  return t;
})();

function crc32(buf) {
  let v = 0xffffffff;
  for (let i = 0; i < buf.length; i++) v = CRC_TABLE[(v ^ buf[i]) & 255] ^ (v >>> 8);
  return (v ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

export function encodePNG(c) {
  const raw = Buffer.alloc((c.w * 3 + 1) * c.h);
  for (let y = 0; y < c.h; y++) {
    raw[y * (c.w * 3 + 1)] = 0; // filter: none
    Buffer.from(c.px.buffer, y * c.w * 3, c.w * 3).copy(raw, y * (c.w * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(c.w, 0);
  ihdr.writeUInt32BE(c.h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- palette
export const INK = rgb("#191512");
export const PAPER = rgb("#f6f1e5");
export const NAVY = rgb("#14213d");
export const RED = rgb("#b3261e");
export const GOLD = rgb("#c98a1b");
export const TEAL = rgb("#0f6b5c");
export const SKY = rgb("#2e6da4");
export const ORANGE = rgb("#e07b39");
export const GREY = rgb("#6b6259");
export const WHITE = rgb("#ffffff");
export const PANEL = rgb("#fffdf7");
export const LINE = rgb("#d8cfba");

// ---------------------------------------------------------------- layout
const M = 28; // outer margin

function kicker(c, x, y, label, col) {
  const w = textWidth(label, 2) + 16;
  fill(c, x, y, x + w, y + 22, col);
  drawText(c, label, x + 8, y + 4, 2, WHITE);
  return w;
}

function panel(c, x, y, w, h) {
  fill(c, x, y, x + w, y + h, PANEL);
  // border
  fill(c, x, y, x + w, y + 2, INK);
  fill(c, x, y + h - 2, x + w, y + h, INK);
  fill(c, x, y, x + 2, y + h, INK);
  fill(c, x + w - 2, y, x + w, y + h, INK);
}

// ---- lead illustration: night sky, Kyiv skyline, missile arcs, blasts ----
function leadArt(c, x, y, w, h) {
  fill(c, x, y, x + w, y + h, NAVY);
  // stars
  const stars = [[30, 26], [90, 60], [150, 30], [210, 70], [260, 24], [330, 52], [120, 92], [300, 96], [60, 110], [240, 118]];
  for (const [sx, sy] of stars) fill(c, x + sx, y + sy, x + sx + 3, y + sy + 3, WHITE);
  // moon
  circle(c, x + w - 52, y + 42, 20, rgb("#f2e3b3"));
  circle(c, x + w - 60, y + 36, 17, NAVY);
  // missile arcs with bright heads
  line(c, x + 20, y + h - 40, x + 150, y + 60, ORANGE, 3);
  line(c, x + 60, y + h - 20, x + 210, y + 40, GOLD, 3);
  line(c, x + 120, y + h - 30, x + 300, y + 30, WHITE, 2);
  circle(c, x + 150, y + 60, 7, ORANGE);
  circle(c, x + 210, y + 40, 7, GOLD);
  circle(c, x + 300, y + 30, 6, WHITE);
  // blast glows
  circle(c, x + 90, y + h - 58, 16, ORANGE);
  circle(c, x + 90, y + h - 58, 8, GOLD);
  circle(c, x + 250, y + h - 44, 13, RED);
  circle(c, x + 250, y + h - 44, 6, GOLD);
  // skyline silhouettes
  const base = y + h;
  const towers = [
    [0, 96, 46], [52, 130, 34], [92, 108, 52], [150, 150, 30],
    [186, 118, 58], [250, 142, 36], [292, 104, 48], [346, 132, 30],
  ];
  for (const [tx, th, tw] of towers) {
    fill(c, x + tx, base - th, x + tx + tw, base, INK);
  }
  // bridge arc across the bottom
  line(c, x, base - 26, x + w, base - 26, RED, 3);
  line(c, x + 40, base - 26, x + 40, base - 52, RED, 2);
  line(c, x + w - 60, base - 26, x + w - 60, base - 52, RED, 2);
  // lit windows
  for (let i = 0; i < 26; i++) {
    const wx = x + 8 + ((i * 37) % (w - 16));
    const wy = base - 18 - ((i * 53) % 96);
    fill(c, wx, wy, wx + 4, wy + 5, GOLD);
  }
}

// ---- masthead ----
function masthead(c) {
  fill(c, 0, 0, W, 148, NAVY);
  fill(c, 0, 148, W, 152, GOLD);
  drawText(c, "THE WORLD IN ONE PICTURE", M, 22, 5, WHITE);
  drawText(c, "SATURDAY 21 NOVEMBER 2026", M, 92, 3, GOLD);
  const tag = "6 STORIES THAT DEFINED THE DAY";
  const tw = textWidth(tag, 2);
  drawText(c, tag, W - M - tw, 100, 2, WHITE);
  line(c, M, 132, W - M, 132, rgb("#3a4a6b"), 1);
}

// ---- lead story ----
function lead(c) {
  const x = M, y = 168, w = W - 2 * M, h = 268;
  panel(c, x, y, w, h);
  leadArt(c, x + 2, y + 2, 360, h - 4);
  const tx = x + 384;
  kicker(c, tx, y + 18, "UKRAINE WAR - LEAD", RED);
  drawText(c, "RUSSIA'S BIGGEST", tx, y + 50, 4, INK);
  drawText(c, "AIR ATTACK OF 2026", tx, y + 90, 4, INK);
  drawText(c, "MISSILES LAND IN POLAND", tx, y + 128, 3, RED);
  const body = "More than 400 drones and 110 missiles struck Ukraine overnight. At least eight were killed, six in Kyiv, and three bridges were hit. Two missiles and a drone came down in Poland. Warsaw called it a deliberate provocation.";
  drawLines(c, wrap(body, w - 408, 2), tx, y + 160, 2, INK, 19);
}

// ---- small icons, one per story panel (simple drawn shapes) ----
function iconMarkets(c, x, y) {
  // falling chart: axes + red down-trend line + bars
  line(c, x, y + 52, x + 76, y + 52, INK, 2);
  line(c, x, y, x, y + 52, INK, 2);
  const bars = [30, 44, 22, 36, 12];
  for (let i = 0; i < bars.length; i++) {
    fill(c, x + 8 + i * 14, y + 52 - bars[i], x + 8 + i * 14 + 9, y + 52, i === 4 ? RED : SKY);
  }
  line(c, x + 4, y + 8, x + 72, y + 44, RED, 3);
  poly(c, [72, 44, 58, 40, 64, 52], RED);
}

function iconSummit(c, x, y) {
  // three flags on poles: US, China, Russia colours
  const cols = [rgb("#b22234"), rgb("#de2910"), rgb("#0039a6")];
  for (let i = 0; i < 3; i++) {
    const fx = x + i * 26;
    line(c, fx, y, fx, y + 56, INK, 2);
    fill(c, fx + 2, y + 2, fx + 22, y + 18, cols[i]);
  }
}

function iconRiyadh(c, x, y) {
  // shield with a deflected bolt
  poly(c, [x + 38, y + 0, x + 72, y + 10, x + 72, y + 34, x + 38, y + 58, x + 4, y + 34, x + 4, y + 10], TEAL);
  poly(c, [x + 38, y + 8, x + 62, y + 16, x + 62, y + 32, x + 38, y + 48, x + 14, y + 32, x + 14, y + 16], PAPER);
  line(c, x + 52, y + 2, x + 30, y + 30, GOLD, 3);
  line(c, x + 30, y + 30, x + 44, y + 30, GOLD, 3);
  line(c, x + 44, y + 30, x + 22, y + 56, GOLD, 3);
}

function iconCancer(c, x, y) {
  // capsule pill, half gold half white, tilted
  poly(c, [x + 14, y + 20, x + 34, y + 6, x + 62, y + 30, x + 42, y + 44], GOLD);
  poly(c, [x + 14, y + 20, x + 42, y + 44, x + 62, y + 30, x + 62, y + 40, x + 34, y + 56, x + 14, y + 34], WHITE);
  line(c, x + 14, y + 20, x + 62, y + 30, INK, 2);
  line(c, x + 14, y + 34, x + 34, y + 56, INK, 2);
  line(c, x + 34, y + 6, x + 62, y + 40, INK, 2);
  fill(c, x + 30, y + 22, x + 46, y + 34, RED);
}

function iconGreenland(c, x, y) {
  // iceberg over a cold sea line
  poly(c, [x + 8, y + 52, x + 26, y + 10, x + 44, y + 34, x + 58, y + 4, x + 72, y + 52], rgb("#cfe3ee"));
  poly(c, [x + 26, y + 10, x + 44, y + 34, x + 36, y + 40, x + 22, y + 30], WHITE);
  fill(c, x, y + 52, x + 76, y + 56, SKY);
  fill(c, x + 6, y + 58, x + 70, y + 60, SKY);
}

// ---- one grid story panel ----
function story(c, x, y, w, h, kickerLabel, kickerCol, headline, body, iconFn) {
  panel(c, x, y, w, h);
  kicker(c, x + 14, y + 14, kickerLabel, kickerCol);
  iconFn(c, x + w - 92, y + 16);
  // Headline wraps clear of the icon at top right; body starts below it.
  const lines = wrap(headline, w - 28 - 96, 3);
  drawLines(c, lines, x + 14, y + 46, 3, INK, 26);
  const bodyY = y + 46 + lines.length * 26 + 6;
  drawLines(c, wrap(body, w - 28, 2), x + 14, bodyY, 2, INK, 19);
}

function grid(c) {
  const y0 = 452, gw = (W - 2 * M - 16) / 2, gh = 192;
  story(c, M, y0, gw, gh, "MARKETS", RED,
    "AI SELL-OFF PUTS WALL ST IN CORRECTION",
    "The S&P 500 and the Dow fall into correction as AI shares slide. The Nasdaq ends the year in the red.",
    iconMarkets);
  story(c, M + gw + 16, y0, gw, gh, "DIPLOMACY", SKY,
    "TRUMP DEFENDS HIS FRIEND PUTIN",
    "After the Shenzhen summit, Trump defends his friendship with Putin at the White House.",
    iconSummit);
  story(c, M, y0 + gh + 16, gw, gh, "MIDDLE EAST", ORANGE,
    "MISSILES OVER RIYADH, 3RD NIGHT",
    "Saudi defences shoot down three Houthi missiles aimed at Riyadh, the third night of alerts.",
    iconRiyadh);
  story(c, M + gw + 16, y0 + gh + 16, gw, gh, "HEALTH", TEAL,
    "A PILL THAT BEATS BACK CANCER",
    "Daraxonrasib with chemotherapy clears tumours in 1 in 12 advanced pancreatic cancer patients.",
    iconCancer);
  // full-width bottom story
  const y3 = y0 + 2 * (gh + 16);
  story(c, M, y3, W - 2 * M, 116, "ARCTIC", NAVY,
    "GREENLAND DEAL APPROVED",
    "Denmark's parliament votes 109-0 for the US-Greenland security deal, easing months of tension over the Arctic island.",
    iconGreenland);
}

function footer(c) {
  const s = "REPORTED 21 NOV 2026  -  AP  -  BBC  -  REUTERS  -  FT  -  GUARDIAN  -  AL JAZEERA";
  const w = textWidth(s, 2);
  drawText(c, s, (W - w) / 2, 996, 2, GREY);
}

// ---------------------------------------------------------------- render
const c = makeCanvas();
fill(c, 0, 0, W, H, PAPER);
masthead(c);
lead(c);
grid(c);
footer(c);
writeFileSync("entry.png", encodePNG(c));
console.log("wrote entry.png");
