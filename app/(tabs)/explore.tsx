import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlarmCode, ALARM_CODES, CATEGORY_COLORS, searchCodes } from '@/data/alarm-codes';

export default function CodesScreen() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = query.trim().length > 0 ? searchCodes(query) : ALARM_CODES;

  const toggle = (code: string) =>
    setExpanded((prev) => (prev === code ? null : code));

  const renderItem = ({ item }: { item: AlarmCode }) => {
    const color = CATEGORY_COLORS[item.category] ?? '#8E8E93';
    const isOpen = expanded === item.code;

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => toggle(item.code)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={styles.rowCode}>{item.code}</Text>
            <View style={[styles.rowBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.rowBadgeText, { color }]}>{item.category}</Text>
            </View>
            <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
          </View>
          <Text style={styles.rowDesc} numberOfLines={isOpen ? 0 : 2}>
            {item.description}
          </Text>
          {isOpen && item.action ? (
            <View style={styles.actionBox}>
              <Text style={styles.actionLabel}>ACTION</Text>
              <Text style={styles.actionText}>{item.action}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Alarm Codes</Text>
        <Text style={styles.subtitle}>{ALARM_CODES.length} codes in database</Text>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search code, description or category…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No codes match "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2 },

  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: '#111',
  },

  list: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },

  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  colorBar: { width: 4 },
  rowContent: { flex: 1, padding: 14, gap: 6 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowCode: { fontSize: 16, fontWeight: '800', color: '#111', letterSpacing: 0.5, flex: 0 },
  rowBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flex: 0,
  },
  rowBadgeText: { fontSize: 11, fontWeight: '600' },
  chevron: { marginLeft: 'auto', color: '#C7C7CC', fontSize: 11 },
  rowDesc: { fontSize: 14, color: '#444', lineHeight: 20 },
  actionBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    gap: 3,
    marginTop: 4,
  },
  actionLabel: { fontSize: 10, fontWeight: '700', color: '#7B5800', letterSpacing: 1 },
  actionText: { fontSize: 13, color: '#4A3500', lineHeight: 18 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 15 },
});
