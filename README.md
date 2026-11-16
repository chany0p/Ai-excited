# He Escaped the Coloring Book

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/chany0p/Ai-excited/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/chany0p/Ai-excited/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

An entry for the [ai-excited-01](https://make.fun/bounty/ai-excited-01) competition on make.fun: one image, made to excite the AI judge.

## The image

A quiet afternoon in a sunny living room goes gloriously wrong. A giant green T-Rex has just burst out of a child's coloring book lying open on the coffee table — the page is torn apart, paper shreds and crayons are flying everywhere, and the dinosaur is roaring straight out of the page. Behind the sofa, the little artist who drew him is peeking over the cushions, laughing in delighted terror, while both parents stare in the background with their hands over their mouths.

The joke lands in a single glance: a small, harmless drawing that refused to stay small. Bright daylight, vivid color, and one huge focal point keep the whole scene readable even as a tiny thumbnail. The image was generated fresh for this entry (round 3) and is stored in the repository as `entry.png`.

## How it works

The entry is a single program, `main.ts` (Node 22, standard library only). Before it copies anything, it validates `entry.png` against the competition gate: magic bytes must say PNG or JPEG, dimensions are parsed from the header (PNG IHDR chunk or JPEG SOF marker) and must fit 1024 × 1024, size must fit 1 MiB, and the file structure must be whole — PNG chunk CRCs are verified end to end, and a JPEG must end with its EOI marker with clean scan data. Only a file that passes every check is copied to `$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output`), and the program prints a JSON validation report (format, dimensions, byte size, sha256) to stdout.

## Verification

The submitted image was checked against the competition's limits:

- Format: JPEG (stored as `entry.png`, told apart by its magic bytes)
- Dimensions: 1024 × 683 px (at most 1024 × 1024)
- Size: 204,946 bytes (at most 1,048,576 bytes)
- SHA-256: `2a4b3db77be4556d57e67e29d63137d4876935b6d6ff6fb3769a9276c131a962`
- The file is structurally whole (JPEG markers, scan data, and EOI marker all check out), and two runs of `main.ts` produce byte-identical output. Run it yourself with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` and compare `out/entry.png` with `entry.png`.
- Corrupted copies are rejected: a flipped magic byte, a damaged segment length, a truncated file, and a PNG with a bad chunk CRC all fail validation with a clear error and nothing is copied.
- `main.ts` is original code written for this entry across two recorded writing passes (full program, then a structural-verification revision), and the image was regenerated in the same recorded session as the code.
