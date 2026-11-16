// He Escaped the Coloring Book — ai-excited-01 entry program.
//
// What this program does, in order:
//   1. Reads the image stored beside it as entry.png.
//   2. Validates that image against the competition gate before touching
//      anything else: it must be a whole PNG or JPEG, at most 1 MiB, and at
//      most 1024 x 1024 pixels. A corrupt or oversized file is rejected with
//      a clear error and nothing is copied.
//   3. Copies the validated image to $MAKEFUN_OUTPUT_DIR/entry.png
//      (default /output), creating the output directory first if needed.
//   4. Prints one JSON validation report to stdout.
//
// Node 22, standard library only. No network, no dependencies, no random
// input: two runs over the same entry.png print byte-identical JSON and
// produce a byte-identical copy, so the grader sees exactly the bytes
// that were validated here.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576;
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function fail(message) {
  throw new Error('entry validation failed: ' + message);
}

function startsWith(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[i] !== prefix[i]) return false;
  }
  return true;
}

function readU32BE(bytes, offset) {
  return (
    (bytes[offset] * 16777216 +
      bytes[offset + 1] * 65536 +
      bytes[offset + 2] * 256 +
      bytes[offset + 3]) >>>
    0
  );
}

function readU16BE(bytes, offset) {
  return bytes[offset] * 256 + bytes[offset + 1];
}

// PNG: the first chunk must be IHDR, 13 bytes long, holding width and
// height as big-endian uint32 at offsets 16 and 20 of the file.
// PNG chunk CRC check (revision: structural verification, not just the
// header). Every PNG chunk stores a CRC32 of its type + data bytes; a
// single flipped byte anywhere in the file changes a CRC, so walking all
// chunks and verifying each CRC proves the file is structurally whole
// instead of merely starting with a plausible IHDR.
const CRC_TABLE = buildCrcTable();

function buildCrcTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(bytes, start, end) {
  let crc = 0xffffffff;
  for (let i = start; i < end; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function checkPngChunks(bytes) {
  let offset = 8;
  let sawIend = false;
  while (offset + 12 <= bytes.length) {
    const length = readU32BE(bytes, offset);
    if (length > bytes.length) fail('PNG chunk length overruns the file');
    const dataEnd = offset + 8 + length;
    if (dataEnd + 4 > bytes.length) fail('PNG chunk overruns the file');
    const stored = readU32BE(bytes, dataEnd);
    const actual = crc32(bytes, offset + 4, dataEnd);
    if (stored !== actual) {
      fail(
        'PNG chunk CRC mismatch at offset ' +
          offset +
          ' (stored ' +
          stored +
          ', computed ' +
          actual +
          ')'
      );
    }
    const type =
      String.fromCharCode(bytes[offset + 4]) +
      String.fromCharCode(bytes[offset + 5]) +
      String.fromCharCode(bytes[offset + 6]) +
      String.fromCharCode(bytes[offset + 7]);
    offset = dataEnd + 4;
    if (type === 'IEND') {
      sawIend = true;
      break;
    }
  }
  if (!sawIend) fail('PNG is truncated: no IEND chunk');
  if (offset !== bytes.length) fail('PNG has trailing bytes after IEND');
}

function parsePngDimensions(bytes) {
  if (bytes.length < 33) fail('PNG file is too short to hold an IHDR chunk');
  const chunkLength = readU32BE(bytes, 8);
  const chunkType =
    String.fromCharCode(bytes[12]) +
    String.fromCharCode(bytes[13]) +
    String.fromCharCode(bytes[14]) +
    String.fromCharCode(bytes[15]);
  if (chunkType !== 'IHDR') fail('PNG first chunk is not IHDR');
  if (chunkLength !== 13) fail('PNG IHDR chunk has wrong length ' + chunkLength);
  const width = readU32BE(bytes, 16);
  const height = readU32BE(bytes, 20);
  if (width === 0 || height === 0) fail('PNG dimensions must be positive');
  return { width, height };
}

// JPEG: walk the marker segments after the SOI marker until a Start Of
// Frame marker (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA,
// 0xCB, 0xCD, 0xCE, 0xCF) is found; its payload holds height then width
// as big-endian uint16. Standalone markers (0xD0-0xD9, 0x01) carry no
// length field and are skipped as single bytes.
function parseJpegDimensions(bytes) {
  let offset = 2;
  while (offset + 9 <= bytes.length) {
    if (bytes[offset] !== 0xff) {
      fail('JPEG marker expected at offset ' + offset);
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) {
      fail('JPEG scan data reached before any SOF marker');
    }
    const isSof =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;
    const segmentLength = readU16BE(bytes, offset + 2);
    if (segmentLength < 2) fail('JPEG segment has bad length at offset ' + offset);
    if (isSof) {
      if (segmentLength < 7) fail('JPEG SOF segment is too short');
      const height = readU16BE(bytes, offset + 5);
      const width = readU16BE(bytes, offset + 7);
      if (width === 0 || height === 0) fail('JPEG dimensions must be positive');
      return { width, height };
    }
    offset += 2 + segmentLength;
  }
  fail('JPEG has no SOF marker');
}

// JPEG structure check: the file must end with the EOI marker FF D9,
// allowing only trailing zero padding after it.
// JPEG scan-data check (revision: the entropy data after SOS is checked
// too). Inside compressed scan data every 0xFF byte must be either a
// stuffing byte (followed by 0x00), a restart marker (0xD0-0xD7), or the
// EOI marker (0xD9) — a stray 0xFF anywhere else means the stream is
// damaged. The scan ends at the first unstuffed 0xFFD9.
function checkJpegScanData(bytes, sosOffset) {
  let i = sosOffset;
  while (i + 1 < bytes.length) {
    if (bytes[i] === 0xff) {
      const next = bytes[i + 1];
      if (next === 0x00) {
        i += 2;
        continue;
      }
      if (next >= 0xd0 && next <= 0xd7) {
        i += 2;
        continue;
      }
      if (next === 0xd9) return;
      fail('JPEG scan data has invalid 0xFF marker FF' + next.toString(16) + ' at offset ' + i);
    }
    i++;
  }
  fail('JPEG scan data has no EOI marker');
}

// Walk the marker segments again and return the offset where the SOS
// segment's scan data begins (right after its length-prefixed header).
function findJpegScanStart(bytes) {
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) fail('JPEG marker expected at offset ' + offset);
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    const segmentLength = readU16BE(bytes, offset + 2);
    if (segmentLength < 2) fail('JPEG segment has bad length at offset ' + offset);
    if (marker === 0xda) return offset + 2 + segmentLength;
    offset += 2 + segmentLength;
  }
  fail('JPEG has no SOS marker');
}

function checkJpegComplete(bytes) {
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0x00) end--;
  if (end < 2 || bytes[end - 2] !== 0xff || bytes[end - 1] !== 0xd9) {
    fail('JPEG is truncated: no EOI marker at end of file');
  }
}

function validateImage(bytes) {
  const size = bytes.length;
  if (size === 0) fail('entry.png is empty');
  if (size > MAX_BYTES) {
    fail('file is ' + size + ' bytes, over the 1048576 byte limit');
  }
  let format;
  let dimensions;
  if (startsWith(bytes, PNG_MAGIC)) {
    format = 'PNG';
    dimensions = parsePngDimensions(bytes);
    checkPngChunks(bytes);
  } else if (startsWith(bytes, JPEG_MAGIC)) {
    format = 'JPEG';
    dimensions = parseJpegDimensions(bytes);
    checkJpegComplete(bytes);
    checkJpegScanData(bytes, findJpegScanStart(bytes));
  } else {
    fail('unknown magic bytes: not PNG (89 50 4E 47) nor JPEG (FF D8 FF)');
  }
  if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) {
    fail(
      'dimensions ' +
        dimensions.width +
        'x' +
        dimensions.height +
        ' exceed the 1024x1024 limit'
    );
  }
  return { format, width: dimensions.width, height: dimensions.height, size };
}

function main() {
  const entryPath = join(dirname(fileURLToPath(import.meta.url)), 'entry.png');
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const outputPath = join(outputDir, 'entry.png');

  const bytes = readFileSync(entryPath);
  const info = validateImage(bytes);
  const sha256 = createHash('sha256').update(bytes).digest('hex');

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(entryPath, outputPath);

  // Confirm the copy on disk is exactly the validated bytes.
  const copied = readFileSync(outputPath);
  if (copied.length !== bytes.length) fail('copied file size differs from source');
  if (!copied.equals(bytes)) fail('copied file bytes differ from source');
  const copiedStat = statSync(outputPath);
  if (copiedStat.size !== bytes.length) fail('copied file stat size differs');

  // Deterministic report: fixed key order, no timestamps, no paths.
  const report = {
    format: info.format,
    width: info.width,
    height: info.height,
    size_bytes: info.size,
    sha256,
    output: 'entry.png',
    valid: true,
  };
  process.stdout.write(JSON.stringify(report) + '\n');
}

main();
