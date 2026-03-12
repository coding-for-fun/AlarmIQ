export interface AlarmCode {
  code: string;
  description: string;
  category: string;
  action?: string;
}

/**
 * Alarm codes database — loaded from assets/alarm-codes.json.
 *
 * To update codes from your alarm manual PDF, run:
 *   node scripts/pdf-to-codes.js path/to/your-alarm-manual.pdf
 *
 * This regenerates assets/alarm-codes.json, which is bundled into the app
 * at build time. No app code changes needed — just rebuild after updating the JSON.
 */
import rawCodes from '../assets/alarm-codes.json';
export const ALARM_CODES: AlarmCode[] = rawCodes as AlarmCode[];

/** Category color mapping for UI display */
export const CATEGORY_COLORS: Record<string, string> = {
  Fire: '#FF3B30',
  Smoke: '#FF9500',
  Security: '#AF52DE',
  Trouble: '#FF6B35',
  Power: '#007AFF',
  Medical: '#34C759',
  Duress: '#FF2D55',
  Test: '#8E8E93',
  Maintenance: '#8E8E93',
  Sprinkler: '#5AC8FA',
  Water: '#5AC8FA',
};

/** Normalise a string for fuzzy matching: lowercase + strip all whitespace. */
function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

/**
 * Looks for any known code within the given scanned text.
 * Matching is case-insensitive and space-insensitive (e.g. "FA 01" matches "FA01").
 * Also matches against the code description, so descriptive text can be recognised.
 * Returns the first match found, or null if no code is recognised.
 */
export function findCode(text: string): AlarmCode | null {
  const norm = normalise(text);
  return (
    ALARM_CODES.find(
      (item) =>
        norm.includes(normalise(item.code)) ||
        norm.includes(normalise(item.description))
    ) ?? null
  );
}

/**
 * Returns ALL codes found within the given scanned text.
 * Matching is case-insensitive and space-insensitive.
 * Also matches against the code description.
 */
export function findAllCodes(text: string): AlarmCode[] {
  const norm = normalise(text);
  return ALARM_CODES.filter(
    (item) =>
      norm.includes(normalise(item.code)) ||
      norm.includes(normalise(item.description))
  );
}

/**
 * Returns all codes whose code, description, or category contains the query string.
 * Matching is case-insensitive and space-insensitive.
 */
export function searchCodes(query: string): AlarmCode[] {
  const q = normalise(query);
  return ALARM_CODES.filter(
    (item) =>
      normalise(item.code).includes(q) ||
      normalise(item.description).includes(q) ||
      normalise(item.category).includes(q)
  );
}
