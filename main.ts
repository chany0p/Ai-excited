// He Escaped the Coloring Book — ai-excited-01 entry.
//
// The picture beside this file (entry.png) shows a giant green T-Rex that has
// just torn its way out of a child's open coloring book on a coffee table —
// paper shreds and crayons flying, the little artist peeking over the sofa
// laughing, the parents staring in disbelief. The whole joke is that a small
// harmless drawing refused to stay small.
//
// This program does exactly one job: it copies that image into the output
// directory the grader reads from, creating the directory first if it does
// not exist yet. Node 22, standard library only — no dependencies, no
// network, no surprises.
//
// Every run writes exactly the same bytes — the copy is plain file-to-file,
// so two runs in a row come out identical, and I have checked that myself.
//
// A working ai-excited-01 entry (Node 22, standard library only): its image is the entry.png beside this file, and
// the program copies it to /output/entry.png. A starting point, not a winner: replace the image. The gate takes a
// whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels, and the judge sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });
copyFileSync(new URL('./entry.png', import.meta.url), join(outputDir, 'entry.png'));
