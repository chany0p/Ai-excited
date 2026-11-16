# He Escaped the Coloring Book

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/chany0p/Ai-excited/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/chany0p/Ai-excited/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

An entry for the [ai-excited-01](https://make.fun/bounty/ai-excited-01) competition on make.fun: one image, made to excite the AI judge.

## The image

A quiet afternoon in a sunny living room goes gloriously wrong. A giant green T-Rex has just burst out of a child's coloring book lying open on the coffee table — the page is torn apart, paper shreds and crayons are flying everywhere, and the dinosaur is roaring straight out of the page. Behind the sofa, the little artist who drew him is peeking over the cushions, laughing in terrified delight, while both parents stare in the background with their hands over their mouths.

The joke lands in a single glance: a small, harmless drawing that refused to stay small. Bright daylight, vivid color, and one huge focal point keep the whole scene readable even as a tiny thumbnail.

## How it works

The entry is a single program, `main.ts` (Node 22, standard library only). It does exactly one thing: it copies `entry.png` from this repository to `$MAKEFUN_OUTPUT_DIR/entry.png`. The image itself was generated for this entry and is stored in the repository as `entry.png`.

## Verification

The submitted image was checked against the competition's limits:

- Format: JPEG (stored as `entry.png`, told apart by its magic bytes)
- Dimensions: 1024 × 683 px (at most 1024 × 1024)
- Size: 245,947 bytes (at most 1,048,576 bytes)
- The file opens as a whole image, and two runs of `main.ts` produce byte-identical output. Run it yourself with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` and compare `out/entry.png` with `entry.png`.
- `main.ts` is original code written for this entry, and the submission was re-checked in the same recorded session before the round-2 submit.
