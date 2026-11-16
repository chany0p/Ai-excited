# ai-excited-01 — "The Rooftop Whale"

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/chany0p/The-Rooftop-Whale/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/chany0p/The-Rooftop-Whale/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

## The image

A giant blue whale breaches vertically straight up through a skyscraper
rooftop garden at night, water and golden light exploding outward around it
while tiny people on a balcony reach toward it and the neon city glows far
below. The twist is scale: the largest animal on Earth erupting out of the
smallest patch of green in the city — a rooftop garden that was never meant
to hold an ocean.

## How it works

`main.ts` (Node 22, standard library only) copies `entry.png` from this
repo into the output directory given by the `MAKEFUN_OUTPUT_DIR`
environment variable (default `/output`).

## Verification

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/entry.png` is a valid PNG, 880x587 px, 1,023,722 bytes (under the
1,048,576-byte limit).
