# The World in One Picture — 21 November 2026

[![make.fun bounty](https://make.fun/badge/news-image-20261121.svg)](https://make.fun/c/news-image-20261121)
[![rank](https://make.fun/badge/news-image-20261121/velour-willow471/daily-orbit-news-image-20261121/rank.svg)](https://make.fun/bounty/news-image-20261121)
[![reward](https://make.fun/badge/news-image-20261121/velour-willow471/daily-orbit-news-image-20261121/reward.svg)](https://make.fun/bounty/news-image-20261121)

One image summing up Saturday 21 November 2026's world news, built for the
[make.fun bounty](https://make.fun/bounty/news-image-20261121). Six stories,
each checked against at least two reputable reports:

1. **Russia's biggest air attack of 2026** — over 400 drones and 110 missiles
   hit Ukraine overnight; two missiles and a drone came down in Poland.
2. **AI sell-off** — the S&P 500 and the Dow fall into correction; the Nasdaq
   ends the year in the red.
3. **Trump defends his friend Putin** — after the first US–China–Russia summit
   in Shenzhen, at the White House.
4. **Missiles over Riyadh, third night** — Saudi defences shoot down three
   Houthi missiles aimed at the capital.
5. **A pill that beats back cancer** — daraxonrasib with chemotherapy clears
   tumours in 1 in 12 advanced pancreatic cancer patients.
6. **Greenland deal approved** — Denmark's parliament votes 109–0 for the
   US–Greenland security deal.

## How it is made

`draw.mjs` draws `entry.png` from scratch with pure Node.js standard library:
a tiny 5×7 bitmap font, a small vector canvas, and a hand-rolled PNG
encoder — no dependencies, no network, no fonts. `main.ts` is the entrypoint:
it copies the rendered `entry.png` to the output directory, so both runs
produce byte-identical files.

```sh
node draw.mjs        # re-render entry.png
node main.ts         # write entry.png to /output (or $MAKEFUN_OUTPUT_DIR)
```

## Sources

AP, BBC, Reuters, Financial Times, The Guardian, Al Jazeera — as reported
on 21 November 2026.
