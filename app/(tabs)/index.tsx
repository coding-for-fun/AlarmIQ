import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getTextFromFrame } from 'expo-text-recognition';
import { AlarmCode, CATEGORY_COLORS, findAllCodes } from '@/data/alarm-codes';

type ScanState = 'idle' | 'processing' | 'select' | 'matched' | 'not_found';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [matchedCode, setMatchedCode] = useState<AlarmCode | null>(null);
  const [candidates, setCandidates] = useState<AlarmCode[]>([]);
  const [rawText, setRawText] = useState('');

  // Prevents stale async results from a previous scan overwriting a newer one
  const scanIdRef = useRef(0);

  const scan = async () => {
    if (!cameraRef.current || scanState === 'processing') return;

    const thisScanId = ++scanIdRef.current;

    setScanState('processing');
    setRawText('');
    setMatchedCode(null);
    setCandidates([]);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.9 });
      if (!photo?.base64) throw new Error('No image captured');

      const lines: string[] = await getTextFromFrame(photo.base64, true);
      const combined = lines.join(' ');

      // Ignore if a newer scan has already started
      if (thisScanId !== scanIdRef.current) return;

      setRawText(combined);

      const found = findAllCodes(combined);

      if (found.length === 0) {
        setScanState('not_found');
      } else if (found.length === 1) {
        // Only one match — show directly
        setMatchedCode(found[0]);
        setScanState('matched');
      } else {
        // Multiple matches — let user pick
        setCandidates(found);
        setScanState('select');
      }
    } catch {
      if (thisScanId !== scanIdRef.current) return;
      setRawText('Error reading image. Try again.');
      setScanState('not_found');
    }
  };

  const selectCode = (code: AlarmCode) => {
    setMatchedCode(code);
    setScanState('matched');
  };

  const reset = () => {
    setMatchedCode(null);
    setCandidates([]);
    setRawText('');
    setScanState('idle');
  };

  // ── Permission ────────────────────────────────────────────────────────────
  if (!permission) {
    return <View style={styles.centred}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centred}>
        <Text style={styles.permText}>Camera access is needed to scan alarm codes.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accentColor = matchedCode
    ? (CATEGORY_COLORS[matchedCode.category] ?? '#007AFF')
    : '#007AFF';

  return (
    <View style={styles.root}>
      {/* Live camera preview */}
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />

      {/* Viewfinder corners */}
      <View style={styles.finderWrapper} pointerEvents="none">
        <View style={styles.finderBox}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        {scanState === 'idle' && (
          <Text style={styles.hint}>Point camera at alarm code(s) then tap Scan</Text>
        )}
        {scanState === 'processing' && (
          <Text style={styles.hint}>Reading…</Text>
        )}
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>

        {/* Raw OCR output — always visible */}
        <View style={styles.rawBox}>
          <Text style={styles.rawLabel}>CAMERA READING</Text>
          <Text style={styles.rawText} numberOfLines={2}>
            {rawText || '— tap Scan to read —'}
          </Text>
        </View>

        {/* ── IDLE: Scan button ── */}
        {scanState === 'idle' && (
          <TouchableOpacity style={styles.scanBtn} onPress={scan}>
            <Text style={styles.scanBtnText}>Scan</Text>
          </TouchableOpacity>
        )}

        {/* ── PROCESSING: spinner ── */}
        {scanState === 'processing' && (
          <View style={styles.processingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.processingText}>Analysing image…</Text>
          </View>
        )}

        {/* ── NOT FOUND ── */}
        {scanState === 'not_found' && (
          <View style={styles.notFoundBox}>
            <Text style={styles.notFoundTitle}>No matching code found</Text>
            <Text style={styles.notFoundSub}>
              Text was detected but doesn't match any known alarm code.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SELECT: multiple codes found ── */}
        {scanState === 'select' && (
          <View style={styles.selectBox}>
            <Text style={styles.selectTitle}>
              {candidates.length} codes detected — select one:
            </Text>
            <ScrollView style={styles.selectScroll} showsVerticalScrollIndicator={false}>
              {candidates.map((item) => {
                const color = CATEGORY_COLORS[item.category] ?? '#8E8E93';
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.candidateRow}
                    onPress={() => selectCode(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.candidateBar, { backgroundColor: color }]} />
                    <View style={styles.candidateContent}>
                      <Text style={styles.candidateCode}>{item.code}</Text>
                      <Text style={styles.candidateDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                    <Text style={styles.candidateChevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MATCHED: result card ── */}
        {scanState === 'matched' && matchedCode && (
          <View style={[styles.resultCard, { borderLeftColor: accentColor }]}>
            <View style={styles.resultHeader}>
              <View style={[styles.badge, { backgroundColor: accentColor }]}>
                <Text style={styles.badgeText}>{matchedCode.category}</Text>
              </View>
              <Text style={styles.codeText}>{matchedCode.code}</Text>
            </View>

            <Text style={styles.descText}>{matchedCode.description}</Text>

            {matchedCode.action ? (
              <View style={styles.actionBox}>
                <Text style={styles.actionLabel}>ACTION</Text>
                <Text style={styles.actionText}>{matchedCode.action}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.scanAgainBtn, { backgroundColor: accentColor }]}
              onPress={reset}
            >
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: '#F2F2F7' },
  permText: { color: '#333', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  btn: { backgroundColor: '#007AFF', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Viewfinder
  finderWrapper: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingBottom: 300 },
  finderBox: { width: 280, height: 120, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#fff' },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  hint: { marginTop: 14, color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },

  // Bottom panel
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16, paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    gap: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },

  // Raw OCR
  rawBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, gap: 3 },
  rawLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  rawText: { color: '#fff', fontSize: 13, lineHeight: 18 },

  // Scan button
  scanBtn: { backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  scanBtnText: { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },

  // Processing
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  processingText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  // Not found
  notFoundBox: { gap: 6 },
  notFoundTitle: { color: '#FF9500', fontSize: 15, fontWeight: '700' },
  notFoundSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18 },
  retryBtn: { marginTop: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Select (multiple codes)
  selectBox: { gap: 8 },
  selectTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  selectScroll: { maxHeight: 160 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  candidateBar: { width: 4, alignSelf: 'stretch' },
  candidateContent: { flex: 1, padding: 10, gap: 2 },
  candidateCode: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  candidateDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  candidateChevron: { color: 'rgba(255,255,255,0.4)', fontSize: 22, paddingRight: 12 },

  // Result card
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderLeftWidth: 5, gap: 10 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  codeText: { fontSize: 22, fontWeight: '800', color: '#111', letterSpacing: 1.5 },
  descText: { fontSize: 15, color: '#222', lineHeight: 22 },
  actionBox: { backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10, gap: 3 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: '#7B5800', letterSpacing: 1 },
  actionText: { fontSize: 13, color: '#4A3500', lineHeight: 18 },
  scanAgainBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  scanAgainText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
