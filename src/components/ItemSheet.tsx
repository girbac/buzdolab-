import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Disposal, Item } from '../types';
import { describeRemaining, expiryDate, formatDate, statusOf } from '../lib/expiry';
import { colors, radius, spacing, statusColor, statusLabel } from '../theme';

type Props = {
  item: Item | undefined;
  onClose: () => void;
  onDispose: (id: string, disposal: Disposal) => void;
};

export default function ItemSheet({ item, onClose, onDispose }: Props) {
  if (!item) return null;

  const isFrozen = item.location === 'freezer';
  const status = statusOf(item);

  function dispose(disposal: Disposal) {
    if (!item) return;
    onDispose(item.id, disposal);
    onClose();
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.photo} />}

          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>

            {isFrozen ? (
              <View style={[styles.pill, { backgroundColor: 'rgba(47,143,214,0.14)' }]}>
                <Text style={[styles.pillText, { color: colors.accentDark }]}>
                  Dondurucuda · bildirim yok
                </Text>
              </View>
            ) : (
              <View style={[styles.pill, { backgroundColor: `${statusColor[status]}22` }]}>
                <View style={[styles.dot, { backgroundColor: statusColor[status] }]} />
                <Text style={[styles.pillText, { color: statusColor[status] }]}>
                  {statusLabel[status]} · {describeRemaining(item)}
                </Text>
              </View>
            )}

            <View style={styles.rows}>
              <Row label="Eklendi" value={formatDate(item.addedAt)} />
              <Row label="Tahmini son gün" value={formatDate(expiryDate(item).toISOString())} />
              <Row
                label="Raf ömrü"
                value={`${item.shelfLifeDays} gün${item.shelfLifeSource === 'manual' ? ' (elle)' : ''}`}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.action, { backgroundColor: colors.fresh }]}
                onPress={() => dispose('consumed')}
              >
                <Text style={styles.actionText}>Tükettim</Text>
              </Pressable>
              <Pressable
                style={[styles.action, { backgroundColor: colors.danger }]}
                onPress={() => dispose('trashed')}
              >
                <Text style={styles.actionText}>Çöpe attım</Text>
              </Pressable>
            </View>

            <Pressable style={styles.close} onPress={onClose}>
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,25,32,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: 200, backgroundColor: colors.border },
  content: { padding: spacing.lg, gap: spacing.md },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rows: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 13, color: colors.textMuted },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  actionText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  close: { alignSelf: 'center', paddingVertical: spacing.xs },
  closeText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
