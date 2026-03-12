/**
 * pdf-to-codes.js
 *
 * Extracts alarm codes from a PDF and writes assets/alarm-codes.json.
 *
 * Usage:
 *   node scripts/pdf-to-codes.js path/to/alarm-manual.pdf
 *
 * Requirements (install once as dev deps):
 *   npm install -D pdf-parse
 *
 * The script tries two extraction strategies in order:
 *
 *  1. STRUCTURED — looks for lines that start with an alarm code pattern
 *     (two uppercase letters + two digits, e.g. FA01, SE02).
 *     Works when the PDF has rows / lines like:
 *       FA01  Fire Alarm - Main Lobby  Fire  Evacuate building.
 *
 *  2. RAW DUMP — if no structured codes are found, it writes the raw
 *     extracted text to assets/alarm-codes-raw.txt so you can inspect it
 *     and adjust CODE_PATTERN below to match your PDF's format.
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

// Regex that identifies the start of a code entry line.
// Default: two uppercase letters followed by two digits (FA01, SD02, …).
// Adjust if your alarm manual uses a different scheme (e.g. /^[A-Z]{1,3}\d{3}/).
const CODE_PATTERN = /^([A-Z]{2}\d{2})\b/;

// Column separator used between fields in your PDF (tab, multiple spaces, pipe…).
// The script splits each line on this to pull out description/category/action.
const FIELD_SEPARATOR = /\s{2,}|\t|\s*\|\s*/;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    console.error('Usage: node scripts/pdf-to-codes.js <path-to-pdf>');
    process.exit(1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`Reading: ${pdfPath}`);
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const rawText = data.text;

  // ── Strategy 1: structured extraction ───────────────────────────────────────
  const codes = [];

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(CODE_PATTERN);
    if (!match) continue;

    const code = match[1];
    const rest = line.slice(code.length).trim();
    const fields = rest.split(FIELD_SEPARATOR).map((f) => f.trim()).filter(Boolean);

    const entry = {
      code,
      description: fields[0] ?? '',
      category: fields[1] ?? 'Unknown',
      ...(fields[2] ? { action: fields[2] } : {}),
    };

    codes.push(entry);
  }

  const outDir = path.join(__dirname, '..', 'assets');
  const outPath = path.join(outDir, 'alarm-codes.json');

  if (codes.length > 0) {
    fs.writeFileSync(outPath, JSON.stringify(codes, null, 2));
    console.log(`\nExtracted ${codes.length} alarm code(s) → ${outPath}`);
    console.log('Rebuild the app to pick up the new codes.');
  } else {
    // ── Strategy 2: raw dump so the user can inspect the PDF text ─────────────
    const rawOut = path.join(outDir, 'alarm-codes-raw.txt');
    fs.writeFileSync(rawOut, rawText);
    console.warn('\nNo alarm codes matched the default pattern.');
    console.warn(`Raw PDF text saved to: ${rawOut}`);
    console.warn('Open that file, then adjust CODE_PATTERN and FIELD_SEPARATOR');
    console.warn('in scripts/pdf-to-codes.js to match your PDF format, and re-run.');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
