export interface AlarmCode {
  code: string;
  description: string;
  category: string;
  action?: string;
}

/**
 * Local database of alarm codes.
 * Add your codes here — the scanner will automatically look them up.
 * Codes are matched case-insensitively against scanned text.
 */
export const ALARM_CODES: AlarmCode[] = [
  // Fire Alarms
  { code: 'FA01', description: 'Fire Alarm - Main Lobby (Zone 1)', category: 'Fire', action: 'Evacuate building, call fire department.' },
  { code: 'FA02', description: 'Fire Alarm - Server Room (Zone 2)', category: 'Fire', action: 'Use CO2 extinguisher only. Evacuate immediately.' },
  { code: 'FA03', description: 'Fire Alarm - Warehouse (Zone 3)', category: 'Fire', action: 'Evacuate via rear exits. Do not use elevators.' },
  { code: 'FA04', description: 'Fire Alarm - Kitchen Area (Zone 4)', category: 'Fire', action: 'Isolate gas supply. Use kitchen extinguisher.' },
  { code: 'FA05', description: 'Fire Alarm - Rooftop Plant Room (Zone 5)', category: 'Fire', action: 'Notify maintenance. Restrict roof access.' },

  // Smoke Detectors
  { code: 'SD01', description: 'Smoke Detector - Floor 1 Corridor', category: 'Smoke', action: 'Check for smoke source. Ventilate area.' },
  { code: 'SD02', description: 'Smoke Detector - Floor 2 Office', category: 'Smoke', action: 'Clear the area. Check for burning equipment.' },
  { code: 'SD03', description: 'Smoke Detector - Floor 3 Meeting Room', category: 'Smoke', action: 'Check meeting rooms. Ensure evacuation if needed.' },

  // Security Alarms
  { code: 'SE01', description: 'Security Breach - Main Entrance', category: 'Security', action: 'Lock down entry. Alert security team.' },
  { code: 'SE02', description: 'Security Breach - Back Gate', category: 'Security', action: 'Secure perimeter. Check CCTV footage.' },
  { code: 'SE03', description: 'Security Breach - Server Room Door', category: 'Security', action: 'Restrict access. Notify IT security.' },
  { code: 'SE04', description: 'Security Breach - Vault/Safe Area', category: 'Security', action: 'Lock down floor. Contact authorities.' },

  // Trouble Codes
  { code: 'TR01', description: 'Trouble - Panel Low Battery', category: 'Trouble', action: 'Replace backup battery within 24 hours.' },
  { code: 'TR02', description: 'Trouble - Communication Fault', category: 'Trouble', action: 'Check phone/network line to monitoring station.' },
  { code: 'TR03', description: 'Trouble - Zone Open Circuit', category: 'Trouble', action: 'Inspect wiring on the affected zone.' },
  { code: 'TR04', description: 'Trouble - Tamper Alert', category: 'Trouble', action: 'Check detector covers on all zones.' },
  { code: 'TR05', description: 'Trouble - Power Supply Fault', category: 'Trouble', action: 'Check mains supply and fuse to panel.' },

  // AC / Power
  { code: 'AC01', description: 'AC Power Failure - Main Panel', category: 'Power', action: 'Switch to backup generator. Check main breaker.' },
  { code: 'AC02', description: 'AC Power Failure - Sub Panel B', category: 'Power', action: 'Investigate sub panel B circuit breakers.' },
  { code: 'AC03', description: 'AC Power Restore - Main Panel', category: 'Power', action: 'Verify all systems returned to normal.' },

  // Medical / Duress
  { code: 'MD01', description: 'Medical Emergency - Floor 1', category: 'Medical', action: 'Call ambulance. Send first aid to Floor 1.' },
  { code: 'MD02', description: 'Medical Emergency - Floor 2', category: 'Medical', action: 'Call ambulance. Send first aid to Floor 2.' },
  { code: 'PA01', description: 'Panic / Duress Alarm Activated', category: 'Duress', action: 'Contact police. Do not approach the area alone.' },

  // Test / Maintenance
  { code: 'TT01', description: 'Test Mode Active - Zone 1', category: 'Test', action: 'System under test. No action required.' },
  { code: 'TT02', description: 'Test Mode Active - Full System', category: 'Test', action: 'Scheduled maintenance test in progress.' },
  { code: 'MN01', description: 'Maintenance Mode Enabled', category: 'Maintenance', action: 'System bypassed for maintenance. Monitor manually.' },

  // Sprinkler / Water
  { code: 'SP01', description: 'Sprinkler Flow - Zone A', category: 'Sprinkler', action: 'Check for sprinkler activation. Shut off valve if false.' },
  { code: 'SP02', description: 'Sprinkler Low Pressure Alert', category: 'Sprinkler', action: 'Inspect water supply and pressure gauge.' },
  { code: 'WL01', description: 'Water Leak Detected - Plant Room', category: 'Water', action: 'Shut off water supply. Call plumber.' },
];

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

/**
 * Looks for any known code within the given scanned text.
 * Returns the first match found, or null if no code is recognised.
 */
export function findCode(text: string): AlarmCode | null {
  const upper = text.toUpperCase().replace(/\s+/g, ' ');
  return ALARM_CODES.find((item) => upper.includes(item.code)) ?? null;
}

/**
 * Returns ALL codes found within the given scanned text.
 * Useful when a screen contains multiple alarm codes at once.
 */
export function findAllCodes(text: string): AlarmCode[] {
  const upper = text.toUpperCase().replace(/\s+/g, ' ');
  return ALARM_CODES.filter((item) => upper.includes(item.code));
}

/**
 * Returns all codes whose code or description contains the query string.
 */
export function searchCodes(query: string): AlarmCode[] {
  const q = query.toUpperCase();
  return ALARM_CODES.filter(
    (item) =>
      item.code.includes(q) ||
      item.description.toUpperCase().includes(q) ||
      item.category.toUpperCase().includes(q)
  );
}
